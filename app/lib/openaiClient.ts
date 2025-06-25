// app/lib/openaiClient.ts
import OpenAI from 'openai';

// --- ADD THIS LINE FOR DEBUGGING ---
console.log('[DEBUG openaiClient] OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '*****' : 'UNDEFINED or EMPTY');
// --- END DEBUG LINE ---

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});