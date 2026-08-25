const OpenAI = require('openai');
const { processAIChat } = require('./aiChatService');

const SYSTEM_PROMPT = `You are AgriAI, a careful farm-residue advisor for farmers in India.
Give concise, practical guidance about agricultural residues, 2G ethanol, CBG, composting, mushroom cultivation, biochar, briquettes, and biomass pooling.
Never invent a facility, price, government scheme, or scientific result. Clearly label estimates as indicative.
If industrial use is not suitable, recommend safe on-farm alternatives. Reply in the user's language: English, Telugu, or Hindi.`;

function isAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function answerWithAI(message, language) {
  if (!isAIConfigured()) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.4',
    instructions: SYSTEM_PROMPT,
    input: `Language preference: ${language || 'en'}\nFarmer question: ${message}`,
    max_output_tokens: 500,
    store: false
  });

  const reply = response.output_text && response.output_text.trim();
  if (!reply) throw new Error('AI provider returned an empty answer.');
  return { success: true, language: language || 'en', reply, actionTrigger: null, provider: 'openai' };
}

async function getAdvisorReply(message, language) {
  try {
    const aiReply = await answerWithAI(message, language);
    if (aiReply) return aiReply;
  } catch (error) {
    console.warn('OpenAI advisor unavailable; using local knowledge base:', error.message);
  }

  return { ...processAIChat(message, language), provider: 'local' };
}

module.exports = { getAdvisorReply, isAIConfigured };
