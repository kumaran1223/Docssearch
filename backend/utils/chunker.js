/**
 * Chunk text into smaller pieces with overlap
 * 
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Size of each chunk (default: 1500)
 * @param {number} overlap - Overlap between chunks (default: 200)
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, chunkSize = 1500, overlap = 200) {
  if (!text || text.length === 0) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // If this is not the last chunk, try to break at sentence boundary
    if (end < text.length) {
      // Look for sentence endings near the chunk boundary
      const searchStart = Math.max(start, end - 100);
      const searchText = text.substring(searchStart, end + 100);
      
      // Find last sentence ending (., !, ?)
      const sentenceEnd = searchText.search(/[.!?]\s/);
      
      if (sentenceEnd !== -1) {
        end = searchStart + sentenceEnd + 1;
      }
    }

    // Extract chunk
    const chunk = text.substring(start, end).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position (with overlap)
    start = end - overlap;
    
    // Prevent infinite loop
    if (start <= chunks.length * chunkSize - overlap * chunks.length) {
      start = end;
    }
  }

  return chunks;
}

export default { chunkText };

