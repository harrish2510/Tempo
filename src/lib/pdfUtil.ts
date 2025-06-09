// src/lib/pdfUtil.ts
import fs from "fs";

/**
 * Extract plain text from a PDF Buffer using pdf-parse,
 * with a quick monkey-patch to ignore its built-in test file.
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  // 1) Monkey‐patch fs.readFileSync so that if pdf-parse tries to
  //    load its example PDF, we return an empty buffer instead.
  const _origRead = fs.readFileSync;
  (fs as any).readFileSync = (pathArg: any, options?: any) => {
    if (
      typeof pathArg === "string" &&
      pathArg.includes("test/data/05-versions-space.pdf")
    ) {
      return Buffer.alloc(0);
    }
    return _origRead(pathArg, options);
  };

  // 2) Require pdf-parse (must be installed)
  //    This will hit our stub above for that one test import.
  const pdfParse = require("pdf-parse") as (
    dataBuffer: Buffer
  ) => Promise<{ text: string }>;

  // 3) Restore the original for all other code
  fs.readFileSync = _origRead;

  // 4) Actually parse your buffer
  const { text } = await pdfParse(buffer);
  return text;
}
