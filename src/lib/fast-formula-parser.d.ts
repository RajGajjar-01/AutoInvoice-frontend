declare module "fast-formula-parser" {
  interface FormulaParserOptions {
    onCell: (ref: { row: number; col: number }) => unknown
    onRange: (ref: {
      from: { row: number; col: number }
      to: { row: number; col: number }
    }) => unknown[][]
    functions?: Record<string, (...args: unknown[]) => unknown>
  }

  interface ParsePosition {
    row: number
    col: number
    sheet: string
  }

  class FormulaParser {
    constructor(options: FormulaParserOptions)
    parse(
      formula: string,
      position: ParsePosition,
      updateRange?: boolean,
    ): unknown
  }

  export default FormulaParser
}
