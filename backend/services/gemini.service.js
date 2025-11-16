import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not set. AI features will not work.');
}

/**
 * Generate embedding for text using Gemini API
 */
export async function generateEmbedding(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        model: 'models/text-embedding-004',
        content: {
          parts: [{
            text: text.substring(0, 2048) // Limit to 2048 characters
          }]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.embedding.values;
  } catch (error) {
    console.error('Gemini embedding error:', error.response?.data || error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate summary for document using Gemini API
 */
export async function generateSummary(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `Summarize the following marketing document.

DOCUMENT TEXT:
${text.substring(0, 4000)}

Provide:
1. A brief 2-sentence overview
2. Exactly 3 key takeaway bullet points

Format as JSON:
{
  "short": "2-sentence summary here",
  "bullets": ["point 1", "point 2", "point 3"]
}`;

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return {
        short: summary.short || 'No summary available',
        bullets: Array.isArray(summary.bullets) ? summary.bullets.slice(0, 3) : []
      };
    }
    
    // Fallback if JSON parsing fails
    return {
      short: 'Summary generation failed',
      bullets: []
    };
  } catch (error) {
    console.error('Gemini summary error:', error.response?.data || error.message);

    // If model isn't available or another API error occurred, fall back to a simple local summarizer
    try {
      const short = simpleLocalSummary(text);
      const bullets = simpleLocalBullets(text, 3);
      return { short, bullets };
    } catch (fallbackErr) {
      console.error('Local summary fallback failed:', fallbackErr.message);
      return {
        short: 'Error generating summary',
        bullets: []
      };
    }
  }
}

/**
 * Classify document and extract tags using Gemini API
 */
export async function classifyAndTag(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `Analyze the following marketing document text and classify it.

DOCUMENT TEXT:
${text.substring(0, 4000)}

INSTRUCTIONS:
1. Classify into ONE category from: Campaigns, Research, Strategy, Budget, Creative, Analytics, Legal, Contracts, Meeting Notes, Reports, Uncategorized
2. Extract exactly 5 relevant keywords/tags
3. Return ONLY valid JSON in this exact format:

{
  "category": "category_name",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // Validate category
      const validCategories = ['Campaigns', 'Research', 'Strategy', 'Budget', 'Creative', 
                               'Analytics', 'Legal', 'Contracts', 'Meeting Notes', 'Reports', 'Uncategorized'];
      const category = validCategories.includes(result.category) ? result.category : 'Uncategorized';
      
      // Validate tags
      const tags = Array.isArray(result.tags) ? result.tags.slice(0, 5) : [];
      
      return { category, tags };
    }
    
    // Fallback
    return {
      category: 'Uncategorized',
      tags: []
    };
  } catch (error) {
    console.error('Gemini classification error:', error.response?.data || error.message);

    // Local fallback: simple tag extraction and Uncategorized
    try {
      const tags = extractTopKeywords(text, 5);
      return { category: 'Uncategorized', tags };
    } catch (fallbackErr) {
      console.error('Local classification fallback failed:', fallbackErr.message);
      return { category: 'Uncategorized', tags: [] };
    }
  }
}

/**
 * Simple local summary: take first two sentences as a short summary
 */
function simpleLocalSummary(text) {
  if (!text) return 'No content';
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]?/g) || [];
  return (sentences.slice(0, 2).join(' ') || text.substring(0, 200)).trim();
}

/**
 * Simple local bullets: extract top N frequent non-stopwords as bullets
 */
function simpleLocalBullets(text, n = 3) {
  const tags = extractTopKeywords(text, n);
  return tags.map(t => t);
}

/**
 * Extract top N keywords by frequency, naive approach
 */
function extractTopKeywords(text, n = 5) {
  if (!text) return [];
  const stopwords = new Set(['the','and','is','in','to','of','a','for','on','with','that','this','it','as','are','was','by','an','be','or','from','at','we','you','your']);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const freq = {};
  for (const w of words) {
    if (w.length < 3) continue;
    if (stopwords.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).map(e => e[0]);
  return sorted.slice(0, n);
}

export default {
  generateEmbedding,
  generateSummary,
  classifyAndTag
};

