const { callGemini } = require('./src/services/geminiHelper');
async function run() {
  const result = await callGemini({
    prompt: `Compare the previous version: An app that tracks habits. with the new version: An app that tracks habits with a focus on social accountability through friend challenges., given this conversation context: User: I think just tracking alone gets boring.\nGemini: What if you added a social component to keep people motivated?. In 1–2 sentences, state what changed and why, from the user's own reasoning — do not invent motivations not present in the conversation.`
  });
  console.log('SUMMARY:', result.text);
}
run();
