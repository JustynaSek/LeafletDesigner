import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createThread,
  addMessageToThread,
  runAssistant,
  retrieveRun,
  getThreadMessages,
  submitToolOutputs,
  getOrCreateAssistant,
} from '@/app/lib/assistantManager';
import { generateLeafletImageTool } from '@/app/lib/imageGenerationTools';
import { prisma } from '@/app/lib/db';
import { openai } from '@/app/lib/openaiClient';
import type { DesignData } from '@/app/lib/imageGenerationTools';

const POLLING_INTERVAL_MS = 1000; // Poll every 1 second

// A map to store available tools
const availableTools: { [key: string]: (designData: DesignData, conversationId: string) => Promise<string> } = {
  generateLeafletImageTool,
};

// Define type guards for run and thread:
function isRun(obj: unknown): obj is { id: string; status: string; required_action?: { submit_tool_outputs?: { tool_calls: Array<{ id: string; function: { name: string; arguments: string } }> } } } {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'status' in obj;
}
function isThread(obj: unknown): obj is { id: string } {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// Add a type guard for threadMessages:
function isThreadMessages(obj: unknown): obj is { data: unknown[] } {
  return typeof obj === 'object' && obj !== null && Array.isArray((obj as { data?: unknown[] }).data);
}

/**
 * POST /api/chat
 * Handles sending a new message to a conversation thread.
 * It will create a thread if one doesn't exist for the conversation.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { message, conversationId: convId } = await req.json();
    let conversationId = convId ?? '';

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Moderation API check
    const moderation = await openai.moderations.create({ input: message });
    if (moderation.results[0]?.flagged) {
      return NextResponse.json({ error: 'Your message was flagged by our content moderation system. Please rephrase your question.' }, { status: 400 });
    }

    let userMessageForThread = message;
    try {
      const initialData = JSON.parse(message);
      // Check for a few key properties to be reasonably sure it's the form data
      if (initialData.product && initialData.targetAudience && initialData.leafletSize) {
        userMessageForThread = `User has introduced this data:
- **Product/Service Name:** ${initialData.product}
- **Product/Service Details:** ${initialData.details}
- **Target Audience:** ${initialData.targetAudience}
- **Contact Information:** ${initialData.contactInfo}
- **Leaflet Size:** ${initialData.leafletSize}
- **Leaflet Style:** ${initialData.leafletStyle}
- **Color Scheme:** ${initialData.colorScheme}`;
      }
    } catch {
      // It's not a JSON string, so it's a regular chat message. Do nothing.
    }

    console.log('Incoming /api/chat POST', { userId, message: userMessageForThread, conversationId });

    const assistant = await getOrCreateAssistant();

    // Find or create the conversation record in the database
    let conversation = convId
      ? await prisma.conversation.findFirst({ where: { id: convId, userId } })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          status: 'gathering_info',
        },
      });
      conversationId = conversation.id;
    }

    // Ensure there's a threadId for the conversation
    let threadId = conversation.threadId;
    console.log('[DEBUG] Initial threadId from conversation:', threadId);
    if (!threadId) {
      const thread = await createThread();
      if (!isThread(thread)) throw new Error('Invalid thread object');
      threadId = String(thread.id);
      console.log('[DEBUG] Created new thread:', threadId);
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { threadId },
      });
      console.log('[DEBUG] Updated conversation with new threadId:', threadId);
    }

    // Add the user's message to the thread
    await addMessageToThread(String(threadId ?? ''), 'user', userMessageForThread);

    // Run the assistant
    let run = await runAssistant(String(threadId ?? ''), assistant.id);
    if (!isRun(run)) throw new Error('Invalid run object');

    // Poll for the run's completion status
    while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      run = await retrieveRun(String(threadId ?? ''), run.id);
      if (!isRun(run)) throw new Error('Invalid run object');
      console.log('[POLLING] Run status:', run.status);
    }

    console.log('[POLLING COMPLETE] Final run status:', run.status);

    // Handle the final run status
    if (run.status === 'completed') {
      // The run is complete, update the conversation status in the database.
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'in_chat' },
      });
      // The frontend will fetch the latest messages.
      return NextResponse.json({
        conversationId: conversation.id,
        status: 'completed',
        runId: run.id,
      });
    } else if (run.status === 'requires_action') {
      console.log('[ACTION REQUIRED] Run requires action. Full run object:', JSON.stringify(run.required_action, null, 2));
      // The assistant requires a tool call
      const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;
      if (!toolCalls) {
        throw new Error('Run requires action, but no tool calls were found.');
      }
      
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableTools[functionName];
        
        if (!functionToCall) {
          throw new Error(`Tool ${functionName} is not available.`);
        }
        
        const functionArgs = JSON.parse(toolCall.function.arguments) as { designData?: object; conversationId?: string };
        if (typeof functionArgs !== 'object' || functionArgs === null) {
          console.error('Tool arguments are not a valid object:', functionArgs);
          throw new Error('Tool arguments are not a valid object.');
        }
        // Add conversationId to the arguments for our tool
        functionArgs.conversationId = String(conversationId ?? '');
        
        try {
          console.log(`[TOOL CALL] Attempting to execute tool: ${functionName}`);
          // Log the DALL-E prompt or design data to the terminal
          console.log('[DALL-E Prompt] Design Data:', JSON.stringify(functionArgs.designData ?? functionArgs, null, 2));
          const output = await functionToCall(functionArgs.designData as DesignData, String(functionArgs.conversationId ?? '')) as string;
          
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify({ url: output }), // Ensure output is a stringified object
          });
        } catch (toolError) {
          console.error('!!!!!!!!!! ERROR EXECUTING TOOL !!!!!!!!!!', { functionName, toolError });
          const errorMessage = toolError instanceof Error ? toolError.message : String(toolError);
          // Optionally, you could add the error to the tool output to inform the assistant
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify({ error: `Tool execution failed: ${errorMessage}` }),
          });
        }
      }

      // Submit the tool outputs back to the assistant
      console.log('[DEBUG] Submitting tool outputs. Calling submitToolOutputs with:', { threadId, runId: run.id, toolOutputs });
      await submitToolOutputs(String(threadId ?? ''), run.id, toolOutputs);
      
      // The frontend will need to poll again or be notified that the process is continuing
      return NextResponse.json({
        conversationId: conversation.id,
        status: 'tool_executed',
        runId: run.id,
      });

    } else {
      // Handle failed, cancelled, or expired runs
      console.error(`Run ended with status: ${run.status}`, { run, conversationId, message });
      await prisma.conversation.update({ where: { id: conversationId }, data: { status: 'failed' }});
      return NextResponse.json({ error: `Run failed with status: ${run.status}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in /api/chat POST:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


/**
 * GET /api/chat
 * Retrieves the status and messages of a conversation.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log(`[GET /api/chat] Found conversation for user ${userId} with status ${conversation.status}`);

    type OpenAIMessage = { id: string; role: string; content: unknown[]; created_at?: number };
    type Message = { id: string; role: 'user' | 'assistant'; content: string; createdAt: number };
    let messages: Message[] = [];
    if (conversation.threadId) {
      const threadMessages = await getThreadMessages(String(conversation.threadId ?? ''));
      if (!isThreadMessages(threadMessages)) throw new Error('Invalid threadMessages object');
      messages = threadMessages.data.map((msg) => {
        if (typeof msg !== 'object' || !msg || !('id' in msg) || !('role' in msg) || !('content' in msg)) return null;
        const contentArr = Array.isArray((msg as { content?: unknown }).content) ? (msg as { content: unknown[] }).content : [];
        const openaiMsg = msg as OpenAIMessage;
        return {
          id: openaiMsg.id,
          role: openaiMsg.role as 'user' | 'assistant',
          content: contentArr.map((c) => (typeof c === 'object' && c && 'type' in c && (c as { type: string }).type === 'text' && 'text' in c && typeof (c as { text: { value: string } }).text.value === 'string' ? (c as { text: { value: string } }).text.value : '')).join('\n'),
          createdAt: typeof openaiMsg.created_at === 'number' ? openaiMsg.created_at * 1000 : Date.now(),
        };
      }).filter(Boolean) as Message[];
    }

    console.log('[GET /api/chat] Returning messages:', JSON.stringify(messages, null, 2));

    return NextResponse.json({
      status: conversation.status,
      messages,
      leafletUrl: conversation.leafletUrl,
    });

  } catch (error) {
    console.error('Error in /api/chat GET:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 