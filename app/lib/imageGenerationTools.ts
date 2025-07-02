import { prisma } from './db';
import { openai } from './openaiClient';

interface DesignData {
  headline: string;
  body: string;
  cta: string;
  leafletSize: 'standard' | 'half_sheet' | 'dl_envelope';
  leafletStyle: 'modern' | 'vintage' | 'playful' | 'minimal' | 'other';
  colorScheme: string;
}

/**
 * Generates a leaflet image using DALL-E 3.
 */
export async function generateLeafletImageTool(
  designData: DesignData,
  conversationId: string
): Promise<string> {
  const { headline, body, cta, leafletSize, leafletStyle, colorScheme } = designData;

  // Immediately update the status to 'designing' to provide feedback to the user
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'designing' },
  });

  // 1. Construct a detailed DALL-E 3 prompt
  const prompt = `
    A visually appealing and professional leaflet design featuring one main hero image. The design must be clean, modern, and uncluttered, with plenty of white space. The design must be suitable for printing.
    Style: ${leafletStyle}.
    Color Scheme: ${colorScheme}.
    Size consideration: ${leafletSize}.

    The leaflet MUST include the following text elements clearly visible and legible:
    - Headline: "${headline}"
    - Body Text: "${body}"
    - Call to Action: "${cta}"

    The text should be concise and integrated naturally into the design. Avoid filling every space; prioritize a readable and elegant layout.
  `;
  console.log('[DALL-E 3 Prompt]', prompt);

  // 2. Call the DALL-E 3 API
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1792', // Portrait aspect ratio for leaflets
    quality: 'hd',
  });

  const imageUrl = response.data?.[0]?.url;

  if (!imageUrl) {
    // If image generation fails, update status to reflect the error
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'failed' },
    });
    throw new Error('Image generation failed, no URL returned.');
  }
  console.log('[DALL-E 3] Image generated:', imageUrl);

  // 3. Update the conversation in the DB with the final URL and 'completed' status
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
            leafletStyle: {
              type: 'string',
              enum: ['modern', 'vintage', 'playful', 'minimal', 'other'],
              description: 'The visual style of the leaflet.',
            },
            colorScheme: {
              type: 'string',
              description: 'The primary color scheme for the leaflet (e.g., "blue", "warm tones", "monochromatic black").',
            },
          },
          required: ['headline', 'body', 'cta', 'leafletSize', 'leafletStyle', 'colorScheme'],
        },
        conversationId: {
          type: 'string',
          description: 'The ID of the current conversation, used to update the database record. This is optional for the assistant to provide.'
        }
      },
      required: ['designData'],
    },
  },
}; 