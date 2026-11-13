let ctx: AudioContext | null = null;

/**
 * A short, quiet two-tone telephone ring, synthesised with the Web Audio API (no audio file).
 * Only ever call this from an explicit user interaction (click/tap) — browsers block it otherwise,
 * and the site never plays sound on its own.
 */
export function playRing() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  const audio = ctx;
  const t = audio.currentTime;
  [0, 0.55].forEach((offset) => {
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.06, t + offset + 0.03);
    gain.gain.setValueAtTime(0.06, t + offset + 0.36);
    gain.gain.linearRampToValueAtTime(0, t + offset + 0.42);
    gain.connect(audio.destination);
    [440, 480].forEach((freq) => {
      const osc = audio.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.45);
    });
  });
}
