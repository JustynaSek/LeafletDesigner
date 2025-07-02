import { prisma } from '../app/lib/db';

async function main() {
  // Create a new Conversation
  const newConversation = await prisma.conversation.create({
    data: {
      status: 'awaiting_form',
      history: [],
    },
  });
  console.log('Created Conversation:', newConversation);

  // Fetch all conversations
  const allConversations = await prisma.conversation.findMany();
  console.log(`Total Conversations in DB: ${allConversations.length}`);
  allConversations.forEach((conv, idx) => {
    console.log(`Conversation #${idx + 1}:`, conv);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 