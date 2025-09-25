const { GoogleGenerativeAI } = require('@google/generative-ai');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const embedder = require('./embedder');
const pinecone = require('./pinecone');

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async trainRAG(linkId) {
    try {
      const link = await Link.findById(linkId);
      if (!link) {
        throw new Error('Link not found');
      }
      
      const WebsiteModel = getWebsiteModel(linkId);
      const websiteData = await WebsiteModel.find({ websiteId: linkId });
      
      console.log(`Training RAG for linkId: ${linkId}`);
      console.log(`Found ${websiteData.length} documents for training`);
      
      for (const data of websiteData) {
        if (data.content && !data.embedding.length) {
          const embeddingVector = await embedder.generateEmbedding(data.content);
          
          // Create unique ID for Pinecone
          const pineconeId = `${linkId}_${data._id.toString()}`;
          
          // Store embedding in Pinecone
          await pinecone.upsertEmbedding(
            pineconeId,
            embeddingVector,
            {
              text: data.content.substring(0, 500), // First 500 chars
              source_page: data.text || 'page',
              section: 'content',
              url: data.url,
              linkId: linkId,
              websiteId: data.websiteId
            }
          );
          
          // Mark as embedded in MongoDB (keep content, don't store embedding)
          data.embedding = [1]; // Just mark as embedded
          await data.save();
          
          console.log(`✅ Embedded: ${data.url}`);
        }
      }
      
      // Update link embedding status
      link.isEmbedded = true;
      await link.save();
      
      return { success: true, message: 'RAG training completed' };
    } catch (error) {
      throw new Error(`RAG training failed: ${error.message}`);
    }
  }

  async query(linkId, question) {
    try {
      console.log('Querying for linkId:', linkId, 'question:', question);
      
      // Generate question embedding
      const questionEmbedding = await embedder.generateEmbedding(question);
      
      // Query Pinecone for similar embeddings
      const matches = await pinecone.queryEmbeddings(
        questionEmbedding,
        3,
        { linkId: { $eq: linkId } }
      );
      
      console.log('Found Pinecone matches:', matches.length);
      
      if (matches.length === 0) {
        return "No trained data available. Please upload and train a website first.";
      }
      
      // Extract context from matches
      const context = matches.map(match => match.metadata.text).join('\n\n');
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a professional business assistant. Based on the provided website content, answer the user's question in a clear, professional manner.

Website Content:
${context}

User Question: ${question}

Instructions:
- Provide a direct, professional response
- Use clear, business-appropriate language
- Structure information in paragraphs, not bullet points
- Do not use markdown formatting (no *, #, -, etc.)
- Only use information from the provided website content
- If the information is not available, politely state that

Professional Response:`;

      const result = await model.generateContent(prompt);
      let response = result.response.text();
      
      // Clean up any remaining markdown formatting
      response = response
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
        .replace(/^[*-]\s+/gm, '')      // Remove bullet points
        .replace(/^#{1,6}\s+/gm, '')    // Remove headers
        .replace(/`(.*?)`/g, '$1')      // Remove code formatting
        .trim();
      
      return response;
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }
}

module.exports = new RAGService();