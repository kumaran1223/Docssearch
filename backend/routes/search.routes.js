import express from 'express';
import File from '../models/File.js';
import SearchLog from '../models/SearchLog.js';
import { generateEmbedding } from '../services/gemini.service.js';
import { hybridSearch } from '../utils/vectorSearch.js';

const router = express.Router();

/**
 * POST /api/search
 * Search for documents
 */
router.post('/', async (req, res) => {
  try {
    const { query, category, page = 1, limit = 10 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Build filter
    const filter = { processingStatus: 'complete' };
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Get all matching documents
    const documents = await File.find(filter);

    if (documents.length === 0) {
      return res.json({
        results: [],
        total: 0,
        page: 1,
        totalPages: 0
      });
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Perform hybrid search
    const searchResults = hybridSearch(queryEmbedding, query, documents);

    // Log search
    await SearchLog.create({
      query,
      resultsCount: searchResults.length,
      filters: { category }
    });

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    // Format results with snippets
    const formattedResults = paginatedResults.map(result => {
      const snippet = result.matchedChunk 
        ? highlightSnippet(result.matchedChunk.text, query)
        : highlightSnippet(result.document.text.substring(0, 300), query);

      return {
        id: result.document._id,
        title: result.document.title,
        snippet,
        summary: result.document.summary,
        tags: result.document.tags,
        category: result.document.category,
        uploadDate: result.document.uploadDate,
        score: result.finalScore,
        semanticScore: result.semanticScore,
        keywordScore: result.keywordScore
      };
    });

    res.json({
      results: formattedResults,
      total: searchResults.length,
      page: parseInt(page),
      totalPages: Math.ceil(searchResults.length / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/recent
 * Get recent searches
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const recentSearches = await SearchLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('query timestamp resultsCount');

    res.json(recentSearches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function to highlight query terms in snippet
 */
function highlightSnippet(text, query) {
  if (!text) return '';
  
  const terms = query.toLowerCase().split(/\s+/);
  let highlighted = text.substring(0, 300);

  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return highlighted + (text.length > 300 ? '...' : '');
}

export default router;

