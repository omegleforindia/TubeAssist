// ─────────────────────────────────────────────────────────────────────────────
// TubeAssist — browser-only Gemini client (no backend needed, GitHub Pages ready)
// Pipeline:
//   1. Ingest  → Gemini reads the YouTube URL directly and writes a detailed
//                timestamped transcript/notes. Cached in localStorage per video.
//   2. Ask     → transcript + session history + question → Gemini.
//                LLM-as-a-Judge sentinel "NO_RELEVANT_CONTEXT" → general fallback.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const LS_KEY = "tubeassist_api_key";
const LS_MODEL = "tubeassist_model";
const LS_CACHE = "tubeassist_video_";
export const DEFAULT_MODEL = "gemini-3.5-flash";
const HISTORY_WINDOW = 6;
const SENTINEL = "NO_RELEVANT_CONTEXT";

// ── Settings (stored only in the user's own browser) ─────────────────────────
export const getApiKey = () =>
  localStorage.getItem(LS_KEY) || import.meta.env.VITE_GEMINI_API_KEY || "";
export const setApiKey = (k) => localStorage.setItem(LS_KEY, k.trim());
export const getModel = () => localStorage.getItem(LS_MODEL) || DEFAULT_MODEL;
export const setModel = (m) => localStorage.setItem(LS_MODEL, (m || DEFAULT_MODEL).trim());

// ── Helpers ──────────────────────────────────────────────────────────────────
export function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

async function callGemini(contents, { system, temperature = 0.3, mediaLow = false } = {}) {
  const key = getApiKey();
  if (!key) throw new Error("Gemini API key missing — click ⚙ Settings (top right) and add your key.");

  const body = {
    contents,
    generationConfig: { temperature },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  if (mediaLow) body.generationConfig.mediaResolution = "MEDIA_RESOLUTION_LOW";

  const res = await fetch(`${API_BASE}/${getModel()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini error (${res.status})`;
    if (res.status === 400 && /API key/i.test(msg)) throw new Error("Invalid Gemini API key. Check ⚙ Settings.");
    if (res.status === 429) throw new Error("Gemini rate limit / quota hit. Thodi der baad try karo.");
    throw new Error(msg);
  }
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();
  if (!text) {
    const reason = data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason;
    throw new Error(`Gemini returned no answer${reason ? ` (${reason})` : ""}.`);
  }
  return text;
}

async function fetchMetadata(url) {
  // noembed.com is CORS-friendly; fall back gracefully if it fails
  try {
    const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const d = await r.json();
    if (d && d.title) return { title: d.title, author: d.author_name || "" };
  } catch { /* ignore */ }
  return { title: "", author: "" };
}

// ── Ingest ───────────────────────────────────────────────────────────────────
export async function ingestVideo(url) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Could not read the video ID from this URL.");

  const cached = localStorage.getItem(LS_CACHE + videoId);
  if (cached) {
    const data = JSON.parse(cached);
    return { ...data, alreadyIndexed: true };
  }

  const meta = await fetchMetadata(url);
  const canonical = `https://www.youtube.com/watch?v=${videoId}`;

  const transcript = await callGemini(
    [{
      role: "user",
      parts: [
        { fileData: { fileUri: canonical, mimeType: "video/*" } },
        { text:
`Create a detailed knowledge base of this video so that questions about it can be answered later WITHOUT watching it.
Output in this exact structure:
TITLE: <video title>
CHANNEL: <channel name if visible/known, else Unknown>
SUMMARY: <5-8 sentence summary>
TRANSCRIPT:
[mm:ss] <what is said, as close to verbatim as possible, in the original spoken language>
... (cover the whole video, every important point, names, numbers, steps, examples)
VISUALS: <important on-screen text, slides, code or demos with timestamps>` },
      ],
    }],
    { temperature: 0.1, mediaLow: true }
  );

  if (transcript.length < 50) throw new Error("Transcript came back empty — video private ya unavailable ho sakta hai.");

  const titleFromAI = transcript.match(/^TITLE:\s*(.+)$/m)?.[1]?.trim();
  const channelFromAI = transcript.match(/^CHANNEL:\s*(.+)$/m)?.[1]?.trim();

  const data = {
    video_id: videoId,
    video_title: meta.title || titleFromAI || "Untitled Video",
    video_author: meta.author || channelFromAI || "",
    transcript,
  };
  try {
    localStorage.setItem(LS_CACHE + videoId, JSON.stringify(data));
  } catch { /* storage full — still works for this session */ }
  return { ...data, alreadyIndexed: false };
}

export function getCachedVideo(videoId) {
  const c = localStorage.getItem(LS_CACHE + videoId);
  return c ? JSON.parse(c) : null;
}

// ── Session memory (in-tab, non-persistent — same as original backend) ──────
const sessionStore = {};

const historyText = (sid) =>
  (sessionStore[sid] || [])
    .slice(-HISTORY_WINDOW)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

const remember = (sid, q, a) => {
  if (!sid) return;
  (sessionStore[sid] ||= []).push({ role: "user", content: q }, { role: "assistant", content: a });
};

// ── Ask ──────────────────────────────────────────────────────────────────────
const RAG_SYSTEM = `You are a helpful assistant that answers questions about a YouTube video.
You will be given the video's knowledge base (transcript with timestamps), prior conversation history, and a user question.
Rules:
1. Use the conversation history to understand follow-up questions.
2. If the knowledge base is relevant to the question — answer fully from it, and cite timestamps like [04:12] where useful.
3. Reply in the same language the user asked in (Hindi/Hinglish/English etc.).
4. If the knowledge base is NOT relevant to the question — respond with exactly "${SENTINEL}" and nothing else.
Do not hallucinate. Do not make up facts.`;

const GENERAL_SYSTEM = `You are a helpful general assistant. Answer using your own knowledge.
Use the conversation history to understand follow-up questions. Be concise and accurate.
Reply in the same language the user asked in.`;

export async function askQuestion(question, videoId, sessionId) {
  const video = getCachedVideo(videoId);
  if (!video) throw new Error("Video data not found — please load the video again.");
  const history = historyText(sessionId);

  let answer = await callGemini(
    [{ role: "user", parts: [{ text:
      `Video: "${video.video_title}"\n\nKnowledge base:\n${video.transcript}\n\nConversation History:\n${history}\n\nQuestion: ${question}` }] }],
    { system: RAG_SYSTEM }
  );

  let fromVideo = true;
  if (answer.replace(/["'`.\s]/g, "") === SENTINEL || answer.includes(SENTINEL)) {
    fromVideo = false;
    answer = await callGemini(
      [{ role: "user", parts: [{ text: `Conversation History:\n${history}\n\nQuestion: ${question}` }] }],
      { system: GENERAL_SYSTEM }
    );
  }

  remember(sessionId, question, answer);
  return { answer, from_video: fromVideo };
}
