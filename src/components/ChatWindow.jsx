import { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";

import MessageBubble, { ThinkingBubble } from "./MessageBubble";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * ChatWindow
 *
 * Props:
 *   messages     — array of { id, role: "user"|"ai", text, timestamp, isError? }
 *   isThinking   — show the animated typing indicator
 */
export default function ChatWindow({ messages = [], isThinking = false }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // ── Auto-scroll to bottom on new message ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // ── Show scroll-to-bottom button when user scrolls up ──
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isEmpty = messages.length === 0 && !isThinking;

  return (
    <div className="cw-wrap" style={{ position: "relative" }}>
      <div
        className="cw-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="cw-empty">
            <div className="cw-empty-icon" />
            <p>Ask anything about the video</p>
          </div>
        )}

        {/* ── Message list ── */}
        {messages.length > 0 && (
          <>
            <div className="cw-separator">
              <div className="cw-separator-line" />
              <span className="cw-separator-label">Conversation</span>
              <div className="cw-separator-line" />
            </div>

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </>
        )}

        {/* ── Thinking indicator ── */}
        {isThinking && <ThinkingBubble />}

        {/* ── Invisible anchor for scroll ── */}
        <div ref={bottomRef} />
      </div>

      {/* ── Scroll to bottom button ── */}
      {showScrollBtn && (
        <button
          className="cw-scroll-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to latest message"
        >
          <ChevronDownIcon />
        </button>
      )}
    </div>
  );
}