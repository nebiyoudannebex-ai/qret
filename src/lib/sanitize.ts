import DOMPurify from "dompurify";

// XSS Sanitization Guard — strips ALL HTML before rendering dynamic dish names
// or customer notes. React escapes by default; this is defense-in-depth for
// any string that ever flows through dangerously-rendered surfaces.
export function sanitizeInput(userInput: string): string {
  return DOMPurify.sanitize(userInput.trim(), {
    ALLOWED_TAGS: [], // Disallow all HTML tags
    ALLOWED_ATTR: [],
  });
}

// UTF-8 Mojibake Repair — fixes double-encoded names (e.g. corrupted Amharic)
// that arrive already garbled in React state.
export function fixMojibake(str: string): string {
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str; // Return original if parsing fails
  }
}