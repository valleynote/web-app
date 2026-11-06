import { getTranscriptionModel } from "@/lib/ai/config";
import { getOpenAICompat } from "@/lib/ai/openai-compat";

function audioFormatFromName(filename: string, mime: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".wav") || mime.includes("wav")) return "wav";
  if (lower.endsWith(".mp3") || mime.includes("mpeg")) return "mp3";
  if (lower.endsWith(".m4a") || mime.includes("mp4")) return "m4a";
  if (lower.endsWith(".ogg") || mime.includes("ogg")) return "ogg";
  if (lower.endsWith(".flac") || mime.includes("flac")) return "flac";
  if (lower.endsWith(".webm") || mime.includes("webm")) return "webm";
  return "webm";
}

export async function transcribeAudio(
  file: File | Blob,
  filename = "audio.webm",
) {
  const { apiKey, baseURL } = getOpenAICompat();
  const model = getTranscriptionModel();
  if (!model) {
    throw new Error("Transcription model is not configured");
  }

  const mime =
    "type" in file && typeof file.type === "string" && file.type
      ? file.type
      : "audio/webm";
  const format = audioFormatFromName(filename, mime);
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  // OpenRouter prefers JSON + input_audio; also works for OpenAI-compatible bases.
  const res = await fetch(`${baseURL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(baseURL.includes("openrouter.ai")
        ? {
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
            "X-Title": "ValleyNote",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      response_format: "json",
      input_audio: {
        data: base64,
        format,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail
        ? `Transcription failed: ${detail.slice(0, 280)}`
        : `Transcription failed (${res.status})`,
    );
  }

  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
