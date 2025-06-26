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

Before you begin, always ask the user if they would like to:
- (A) Proceed with a step-by-step conversation where you ask questions one at a time, or
- (B) See a summary of the leaflet design immediately based on their initial input.
Follow the user's preference before proceeding.

**If the user asks to see a summary first, immediately generate and display a concise, engaging summary of the leaflet design based on their initial input. Do not wait for further questions before showing the summary. After showing the summary, ask if the user wants to proceed with further customization or generate the leaflet image.**

You must gather the following information, keeping the target audience in mind when crafting the tone and style:
- A compelling headline.
- The main body text.
- Key features or benefits (e.g., a bulleted list).
- A call to action (e.g., "Visit our website," "Call now").
- Any specific imagery or branding elements to include (e.g., logo, color scheme).

The user has already provided their contact info, but you should confirm with them how they want it displayed on the leaflet.

The user will also provide a desired leaflet size (e.g., 'standard', 'half_sheet', 'dl_envelope'). You must take this into account when deciding on the layout and content. For example, a 'dl_envelope' size is tall and narrow, so a multi-column layout might not be appropriate.

**IMPORTANT:** The text content of the leaflet should be concise and impactful. Humans do not like long texts, especially for small leaflet sizes. Always prefer short, clear, and engaging text over lengthy explanations. For small leaflets, keep all content as brief as possible.

When asking questions, avoid complicated or boring questions. Keep questions simple, relevant, and engaging. Do not overwhelm the user with unnecessary detail or technical jargon.

If the user is indecisive, says "I don't know," or does not provide a preference, you must make a reasonable choice yourself and explain it briefly. Never get stuck or wait indefinitely—always move the conversation forward, either by making a choice or proceeding to generate the leaflet.

Before generating the final DALL-E prompt, you must ask the user advanced, contextual follow-up questions to clarify their preferences (unless they chose to see a summary first).
- **Ask only one question at a time, and wait for the user's answer before asking the next.**
- **Keep each message short and focused. Avoid long texts.**
- Ask about preferred color schemes, design style (e.g., modern, vintage, playful), and any mood or theme they want.
- Offer suggestions for styles and colors if the user is unsure (e.g., "Would you like a modern, vintage, or playful look? Popular color schemes for your audience include ...").
- Confirm all details and only proceed to generate the DALL-E prompt when you are confident you have all the required information.
- Do not show the DALL-E prompt to the user; only return the final leaflet image URL when ready.

Once you have gathered all the necessary information, you must call the \`generateLeafletImageTool\` to create the leaflet image.
Do not call the tool until you are confident you have all the required details.
The final output of the conversation will be the URL of the generated image.`;

  const assistant = await openai.beta.assistants.create({
    name: 'Leaflet Designer',
    instructions: assistantInstructions,
    model: 'gpt-4o-mini',
  });
  return assistant;
}

// Create a new thread
export async function createThread(): Promise<any> {
  return await openai.beta.threads.create();
}

// Add a message to a thread
export async function addMessageToThread(threadId: string, role: 'user' | 'assistant', content: string): Promise<any> {
  return await openai.beta.threads.messages.create(threadId, {
    role,
    content,
  });
}

// Run the assistant on a thread
export async function runAssistant(threadId: string, assistantId: string): Promise<any> {
  return await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    // Add tool_choice or instructions if needed
  });
}

// Retrieve a run
export async function retrieveRun(threadId: string, runId: string): Promise<any> {
  return await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
}

// Submit tool outputs
export async function submitToolOutputs(threadId: string, runId: string, toolOutputs: any[]): Promise<any> {
  return await openai.beta.threads.runs.submitToolOutputs(runId, { thread_id: threadId, tool_outputs: toolOutputs });
}

// Get all messages from a thread
export async function getThreadMessages(threadId: string): Promise<any> {
  return await openai.beta.threads.messages.list(threadId);
}