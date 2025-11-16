import natural from 'natural';

const TfIdf = natural.TfIdf;

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Perform semantic search using embeddings
 */
export function semanticSearch(queryEmbedding, documents) {
  const results = [];

  for (const doc of documents) {
    if (!doc.chunks || doc.chunks.length === 0) {
      continue;
    }

    // Find best matching chunk
    let bestScore = 0;
    let bestChunk = null;

    for (const chunk of doc.chunks) {
      if (chunk.embedding && chunk.embedding.length > 0) {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        if (score > bestScore) {
          bestScore = score;
          bestChunk = chunk;
        }
      }
    }

    if (bestChunk) {
      results.push({
        document: doc,
        score: bestScore,
        matchedChunk: bestChunk
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Perform keyword search using BM25 algorithm
 */
export function keywordSearch(query, documents) {
  const tfidf = new TfIdf();

  // Add all documents to TF-IDF
  documents.forEach(doc => {
    const text = `${doc.title} ${doc.text} ${doc.tags.join(' ')}`;
    tfidf.addDocument(text);
  });

  // Calculate scores for query
  const scores = [];
  const queryTerms = query.toLowerCase().split(/\s+/);

  documents.forEach((doc, index) => {
    let score = 0;
    queryTerms.forEach(term => {
      score += tfidf.tfidf(term, index);
    });
    scores.push({ document: doc, score });
  });

  // Normalize scores to 0-1 range
  const maxScore = Math.max(...scores.map(s => s.score), 1);
  const normalized = scores.map(s => ({
    document: s.document,
    score: s.score / maxScore
  }));

  return normalized.sort((a, b) => b.score - a.score);
}

/**
 * Hybrid search combining semantic and keyword search
 */
export function hybridSearch(queryEmbedding, query, documents, semanticWeight = 0.7) {
  const semanticResults = semanticSearch(queryEmbedding, documents);
  const keywordResults = keywordSearch(query, documents);

  // Create a map of document scores
  const scoreMap = new Map();

  // Add semantic scores
  semanticResults.forEach(result => {
    const docId = result.document._id.toString();
    scoreMap.set(docId, {
      document: result.document,
      semanticScore: result.score,
      keywordScore: 0,
      matchedChunk: result.matchedChunk
    });
  });

  // Add keyword scores
  keywordResults.forEach(result => {
    const docId = result.document._id.toString();
    if (scoreMap.has(docId)) {
      scoreMap.get(docId).keywordScore = result.score;
    } else {
      scoreMap.set(docId, {
        document: result.document,
        semanticScore: 0,
        keywordScore: result.score,
        matchedChunk: null
      });
    }
  });

  // Calculate hybrid scores
  const hybridResults = Array.from(scoreMap.values()).map(item => ({
    document: item.document,
    semanticScore: item.semanticScore,
    keywordScore: item.keywordScore,
    finalScore: (semanticWeight * item.semanticScore) + ((1 - semanticWeight) * item.keywordScore),
    matchedChunk: item.matchedChunk
  }));

  return hybridResults.sort((a, b) => b.finalScore - a.finalScore);
}

export default {
  cosineSimilarity,
  semanticSearch,
  keywordSearch,
  hybridSearch
};

