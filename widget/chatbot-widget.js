(function() {
  if (window.WebBotWidget) return;
  
  window.WebBotWidget = {
    init: function() {
      this.createWidget();
    },
    
    createWidget: function() {
      const widget = document.createElement('div');
      widget.id = 'webbot-widget';
      widget.innerHTML = `
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
        ">
          💬
        </div>
        
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
            <h3 style="margin: 0;">WebBot</h3>
            <button id="webbot-close" style="background: none; border: none; color: white; cursor: pointer;">×</button>
          </div>
          
          <div id="webbot-messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f9fafb;">
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              Hi! Ask me about this website.
            </div>
          </div>
          
          <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 8px;">
              <input id="webbot-input" type="text" placeholder="Ask anything..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
              <button id="webbot-send" style="background: #4F46E5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Send</button>
            </div>
          </div>
        </div>
      `;
      
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
    
    addMessage: function(text, type) {
      const messages = document.getElementById('webbot-messages');
      const div = document.createElement('div');
      div.style.cssText = `
        background: ${type === 'user' ? '#4F46E5' : 'white'};
        color: ${type === 'user' ? 'white' : 'black'};
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        margin-left: ${type === 'user' ? 'auto' : '0'};
        margin-right: ${type === 'user' ? '0' : 'auto'};
        max-width: 80%;
      `;
      div.textContent = text;
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
          model: 'gemini-2.0-flash'
        })
      })
      .then(r => r.json())
      .then(data => {
        const messages = document.getElementById('webbot-messages');
        messages.removeChild(messages.lastChild);
        this.addMessage(data.answer || 'Error occurred', 'bot');
      })
      .catch(() => {
        const messages = document.getElementById('webbot-messages');
        messages.removeChild(messages.lastChild);
        this.addMessage('Connection error', 'bot');
      });
    }
  };
  
  WebBotWidget.init();
})();