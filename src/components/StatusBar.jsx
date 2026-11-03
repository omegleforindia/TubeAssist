import { useState, useEffect } from "react";
import "./StatusBar.css";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
             M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <rect x="3" y="3" width="18" height="18"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);


const STATUS_CONFIG = {
  processing: {
    icon: <SpinnerIcon />,
    defaultMessage: "Processing video…",
  },
  thinking: {
    icon: <SpinnerIcon />,
    defaultMessage: "Thinking…",
  },
  error: {
    icon: <ErrorIcon />,
    defaultMessage: "Something went wrong.",
  },
  success: {
    icon: null, // uses dot instead
    defaultMessage: "Ready!",
  },
};

export default function StatusBar({
  status = null,
  message = "",
  autoClearSuccess = 3000,
}) {
  const [visible, setVisible] = useState(true);

  // ── Reset visibility whenever status changes ──
  useEffect(() => {
    setVisible(true);
  }, [status, message]);

  // ── Auto-clear success after timeout ──
  useEffect(() => {
    if (status === "success" && autoClearSuccess > 0) {
      const timer = setTimeout(() => setVisible(false), autoClearSuccess);
      return () => clearTimeout(timer);
    }
  }, [status, autoClearSuccess]);

  // ── Nothing to show ──
  if (!status || !visible) return null;

  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const displayMessage = message || config.defaultMessage;

  return (
    <div
      className={`sb-bar ${status}`}
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
    >
      {/* Icon / dot */}
      <div className="sb-icon">
        {status === "success"
          ? <span className="sb-dot" aria-hidden="true" />
          : config.icon
        }
      </div>

      {/* Message */}
      <span className="sb-text">{displayMessage}</span>

      {/* Dismiss button — error only */}
      {status === "error" && (
        <button
          className="sb-dismiss"
          onClick={() => setVisible(false)}
          aria-label="Dismiss error"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}