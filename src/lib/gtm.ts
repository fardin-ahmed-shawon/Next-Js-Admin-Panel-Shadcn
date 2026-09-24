export type GtmScript = { src: string | null; isAsync: boolean; isDefer: boolean; content: string };

export function parseGtmHead(rawCode?: string | null): GtmScript[] {
  if (!rawCode?.trim()) return [];
  const scripts: GtmScript[] = [];
  const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawCode)) !== null) {
    const attrs = match[1] || "";
    scripts.push({
      src: attrs.match(/src=["']([^"']+)["']/i)?.[1] || null,
      isAsync: /\basync\b/i.test(attrs),
      isDefer: /\bdefer\b/i.test(attrs),
      content: (match[2] || "").trim(),
    });
  }
  if (!scripts.length) {
    const content = rawCode.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (content) scripts.push({ src: null, isAsync: false, isDefer: false, content });
  }
  return scripts;
}

export function parseGtmBody(rawCode?: string | null): string[] {
  if (!rawCode?.trim()) return [];
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