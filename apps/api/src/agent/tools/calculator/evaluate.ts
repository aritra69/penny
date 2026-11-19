const tokenize = (expression: string): string[] => {
  const tokens = expression.match(/\d+(?:\.\d+)?|\.\d+|[+\-*/%^()]|\S/g) ?? [];
  if (tokens.length === 0) throw new Error("Empty expression");
  return tokens;
};

/**
 * Safe arithmetic evaluator for the agent's calculator tool. Parses the expression
 * itself (no `eval`), so model-supplied input can only ever do arithmetic.
 *
 * Grammar (lowest to highest precedence):
 *   expr    = term (("+" | "-") term)*
 *   term    = unary (("*" | "/" | "%") unary)*
 *   unary   = ("+" | "-") unary | power
 *   power   = primary ("^" unary)?        right-associative; -2^2 = -4
 *   primary = number | "(" expr ")"
 */
export const evaluate = (expression: string): number => {
  const tokens = tokenize(expression);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (value: string) => {
    if (next() !== value) throw new Error(`Expected "${value}"`);
  };

  const expr = (): number => {
    let value = term();
    while (peek() === "+" || peek() === "-") {
      value = next() === "+" ? value + term() : value - term();
    }
    return value;
  };

  const term = (): number => {
    let value = unary();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = next();
      const rhs = unary();
      if ((op === "/" || op === "%") && rhs === 0) throw new Error("Division by zero");
      value = op === "*" ? value * rhs : op === "/" ? value / rhs : value % rhs;
    }
    return value;
  };

  const unary = (): number => {
    if (peek() === "-") {
      next();
      return -unary();
    }
    if (peek() === "+") {
      next();
      return unary();
    }
    return power();
  };

  const power = (): number => {
    const base = primary();
    if (peek() === "^") {
      next();
      return base ** unary();
    }
    return base;
  };

  const primary = (): number => {
    const token = next();
    if (token === undefined) throw new Error("Unexpected end of expression");
    if (token === "(") {
      const value = expr();
      expect(")");
      return value;
    }
    const value = Number(token);
    if (Number.isNaN(value)) throw new Error(`Unexpected "${token}"`);
    return value;
  };

  const result = expr();
  if (pos < tokens.length) throw new Error(`Unexpected "${peek()}"`);
  if (!Number.isFinite(result)) throw new Error("Result is not a finite number");
  return result;
};
