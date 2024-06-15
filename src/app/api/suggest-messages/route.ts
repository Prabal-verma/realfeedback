import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { generateText } from 'ai'; // Assuming this function exists and is imported correctly
import { NextResponse } from 'next/server';

// Create a Google Generative AI provider instance with custom settings
const googleAI: GoogleGenerativeAIProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY as string, // API Key from environment variable
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Example prompt for text generation
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Generate text using a specific model
    const { text } = await generateText({
      model: googleAI('models/gemini-pro'),
      prompt,
    });

    // Return the generated text as a response
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Handle errors gracefully
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
