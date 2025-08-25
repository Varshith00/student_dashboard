/**
 * Clipboard utility with comprehensive fallback support
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern clipboard API first (requires HTTPS in production)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    return fallbackCopyToClipboard(text);
  } catch (error) {
    console.error("Clipboard API failed:", error);
    return fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make it invisible but functional
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    textArea.style.zIndex = "-1";

    // Add to DOM, select, and copy
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const success = document.execCommand("copy");

    // Clean up
    document.body.removeChild(textArea);

    return success;
  } catch (error) {
    console.error("Fallback copy failed:", error);
    return false;
  }
}

export function showCopyPrompt(
  text: string,
  description: string = "Copy this text",
): void {
  // As a last resort, show a prompt dialog
  prompt(`${description}:`, text);
}
