/// <reference lib="webworker" />

addEventListener("message", (event: MessageEvent<{ pattern: string; flags: string; text: string }>) => {
  try {
    const { pattern, flags, text } = event.data;
    const regex = new RegExp(pattern, flags);
    const matches: { index: number; value: string }[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ index: match.index, value: match[0] });
      if (!regex.global || matches.length >= 1000) break;
      if (!match[0]) regex.lastIndex += regex.unicode ? (Array.from(text.slice(regex.lastIndex))[0]?.length ?? 1) : 1;
    }
    postMessage({ matches });
  } catch (error) { postMessage({ error: error instanceof Error ? error.message : "Invalid expression." }); }
});