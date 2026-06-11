import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert product manager and technical writer. When given a rough product brief, you produce a structured specification document.

You MUST respond with ONLY valid JSON — no markdown fences, no explanation, no extra text.

The JSON must exactly match this structure:
{
  "problemStatement": "string describing the core problem being solved",
  "userStories": [
    {
      "title": "short title",
      "story": "As a [user], I want [goal], so that [benefit]",
      "acceptanceCriteria": ["Given [context], When [action], Then [outcome]"]
    }
  ],
  "edgeCases": ["string describing an edge case"],
  "outOfScope": ["string describing what is explicitly out of scope"],
  "openQuestions": ["string describing an unresolved question the team needs to answer"]
}

Rules:
- Generate 3-6 user stories, each with 2-4 acceptance criteria
- Generate 4-8 edge cases
- Generate 3-5 out of scope items
- Generate 3-5 open questions
- Be specific and concrete, not generic
- Base everything on the provided brief and context`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief, context } = body as {
      brief: string;
      context?: {
        productType?: string;
        audience?: string;
        platform?: string;
        constraints?: string;
      };
    };

    if (!brief || brief.trim().length < 10) {
      return NextResponse.json(
        { error: "Brief is too short. Please provide more detail." },
        { status: 400 }
      );
    }

    let userMessage = `Brief: ${brief.trim()}`;
    if (context) {
      if (context.productType) userMessage += `\nProduct type: ${context.productType}`;
      if (context.audience) userMessage += `\nTarget audience: ${context.audience}`;
      if (context.platform) userMessage += `\nPlatform: ${context.platform}`;
      if (context.constraints) userMessage += `\nTechnical constraints: ${context.constraints}`;
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    const parsed = JSON.parse(content.text);
    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const error = err as { status?: number; message?: string };

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: "API authentication failed. Please check your API key." },
        { status: 500 }
      );
    }

    console.error("Generate API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
