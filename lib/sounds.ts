/**
 * Sound Effects Manager
 * Provides subtle, professional audio feedback for UI interactions
 * All sounds are optional and respect user preferences
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false;
  private volume: number = 0.3;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Check if user has enabled sounds in localStorage
    if (typeof window !== "undefined") {
      this.enabled = localStorage.getItem("soundEffects") === "true";
      const savedVolume = localStorage.getItem("soundVolume");
      if (savedVolume) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  /**
   * Initialize audio context (only when first sound is played)
   */
  private initAudioContext() {
    if (
      !this.audioContext &&
      typeof window !== "undefined" &&
      window.AudioContext
    ) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Play a synthesized sound effect
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    fadeOut: boolean = true
  ) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      // Set initial volume
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      // Fade out if requested
      if (fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + duration
        );
      }

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  /**
   * Sound effect presets
   */
  public click() {
    this.initAudioContext();
    this.playTone(600, 0.05, "sine");
  }

  public success() {
    this.initAudioContext();
    if (!this.enabled || !this.audioContext) return;

    // Play a pleasant two-tone success sound
    this.playTone(523.25, 0.1, "sine"); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.15, "sine"); // E5
    }, 100);
  }

  public generate() {
    this.initAudioContext();
    if (!this.enabled || !this.audioContext) return;

    // Ascending tone for generation start
    this.playTone(400, 0.1, "sine");
    setTimeout(() => {
      this.playTone(500, 0.1, "sine");
    }, 50);
    setTimeout(() => {
      this.playTone(600, 0.15, "sine");
    }, 100);
  }

  public copy() {
    this.initAudioContext();
    // Quick, light feedback for copy
    this.playTone(800, 0.03, "square");
  }

  public error() {
    this.initAudioContext();
    if (!this.enabled || !this.audioContext) return;

    // Low tone for errors
    this.playTone(200, 0.2, "sawtooth");
  }

  public hover() {
    this.initAudioContext();
    // Very subtle hover sound
    this.playTone(1000, 0.02, "sine");
  }

  public type() {
    this.initAudioContext();
    // Subtle typing feedback
    this.playTone(400 + Math.random() * 200, 0.01, "sine");
  }

  /**
   * Toggle sound effects on/off
   */
  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEffects", this.enabled.toString());
    }
    if (this.enabled) {
      this.click(); // Play a sound to confirm it's enabled
    }
    return this.enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
      localStorage.setItem("soundVolume", this.volume.toString());
    }
  }

  /**
   * Check if sounds are enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }
}

// Create singleton instance
let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}

// React hook for using sounds
import { useCallback } from "react";

export function useSounds() {
  const soundManager = getSoundManager();

  return {
    playClick: useCallback(() => soundManager.click(), [soundManager]),
    playSuccess: useCallback(() => soundManager.success(), [soundManager]),
    playGenerate: useCallback(() => soundManager.generate(), [soundManager]),
    playCopy: useCallback(() => soundManager.copy(), [soundManager]),
    playError: useCallback(() => soundManager.error(), [soundManager]),
    playHover: useCallback(() => soundManager.hover(), [soundManager]),
    playType: useCallback(() => soundManager.type(), [soundManager]),
    toggleSounds: useCallback(() => soundManager.toggle(), [soundManager]),
    setVolume: useCallback(
      (v: number) => soundManager.setVolume(v),
      [soundManager]
    ),
    isEnabled: useCallback(() => soundManager.isEnabled(), [soundManager]),
    getVolume: useCallback(() => soundManager.getVolume(), [soundManager]),
  };
}
