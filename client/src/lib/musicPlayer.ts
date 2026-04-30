const TRACKS = [
  "/music/smooth-jazz-1.mp3",
  "/music/smooth-jazz-2.mp3",
  "/music/smooth-jazz-3.mp3",
];

const VOLUME = 0.12;

class MusicPlayer {
  private audio: HTMLAudioElement;
  private trackIndex = 0;
  private onStopCallback: (() => void) | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.volume = VOLUME;
    this.audio.addEventListener("ended", () => this.advance());
    this.audio.addEventListener("error", () => this.advance());
  }

  onStop(cb: () => void) {
    this.onStopCallback = cb;
  }

  play() {
    this.audio.src = TRACKS[this.trackIndex];
    this.audio.volume = VOLUME;
    this.audio.play().catch(() => {});
  }

  pause() {
    this.audio.pause();
  }

  next() {
    this.trackIndex = (this.trackIndex + 1) % TRACKS.length;
    this.audio.src = TRACKS[this.trackIndex];
    this.audio.play().catch(() => {});
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.trackIndex = 0;
  }

  private advance() {
    const nextIndex = this.trackIndex + 1;
    if (nextIndex >= TRACKS.length) {
      // Played through all tracks — stop and notify
      this.audio.pause();
      this.trackIndex = 0;
      this.onStopCallback?.();
      return;
    }
    this.trackIndex = nextIndex;
    this.audio.src = TRACKS[this.trackIndex];
    this.audio.play().catch(() => {});
  }
}

export const musicPlayer = new MusicPlayer();
