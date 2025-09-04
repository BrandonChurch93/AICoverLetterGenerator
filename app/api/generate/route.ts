import { NextResponse } from "next/server";
import OpenAI from "openai";
import LZString from "lz-string";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription, supportingInfo } = body;

    // Validate input
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    // Decompress data if compressed
    const decompressedResume = resumeText.startsWith("{")
      ? resumeText
      : LZString.decompressFromUTF16(resumeText) || resumeText;

    const decompressedJob = jobDescription.startsWith("{")
      ? jobDescription
      : LZString.decompressFromUTF16(jobDescription) || jobDescription;

    // Build the prompt
    const systemPrompt = `You are an expert cover letter writer with years of experience in HR and recruitment. 
    Your task is to create a compelling, professional cover letter that perfectly matches the candidate's experience with the job requirements.
    Write in a confident, professional tone while keeping the letter concise and impactful.
    The cover letter should be 3-4 paragraphs and highlight the most relevant experience.`;

    const userPrompt = `Create a cover letter for this job application:

RESUME:
${decompressedResume}

JOB DESCRIPTION:
${decompressedJob}

${
  supportingInfo?.skills
    ? `KEY SKILLS TO EMPHASIZE: ${supportingInfo.skills}`
    : ""
}
${
  supportingInfo?.achievements
    ? `NOTABLE ACHIEVEMENTS TO HIGHLIGHT: ${supportingInfo.achievements}`
    : ""
}
${
  supportingInfo?.preferences
    ? `STYLE PREFERENCES: ${supportingInfo.preferences}`
    : ""
}

Please write a professional cover letter that:
1. Opens with a strong, engaging introduction
2. Highlights relevant experience and achievements that match the job requirements
3. Shows enthusiasm for the role and company
4. Closes with a confident call to action
5. Maintains a professional yet personable tone throughout

Format the letter with proper business letter structure, but do not include addresses or date.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const coverLetter = completion.choices[0]?.message?.content;

    if (!coverLetter) {
      throw new Error("Failed to generate cover letter");
    }

    // Return the generated cover letter
    return NextResponse.json({
      coverLetter,
      usage: completion.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating cover letter:", error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your OpenAI API key." },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a moment." },
        { status: 429 }
      );
    }

    if (error?.status === 500) {
      return NextResponse.json(
        {
          error: "OpenAI service is temporarily unavailable. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}
