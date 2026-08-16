declare global {
  interface Window {
    QretBridge?: {
      copyText?: (text: string) => boolean;
    };
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 0) Native Android app bridge (window.QretBridge) — copied by the Android
  //    system clipboard itself, cannot be blocked by browser quirks.
  try {
    const bridge = window.QretBridge;
    if (bridge && typeof bridge.copyText === "function") {
      const result = bridge.copyText(text);
      if (result === true) return true;
    }
  } catch {
    /* fall through */
  }

  // 1) Modern async API (works on secure contexts like localhost/HTTPS)
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }

  // 2) Legacy execCommand fallback (works on plain HTTP / Android WebView)
  // IMPORTANT: the textarea must stay technically visible to the engine —
  // positioning it far off-screen (e.g. -9999px) makes the copy fail on
  // several mobile browsers. Use a 1px transparent field at the top-left.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.setAttribute("aria-hidden", "true");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.width = "1px";
    ta.style.height = "1px";
    ta.style.padding = "0";
    ta.style.border = "none";
    ta.style.outline = "none";
    ta.style.boxShadow = "none";
    ta.style.background = "transparent";
    ta.style.opacity = "0.01";
    ta.style.fontSize = "12pt";
    document.body.appendChild(ta);

    const selection = document.getSelection();
    const oldRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const activeElement = document.activeElement as HTMLElement | null;

    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }

    try {
      ta.blur();
    } catch {
      /* ignore */
    }
    if (oldRange && selection) {
      selection.removeAllRanges();
      selection.addRange(oldRange);
    }
    if (activeElement && typeof activeElement.focus === "function") {
      activeElement.focus();
    }
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}