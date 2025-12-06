"use server";
import { ContentItem, Slide } from "@/lib/types";
import axios from "axios";
import { uploadDirect } from "@uploadcare/upload-client";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateCreativePrompt = async (userPrompt: string) => {
  console.log("🟢 Generating creative prompt...", userPrompt);
  const finalPrompt = `
  Create a coherent and relevant outline for the following prompt: ${userPrompt}.
  The outline should consist of at least 6 points, with each point written as a single sentence.
  Ensure the outline is well-structured and directly related to the topic.
  
  I need your response to be in JSON format ONLY, with no markdown code blocks, no extra text, and no explanations.
  Return ONLY the following JSON object:

  {
    "outlines": [
      "Point 1",
      "Point 2",
      "Point 3",
      "Point 4",
      "Point 5",
      "Point 6"
    ]
  }
  `;

  try {
    // Set up Gemini model with appropriate settings
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Create system and user chat content
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "You are a helpful AI that generates outlines for presentations. You MUST respond with ONLY valid JSON, no markdown formatting, no code blocks." },
            { text: finalPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 1000,
      },
    });

    const responseContent = result.response.text();

    if (responseContent) {
      // Parse the response to ensure it's valid JSON
      try {
        // Clean the response - remove markdown code blocks if present
        const cleanedResponse = responseContent
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .trim();
        
        const jsonResponse = JSON.parse(cleanedResponse);
        return { status: 200, data: jsonResponse };
      } catch (err) {
        console.error("Invalid JSON received:", responseContent, err);
        return { status: 500, error: "Invalid JSON format received from AI" };
      }
    }

    return { status: 400, error: "No content generated" };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const generateImages = async (slides: Slide[]) => {
  try {
    console.log("🟢 Generating images for slides...");

    // Create a deep clone to preserve original data
    const slidesCopy: Slide[] = JSON.parse(JSON.stringify(slides));

    // Process cloned slides
    const processedSlides = await Promise.all(
      slidesCopy.map(async (slide) => {
        const updatedContent = await processSlideContent(slide.content);
        return { ...slide, content: updatedContent };
      })
    );

    console.log("🟢 Images generated successfully");
    return { status: 200, data: processedSlides };
  } catch (error) {
    console.error("🔴 ERROR:", error);
    return { status: 500, error: "Internal server error" };
  }
};

const processSlideContent = async (content: ContentItem): Promise<ContentItem> => {
  // Create a deep clone of the content structure
  const contentClone: ContentItem = JSON.parse(JSON.stringify(content));
  const imageComponents = findImageComponents(contentClone);

  // Process images in parallel while maintaining structure
  await Promise.all(
    imageComponents.map(async (component) => {
      try {
        const newUrl = await generateImageUrl(component.alt || "Placeholder Image");
        component.content = newUrl;
      } catch (error) {
        console.error("🔴 Image generation failed:", error);
        component.content = "https://placehold.co/1024x1024";
      }
    })
  );

  return contentClone;
};

// Modified findImageComponents to work with cloned structure
const findImageComponents = (layout: ContentItem): ContentItem[] => {
  const images: ContentItem[] = [];

  const traverse = (node: ContentItem) => {
    if (node.type === "image") {
      images.push(node);
    }
    
    if (Array.isArray(node.content)) {
      node.content.forEach(child => traverse(child as ContentItem));
    } else if (typeof node.content === "object" && node.content !== null) {
      traverse(node.content);
    }
  };

  traverse(layout);
  return images;
};

const generateImageUrl = async (prompt: string): Promise<string> => {
  try {
    // For now using placeholder images since Gemini doesn't directly support image generation
    console.log("⚠️ Using placeholder image as Gemini doesn't directly support image generation yet");
    
    // Generate a unique placeholder based on the prompt to simulate different images
    // const hash = await hashString(prompt);
    const placeholderUrl = `https://placehold.co/1024x1024/png?text=${encodeURIComponent(prompt.substring(0, 20))}`;
    
    // Download the image from the service
    const imageResponse = await axios.get(placeholderUrl, {
      responseType: "arraybuffer",
    });
    
    const imageBuffer = Buffer.from(imageResponse.data);
    const result = await uploadDirect(imageBuffer, {
      publicKey: process.env.UPLOADCARE_PUBLIC_KEY!,
      store: "auto",
    });

    console.log("🟢 Image uploaded to Uploadcare:", result?.uuid);

    return result?.uuid
      ? `https://ucarecdn.com/${result.uuid}/-/preview/`
      : "https://placehold.co/1024x1024";
  } catch (error) {
    console.error("Failed to generate image:", error);
    return "https://placehold.co/1024x1024";
  }
};

// Helper function to create a simple hash from a string for unique placeholders
// async function hashString(str: string): Promise<string> {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(str);
//   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//   return hashHex.substring(0, 8); // Return first 8 characters for brevity
// }