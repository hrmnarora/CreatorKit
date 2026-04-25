import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: { message: "GEMINI_API_KEY is missing." } },
        { status: 500 }
      );
    }

    let body;
    try { 
      body = await req.json(); 
    } catch { 
      return NextResponse.json({ error: { message: "Invalid JSON body." } }, { status: 400 }); 
    }

    // FIX 1: Destructure correctly from the body
    // Updated default to the Gemini 3 series for 2026 stability
    const { 
      model = "gemini-3-flash-preview", 
      messages, 
      max_tokens = 2000 
    } = body;

    // FIX 2: Basic validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: { message: "messages array is required." } }, { status: 400 });
    }

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: Array.isArray(m.content)
        ? m.content.map((part) =>
            part.type === "image"
              ? { inlineData: { mimeType: part.source.media_type, data: part.source.data } }
              : { text: part.text ?? "" }
          )
        : [{ text: m.content ?? "" }],
    }));

    // FIX 3: Ensure the URL uses the 'model' variable defined above
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents, 
          generationConfig: { maxOutputTokens: max_tokens } 
        }),
      }
    );

    const rawText = await geminiRes.text();
    let data;
    try { 
      data = JSON.parse(rawText); 
    } catch {
      return NextResponse.json(
        { error: { message: `Gemini returned non-JSON (${geminiRes.status}): ${rawText.slice(0, 200)}` } },
        { status: 502 }
      );
    }

    if (!geminiRes.ok) {
      return NextResponse.json(
        { error: { message: data?.error?.message || `Gemini error ${geminiRes.status}` } },
        { status: geminiRes.status }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return NextResponse.json({ choices: [{ message: { content: text } }] });

    const finishReason = data.candidates?.[0]?.finishReason;
    return NextResponse.json(
      { error: { message: `No content from Gemini. Finish reason: ${finishReason ?? "unknown"}` } },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ error: { message: `Server error: ${err.message}` } }, { status: 500 });
  }
}
