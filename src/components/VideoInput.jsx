import { useState } from "react";
import "./VideoInput.css";

import { validateYouTubeUrl } from "../utils/validateYouTubeUrl";

// ─── Icons ────────────────────────────────────────────────────────────────────
const YoutubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);

const LoadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="15 3 21 3 21 9"/>
    <path d="M21 3L9 15"/>
    <path d="M4 6H2v16h16v-2"/>
  </svg>
);

const Spinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);


export default function VideoInput({ onIngest, isLoading = false, videoTitle = "", disabled = false }) {
  const [url,     setUrl]     = useState("");
  const [error,   setError]   = useState("");
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (touched) setError(validateYouTubeUrl(val).error || "");
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateYouTubeUrl(url).error || "");
  };

  const handleSubmit = () => {
    setTouched(true);
    const { valid, error: err } = validateYouTubeUrl(url);
    if (!valid) { setError(err); return; }
    setError("");
    onIngest(url.trim());
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const isDisabled = disabled || isLoading;
  const hasSuccess = !!videoTitle && !isLoading;

  const inputClass = [
    "vi-input",
    error      ? "has-error"   : "",
    hasSuccess ? "has-success" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="vi-wrap">

      <div className="vi-label">
        <YoutubeIcon />
        YouTube URL
      </div>

      <div className="vi-row">
        <div className="vi-input-wrap">
          <input
            className={inputClass}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            aria-label="YouTube video URL"
            aria-invalid={!!error}
            aria-describedby={error ? "vi-error-msg" : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          className={`vi-btn${isLoading ? " loading" : ""}`}
          onClick={handleSubmit}
          disabled={isDisabled}
          aria-label={isLoading ? "Processing video" : "Load video"}
        >
          {isLoading ? <Spinner /> : <LoadIcon />}
          {isLoading ? "Processing…" : "Load"}
        </button>
      </div>

      {error && !isLoading && (
        <div className="vi-feedback error" id="vi-error-msg" role="alert">
          <ErrorIcon />
          {error}
        </div>
      )}

      {isLoading && (
        <div className="vi-feedback loading">
          <Spinner />
          Gemini is reading the video and building the knowledge base…
        </div>
      )}

      {hasSuccess && (
        <div className="vi-title" role="status">
          <CheckIcon />
          Now chatting with:&nbsp;
          <span className="vi-title-text" title={videoTitle}>"{videoTitle}"</span>
        </div>
      )}

    </div>
  );
}