import { NextRequest, NextResponse } from 'next/server';
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
    const { message, conversationId: convId } = await req.json();
    let conversationId = convId;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const assistant = await getOrCreateAssistant();

    // Find or create the conversation record in the database
    let conversation = conversationId
      ? await prisma.conversation.findUnique({ where: { id: conversationId } })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          // In a real app, you'd link this to a user ID
          userId: 'anonymous_user',
          status: 'gathering_info',
        },
      });
      conversationId = conversation.id;
    }

    // Ensure there's a threadId for the conversation
    let threadId = conversation.threadId;
    if (!threadId) {
      const thread = await createThread();
      threadId = thread.id;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { threadId },
      });
    }

    // Add the user's message to the thread
    await addMessageToThread(threadId, 'user', message);

    // Run the assistant
    let run = await runAssistant(threadId, assistant.id);

    // Poll for the run's completion status
    while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      run = await retrieveRun(run.id, threadId);
    }

    // Handle the final run status
    if (run.status === 'completed') {
      // The run is complete, nothing more to do on the backend for now.
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
        
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        // Add conversationId to the arguments for our tool
        functionArgs.conversationId = conversationId;

        const output = await functionToCall(functionArgs.designData, functionArgs.conversationId);
        
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({ url: output }), // Ensure output is a stringified object
        });
      }

      // Submit the tool outputs back to the assistant
      await submitToolOutputs(run.id, threadId, toolOutputs);
      
      // The frontend will need to poll again or be notified that the process is continuing
      return NextResponse.json({
        conversationId: conversation.id,
        status: 'tool_executed',
        runId: run.id,
      });

    } else {
      // Handle failed, cancelled, or expired runs
      console.error(`Run ended with status: ${run.status}`);
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
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    let messages = [];
    if (conversation.threadId) {
      const threadMessages = await getThreadMessages(conversation.threadId);
      // We reverse the order to show the latest messages last, which is typical for a chat UI.
      messages = threadMessages.data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content.map(c => (c.type === 'text' ? c.text.value : '')).join('\n'),
      })).reverse();
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