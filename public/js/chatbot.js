/** Safe conversational interface for the AgriAI backend advisor. */
const ChatbotModule = {
  isOpen: false,

  init() {
    document.getElementById('btn-chatbot-toggle')?.addEventListener('click', () => this.toggleChat());
    document.getElementById('btn-chatbot-close')?.addEventListener('click', () => this.closeChat());
    document.getElementById('chatbot-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('chatbot-input');
      const value = input?.value.trim();
      if (value) this.sendMessage(value);
      if (input) input.value = '';
    });
    document.querySelectorAll('.btn-chat-chip').forEach((chip) => chip.addEventListener('click', () => this.sendMessage(chip.dataset.query || chip.textContent)));
  },

  toggleChat() { this.isOpen ? this.closeChat() : this.openChat(); },
  openChat() {
    this.isOpen = true;
    document.getElementById('ai-chatbot-widget')?.classList.add('active');
    document.getElementById('chatbot-input')?.focus();
  },
  closeChat() {
    this.isOpen = false;
    document.getElementById('ai-chatbot-widget')?.classList.remove('active');
  },

  appendMessage(text, sender = 'bot', actionTrigger = null) {
    const list = document.getElementById('chatbot-messages');
    if (!list) return;
    const row = document.createElement('div');
    row.className = `chat-msg chat-msg-${sender}`;
    if (sender === 'user') {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble user-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);
    } else {
      const avatar = document.createElement('div');
      avatar.className = 'chat-avatar';
      avatar.textContent = 'AI';
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble bot-bubble';
      const answer = document.createElement('div');
      answer.style.whiteSpace = 'pre-line';
      answer.textContent = text;
      bubble.appendChild(answer);
      const controls = document.createElement('div');
      controls.style.cssText = 'margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;';
      const listen = document.createElement('button');
      listen.className = 'btn-tts-mini';
      listen.type = 'button';
      listen.textContent = 'Listen';
      listen.addEventListener('click', () => window.VoiceAssistant?.speakText(text));
      controls.appendChild(listen);
      if (actionTrigger?.type === 'NAVIGATE') {
        const open = document.createElement('button');
        open.className = 'btn btn-secondary btn-sm';
        open.type = 'button';
        open.textContent = 'Open result';
        open.addEventListener('click', () => { window.App?.navigate(actionTrigger.view); this.closeChat(); });
        controls.appendChild(open);
      }
      bubble.appendChild(controls);
      row.append(avatar, bubble);
    }
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
  },

  async sendMessage(query, options = {}) {
    const text = String(query || '').trim();
    if (!text) return;
    this.openChat();
    this.appendMessage(text, 'user');
    const list = document.getElementById('chatbot-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg chat-msg-bot';
    typing.textContent = 'AgriBot is thinking...';
    list?.appendChild(typing);
    try {
      const data = await window.API.request('/chat', { method: 'POST', body: JSON.stringify({ message: text, language: window.I18N?.currentLang || 'en' }) });
      typing.remove();
      this.appendMessage(data.reply, 'bot', data.actionTrigger);
      if (options.speakReply) window.VoiceAssistant?.speakText(data.reply);
    } catch (_) {
      typing.remove();
      this.appendMessage('I could not reach the advisor. Please try again or use the analysis form.', 'bot');
    }
  }
};

window.ChatbotModule = ChatbotModule;
