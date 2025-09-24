import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, systemInstructions, conversationHistory, currentCode } = await request.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build messages array including conversation history
    const messages: any[] = [];
    
    // Add system message
    if (systemInstructions) {
      messages.push({
        role: 'system',
        content: systemInstructions
      });
    }
    
    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const historyMessage of conversationHistory) {
        if (historyMessage.role === 'user' || historyMessage.role === 'assistant') {
          messages.push({
            role: historyMessage.role,
            content: historyMessage.content
          });
        }
      }
    }
    
    // Add the current message with code context
    messages.push({ 
      role: 'user', 
      content: `Current code: ${currentCode}\n\n${message}` 
    });

    // Create OpenRouter request for xAI Grok 4 Fast (free)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Gamenzo Platform'
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4-fast:free',
        messages: messages,
        max_tokens: 32000,
        stream: true,
        temperature: 0.7,
        // Enable reasoning for better code generation
        reasoning: {
          enabled: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter Grok API Error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Grok API request failed' },
        { status: response.status }
      );
    }

    // Process the streaming response to extract content
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          if (!response.body) {
            throw new Error('Response body is empty');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Skip malformed JSON lines
                  continue;
                }
              }
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    console.error('Grok API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process Grok request' },
      { status: 500 }
    );
  }
}