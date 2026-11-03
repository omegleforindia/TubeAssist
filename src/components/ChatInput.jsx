import { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="square" strokeLinejoin="miter">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const Spinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
             M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * ChatInput
 *
 * Props:
 *   onSend(message)  — called with trimmed message string
 *   isThinking       — true while AI is responding (disables input + shows spinner)
 *   isVideoReady     — guard: disables everything until a video is loaded
 */
export default function ChatInput({ onSend, isThinking = false, isVideoReady = false }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // ── Auto-resize textarea as user types ──
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [message]);

  // ── Focus textarea when video becomes ready ──
  useEffect(() => {
    if (isVideoReady && !isThinking) {
      textareaRef.current?.focus();
    }
  }, [isVideoReady, isThinking]);

  const canSend = isVideoReady && !isThinking && message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(message.trim());
    setMessage("");
    // reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = !isVideoReady || isThinking;

  const placeholder = !isVideoReady
    ? "Load a video first…"
    : isThinking
    ? "Waiting for response…"
    : "Ask something about the video…";

  return (
    <div>
      {/* Guard hint — only shown before video is loaded */}
      {!isVideoReady && (
        <p className="ci-guard-hint">
          <span>Load a YouTube video</span> above to start chatting
        </p>
      )}

      <div className="ci-wrap">
        {/* Textarea */}
        <div className="ci-textarea-wrap">
          <textarea
            ref={textareaRef}
            className="ci-textarea"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            rows={1}
            aria-label="Chat message input"
            aria-disabled={isDisabled}
          />
        </div>

        {/* Send / Thinking button */}
        <button
          className={`ci-send-btn${isThinking ? " thinking" : ""}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-label={isThinking ? "Waiting for AI response" : "Send message"}
        >
          {isThinking ? <Spinner /> : <SendIcon />}
        </button>
      </div>
    </div>
  );
}