/**
 * Basic spreadsheet formula engine
 * Supports: 
 * - Cell references: A1, B5, etc.
 * - Basic math: +, -, *, /, ( )
 * - Functions: SUM, AVG, COUNT, MIN, MAX
 */

const getCellValue = (ref, rows, cols) => {
    const match = ref.match(/^([A-Z]+)([0-9]+)$/)
    if (!match) return 0

    const colStr = match[1]
    const rowIdx = parseInt(match[2], 10) - 1

    // Convert A, B, C... to 0, 1, 2...
    let colIdx = 0
    for (let i = 0; i < colStr.length; i++) {
        colIdx = colIdx * 26 + (colStr.charCodeAt(i) - 64)
    }
    colIdx -= 1

    const row = rows[rowIdx]
    const col = cols[colIdx]

    if (!row || !col) return 0
    const val = row[col.name]
    return isNaN(parseFloat(val)) ? 0 : parseFloat(val)
}

const resolveRange = (range, rows, cols) => {
    const [start, end] = range.split(':')
    if (!start || !end) return []

    const startMatch = start.match(/^([A-Z]+)([0-9]+)$/)
    const endMatch = end.match(/^([A-Z]+)([0-9]+)$/)
    if (!startMatch || !endMatch) return []

    const startCol = startMatch[1]
    const startRow = parseInt(startMatch[2], 10) - 1
    const endCol = endMatch[1]
    const endRow = parseInt(endMatch[2], 10) - 1

    const getColIdx = (s) => {
        let idx = 0
        for (let i = 0; i < s.length; i++) idx = idx * 26 + (s.charCodeAt(i) - 64)
        return idx - 1
    }

    const sColIdx = getColIdx(startCol)
    const eColIdx = getColIdx(endCol)

    const values = []
    for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
        for (let c = Math.min(sColIdx, eColIdx); c <= Math.max(sColIdx, eColIdx); c++) {
            const row = rows[r]
            const col = cols[c]
            if (row && col) {
                const val = parseFloat(row[col.name])
                if (!isNaN(val)) values.push(val)
            }
        }
    }
    return values
}

export const evaluateFormula = (formula, rows, cols) => {
    if (!formula || typeof formula !== 'string' || !formula.startsWith('=')) {
        return formula
    }

    try {
        let expression = formula.substring(1).toUpperCase()

        // 1. Handle Ranges in functions: SUM(A1:C1) -> SUM([vals])
        expression = expression.replace(/([A-Z]+[0-9]+:[A-Z]+[0-9]+)/g, (match) => {
            const vals = resolveRange(match, rows, cols)
            return `[${vals.join(',')}]`
        })

        // 2. Handle single cell references: A1 -> 10
        expression = expression.replace(/([A-Z]+[0-9]+)/g, (match) => {
            return getCellValue(match, rows, cols)
        })

        // 3. Basic Functions
        const functions = {
            SUM: (arr) => arr.reduce((a, b) => a + b, 0),
            AVG: (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
            COUNT: (arr) => arr.length,
            MIN: (arr) => Math.min(...arr),
            MAX: (arr) => Math.max(...arr),
        }

        Object.keys(functions).forEach(fn => {
            const regex = new RegExp(`${fn}\\(\\[(.*?)\\]\\)`, 'g')
            expression = expression.replace(regex, (_, args) => {
                const vals = args.split(',').map(Number).filter(n => !isNaN(n))
                return functions[fn](vals)
            })
            
            // Also handle comma separated values SUM(1,2,3)
            const regexComma = new RegExp(`${fn}\\((.*?)\\)`, 'g')
            expression = expression.replace(regexComma, (_, args) => {
                const vals = args.split(',').map(v => {
                   try { return eval(v) } catch { return 0 }
                }).map(Number)
                return functions[fn](vals)
            })
        })

        // 4. Final Math expression evaluation
        // eslint-disable-next-line no-eval
        const result = eval(expression)
        return isFinite(result) ? result : '#VALUE!'
    } catch (err) {
        console.error("Formula Error:", err)
        return '#ERROR!'
    }
}
