
const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}([&?].*)?$/;

/**
 * validateYouTubeUrl
 *
 * @param {string} url
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateYouTubeUrl(url) {
  if (!url?.trim())
    return { valid: false, error: "Please enter a YouTube URL." };

  if (!YOUTUBE_REGEX.test(url.trim()))
    return { valid: false, error: "Invalid YouTube link. Paste a valid video URL." };

  return { valid: true, error: null };
}