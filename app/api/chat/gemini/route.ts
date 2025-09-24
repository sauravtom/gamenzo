import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You're an extremely proficient creative coding agent, and can code effects, games, generative art.
Write javascript code assuming it's in a live p5js environment.
Return the code block.
You can include a short paragraph explaining your reasoning and the result in human readable form.
There can be no external dependencies: all functions must be in the returned code.
Make extra sure that all functions are either declared in the code or part of p5js.
The user can modify the code, go along with the user's changes.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, systemInstructions, conversationHistory, currentCode } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Prepare conversation history for Gemini
    const geminiHistory: any[] = [];

    // System instruction
    geminiHistory.push({
      role: 'user',
      parts: [{ text: systemInstructions || SYSTEM_PROMPT }],
    });

    geminiHistory.push({
      role: 'model',
      parts: [{ text: "I understand. I'm ready to help you create p5.js games, effects, and generative art. I'll provide complete, self-contained JavaScript code that runs in the p5.js environment." }],
    });

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          geminiHistory.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Add current code context if provided
    if (currentCode && currentCode.trim() !== '') {
      geminiHistory.push({
        role: 'user',
        parts: [{ text: `Current code context:\n\`\`\`javascript\n${currentCode}\n\`\`\`` }],
      });
      geminiHistory.push({
        role: 'model',
        parts: [{ text: 'I can see the current code. I\'ll take this into account for any modifications or improvements.' }],
      });
    }

    // Add the current message
    if (message && message.trim() !== '') {
      geminiHistory.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    // Config
    const config = {
      thinkingConfig: { thinkingBudget: -1 },
    };

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            config,
            contents: geminiHistory,
          });

          for await (const chunk of response) {
            if (chunk.text) {
              controller.enqueue(
                new TextEncoder().encode(chunk.text)
              );
            }
          }
          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`
          ));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
