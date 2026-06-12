import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior product manager with 10 years experience writing specs for engineering teams at high-growth startups. You write specs that engineers trust and QA can test without asking follow-up questions.

The JSON must exactly match this structure:
{
  "problemStatement": "string",
  "userStories": [
    {
      "title": "short title",
      "story": "As a [specific role], I want [specific action], so that [specific measurable outcome]",
      "acceptanceCriteria": ["Given [context], When [action], Then [outcome]"]
    }
  ],
  "edgeCases": ["string"],
  "outOfScope": ["string"],
  "openQuestions": ["string"]
}

PROBLEM STATEMENT
Name a specific user type and a specific pain point. Describe the measurable impact of the problem — time lost, errors made, revenue missed. Do not write a generic description. One paragraph maximum.

USER STORIES
Break every epic into the smallest atomic stories possible. Each story must describe exactly one user behaviour. If a story cannot be tested in isolation, split it further. Generate 4–6 stories.

Use this exact format: "As a [specific user type], I want to [specific action], so that [specific measurable outcome]."

Never use "user" as the actor — always name the specific role (e.g. "free tier user", "team admin", "first-time visitor", "unauthenticated visitor").

ACCEPTANCE CRITERIA
For every user story, write at least 3 Given/When/Then scenarios: one happy path, one error/failure path, and one boundary condition. Each scenario must be specific enough that a QA engineer can write an automated test from it with no further clarification.

Forbidden phrases: "correctly", "properly", "as expected", "successfully", "works as intended", "is displayed properly", "should work". Replace every instance with a concrete, observable outcome (e.g. instead of "the form submits successfully", write "the user is redirected to /dashboard and a confirmation email is sent within 60 seconds").

EDGE CASES
Generate at least one edge case per applicable category from this taxonomy. Label each with its category prefix:

CONCURRENT ACTIONS — what happens if two users act on the same resource simultaneously (e.g. both edit, both delete, both claim a limited slot)?
SESSION/AUTH — what if the session expires mid-flow? What if a user's permissions are revoked between page load and form submission? What if a token is valid but the underlying account is suspended?
DATA INTEGRITY — what if third-party API data is malformed, missing required fields, returns an unexpected type, or arrives out of order?
RATE LIMITS & QUOTAS — what if the user hits their plan limit mid-action (e.g. they start an action, then the quota check runs and they're over)? What if the upstream API rate-limits the backend?
DEVICE/PLATFORM — what if the behaviour differs between mobile and desktop viewports, between touch and pointer input, or between browsers with different capability support?
RACE CONDITIONS — what if a slow network causes responses to arrive out of order? What if the user navigates away and back before an async operation completes?

OPEN QUESTIONS
Only include questions that, if left unanswered, would cause engineering to make a decision they shouldn't make unilaterally. Generate 3–5 questions.

Format each as: "[Decision owner] needs to decide: [specific decision] before [specific engineering task] can begin."

OUT OF SCOPE
Be specific and opinionated. List 4–6 things that a reasonable stakeholder might assume are included but are not. Each item must be one clear sentence starting with "This spec does not cover..."

Return only valid JSON matching the exact schema provided. No markdown, no preamble, no explanation outside the JSON structure.`;

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
      max_tokens: 4000,
      temperature: 0.3,
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
