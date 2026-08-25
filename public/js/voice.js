/**
 * Browser voice assistant for AgriAI.
 * Uses the Web Speech API when it is available and gracefully falls back to text input.
 */
const VoiceAssistant = {
  recognition: null,
  isListening: false,
  targetFieldId: null,

  init() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    this.recognition = new Recognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.onstart = () => this.setListeningState(true);
    this.recognition.onresult = (event) => this.handleTranscript(event.results[0][0].transcript);
    this.recognition.onerror = (event) => {
      if (event.error !== 'aborted') this.notify('Voice input was unavailable. Please type your question instead.', 'info');
      this.setListeningState(false);
    };
    this.recognition.onend = () => this.setListeningState(false);
  },

  startListening(fieldId = null) {
    this.targetFieldId = fieldId;
    const modal = document.getElementById('voice-assistant-modal');
    if (modal) modal.classList.add('active');

    if (!this.recognition) {
      this.setListeningState(false);
      const text = window.prompt('Voice recognition is not supported here. Type your question:', '1000 kg rice straw in Guntur');
      if (text) this.handleTranscript(text);
      return;
    }

    const language = window.I18N?.currentLang || 'en';
    this.recognition.lang = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' }[language] || 'en-IN';
    try {
      this.recognition.start();
    } catch (_) {
      this.notify('Voice assistant is already listening.', 'info');
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) this.recognition.stop();
    this.setListeningState(false);
  },

  setListeningState(listening) {
    this.isListening = listening;
    const modal = document.getElementById('voice-assistant-modal');
    const status = document.getElementById('voice-modal-status');
    const wave = document.getElementById('voice-wave-anim');
    if (status) status.textContent = listening ? 'Listening... describe your residue or ask a question.' : 'Tap the microphone to ask AgriAI.';
    if (wave) wave.style.display = listening ? 'flex' : 'none';
    if (!listening && modal) modal.classList.remove('active');
  },

  handleTranscript(transcript) {
    this.setListeningState(false);
    const text = String(transcript || '').trim();
    if (!text) return;

    if (this.targetFieldId) {
      const field = document.getElementById(this.targetFieldId);
      if (field) field.value = field.type === 'number' ? (text.match(/\d+(?:\.\d+)?/) || [''])[0] : text;
      this.targetFieldId = null;
      field?.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    this.notify(`Heard: ${text}`, 'info');
    window.ChatbotModule?.openChat();
    window.ChatbotModule?.sendMessage(text, { speakReply: true });
  },

  speakText(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    const language = window.I18N?.currentLang || 'en';
    utterance.lang = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' }[language] || 'en-IN';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  },

  notify(message, type) {
    window.API?.showToast(message, type);
  }
};

window.VoiceAssistant = VoiceAssistant;
