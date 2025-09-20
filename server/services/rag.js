const { GoogleGenerativeAI } = require('@google/generative-ai');
const ScrapedLink = require('../models/ScrapedLink');
const embedder = require('./embedder');
const pinecone = require('./pinecone');

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.embeddings = new Map();
  }

  async trainRAG(userId, originalUrl) {
    try {
      const scrapedLinks = await ScrapedLink.find({ userId, originalUrl });
      console.log(`Training RAG for userId: ${userId}, url: ${originalUrl}`);
      console.log(`Found ${scrapedLinks.length} links for training`);
      
      for (const link of scrapedLinks) {
        if (link.pageContent) {
          const embeddingVector = await embedder.generateEmbedding(link.pageContent);
          
          // Store embedding in Pinecone
          await pinecone.upsertEmbedding(
            link._id.toString(),
            embeddingVector,
            {
              userId,
              originalUrl,
              anchorUrl: link.anchorUrl,
              anchorText: link.anchorText,
              scrapedLinkId: link._id.toString()
            }
          );
          
          // Mark as embedded
          link.isEmbedded = true;
          await link.save();
          
          console.log(`✅ Embedded: ${link.anchorUrl}`);
        }
      }
      
      return { success: true, message: 'RAG training completed' };
    } catch (error) {
      throw new Error(`RAG training failed: ${error.message}`);
    }
  }

  async query(userId, question) {
    try {
      console.log('Querying for userId:', userId);
      
      // Generate question embedding
      const questionEmbedding = await embedder.generateEmbedding(question);
      
      // Query Pinecone for similar embeddings
      const matches = await pinecone.queryEmbeddings(
        questionEmbedding, 
        3, 
        { userId: { $eq: userId } }
      );
      
      console.log('Found Pinecone matches:', matches.length);
      
      if (matches.length === 0) {
        return "No trained data available. Please upload and train a website first.";
      }
      
      // Get content from matched scraped links
      const topResults = [];
      for (const match of matches) {
        const scrapedLink = await ScrapedLink.findById(match.metadata.scrapedLinkId);
        if (scrapedLink) {
          topResults.push({
            content: scrapedLink.pageContent,
            url: match.metadata.anchorUrl,
            score: match.score
          });
        }
      }
      
      const context = topResults.map(r => r.content).join('\n\n');
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Based on the following context from the website, answer the user's question in a well-structured format:

Context:
${context}

Question: ${question}

Instructions:
- Provide a clear, well-formatted answer
- Use proper headings and bullet points where appropriate
- Structure the information logically
- Make it easy to read and understand
- Only use information from the provided context

Answer:`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }
}

module.exports = new RAGService();