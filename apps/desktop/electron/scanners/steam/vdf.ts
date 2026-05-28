export function tokenizeVdf(content: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < content.length) {
    const char = content[index];

    if (char === '"') {
      const result = readQuotedString(content, index + 1);
      tokens.push(result.value);
      index = result.nextIndex;
      continue;
    }

    if (char === "{" || char === "}") {
      tokens.push(char);
      index += 1;
      continue;
    }

    if (char === "/" && content[index + 1] === "/") {
      index += 2;
      while (index < content.length && content[index] !== "\n") {
        index += 1;
      }
      continue;
    }

    index += 1;
  }

  return tokens;
}

export function parseFlatVdfPairs(content: string): Record<string, string> {
  const tokens = tokenizeVdf(content);
  const pairs: Record<string, string> = {};
  let index = 0;

  while (index + 1 < tokens.length) {
    const key = tokens[index];
    const value = tokens[index + 1];

    if (key !== "{" && key !== "}" && value !== "{" && value !== "}") {
      pairs[key] = value;
      index += 2;
    } else {
      index += 1;
    }
  }

  return pairs;
}

function readQuotedString(content: string, startIndex: number): {
  value: string;
  nextIndex: number;
} {
  let value = "";
  let index = startIndex;

  while (index < content.length) {
    const char = content[index];

    if (char === "\\") {
      const escaped = content[index + 1];
      if (escaped === '"' || escaped === "\\") {
        value += escaped;
        index += 2;
        continue;
      }

      if (escaped) {
        value += `\\${escaped}`;
        index += 2;
        continue;
      }

      value += "\\";
      index += 1;
      continue;
    }

    if (char === '"') {
      return { value, nextIndex: index + 1 };
    }

    value += char;
    index += 1;
  }

  throw new Error("VDF inválido: string sem fechamento.");
}
