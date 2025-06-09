export const dynamic = "force-dynamic";
export const config = { api: { bodyParser: false } };

import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { extractTextFromBuffer } from "@/lib/pdfUtil";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Your chosen Groq Llama model
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(
  req: Request,
  context: any
) {
  // 1) Unwrap assignmentId
  const { id: assignmentId } = (await context.params) as { id: string };

  try {
    // 2) Auth check
    const user = await getUserFromCookie();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3) Prevent duplicate
    const existing = await prisma.submission.findFirst({
      where: { studentId: user.id, assignmentId },
    });
    if (existing) {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 });
    }

    // 4) Get PDF buffer
    const formData = await req.formData();
    const fileBlob = formData.get("file") as Blob | null;
    if (!fileBlob) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    // 5) Save PDF
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
    const filename = `${user.id}-${assignmentId}-${Date.now()}.pdf`;
    writeFileSync(join(uploadsDir, filename), buffer);

    // 6) Extract text
    const text = await extractTextFromBuffer(buffer);

    // 7) Load assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // 8) Build prompt
    const prompt = `
You are an AI grading assistant. Grade this assignment.

Title: "${assignment.name}"
Description: "${assignment.description}"
Criteria:
${assignment.criteria
      .map((c: string, i: number) => `${i + 1}. ${c}`)
      .join("\n")}

Submission:
${text}

Respond in strict JSON: {"score":number,"feedback":string,"improvement":string}
`;

    // 9) Call Groq AI
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Missing GROQ_API_KEY");

    const aiRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    // 10) Handle errors
    if (!aiRes.ok) {
      const errJson = await aiRes.json();
      if (errJson.error?.code === "model_terms_required") {
        return NextResponse.json(
          {
            error:
              "Model terms not accepted. Please accept at " +
              `https://console.groq.com/playground?model=${GROQ_MODEL}`,
          },
          { status: 400 }
        );
      }
      throw new Error(`AI error: ${JSON.stringify(errJson)}`);
    }

    // 11) Extract the chat content JSON
    const aiJson = await aiRes.json();
    const content: unknown = aiJson.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Unexpected AI response structure");
    }

    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`No JSON object found in AI response: ${content}`);
    }

    // 12) Parse and validate
    let result: { score: number; feedback: string; improvement: string };
    try {
      result = JSON.parse(match[0]);
    } catch {
      throw new Error(`Invalid JSON extracted from AI response: ${match[0]}`);
    }

    if (typeof result.score !== "number" || !isFinite(result.score)) {
      throw new Error(`Invalid score from AI: ${result.score}`);
    }
    if (typeof result.feedback !== "string") {
      throw new Error("Missing feedback in AI response");
    }

    // 13) Persist submission
    const submission = await prisma.submission.create({
      data: {
        studentId: user.id,
        assignmentId,
        filePath: `/uploads/${filename}`,
        score: Math.floor(result.score),
        feedback: result.feedback,
      },
    });

    // 14) Return result
    return NextResponse.json({
      id: submission.id,
      score: submission.score,
      feedback: submission.feedback,
      improvement: result.improvement,
      createdAt: submission.createdAt,
    });
  } catch (err: any) {
    console.error("📄 /submit error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
