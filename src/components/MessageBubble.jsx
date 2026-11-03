import ReactMarkdown from "react-markdown";
import "./MessageBubble.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="square" strokeLinejoin="miter">
    <rect x="3" y="11" width="18" height="11"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <line x1="12" y1="3" x2="12" y2="7"/>
    <circle cx="9" cy="16" r="1" fill="currentColor"/>
    <circle cx="15" cy="16" r="1" fill="currentColor"/>
  </svg>
);

// ─── Thinking bubble (exported for ChatWindow) ────────────────────────────────
export function ThinkingBubble() {
  return (
    <div className="mb-row ai">
      <div className="mb-group">
        <div className="mb-avatar ai">
          <BotIcon />
        </div>
        <div className="mb-thinking" aria-label="AI is thinking">
          <span className="mb-thinking-dot" />
          <span className="mb-thinking-dot" />
          <span className="mb-thinking-dot" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * MessageBubble
 *
 * Props:
 *   message — { id, role, text, timestamp, isError, fromVideo }
 */
export default function MessageBubble({ message }) {
  const { role, text, timestamp, isError, fromVideo } = message;

  const isUser = role === "user";
  const avatarLabel = isUser ? "You" : <BotIcon />;

  const bubbleClass = [
    "mb-bubble",
    isError ? "error" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`mb-row ${role}`}>

      {/* Avatar + bubble */}
      <div className="mb-group">
        <div className={`mb-avatar ${role}`} aria-hidden="true">
          {avatarLabel}
        </div>
        <div
          className={bubbleClass}
          role={isError ? "alert" : undefined}
        >
          {isUser || isError ? (
            text
          ) : (
            <ReactMarkdown>{text}</ReactMarkdown>
          )}

          {/* General knowledge badge — only on AI messages not from video */}
          {role === "ai" && fromVideo === false && !isError && (
            <span className="mb-general-badge">
              ⓘ General knowledge — not from video
            </span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="mb-timestamp">{formatTime(timestamp)}</span>

    </div>
  );
}