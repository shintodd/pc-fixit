export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 data URI
}

/**
 * Compress and downscale an image client-side to prevent large network transfers
 * and prevent blowing past browser localStorage limits.
 */
export async function compressImage(
  file: File | Blob,
  maxDimension = 1024,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Diagnostic streaming & JSON client for /api/diagnose.
 * Kept lean and isolated to prevent bundling large research datasets into client pages.
 */
export async function diagnoseProblem(
  history: ChatMessage[],
  onChunk?: (chunk: string) => void,
  lang: "en" | "ms" = "en"
): Promise<string> {
  try {
    const streamQuery = onChunk ? "&stream=true" : "";
    const url = `/api/diagnose?lang=${lang}${streamQuery}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ history, lang }),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: `Diagnosis request failed (${res.status})` }));
      return `[DIAGNOSTIC_ERROR]: ${
        errorData.error || "Unable to complete diagnosis. Please tap Retry."
      }`;
    }

    const contentType = res.headers.get("content-type") || "";

    if (onChunk && res.body && !contentType.includes("application/json")) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }

      if (!fullText.trim()) {
        return "[DIAGNOSTIC_ERROR]: Connection closed before receiving diagnostic steps. Please tap Retry.";
      }
      return fullText;
    }

    const data = await res.json();
    if (data.error) {
      return `[DIAGNOSTIC_ERROR]: ${data.error}`;
    }
    return (
      data.reply ||
      "I evaluated your description, but received an empty response. Please try describing the symptom again."
    );
  } catch (err: any) {
    console.error("Diagnosis fetch error:", err);
    return `[DIAGNOSTIC_ERROR]: Network error connecting to diagnosis service (${err.message || "Failed to fetch"}). Please check your connection and tap Retry.`;
  }
}

// Alias for backwards compatibility with existing consumers
export const mockDiagnose = diagnoseProblem;
