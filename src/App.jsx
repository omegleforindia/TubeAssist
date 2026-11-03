import { useEffect, useState } from "react";
import "./App.css";

import VideoInput from "./components/VideoInput";
import ChatWindow from "./components/ChatWindow";
import ChatInput  from "./components/ChatInput";
import StatusBar  from "./components/StatusBar";
import SettingsModal from "./components/SettingsModal";
import { getApiKey } from "./api/gemini";

import useVideoIngest from "./hooks/useVideoIngest";
import useChat        from "./hooks/useChat";


export default function App() {
  const [hasKey, setHasKey] = useState(!!getApiKey());
  const [showSettings, setShowSettings] = useState(!getApiKey());

  // ── Hooks ──
  const {
    videoId,
    videoTitle,
    sessionId,
    isIngesting,
    ingestStatus,
    ingestMsg,
    handleIngest,
    reset: resetIngest,
  } = useVideoIngest();

  const isVideoReady = !!videoTitle && !isIngesting;

  const {
    messages,
    isThinking,
    chatStatus,
    chatMsg,
    handleSend,
    resetChat,
  } = useChat(videoId, sessionId, isVideoReady);

  // ── Reset chat whenever a new video starts ingesting ──
  useEffect(() => {
    if (isIngesting) resetChat();
  }, [isIngesting, resetChat]);


  const status    = ingestStatus || chatStatus;
  const statusMsg = ingestStatus ? ingestMsg : chatMsg;


  return (
    <div className="app-root">
      {showSettings && (
        <SettingsModal
          onClose={() => { setShowSettings(false); setHasKey(!!getApiKey()); }}
        />
      )}

      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="square" strokeLinejoin="miter">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14"/>
            </svg>
          </div>
          <span className="app-logo-name">
            Tube<span>Assist</span>
          </span>
        </div>
        <div className="app-header-right">
          <span className="app-header-meta">AI Video Chat</span>
          <button
            className={`app-settings-btn${hasKey ? "" : " needs-key"}`}
            onClick={() => setShowSettings(true)}
          >
            ⚙ {hasKey ? "Settings" : "Add API key"}
          </button>
        </div>
      </header>

      {/* ── Video URL input ── */}
      <section className="app-video-section">
        <VideoInput
          onIngest={handleIngest}
          isLoading={isIngesting}
          videoTitle={videoTitle}
          disabled={isThinking}
        />
      </section>

      {/* ── Status bar ── */}
      <div className="app-status-section">
        <StatusBar
          status={status}
          message={statusMsg}
          autoClearSuccess={8000}
        />
      </div>

      {/* ── Chat messages ── */}
      <main className="app-chat-area">
        <ChatWindow
          messages={messages}
          isThinking={isThinking}
        />
      </main>

      {/* ── Chat input ── */}
      <footer className="app-input-section">
        <ChatInput
          onSend={handleSend}
          isThinking={isThinking}
          isVideoReady={isVideoReady}
        />
      </footer>

    </div>
  );
}