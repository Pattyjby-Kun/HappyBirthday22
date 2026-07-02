import {
  COIN_MIN_INTERVAL_MS,
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SFX_VOLUME,
  GAMEPLAY_FADE_IN_MS,
  LOOPING_SFX_KEYS,
  MENU_FADE_OUT_MS,
  MUSIC_URLS,
  MusicKeys,
  SOUND_POOL_SIZE,
  SOUND_URLS,
  SoundKeys,
  VN_MUSIC_VOLUME_SCALE,
  type MusicKey,
  type SoundKey,
} from "./sounds"

interface PlayOptions {
  /** Override volume for this play (0–1). Defaults to the SFX master volume. */
  volume?: number
}

type FadeCancel = () => void

/**
 * Shared audio manager for React UI and Phaser scenes.
 *
 * - Music and SFX are independent (volume + mute).
 * - Preloads from public/assets/audio/music/ and public/assets/audio/sfx/.
 * - Logs a console warning for each missing file (gameplay continues silently).
 * - Unlocks playback after the first user gesture (mobile policy).
 * - Reuses HTMLAudioElement instances — nothing is recreated per frame.
 */
export class AudioManager {
  private readonly musicTracks = new Map<MusicKey, HTMLAudioElement>()
  private readonly sfxPools = new Map<SoundKey, HTMLAudioElement[]>()
  private readonly sfxLoops = new Map<SoundKey, HTMLAudioElement>()

  private musicVolume = DEFAULT_MUSIC_VOLUME
  /** Per-track multiplier on musicVolume (e.g. VN music is intentionally softer). */
  private musicVolumeScale = 1
  private sfxVolume = DEFAULT_SFX_VOLUME
  private musicMuted = false
  private sfxMuted = false
  private unlocked = false
  private lastCoinPlayAt = 0
  private walkingActive = false
  private activeMusic: MusicKey | null = null
  private preloadComplete = false
  private cancelMusicFade: FadeCancel | null = null

  constructor() {
    this.registerUnlockListeners()
  }

  // ---------------------------------------------------------------------------
  // Preload & unlock
  // ---------------------------------------------------------------------------

  /** Attempts to preload every registered music track and SFX. Safe to call multiple times. */
  async preload(): Promise<void> {
    if (this.preloadComplete) {
      return
    }

    const musicEntries = Object.entries(MUSIC_URLS) as [MusicKey, string][]
    const sfxEntries = Object.entries(SOUND_URLS) as [SoundKey, string][]
    const loaded: string[] = []
    const missing: string[] = []

    await Promise.all([
      ...musicEntries.map(async ([key, url]) => {
        try {
          const audio = await this.loadAudioElement(url)
          audio.loop = true
          this.musicTracks.set(key, audio)
          loaded.push(url)
        } catch {
          missing.push(url)
          console.warn(`[AudioManager] Audio file not found: ${url} (${key})`)
        }
      }),
      ...sfxEntries.map(async ([key, url]) => {
        try {
          const template = await this.loadAudioElement(url)
          if (LOOPING_SFX_KEYS.has(key)) {
            template.loop = true
            this.sfxLoops.set(key, template)
          } else {
            this.createPool(key, template)
          }
          loaded.push(url)
        } catch {
          missing.push(url)
          console.warn(`[AudioManager] Audio file not found: ${url} (${key})`)
        }
      }),
    ])

    if (missing.length === 0) {
      console.info(`[AudioManager] Preload OK — ${loaded.length} file(s) from /assets/audio/music/ and /assets/audio/sfx/`)
    } else {
      console.warn(
        `[AudioManager] Preload incomplete — ${loaded.length} loaded, ${missing.length} missing:\n` +
          missing.map((url) => `  • ${url}`).join("\n"),
      )
    }

    this.preloadComplete = true
  }

  /**
   * Must run inside a user gesture on mobile before audio will play.
   * Safe to call multiple times.
   */
  unlock(): void {
    if (this.unlocked) {
      return
    }

    this.unlocked = true

    // Warm up one element per loaded category (iOS requires gesture-bound play).
    for (const audio of this.musicTracks.values()) {
      this.warmUpElement(audio, this.musicVolume)
    }

    for (const pool of this.sfxPools.values()) {
      const audio = pool[0]
      if (audio) {
        this.warmUpElement(audio, this.sfxVolume)
      }
    }

    for (const audio of this.sfxLoops.values()) {
      this.warmUpElement(audio, this.sfxVolume)
    }

    // Default to menu music on first unlock when nothing else is playing yet.
    if (this.activeMusic === null) {
      void this.playMusicTrack(MusicKeys.Menu)
    }
  }

