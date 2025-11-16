import File from '../models/File.js';
import { extractText } from '../utils/textExtractor.js';
import { chunkText } from '../utils/chunker.js';
import { generateEmbedding, generateSummary, classifyAndTag } from './gemini.service.js';

/**
 * Process uploaded file asynchronously
 */
export async function processFile(fileId) {
  try {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    console.log(`Processing file: ${file.originalName}`);

    // Step 1: Extract text
    file.processingStatus = 'extracting';
    await file.save();
    
    const extractedText = await extractText(file.filename, file.mimeType);
    file.text = extractedText;
    await file.save();

    console.log(`✓ Extracted ${extractedText.length} characters from ${file.originalName}`);

    // Step 2: Chunk text
    const chunks = chunkText(extractedText);
    console.log(`✓ Created ${chunks.length} chunks`);

    // Step 3: Generate embeddings
    file.processingStatus = 'embedding';
    await file.save();

    const chunksWithEmbeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await generateEmbedding(chunks[i]);
        chunksWithEmbeddings.push({
          index: i,
          text: chunks[i],
          embedding: embedding
        });
        
        // Rate limiting: wait 100ms between requests
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error generating embedding for chunk ${i}:`, error.message);
        // Continue with next chunk
      }
    }

    file.chunks = chunksWithEmbeddings;
    await file.save();

    console.log(`✓ Generated embeddings for ${chunksWithEmbeddings.length} chunks`);

    // Step 4: Generate summary
    file.processingStatus = 'tagging';
    await file.save();

    const summary = await generateSummary(extractedText);
    file.summary = summary;
    await file.save();

    console.log(`✓ Generated summary`);

    // Step 5: Classify and tag
    const { category, tags } = await classifyAndTag(extractedText);
    file.category = category;
    file.tags = tags;
    file.processingStatus = 'complete';
    await file.save();

    console.log(`✓ Classified as ${category} with tags: ${tags.join(', ')}`);
    console.log(`✓ Processing complete for ${file.originalName}`);

    return file;
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
    
    // Update file with error status
    try {
      await File.findByIdAndUpdate(fileId, {
        processingStatus: 'error',
        errorMessage: error.message
      });
    } catch (updateError) {
      console.error('Error updating file status:', updateError);
    }
    
    throw error;
  }
}

/**
 * Process file in background (non-blocking)
 */
export function processFileAsync(fileId) {
  // Process in background without blocking
  processFile(fileId).catch(error => {
    console.error(`Background processing failed for file ${fileId}:`, error);
  });
}

export default {
  processFile,
  processFileAsync
};

