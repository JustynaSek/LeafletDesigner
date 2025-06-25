"use server";
import { openai } from './openaiClient';
import { generateLeafletImageToolSchema } from './imageGenerationTools';

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
  const assistantInstructions = `You are an expert leaflet designer.
You will be given initial data about a product or service, including a target audience and contact information.
Your goal is to have a conversation with the user to gather all the necessary information to create a visually appealing and effective leaflet.

You must gather the following information, keeping the target audience in mind when crafting the tone and style:
- A compelling headline.
- The main body text.
- Key features or benefits (e.g., a bulleted list).
- A call to action (e.g., "Visit our website," "Call now").
- Any specific imagery or branding elements to include (e.g., logo, color scheme).

The user has already provided their contact info, but you should confirm with them how they want it displayed on the leaflet.

The user will also provide a desired leaflet size (e.g., 'standard', 'half_sheet', 'dl_envelope'). You must take this into account when deciding on the layout and content. For example, a 'dl_envelope' size is tall and narrow, so a multi-column layout might not be appropriate.

Once you have gathered all the necessary information, you must call the \`generateLeafletImageTool\` to create the leaflet image.
Do not call the tool until you are confident you have all the required details.
The final output of the conversation will be the URL of the generated image.`;

  const assistant = await openai.beta.assistants.create({
    name: 'Leaflet Design Assistant',
    instructions: assistantInstructions,
    tools: [generateLeafletImageToolSchema], // Add the tool schema here
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