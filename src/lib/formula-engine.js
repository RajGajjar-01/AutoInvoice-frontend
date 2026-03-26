import FormulaParser from "fast-formula-parser"

const toNumberOrZero = (value) => {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

const isBlank = (value) => value == null || String(value).trim() === ""

const pad2 = (n) => String(n).padStart(2, "0")

const toIsoDate = (d) => {
  const yyyy = d.getFullYear()
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  return `${yyyy}-${mm}-${dd}`
}

const parseFlexibleDate = (input) => {
  if (input == null) return null
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input

  if (typeof input === "number") {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const s = String(input).trim()
  if (!s) return null

  // ISO date / datetime
  const iso = new Date(s)
  if (!Number.isNaN(iso.getTime())) return iso

  // DD/MM/YYYY or MM/DD/YYYY (we prefer DD/MM/YYYY for ambiguous cases)
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const a = Number.parseInt(m[1], 10)
    const b = Number.parseInt(m[2], 10)
    const y = Number.parseInt(m[3], 10)

    // Prefer DD/MM/YYYY; if that looks invalid, fallback to MM/DD/YYYY.
    const asDmy = new Date(y, b - 1, a)
    if (
      asDmy.getFullYear() === y &&
      asDmy.getMonth() === b - 1 &&
      asDmy.getDate() === a
    ) {
      return asDmy
    }
    const asMdy = new Date(y, a - 1, b)
    if (
      asMdy.getFullYear() === y &&
      asMdy.getMonth() === a - 1 &&
      asMdy.getDate() === b
    ) {
      return asMdy
    }
  }

  return null
}

const buildParser = (rows, cols) => {
  const maxRow = rows?.length ?? 0
  const maxCol = cols?.length ?? 0

  return new FormulaParser({
    onCell: ({ row, col }) => {
      if (row < 1 || col < 1 || row > maxRow || col > maxCol) return 0
      const r = rows[row - 1]
      const c = cols[col - 1]
      if (!r || !c) return 0
      const v = r[c.name]
      // Keep raw values (strings/booleans) so IF/AND/OR can work.
      // Numeric operations will coerce as needed.
      return v ?? 0
    },
    onRange: (ref) => {
      const fromRow = Math.max(1, ref.from.row)
      const toRow = Math.min(maxRow, ref.to.row)
      const fromCol = Math.max(1, ref.from.col)
      const toCol = Math.min(maxCol, ref.to.col)

      const arr = []
      for (let r = fromRow; r <= toRow; r++) {
        const rowVals = []
        for (let c = fromCol; c <= toCol; c++) {
          const rowObj = rows[r - 1]
          const colObj = cols[c - 1]
          rowVals.push(rowObj && colObj ? (rowObj[colObj.name] ?? 0) : 0)
        }
        arr.push(rowVals)
      }
      return arr
    },
    functions: {
      TODAY: () => toIsoDate(new Date()),
      NOW: () => new Date().toISOString(),
      DATE: (year, month, day) => {
        const y = Math.trunc(toNumberOrZero(year))
        const m = Math.trunc(toNumberOrZero(month))
        const d = Math.trunc(toNumberOrZero(day))
        const dt = new Date(y, m - 1, d)
        if (Number.isNaN(dt.getTime())) return "#VALUE!"
        return toIsoDate(dt)
      },
      YEAR: (value) => {
        const dt = parseFlexibleDate(value)
        return dt ? dt.getFullYear() : "#VALUE!"
      },
      MONTH: (value) => {
        const dt = parseFlexibleDate(value)
        return dt ? dt.getMonth() + 1 : "#VALUE!"
      },
      DAY: (value) => {
        const dt = parseFlexibleDate(value)
        return dt ? dt.getDate() : "#VALUE!"
      },
      COUNTA: (...args) => {
        let count = 0
        const stack = [...args]
        while (stack.length) {
          const v = stack.shift()
          if (Array.isArray(v)) {
            stack.unshift(...v.flat(Infinity))
            continue
          }
          if (!isBlank(v)) count++
        }
        return count
      },
    },
  })
}

export const evaluateFormula = (formula, rows, cols) => {
  if (!formula || typeof formula !== "string" || !formula.startsWith("=")) {
    return formula
  }

  try {
    const parser = buildParser(rows ?? [], cols ?? [])
    const position = { row: 1, col: 1, sheet: "Sheet1" }
    const res = parser.parse(formula.substring(1), position, true)

    // Array results: show the first scalar cell
    if (Array.isArray(res)) {
      const first = res.flat(Infinity)[0]
      return first ?? "#VALUE!"
    }

    return res
  } catch (err) {
    console.error("Formula Error:", err)
    return "#ERROR!"
  }
}
