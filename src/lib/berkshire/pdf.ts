import fs from "node:fs/promises";
import pdfParse from "pdf-parse";

export async function extractPdfText(filePath: string) {
  const fileBuffer = await fs.readFile(filePath);
  const parsed = await pdfParse(fileBuffer);

  return normalizeExtractedText(parsed.text);
}

function normalizeExtractedText(text: string) {
  return text
    .replaceAll("\r", "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
