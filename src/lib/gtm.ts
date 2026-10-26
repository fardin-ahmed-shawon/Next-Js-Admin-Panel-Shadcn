export type GtmScript = { src: string | null; isAsync: boolean; isDefer: boolean; content: string };

function normalizeSnippet(rawCode?: string | null): string {
  const value = typeof rawCode === "string" ? rawCode.trim() : "";
  if (/<(?:script|noscript|iframe)\b/i.test(value) || !/&lt;(?:script|noscript|iframe)\b/i.test(value)) return value;
  return value.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#(?:39|x27);/gi, "'").replace(/&amp;/gi, "&");
}

export function parseGtmHead(rawCode?: string | null): GtmScript[] {
  rawCode = normalizeSnippet(rawCode);
  if (!rawCode) return [];
  const scripts: GtmScript[] = [];
  const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawCode)) !== null) {
    const attrs = match[1] || "";
    scripts.push({
      src: attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] || null,
      isAsync: /\basync\b/i.test(attrs),
      isDefer: /\bdefer\b/i.test(attrs),
      content: (match[2] || "").trim(),
    });
  }
  if (!scripts.length) {
    const content = rawCode.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (content && !content.startsWith("<")) scripts.push({ src: null, isAsync: false, isDefer: false, content });
  }
  return scripts;
}

export function parseGtmBody(rawCode?: string | null): string[] {
  rawCode = normalizeSnippet(rawCode);
  if (!rawCode) return [];
  const contents: string[] = [];
  const regex = /<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawCode)) !== null) {
    if (match[1]?.trim()) contents.push(match[1].trim());
  }
  if (!contents.length) {
    const content = rawCode.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (content) contents.push(content);
  }
  return contents;
}

// Register before executing the custom loader so even an immediate network failure is caught.
export function prepareGtmHead(head?: string | null, body?: string | null): GtmScript[] {
  const scripts = parseGtmHead(head);
  const iframe = parseGtmBody(body).join('').match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (!iframe || !scripts.length) return scripts;
  let origin: string;
  let container: string;
  try {
    const url = new URL(iframe.replace(/&amp;/g, '&'));
    origin = url.origin;
    container = url.searchParams.get('id') || '';
    if (!/^GTM-[A-Z0-9]+$/.test(container) || url.hostname === 'www.googletagmanager.com') return scripts;
  } catch { return scripts; }
  const guard = '(function(){var origin=' + JSON.stringify(origin) + ',id=' + JSON.stringify(container) + ';' +
    'var done=false;function recover(e){var s=e.target;if(done||!s||s.tagName!=="SCRIPT"||!s.src)return;' +
    'try{if(new URL(s.src).origin!==origin)return;}catch(_){return;}' +
    'done=true;document.removeEventListener("error",recover,true);' +
    'if(window.google_tag_manager&&window.google_tag_manager[id])return;' +
    'var fallback=document.createElement("script");fallback.async=true;' +
    'fallback.src="https://www.googletagmanager.com/gtm.js?id="+encodeURIComponent(id);' +
    'document.head.appendChild(fallback);}' +
    'document.addEventListener("error",recover,true);})();';
  // Keep registration and inline execution in the same script to preserve ordering.
  if (!scripts[0].src) return [{ ...scripts[0], content: guard + '\n' + scripts[0].content }, ...scripts.slice(1)];
  return [{ src: null, isAsync: false, isDefer: false, content: guard }, ...scripts];
}
