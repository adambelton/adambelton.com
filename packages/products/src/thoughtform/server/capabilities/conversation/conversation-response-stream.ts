export function createJsonStringFieldDeltaDecoder(field: string) {
  let source = "";
  let cursor = 0;
  let valueStarted = false;
  let finished = false;

  return {
    push(chunk: string) {
      if (finished || !chunk) return "";
      source += chunk;
      if (!valueStarted) {
        const fieldIndex = source.indexOf(`"${field}"`);
        if (fieldIndex === -1) return "";
        const colonIndex = source.indexOf(":", fieldIndex + field.length + 2);
        if (colonIndex === -1) return "";
        const quoteIndex = source.indexOf('"', colonIndex + 1);
        if (quoteIndex === -1) return "";
        cursor = quoteIndex + 1;
        valueStarted = true;
      }

      let delta = "";
      while (cursor < source.length) {
        const character = source[cursor]!;
        if (character === '"') {
          finished = true;
          cursor += 1;
          break;
        }
        if (character !== "\\") {
          delta += character;
          cursor += 1;
          continue;
        }
        if (cursor + 1 >= source.length) break;
        const escape = source[cursor + 1]!;
        if (escape === "u") {
          const code = source.slice(cursor + 2, cursor + 6);
          if (code.length < 4) break;
          if (!/^[0-9a-f]{4}$/i.test(code)) {
            cursor += 2;
            continue;
          }
          delta += String.fromCharCode(Number.parseInt(code, 16));
          cursor += 6;
          continue;
        }
        if (escape === "\\" && source[cursor + 2] === "u") {
          const code = source.slice(cursor + 3, cursor + 7);
          if (code.length < 4) break;
          if (/^[0-9a-f]{4}$/i.test(code)) {
            delta += String.fromCharCode(Number.parseInt(code, 16));
            cursor += 7;
            continue;
          }
        }
        const escapedCharacters: Record<string, string> = {
          '"': '"',
          "\\": "\\",
          "/": "/",
          b: "\b",
          f: "\f",
          n: "\n",
          r: "\r",
          t: "\t",
        };
        delta += escapedCharacters[escape] ?? escape;
        cursor += 2;
      }
      return delta;
    },
  };
}
