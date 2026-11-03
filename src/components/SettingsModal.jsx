import { useState } from "react";
import "./SettingsModal.css";
import { getApiKey, setApiKey, getModel, setModel, DEFAULT_MODEL } from "../api/gemini";

export default function SettingsModal({ onClose }) {
  const [key, setKey] = useState(getApiKey());
  const [model, setModelVal] = useState(getModel());
  const [show, setShow] = useState(false);

  const save = () => {
    setApiKey(key);
    setModel(model || DEFAULT_MODEL);
    onClose(true);
  };

  return (
    <div className="sm-backdrop" onClick={() => onClose(false)}>
      <div className="sm-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
        <div className="sm-title">Settings</div>

        <label className="sm-label">Gemini API key</label>
        <div className="sm-row">
          <input
            className="sm-input"
            type={show ? "text" : "password"}
            placeholder="AIza…"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="sm-ghost" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
        </div>
        <p className="sm-hint">
          Free key: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>.
          Key sirf aapke browser (localStorage) mein save hoti hai — kahin aur nahi jaati.
        </p>

        <label className="sm-label">Model</label>
        <input
          className="sm-input"
          value={model}
          onChange={(e) => setModelVal(e.target.value)}
          placeholder={DEFAULT_MODEL}
          spellCheck={false}
        />
        <p className="sm-hint">Default: {DEFAULT_MODEL} (YouTube video support wala model chahiye).</p>

        <div className="sm-actions">
          <button className="sm-ghost" onClick={() => onClose(false)}>Cancel</button>
          <button className="sm-primary" onClick={save} disabled={!key.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}
