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

const POLLING_INTERVAL_MS = 1000; // Poll every 1 second

// A map to store available tools
const availableTools: { [key: string]: Function } = {
  generateLeafletImageTool,
};

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
    let conversationId = convId;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Moderation API check
    const moderation = await openai.moderations.create({ input: message });
    const flagged = moderation.results[0]?.flagged;
    if (flagged) {
      return NextResponse.json({ error: 'Your message was flagged by our content moderation system. Please rephrase your question.' }, { status: 400 });
    }

    console.log('Incoming /api/chat POST', { userId, message, conversationId });

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
      threadId = thread.id;
      console.log('[DEBUG] Created new thread:', threadId);
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { threadId },
      });
      console.log('[DEBUG] Updated conversation with new threadId:', threadId);
    }

    // Add the user's message to the thread
    await addMessageToThread(threadId, 'user', message);

    // Run the assistant
    let run = await runAssistant(threadId, assistant.id);

    // Poll for the run's completion status
    while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      console.log('[DEBUG] Polling run status. Calling retrieveRun with:', { threadId, runId: run.id });
      run = await retrieveRun(threadId, run.id);
    }

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
      // The assistant requires a tool call
      const toolCalls = run.required_action?.submit_tool_outputs.tool_calls;
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
        
        let functionArgs: any = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
        } catch (err) {
          console.error('Failed to parse toolCall.function.arguments:', toolCall.function.arguments, err);
          throw new Error('Invalid tool arguments received from assistant.');
        }
        if (typeof functionArgs !== 'object' || functionArgs === null) {
          console.error('Tool arguments are not a valid object:', functionArgs);
          throw new Error('Tool arguments are not a valid object.');
        }
        // Add conversationId to the arguments for our tool
        functionArgs.conversationId = conversationId;
        // Log the DALL-E prompt or design data to the terminal
        console.log('[DALL-E Prompt] Design Data:', JSON.stringify(functionArgs.designData ?? functionArgs, null, 2));
        const output = await functionToCall(functionArgs.designData ?? functionArgs, functionArgs.conversationId);
        
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({ url: output }), // Ensure output is a stringified object
        });
      }

      // Submit the tool outputs back to the assistant
      console.log('[DEBUG] Submitting tool outputs. Calling submitToolOutputs with:', { threadId, runId: run.id, toolOutputs });
      await submitToolOutputs(threadId, run.id, toolOutputs);
      
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

    type Message = { id: string; role: 'user' | 'assistant'; content: string };
    let messages: Message[] = [];
    if (conversation.threadId) {
      const threadMessages = await getThreadMessages(conversation.threadId);
      // We reverse the order to show the latest messages last, which is typical for a chat UI.
      messages = threadMessages.data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content.map(c => (c.type === 'text' ? c.text.value : '')).join('\n'),
      })).reverse() as Message[];
    }

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