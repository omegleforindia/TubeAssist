import { useState, useCallback } from "react";
import { ingestVideo } from "../api/gemini";

export default function useVideoIngest() {
  const [videoId,      setVideoId]      = useState("");
  const [videoTitle,   setVideoTitle]   = useState("");
  const [sessionId,    setSessionId]    = useState("");
  const [isIngesting,  setIsIngesting]  = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);
  const [ingestMsg,    setIngestMsg]    = useState("");

  const reset = useCallback(() => {
    setVideoId("");
    setVideoTitle("");
    setSessionId("");
    setIngestStatus(null);
    setIngestMsg("");
  }, []);

  const handleIngest = useCallback(async (url) => {
    setVideoId("");
    setVideoTitle("");
    setSessionId("");
    setIsIngesting(true);
    setIngestStatus("processing");
    setIngestMsg("Gemini is watching the video… (long videos take 1–2 min)");

    try {
      const data = await ingestVideo(url);
      setVideoId(data.video_id);
      setVideoTitle(data.video_title || "Untitled Video");
      setSessionId(crypto.randomUUID());
      setIngestStatus("success");
      setIngestMsg(
        data.alreadyIndexed
          ? `Already indexed — start asking questions! (${data.video_title})`
          : "Video ready — start asking questions!"
      );
    } catch (err) {
      setIngestStatus("error");
      setIngestMsg(err.message || "Something went wrong.");
    } finally {
      setIsIngesting(false);
    }
  }, []);

  return { videoId, videoTitle, sessionId, isIngesting, ingestStatus, ingestMsg, handleIngest, reset };
}
