import { describe, expect, it } from "vitest";
import { toCodeLines } from "./code";

describe("toCodeLines", () => {
  it("drops the blank first and last line a template literal leaves behind", () => {
    expect(toCodeLines("\nconst a = 1;\n")).toEqual([{ text: "const a = 1;", tone: "fg" }]);
  });

  it("removes the common indentation so a nested literal reads flush left", () => {
    const lines = toCodeLines(`
      if (ok) {
        run();
      }
    `);
    expect(lines.map((l) => l.text)).toEqual(["if (ok) {", "  run();", "}"]);
  });

  it("ignores blank lines when measuring indentation, and keeps them empty", () => {
    const lines = toCodeLines(`
      a();

      b();
    `);
    expect(lines.map((l) => l.text)).toEqual(["a();", "", "b();"]);
  });

  it("tones comments down and leaves code at full contrast", () => {
    const lines = toCodeLines(`
      // why this exists
      run();
      # shell comment
    `);
    expect(lines.map((l) => l.tone)).toEqual(["muted", "fg", "muted"]);
  });

  it("treats an indented comment as a comment", () => {
    expect(toCodeLines("  // note")[0].tone).toBe("muted");
  });

  it("returns nothing for an empty source", () => {
    expect(toCodeLines("   \n  \n")).toEqual([]);
  });
});