  // ---------------------------------------------------------------------------
  // Music
  // ---------------------------------------------------------------------------

  /** Start looping menu music (/assets/audio/music/gamestart.mp3). */
  startMenuMusic(): void {
    this.musicVolumeScale = 1
    void this.playMusicTrack(MusicKeys.Menu)
  }

  /**
   * Fade menu music out over 1 s, then fade gameplay music in.
   * Call when the Play button is pressed.
   */
  transitionToGameplayMusic(): void {
    void this.crossfadeMusic(MusicKeys.Menu, MusicKeys.Gameplay, MENU_FADE_OUT_MS, GAMEPLAY_FADE_IN_MS, 1)
  }

  /** Fade whatever is playing out and return to menu music (e.g. on Exit / VN end). */
  transitionToMenuMusic(): void {
    this.setWalking(false)
    const from = this.activeMusic ?? MusicKeys.Gameplay
    void this.crossfadeMusic(from, MusicKeys.Menu, MENU_FADE_OUT_MS, GAMEPLAY_FADE_IN_MS, 1)
  }

  /**
   * Enter the secret-ending visual novel: fade the current track out and fade a
   * calm, very soft track in. Loops until the ending finishes. Safe/silent if
   * the optional emotional.mp3 is not present.
   */
  transitionToVnMusic(): void {
    this.setWalking(false)
    const from = this.activeMusic ?? MusicKeys.Gameplay
    void this.crossfadeMusic(from, MusicKeys.Vn, MENU_FADE_OUT_MS, GAMEPLAY_FADE_IN_MS, VN_MUSIC_VOLUME_SCALE)
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clampVolume(volume)
    this.applyMusicVolume()
  }

  getMusicVolume(): number {
    return this.musicVolume
  }

  setMuteMusic(muted: boolean): void {
    this.musicMuted = muted
    if (muted) {
      this.pauseAllMusic()
    } else if (this.unlocked && this.activeMusic) {
      void this.playMusicTrack(this.activeMusic)
    }
  }

  isMusicMuted(): boolean {
    return this.musicMuted
  }

  // ---------------------------------------------------------------------------
  // Sound effects — typed helpers
  // ---------------------------------------------------------------------------

  /** UI buttons: Play, Mail icon, Close, Exit. */
  playClick(): void {
    this.playOneShot(SoundKeys.Click)
  }

  /**
   * Short speech "blip" for the dialogue typewriter. Plays a pooled instance at
   * a custom (low) volume and playback rate so the pitch varies — the retro
   * visual-novel / Animal-Crossing effect. Silent-safe if the file is missing.
   */
  playVoiceBlip(key: SoundKey, options: { volume: number; rate: number }): void {
    if (!this.canPlaySfx()) {
      return
    }

    const audio = this.acquireFromPool(key)
    if (!audio) {
      return
    }

    // Disable pitch preservation so playbackRate also shifts the pitch.
    const pitchy = audio as HTMLAudioElement & {
      preservesPitch?: boolean
      mozPreservesPitch?: boolean
      webkitPreservesPitch?: boolean
    }
    pitchy.preservesPitch = false
    pitchy.mozPreservesPitch = false
    pitchy.webkitPreservesPitch = false

    audio.volume = clampVolume(options.volume)
    audio.playbackRate = options.rate
    audio.currentTime = 0

    void audio.play().catch(() => {
      // Blocked or missing — ignore, dialogue still types silently.
    })
  }

  /** Coin pickup with overlap protection for rapid collection. */
  playCoin(): void {
    const now = performance.now()
    if (now - this.lastCoinPlayAt < COIN_MIN_INTERVAL_MS) {
      return
    }
    this.lastCoinPlayAt = now
    this.playOneShot(SoundKeys.Coin)
  }

  /** Jump SFX — call once when the player leaves the ground upward. */
  playJump(): void {
    this.playOneShot(SoundKeys.Jump)
  }

  /**
   * Mail notification after victory sequence.
   * Do not call when opening the mail window — use playClick() there instead.
   */
  playMail(onComplete?: () => void): void {
    this.playOneShot(SoundKeys.Mail, {}, onComplete)
  }

