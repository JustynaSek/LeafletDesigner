import { openai } from './openaiClient';
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
 * Generates a leaflet image using DALL-E 3 based on structured design data.
 * This function is intended to be used as a "tool" by the OpenAI Assistant.
 *
 * @param designData The structured data collected for the leaflet design.
 * @param conversationId The ID of the conversation to update in the database.
 * @returns The URL of the generated leaflet image.
 */
export async function generateLeafletImageTool(
  designData: DesignData,
  conversationId: string
): Promise<string> {
  console.log(`[ImageGenerationTool] Received data for conversation ${conversationId}:`, designData);

  // 1. Input Validation (Basic)
  if (!designData.leafletSize || !designData.purpose || !designData.imageryPrompt || !designData.keyMessage1) {
    throw new Error('Missing required design data fields.');
  }

  // 2. Construct DALL-E 3 Prompt
  // This is a critical step. We synthesize the structured data into a detailed, effective prompt.
  const prompt = `
    Create a visually appealing, professional leaflet design.
    The leaflet's dimensions are ${designData.leafletSize.replace('x', ' by ')} pixels.
    The leaflet is for: "${designData.purpose}".
    It is targeted at: "${designData.targetAudience}".
    The overall style should be: "${designData.style}".

    The leaflet MUST include the following text, rendered clearly and legibly:
    - Headline/Main Message: "${designData.keyMessage1}"
    ${designData.keyMessage2 ? `- Secondary Message: "${designData.keyMessage2}"` : ''}
    ${designData.contactEmail ? `- Contact Information: "${designData.contactEmail}"` : ''}

    The imagery should be based on this description: "${designData.imageryPrompt}".

    The layout should be well-organized, with text and images balanced. All text must be readable.
    Do not include any placeholder text like "Lorem Ipsum".
  `.trim().replace(/\s+/g, ' ');

  console.log(`[ImageGenerationTool] Constructed DALL-E 3 prompt:`, prompt);

  try {
    // 3. Call DALL-E 3 API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: designData.leafletSize,
      quality: 'hd', // Use 'hd' for higher detail
      style: 'vivid', // 'vivid' or 'natural'
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error('DALL-E 3 API did not return an image URL.');
    }

    console.log(`[ImageGenerationTool] Generated image URL: ${imageUrl}`);

    // 4. Store & Return Result
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        leafletUrl: imageUrl,
        status: 'completed',
        designData: designData as any, // Store the final design data
      },
    });

    console.log(`[ImageGenerationTool] Successfully updated conversation ${conversationId} in DB.`);

    return imageUrl;
  } catch (error) {
    console.error('[ImageGenerationTool] Error during image generation or DB update:', error);
    // Update conversation status to 'failed'
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'failed',
      },
    });
    throw new Error('Failed to generate or save the leaflet image.');
  }
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
        // We no longer need userId here as we will pass in the conversationId from the API route
        conversationId: {
          type: 'string',
          description: 'The ID of the current conversation, used to update the database record.'
        }
      },
      required: ['designData', 'conversationId'],
    },
  },
}; 