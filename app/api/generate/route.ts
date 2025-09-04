import { NextResponse } from "next/server";
import OpenAI from "openai";
import LZString from "lz-string";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Token estimation (rough: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Smart text truncation to stay within token limits (only if absolutely necessary)
function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text);
  if (estimatedTokens <= maxTokens) return text;

  // Preserve the most important parts when truncating
  const charLimit = maxTokens * 4;

  // For very long texts, try to keep the beginning and recent parts
  if (text.length > charLimit * 2) {
    const firstPart = text.slice(0, charLimit * 0.6);
    const lastPart = text.slice(-(charLimit * 0.4));
    return firstPart + "\n...[truncated]...\n" + lastPart;
  }

  return text.slice(0, charLimit) + "...[truncated]";
}

// Light preprocessing to clean up text without losing information
function cleanupText(text: string): string {
  // Remove excessive whitespace while preserving paragraph breaks
  let cleaned = text.replace(/[^\S\n]+/g, " "); // Replace multiple spaces/tabs with single space
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // Replace 3+ newlines with 2
  cleaned = cleaned.trim();

  return cleaned;
}

// Extract key information to help the AI understand context
function extractKeyContext(resumeText: string, jobDescription: string) {
  // Extract potential company name from job description
  const companyMatch = jobDescription.match(
    /(?:at|for|join)\s+([A-Z][A-Za-z0-9\s&,.-]{2,30}?)(?:\s+as|\s+is|\s+seeks|\.|,)/i
  );
  const companyName = companyMatch ? companyMatch[1].trim() : null;

  // Extract role/position title
  const rolePatterns = [
    /(?:position|role|job|title|hiring|seeking|looking for)[:]*\s*([A-Za-z\s&/-]{3,50}?)(?:\n|\.|\||-|,|to)/i,
    /^([A-Za-z\s&/-]{3,50}?)(?:\n|at|with)/i,
    /(?:as a|as an)\s+([A-Za-z\s&/-]{3,50}?)(?:\.|,|\n|$)/i,
  ];

  let roleName = null;
  for (const pattern of rolePatterns) {
    const match = jobDescription.match(pattern);
    if (match) {
      roleName = match[1].trim();
      break;
    }
  }

  // Detect industry/domain from job description
  const techKeywords =
    /react|node|javascript|python|aws|cloud|api|frontend|backend|full.?stack|software|developer|engineer/i;
  const salesKeywords =
    /sales|revenue|quota|pipeline|crm|account|customer|b2b|saas/i;
  const marketingKeywords =
    /marketing|brand|content|seo|campaign|digital|social media|analytics/i;
  const financeKeywords =
    /financial|accounting|budget|audit|compliance|risk|investment/i;

  let industry = "general";
  if (techKeywords.test(jobDescription)) industry = "technology";
  else if (salesKeywords.test(jobDescription)) industry = "sales";
  else if (marketingKeywords.test(jobDescription)) industry = "marketing";
  else if (financeKeywords.test(jobDescription)) industry = "finance";

  // Extract years of experience from resume
  const expMatch = resumeText.match(
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i
  );
  const yearsExperience = expMatch ? parseInt(expMatch[1]) : null;

  return {
    companyName,
    roleName,
    industry,
    yearsExperience,
  };
}

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

    // Clean up text without aggressive truncation
    const processedResume = truncateToTokenLimit(
      cleanupText(decompressedResume),
      1250 // ~5000 characters - much more generous limit
    );

    const processedJob = truncateToTokenLimit(
      cleanupText(decompressedJob),
      1000 // ~4000 characters - full job descriptions
    );

    // Process supporting information
    const processedSupporting = {
      skills: supportingInfo?.skills
        ? cleanupText(supportingInfo.skills).slice(0, 300)
        : "",
      achievements: supportingInfo?.achievements
        ? cleanupText(supportingInfo.achievements).slice(0, 300)
        : "",
      preferences: supportingInfo?.preferences
        ? cleanupText(supportingInfo.preferences).slice(0, 200)
        : "",
    };

    // Extract context for better personalization
    const context = extractKeyContext(processedResume, processedJob);

    // Calculate estimated token usage
    const systemPromptTokens = 250; // Larger for more sophisticated instructions
    const userPromptTemplateTokens = 300;
    const resumeTokens = estimateTokens(processedResume);
    const jobTokens = estimateTokens(processedJob);
    const supportingTokens = estimateTokens(
      Object.values(processedSupporting).join(" ")
    );

    const totalInputTokens =
      systemPromptTokens +
      userPromptTemplateTokens +
      resumeTokens +
      jobTokens +
      supportingTokens;

    // Log token usage for monitoring
    console.log("Token Usage Estimate:", {
      input: totalInputTokens,
      maxOutput: 700,
      total: totalInputTokens + 700,
      model: "gpt-4o-mini or gpt-5-mini",
      context: context,
      estimatedCost: "Check OpenAI for current pricing",
    });

    // With GPT-5-mini's improved context handling
    if (totalInputTokens > 15000) {
      // Even more generous with GPT-5
      return NextResponse.json(
        {
          error:
            "Input is extremely long. Please reduce the length of your resume or job description.",
          tokenEstimate: totalInputTokens,
        },
        { status: 400 }
      );
    }

    // Enhanced system prompt for GPT-5-mini with personality
    const systemPrompt = `You are an expert cover letter writer who creates compelling, authentic cover letters that get interviews.

Your writing principles:
- Write with genuine enthusiasm and personality - avoid corporate jargon
- Use powerful action verbs: spearheaded, orchestrated, pioneered, transformed, architected
- Include specific metrics and quantifiable achievements
- Create a narrative arc that tells a story, not just lists qualifications
- Mirror the company's tone from the job posting (formal vs casual, innovative vs traditional)
- Never use clichés like "I am writing to apply" or "I am the perfect candidate"
- Sound like a confident professional having a conversation, not a robot

Industry-specific adjustments:
- Technology: Focus on technical skills, problem-solving, innovation
- Sales: Emphasize revenue generation, relationship building, quota achievements  
- Marketing: Highlight creativity, campaigns, ROI, brand development
- Finance: Stress accuracy, compliance, risk management, analytical skills
- General: Focus on leadership, adaptability, and transferable skills`;

    // Dynamic user prompt based on context
    const userPrompt = `Create an exceptional cover letter using this information:

CANDIDATE RESUME:
${processedResume}

TARGET POSITION:
${processedJob}

${
  processedSupporting.skills
    ? `\nKEY SKILLS TO EMPHASIZE: ${processedSupporting.skills}`
    : ""
}
${
  processedSupporting.achievements
    ? `\nSPECIFIC ACHIEVEMENTS TO HIGHLIGHT: ${processedSupporting.achievements}`
    : ""
}
${
  processedSupporting.preferences
    ? `\nWRITING STYLE PREFERENCES: ${processedSupporting.preferences}`
    : ""
}

CONTEXT DETECTED:
- Company: ${context.companyName || "Unknown (use position context clues)"}
- Role: ${context.roleName || "Based on description"}
- Industry: ${context.industry}
- Candidate Experience Level: ${
      context.yearsExperience
        ? `${context.yearsExperience}+ years`
        : "Determine from resume"
    }

STRUCTURE YOUR COVER LETTER:

PARAGRAPH 1 - The Hook (2-3 sentences):
- Start with something unexpected that shows you understand their specific needs
- Reference a specific challenge, opportunity, or aspect of the role that excites you
- Connect it to a unique insight or experience you bring
- Examples of strong openers:
  * "Your need for someone who can [specific challenge] immediately caught my attention because I recently [relevant achievement]."
  * "The intersection of [skill 1] and [skill 2] in your job posting perfectly describes my career trajectory."
  * "Having [specific achievement], I understand exactly what it takes to [job requirement]."

PARAGRAPH 2 - The Evidence (3-4 sentences):
- Present 2-3 specific achievements using the STAR method compressed into single sentences
- Each achievement should directly map to a job requirement
- Include numbers, percentages, or concrete outcomes
- Use this formula: "When [situation], I [action] resulting in [quantified result]."

PARAGRAPH 3 - The Vision (2-3 sentences):
- Paint a picture of what you'll accomplish in the role
- Reference specific projects, goals, or challenges mentioned in the posting
- Show you've thought about their needs beyond the job description
- Demonstrate cultural fit through your language and values alignment

PARAGRAPH 4 - The Close (2 sentences):
- Express genuine enthusiasm for a specific aspect of the role or company
- Include a confident, specific call to action
- Example: "I'd welcome the opportunity to discuss how my experience in [specific area] can help [company] achieve [specific goal]."

CRITICAL REQUIREMENTS:
- Total length: 250-350 words maximum
- Do NOT include any date lines, address blocks, or formal letter headers
- Start with a simple greeting (Dear [Company] Team or Dear Hiring Manager)
- End with a simple closing (Best regards, Sincerely, or Looking forward to connecting) followed by just the candidate's first and last name
- Write in ${
      context.industry === "technology"
        ? "a direct, innovative"
        : context.industry === "finance"
        ? "a professional, precise"
        : "an engaging, professional"
    } tone
- Avoid any phrase that appears in typical AI-generated content
- Each sentence must add new information - no filler
- Use varied sentence lengths for rhythm
- Include at least 3 specific metrics or quantifiable achievements
- Never repeat phrases from the job description verbatim - rephrase intelligently
- Do not include contact information, as that will be handled by the application`;

    // Call OpenAI API - try GPT-5-mini first, fallback to gpt-4o-mini
    let completion;
    let modelUsed = "gpt-5-mini";

    try {
      // First attempt with GPT-5-mini
      completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.75,
        max_completion_tokens: 700, // Using the correct parameter name for newer models
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });
    } catch (error: any) {
      console.log("GPT-5-mini error:", error?.message);

      // If GPT-5-mini fails for any reason, try gpt-4o-mini
      if (
        error?.status === 404 ||
        error?.code === "model_not_found" ||
        error?.message?.includes("model")
      ) {
        console.log("Falling back to gpt-4o-mini");
        modelUsed = "gpt-4o-mini";

        try {
          completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.75,
            max_completion_tokens: 700, // Using the correct parameter name
            presence_penalty: 0.3,
            frequency_penalty: 0.3,
          });
        } catch (fallbackError: any) {
          // If both models fail, try with the old parameter name as last resort
          if (fallbackError?.message?.includes("max_completion_tokens")) {
            console.log("Trying with max_tokens parameter instead");
            modelUsed = "gpt-3.5-turbo"; // Fallback to older model

            completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.75,
              max_tokens: 700, // Using old parameter name for older models
              presence_penalty: 0.3,
              frequency_penalty: 0.3,
            });
          } else {
            throw fallbackError;
          }
        }
      } else {
        throw error; // Re-throw if it's not a model availability issue
      }
    }

    const coverLetter = completion.choices[0]?.message?.content;

    if (!coverLetter) {
      throw new Error("Failed to generate cover letter - no content returned");
    }

    // Calculate actual token usage and cost
    const actualUsage = completion.usage;

    // Return the generated cover letter with usage stats
    return NextResponse.json({
      coverLetter,
      usage: {
        ...actualUsage,
        model: modelUsed,
        context: context, // Include detected context for debugging
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    console.error("Error details:", {
      status: error?.status,
      code: error?.code,
      message: error?.message,
      type: error?.type,
      response: error?.response?.data,
    });

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        {
          error:
            "Invalid API key. Please check your OpenAI API key in environment variables.",
        },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a moment." },
        { status: 429 }
      );
    }

    if (error?.status === 404 && error?.message?.includes("model")) {
      return NextResponse.json(
        {
          error:
            "Model not found. Please ensure you have access to gpt-4o-mini or update to a valid model.",
        },
        { status: 404 }
      );
    }

    if (error?.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error:
            "OpenAI quota exceeded. Please check your OpenAI account billing.",
        },
        { status: 402 }
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

    // Log the full error for debugging
    console.error("Unhandled error type:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate cover letter. Please check the console for details.",
      },
      { status: 500 }
    );
  }
}