  /**
   * Victory sequence at 20/20 coins:
   * 1. /assets/audio/sfx/vicotroy.mp3
   * 2. /assets/audio/sfx/mailalert.wav (then optional callback, e.g. show toast)
   */
  playVictoryThenMail(onComplete?: () => void): void {
    if (!this.canPlaySfx()) {
      onComplete?.()
      return
    }

    const victory = this.acquireFromPool(SoundKeys.Victory)
    if (!victory) {
      this.playMail(onComplete)
      return
    }

    victory.volume = this.sfxVolume
    victory.currentTime = 0

    const handleEnded = (): void => {
      victory.removeEventListener("ended", handleEnded)
      this.playMail(onComplete)
    }

    victory.addEventListener("ended", handleEnded, { once: true })
    void victory.play().catch(() => {
      victory.removeEventListener("ended", handleEnded)
      this.playMail(onComplete)
    })
  }

  /**
   * Loop walking SFX while moving on the ground.
   * Call every frame from Player — internally deduplicates start/stop.
   */
  setWalking(active: boolean): void {
    if (active === this.walkingActive) {
      return
    }

    if (!active || !this.canPlaySfx()) {
      this.stopLoopingSfx(SoundKeys.Walking)
      this.walkingActive = false
      return
    }

    const walking = this.sfxLoops.get(SoundKeys.Walking)
    if (!walking) {
      this.walkingActive = false
      return
    }

    this.walkingActive = true
    walking.volume = this.sfxVolume
    if (walking.paused) {
      void walking.play().catch(() => {
        this.walkingActive = false
      })
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = clampVolume(volume)
  }

  getSfxVolume(): number {
    return this.sfxVolume
  }

  setMuteSfx(muted: boolean): void {
    this.sfxMuted = muted
    if (muted) {
      this.stopAllSfx()
    }
  }

  isSfxMuted(): boolean {
    return this.sfxMuted
  }

  /** Mute both music and SFX without affecting gameplay logic. */
  setMuteAll(muted: boolean): void {
    this.setMuteMusic(muted)
    this.setMuteSfx(muted)
  }

  isMuted(): boolean {
    return this.musicMuted && this.sfxMuted
  }

  isUnlocked(): boolean {
    return this.unlocked
  }

  isPreloadComplete(): boolean {
    return this.preloadComplete
  }

  /** Stop every playing one-shot and looping SFX instance. */
  stopAllSfx(): void {
    for (const key of this.sfxPools.keys()) {
      this.stopPool(key)
    }
    for (const key of this.sfxLoops.keys()) {
      this.stopLoopingSfx(key)
    }
    this.walkingActive = false
  }

  // ---------------------------------------------------------------------------
  // Internal — playback
  // ---------------------------------------------------------------------------

  private canPlaySfx(): boolean {
    return this.unlocked && !this.sfxMuted
  }

  private canPlayMusic(): boolean {
    return this.unlocked && !this.musicMuted
  }

  private playOneShot(key: SoundKey, options: PlayOptions = {}, onComplete?: () => void): void {
    if (!this.canPlaySfx()) {
      return
    }

    const audio = this.acquireFromPool(key)
    if (!audio) {
      return
    }

    audio.volume = options.volume ?? this.sfxVolume
    audio.currentTime = 0

    if (onComplete) {
      const handleEnded = (): void => {
        audio.removeEventListener("ended", handleEnded)
        onComplete()
      }
      audio.addEventListener("ended", handleEnded, { once: true })
    }

    void audio.play().catch(() => {
      // Browser blocked playback or file missing — ignore to keep gameplay silent-safe.
    })
  }

  private async playMusicTrack(key: MusicKey): Promise<void> {
    if (!this.canPlayMusic()) {
      return
    }

    const track = this.musicTracks.get(key)
    if (!track) {
      return
    }

    // Pause any other music track without resetting the target's position.
    for (const [otherKey, otherTrack] of this.musicTracks.entries()) {
      if (otherKey !== key) {
        otherTrack.pause()
      }
    }

    this.activeMusic = key
    track.volume = this.targetMusicVolume()

    if (track.paused) {
      try {
        await track.play()
      } catch {
        // Autoplay blocked or missing file — silent fail.
      }
    } else {
      track.volume = this.targetMusicVolume()
    }
  }

  /** Effective volume for the active track (master × per-track scale). */
  private targetMusicVolume(): number {
    return this.musicVolume * this.musicVolumeScale
  }

  private async crossfadeMusic(
    fromKey: MusicKey,
    toKey: MusicKey,
    fadeOutMs: number,
    fadeInMs: number,
    toScale = 1,
  ): Promise<void> {
    this.cancelMusicFade?.()
    this.cancelMusicFade = null

    const fromTrack = this.musicTracks.get(fromKey)
    const toTrack = this.musicTracks.get(toKey)

    if (!toTrack) {
      if (fromTrack) {
        fromTrack.pause()
        fromTrack.currentTime = 0
      }
      this.activeMusic = null
      return
    }

    if (!this.canPlayMusic()) {
      fromTrack?.pause()
      toTrack.pause()
      this.activeMusic = null
      return
    }

    const startNext = async (): Promise<void> => {
      this.activeMusic = toKey
      this.musicVolumeScale = toScale
      toTrack.currentTime = 0
      toTrack.volume = 0

      try {
        await toTrack.play()
      } catch {
        return
      }

      this.cancelMusicFade = this.fadeVolume(toTrack, 0, this.targetMusicVolume(), fadeInMs, () => {
        this.cancelMusicFade = null
      })
    }

    if (!fromTrack || fromTrack.paused) {
      await startNext()
      return
    }

    const fromStartVolume = fromTrack.volume
    this.cancelMusicFade = this.fadeVolume(fromTrack, fromStartVolume, 0, fadeOutMs, () => {
      fromTrack.pause()
      fromTrack.currentTime = 0
      this.cancelMusicFade = null
      void startNext()
    })
  }

  private pauseAllMusic(): void {
    this.cancelMusicFade?.()
    this.cancelMusicFade = null

    for (const track of this.musicTracks.values()) {
      track.pause()
    }
  }

  private applyMusicVolume(): void {
    if (this.activeMusic) {
      const track = this.musicTracks.get(this.activeMusic)
      if (track && !track.paused) {
        track.volume = this.targetMusicVolume()
      }
    }
  }

  private stopPool(key: SoundKey): void {
    const pool = this.sfxPools.get(key)
    pool?.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  private stopLoopingSfx(key: SoundKey): void {
    const audio = this.sfxLoops.get(key)
    if (!audio) {
      return
    }

    audio.pause()
    audio.currentTime = 0
  }

  // ---------------------------------------------------------------------------
  // Internal — loaders & pools
  // ---------------------------------------------------------------------------

  private registerUnlockListeners(): void {
    const unlockOnce = (): void => {
      this.unlock()
    }

    document.addEventListener("pointerdown", unlockOnce, { once: true, passive: true })
    document.addEventListener("touchstart", unlockOnce, { once: true, passive: true })
    document.addEventListener("keydown", unlockOnce, { once: true })
  }

  private warmUpElement(audio: HTMLAudioElement, volume: number): void {
    const previousVolume = audio.volume
    audio.volume = 0
    void audio
      .play()
      .then(() => {
        audio.pause()
        audio.currentTime = 0
        audio.volume = volume
      })
      .catch(() => {
        audio.volume = previousVolume
      })
  }

  private async loadAudioElement(url: string): Promise<HTMLAudioElement> {
    const audio = new Audio(url)
    audio.preload = "auto"

    await new Promise<void>((resolve, reject) => {
      const onReady = (): void => {
        cleanup()
        resolve()
      }
      const onError = (): void => {
        cleanup()
        reject(new Error(`Failed to load ${url}`))
      }
      const cleanup = (): void => {
        audio.removeEventListener("canplaythrough", onReady)
        audio.removeEventListener("error", onError)
      }

      audio.addEventListener("canplaythrough", onReady, { once: true })
      audio.addEventListener("error", onError, { once: true })
      audio.load()
    })

    return audio
  }

  private createPool(key: SoundKey, template: HTMLAudioElement): void {
    const pool: HTMLAudioElement[] = []

    for (let i = 0; i < SOUND_POOL_SIZE; i += 1) {
      const clone =
        i === 0
          ? template
          : (() => {
              const node = new Audio(template.src)
              node.preload = "auto"
              return node
            })()
      pool.push(clone)
    }

    this.sfxPools.set(key, pool)
  }

  private acquireFromPool(key: SoundKey): HTMLAudioElement | null {
    const pool = this.sfxPools.get(key)
    if (!pool || pool.length === 0) {
      return null
    }

    const idle = pool.find((audio) => audio.paused || audio.ended)
    return idle ?? pool[0] ?? null
  }

  private fadeVolume(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
    onComplete?: () => void,
  ): FadeCancel {
    const start = performance.now()
    let cancelled = false
    let frameId = 0

    const tick = (now: number): void => {
      if (cancelled) {
        return
      }

      const progress = durationMs <= 0 ? 1 : Math.min(1, (now - start) / durationMs)
      audio.volume = from + (to - from) * progress

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        onComplete?.()
      }
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
    }
  }
}

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume))
}

/** Process-wide singleton — import from Phaser scenes and React handlers. */
export const audioManager = new AudioManager()
