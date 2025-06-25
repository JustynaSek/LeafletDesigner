import { prisma } from './db';

interface DesignData {
  leafletSize: '1024x1792' | '1792x1024';
  purpose: string;
  targetAudience: string;
  keyMessage1: string;
  keyMessage2?: string;
  contactEmail?: string;
  style: string;
  imageryPrompt: string;
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
            leafletSize: {
              type: 'string',
              enum: ['1024x1792', '1792x1024'],
              description: 'The dimensions for the leaflet image. 1024x1792 for portrait, 1792x1024 for landscape.',
            },
            purpose: {
              type: 'string',
              description: 'The main goal or purpose of the leaflet (e.g., "Event Promotion", "Product Advertisement").',
            },
            targetAudience: {
              type: 'string',
              description: 'The intended audience for the leaflet (e.g., "Students", "Local Residents").',
            },
            keyMessage1: {
              type: 'string',
              description: 'The primary headline or most important message to be displayed prominently.'
            },
            keyMessage2: {
              type: 'string',
              description: 'A secondary message or piece of information, if applicable.'
            },
            contactEmail: {
              type: 'string',
              description: 'A contact email address to include on the leaflet, if provided by the user.'
            },
            style: {
              type: 'string',
              description: 'The desired visual style (e.g., "Modern and minimalist", "Playful and colorful", "Corporate and professional").',
            },
            imageryPrompt: {
              type: 'string',
              description: 'A detailed description of the desired background imagery or visual elements for DALL-E to generate.'
            }
          },
          required: ['leafletSize', 'purpose', 'targetAudience', 'keyMessage1', 'style', 'imageryPrompt'],
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