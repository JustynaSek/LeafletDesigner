import { prisma } from './db';

interface DesignData {
  headline: string;
  body: string;
  cta: string;
  leafletSize: 'standard' | 'half_sheet' | 'dl_envelope';
}

/**
 * MOCKED: Generates a leaflet image by returning a static placeholder image URL.
 * This is a temporary mock for testing the rest of the app without DALL-E API calls.
 */
export async function generateLeafletImageTool(
  designData: DesignData,
  conversationId: string
): Promise<string> {
  // Use a local sample image or a public placeholder
  const imageUrl = '/images/sample-products/p1-1.jpg'; // You can change this to any image in your public folder

  // Simulate a short delay to mimic API latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Update the conversation in the DB as if the image was generated
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      leafletUrl: imageUrl,
      status: 'completed',
      designData: designData as any,
    },
  });

  return imageUrl;
}

// We can define the schema for the tool here, to be used when creating/updating the assistant.
export const generateLeafletImageToolSchema = {
  type: 'function' as const,
  function: {
    name: 'generateLeafletImageTool',
    description: 'Generates a leaflet image using DALL-E 3 based on a comprehensive set of design parameters. This is the final step in the design process and should only be called when all necessary information has been gathered from the user.',
    parameters: {
      type: 'object',
      properties: {
        designData: {
          type: 'object',
          properties: {
            headline: {
              type: 'string',
              description: 'The compelling headline for the leaflet.',
            },
            body: {
              type: 'string',
              description: 'The main body text of the leaflet, including features, benefits, etc.',
            },
            cta: {
              type: 'string',
              description: 'The call to action (e.g., "Visit our website," "Call now").',
            },
            leafletSize: {
              type: 'string',
              enum: ['standard', 'half_sheet', 'dl_envelope'],
              description: 'The size of the leaflet. Standard (8.5" x 11"), Half Sheet (5.5" x 8.5"), or DL Envelope (3.9" x 8.3").',
            },
          },
          required: ['headline', 'body', 'cta', 'leafletSize'],
        },
        conversationId: {
          type: 'string',
          description: 'The ID of the current conversation, used to update the database record.'
        }
      },
      required: ['designData', 'conversationId'],
    },
  },
}; 