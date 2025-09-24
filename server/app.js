const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { requireAuth } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');
const ragRoutes = require('./routes/ragRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Widget route
app.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const linkId = req.query.linkId || 'default';
  
  const widgetScript = `
(function() {
  if (window.WebBotWidget) return;
  
  const linkId = '${linkId}';
  
  window.WebBotWidget = {
    init: function() {
      this.createWidget();
    },
    
    createWidget: function() {
      const widget = document.createElement('div');
      widget.innerHTML = \`
        <div id="webbot-toggle" style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #4F46E5;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-size: 24px;
          color: white;
        ">💬</div>
        
        <div id="webbot-chat" style="
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          z-index: 10001;
          display: none;
          flex-direction: column;
        ">
          <div style="background: #4F46E5; color: white; padding: 16px; display: flex; justify-content: space-between;">
            <h3 style="margin: 0;">WebBot Assistant</h3>
            <button id="webbot-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
          </div>
          
          <div id="webbot-messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f9fafb;">
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              Hi! I can help answer questions about this website. What would you like to know?
            </div>
          </div>
          
          <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 8px;">
              <input id="webbot-input" type="text" placeholder="Ask me anything..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
              <button id="webbot-send" style="background: #4F46E5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Send</button>
            </div>
          </div>
        </div>
      \`;
      
      document.body.appendChild(widget);
      this.bindEvents();
    },
    
    bindEvents: function() {
      document.getElementById('webbot-toggle').onclick = () => {
        const chat = document.getElementById('webbot-chat');
        chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
      };
      
      document.getElementById('webbot-close').onclick = () => {
        document.getElementById('webbot-chat').style.display = 'none';
      };
      
      const sendMessage = () => {
        const input = document.getElementById('webbot-input');
        const message = input.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        this.queryBot(message);
      };
      
      document.getElementById('webbot-send').onclick = sendMessage;
      document.getElementById('webbot-input').onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
      };
    },
    
    parseMarkdown: function(text) {
      return text
        // Bold text **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Headers ### text
        .replace(/^### (.*$)/gm, '<h3 style="margin: 8px 0; font-size: 16px; font-weight: bold;">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 style="margin: 10px 0; font-size: 18px; font-weight: bold;">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 style="margin: 12px 0; font-size: 20px; font-weight: bold;">$1</h1>')
        // Bullet points * item or - item
        .replace(/^[*-] (.+)$/gm, '<li style="margin-left: 16px;">$1</li>')
        // Numbered lists 1. item
        .replace(/^\d+\. (.+)$/gm, '<li style="margin-left: 16px; list-style-type: decimal;">$1</li>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Wrap consecutive <li> elements in <ul>
        .replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, '<ul style="margin: 8px 0; padding-left: 0;">$1</ul>');
    },
    
    addMessage: function(text, type) {
      const messages = document.getElementById('webbot-messages');
      const div = document.createElement('div');
      div.style.cssText = \`
        background: \${type === 'user' ? '#4F46E5' : 'white'};
        color: \${type === 'user' ? 'white' : '#374151'};
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        margin-left: \${type === 'user' ? 'auto' : '0'};
        margin-right: \${type === 'user' ? '0' : 'auto'};
        max-width: 80%;
        line-height: 1.5;
        font-size: 14px;
        word-wrap: break-word;
      \`;
      
      if (type === 'bot') {
        div.innerHTML = this.parseMarkdown(text);
      } else {
        div.textContent = text;
      }
      
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    },
    
    queryBot: function(question) {
      this.addMessage('Thinking...', 'bot');
      
      fetch('http://localhost:5000/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          model: 'gemini-2.0-flash',
          linkId: linkId
        })
      })
      .then(r => r.json())
      .then(data => {
        const messages = document.getElementById('webbot-messages');
        messages.removeChild(messages.lastChild);
        this.addMessage(data.answer || 'Sorry, I could not process your request.', 'bot');
      })
      .catch(() => {
        const messages = document.getElementById('webbot-messages');
        messages.removeChild(messages.lastChild);
        this.addMessage('Connection error. Please try again.', 'bot');
      });
    }
  };
  
  WebBotWidget.init();
})();
  `;
  
  res.send(widgetScript);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/rag', ragRoutes);

// Health check for monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

module.exports = app;