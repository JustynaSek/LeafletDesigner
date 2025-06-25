import { openai } from './openaiClient';

// Get or create an Assistant using the ID from env or create a new one if not present
export async function getOrCreateAssistant() {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  if (assistantId) {
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      return assistant;
    } catch (e) {
      console.warn('Assistant ID in env not found, creating a new one...');
    }
  }
  // Create a new Assistant (basic config, update as needed)
  const assistant = await openai.beta.assistants.create({
    name: 'Leaflet Generator Assistant',
    instructions: 'You are an AI assistant that helps users design custom leaflets. Gather all necessary details and synthesize a prompt for DALL-E 3 to generate the leaflet image.',
    tools: [], // Add tool definitions here if needed
    model: 'gpt-4o-mini',
  });
  console.log('New Assistant created. Please add this ID to your .env.local:', assistant.id);
  return assistant;
}

// Create a new thread
export async function createThread() {
  return openai.beta.threads.create();
}

// Add a message to a thread
export async function addMessageToThread(threadId: string, role: 'user' | 'assistant', content: string) {
  return openai.beta.threads.messages.create(threadId, {
    role,
    content,
  });
}

// Run the Assistant on a thread
export async function runAssistant(threadId: string, assistantId: string) {
  return openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
}

// Retrieve the status of a run
export async function retrieveRun(runId: string, threadId: string) {
  return openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
}

// Get all messages from a thread
export async function getThreadMessages(threadId: string) {
  return openai.beta.threads.messages.list(threadId);
}

// Submit tool outputs to the Assistant
// NOTE: output must be a string. If you need to return an object, use JSON.stringify(yourObject) before passing it here.
export async function submitToolOutputs(
  runId: string,
  threadId: string,
  toolOutputs: Array<{ tool_call_id: string; output: string }>
) {
  // NOTE: output must be a string. If you need to return an object, use JSON.stringify(yourObject) before passing it here.
  return openai.beta.threads.runs.submitToolOutputs(runId, {
    thread_id: threadId,
    tool_outputs: toolOutputs,
  });
}