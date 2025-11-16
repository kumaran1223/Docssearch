import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', process.env.STORAGE_PATH || 'uploads');

/**
 * Extract text from various file formats
 */
export async function extractText(filename, mimeType) {
  const filePath = path.join(UPLOADS_DIR, filename);

  try {
    // PDF files
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }

    // Word documents (.docx)
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // PowerPoint (.pptx) - extract as text
    if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // For PPTX, we'll use a simple extraction
      // In production, you'd use a proper PPTX parser
      const buffer = await fs.readFile(filePath);
      const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));
      // Extract readable text (basic approach)
      const readable = text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
      return readable || 'PowerPoint content (text extraction limited)';
    }

    // Plain text files
    if (mimeType === 'text/plain' || mimeType.startsWith('text/')) {
      const text = await fs.readFile(filePath, 'utf-8');
      return text;
    }

    // Images - use OCR
    if (mimeType.startsWith('image/')) {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      return text || 'No text found in image';
    }

    // Unsupported format
    return `Unsupported file format: ${mimeType}`;
  } catch (error) {
    console.error(`Error extracting text from ${filename}:`, error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

export default { extractText };

