const { Pinecone } = require('@pinecone-database/pinecone');

class PineconeService {
  constructor() {
    this.pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    this.indexName = process.env.PINECONE_INDEX_NAME;
  }

  async upsertEmbedding(id, embedding, metadata) {
    try {
      const index = this.pc.index(this.indexName);
      
      await index.upsert([{
        id: id,
        values: embedding,
        metadata: metadata
      }]);
      
      console.log(`✅ Stored embedding in Pinecone: ${id}`);
    } catch (error) {
      console.error('Pinecone upsert error:', error);
      throw error;
    }
  }

  async queryEmbeddings(embedding, topK = 3, filter = {}) {
    try {
      const index = this.pc.index(this.indexName);
      
      const queryResponse = await index.query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
        filter: filter
      });
      
      return queryResponse.matches;
    } catch (error) {
      console.error('Pinecone query error:', error);
      throw error;
    }
  }
}

module.exports = new PineconeService();