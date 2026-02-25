import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

    if (!apiKey) {
      console.error('--- GROQ API ERROR --- API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert database architect. You write valid DBML (Database Markup Language) code based on user requests.
Rules:
1. ONLY return raw DBML code.
2. DO NOT wrap the logic in markdown formatting like \`\`\`dbml or \`\`\`. Start immediately with 'Table ...'
3. DO NOT include any explanations, comments, or pleasantries before or after the code.
4. Ensure relationships are defined correctly using the 'ref:' syntax inline or standalone Ref statements.

Example valid output:
Table users {
  id integer [primary key]
  username varchar
}

Table posts {
  id integer [primary key]
  user_id integer [ref: > users.id]
  title varchar
}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: apiMessages,
        temperature: 0.1,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('--- GROQ API ERROR ---', response.status, response.statusText);
      console.error('Error Data:', errorData);
      return NextResponse.json({ error: 'Failed to generate DBML from AI provider.' }, { status: response.status });
    }

    const data = await response.json();
    let generatedDBML = data.choices[0]?.message?.content || '';

    if (generatedDBML.startsWith('\`\`\`')) {
      generatedDBML = generatedDBML.replace(/^\`\`\`(dbml)?/i, '');
      generatedDBML = generatedDBML.replace(/\`\`\`$/, '');
      generatedDBML = generatedDBML.trim();
    }

    return NextResponse.json({ dbml: generatedDBML });

  } catch (error: any) {
    console.error('--- GENERATION API ERROR ---', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
