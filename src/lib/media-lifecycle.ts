export function waitForClip(video: HTMLVideoElement, end: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let frame = 0;
    const cleanup = () => {
      cancelAnimationFrame(frame); clearTimeout(timer);
      video.removeEventListener("error", fail); signal.removeEventListener("abort", cancel);
    };
    const fail = () => { cleanup(); reject(new Error("Playback stopped before recording finished.")); };
    const cancel = () => { cleanup(); reject(new DOMException("Recording cancelled.", "AbortError")); };
    const tick = () => { if (video.currentTime >= end || video.ended) { cleanup(); resolve(); } else frame = requestAnimationFrame(tick); };
    const timer = setTimeout(fail, Math.max(10000, (end - video.currentTime) * 1000 + 15000));
    video.addEventListener("error", fail, { once: true }); signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel(); else tick();
  });
}