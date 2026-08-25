/**
 * Conversational AI Assistant Widget for AgriAI – Waste2Fuel
 * Directly interacts with website views, forms, and triggers actions.
 */

const ChatbotModule = {
  isOpen: false,

  init() {
    this.setupListeners();
  },

  setupListeners() {
    const toggleBtn = document.getElementById('btn-chatbot-toggle');
    const chatContainer = document.getElementById('ai-chatbot-widget');
    const closeBtn = document.getElementById('btn-chatbot-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');

    if (toggleBtn && chatContainer) {
      toggleBtn.addEventListener('click', () => this.toggleChat());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          this.sendMessage(text);
          input.value = '';
        }
      });
    }

    // Quick Action Chips
    document.querySelectorAll('.btn-chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query') || chip.textContent.trim();
        this.sendMessage(query);
      });
    });
  },

  toggleChat() {
    this.isOpen = !this.isOpen;
    const widget = document.getElementById('ai-chatbot-widget');
    if (widget) {
      if (this.isOpen) {
        widget.classList.add('active');
        document.getElementById('chatbot-input')?.focus();
      } else {
        widget.classList.remove('active');
      }
    }
  },

  openChat() {
    this.isOpen = true;
    const widget = document.getElementById('ai-chatbot-widget');
    if (widget) widget.classList.add('active');
  },

  closeChat() {
    this.isOpen = false;
    const widget = document.getElementById('ai-chatbot-widget');
    if (widget) widget.classList.remove('active');
  },

  appendMessage(text, sender = 'bot', actionTrigger = null) {
    const msgList = document.getElementById('chatbot-messages');
    if (!msgList) return;

    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg chat-msg-${sender}`;

    if (sender === 'user') {
      msgEl.innerHTML = `<div class="chat-bubble user-bubble">${text}</div>`;
    } else {
      let actionBtnHtml = '';
      if (actionTrigger) {
        if (actionTrigger.type === 'RUN_DEMO') {
          actionBtnHtml = `<button class="btn btn-secondary btn-sm" style="margin-top: 6px;" onclick="App.runGunturDemoScenario(); ChatbotModule.closeChat();">🚀 Open Demo Recommendation</button>`;
        } else if (actionTrigger.type === 'NAVIGATE') {
          actionBtnHtml = `<button class="btn btn-outline-primary btn-sm" style="margin-top: 6px;" onclick="App.navigate('${actionTrigger.view}'); ChatbotModule.closeChat();">👉 View On Website</button>`;
        }
      }

      msgEl.innerHTML = `
        <div class="chat-avatar">🤖</div>
        <div class="chat-bubble bot-bubble">
          <div>${text}</div>
          ${actionBtnHtml}
          <div style="margin-top: 6px; display: flex; gap: 6px;">
            <button class="btn-tts-mini" onclick="VoiceAssistant.speakText('${text.replace(/'/g, "\\'")}')">
              🔊 Listen
            </button>
          </div>
        </div>
      `;
    }

    msgList.appendChild(msgEl);
    msgList.scrollTop = msgList.scrollHeight;
  },

  async sendMessage(query) {
    this.openChat();
    this.appendMessage(query, 'user');

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    const msgList = document.getElementById('chatbot-messages');
    if (msgList) {
      const typingEl = document.createElement('div');
      typingEl.id = typingId;
      typingEl.className = 'chat-msg chat-msg-bot';
      typingEl.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble bot-bubble" style="color: #64748b;"><em>AgriBot is thinking...</em></div>`;
      msgList.appendChild(typingEl);
      msgList.scrollTop = msgList.scrollHeight;
    }

    try {
      const currentLang = window.I18N ? window.I18N.currentLang : 'en';
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language: currentLang })
      });

      const data = await response.json();
      document.getElementById(typingId)?.remove();

      if (data.success) {
        this.appendMessage(data.reply, 'bot', data.actionTrigger);

        // Execute action automatically if matched
        if (data.actionTrigger) {
          if (data.actionTrigger.type === 'RUN_DEMO' && window.App) {
            window.App.runGunturDemoScenario();
          } else if (data.actionTrigger.type === 'NAVIGATE' && window.App) {
            window.App.navigate(data.actionTrigger.view);
          }
        }
      } else {
        this.appendMessage("I could not process your query. Please try asking about 2G Ethanol, Biomass Pooling, or Composting.", 'bot');
      }
    } catch (err) {
      console.error('Chat error:', err);
      document.getElementById(typingId)?.remove();
      this.appendMessage("Sorry, I encountered a temporary connection glitch. You can still use the direct form to analyze residue!", 'bot');
    }
  }
};

window.ChatbotModule = ChatbotModule;
