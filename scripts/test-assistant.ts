import { getOrCreateAssistant, createThread, addMessageToThread, runAssistant, retrieveRun, getThreadMessages } from '../app/lib/assistantManager';

async function main() {
  // 1. Get or create the Assistant
  const assistant = await getOrCreateAssistant();
  console.log('Assistant:', assistant);

  // 2. Create a new thread
  const thread = await createThread();
  console.log('Thread:', thread);

  // 3. Add a user message
  const userMessage = 'Hello! I want to create a leaflet for a summer camp.';
  const userMsgResult = await addMessageToThread(thread.id, 'user', userMessage);
  console.log('User message result:', userMsgResult);

  // 4. Run the Assistant
  const run = await runAssistant(thread.id, assistant.id);
  console.log('Run:', run);

  // 5. Poll for completion
  let runStatus = run.status;
  let runId = run.id;
  let pollCount = 0;
  while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled') {
    await new Promise((res) => setTimeout(res, 2000));
    pollCount++;
    try {
      console.log(`[Poll ${pollCount}] About to call retrieveRun with runId:`, runId, 'thread.id:', thread.id);
      const updatedRun = await retrieveRun(runId, thread.id);
      runStatus = updatedRun.status;
      console.log(`[Poll ${pollCount}] Run status:`, runStatus, '| Run:', updatedRun);
    } catch (err) {
      console.error(`[Poll ${pollCount}] Error retrieving run:`, err);
      break;
    }
  }

  // 6. Get and print the assistant's reply
  try {
    const messages = await getThreadMessages(thread.id);
    const lastMessage = messages.data.reverse().find((msg) => msg.role === 'assistant');
    if (lastMessage) {
      console.log('Assistant reply:', lastMessage.content.map((c: any) => c.text?.value).join('\n'));
    } else {
      console.log('No assistant reply found.');
    }
  } catch (err) {
    console.error('Error fetching thread messages:', err);
  }
}

main().catch((e) => {
  console.error('Fatal error in test-assistant.ts:', e);
  process.exit(1);
}); 