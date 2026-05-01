"use client";

import { useState, useCallback, useEffect } from "react";

// Singleton audio instance shared across all components
const audioInstance = typeof window !== "undefined" ? new Audio() : null;

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Track the audio instance status
  useEffect(() => {
    if (!audioInstance) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setActiveId(null);
    };

    audioInstance.addEventListener("play", onPlay);
    audioInstance.addEventListener("pause", onPause);
    audioInstance.addEventListener("ended", onEnded);

    return () => {
      audioInstance.removeEventListener("play", onPlay);
      audioInstance.removeEventListener("pause", onPause);
      audioInstance.removeEventListener("ended", onEnded);
    };
  }, []);

  const playAudio = useCallback((url: string, id: string) => {
    if (!audioInstance) return;

    // Snappy interruption
    if (!audioInstance.paused) {
      audioInstance.pause();
    }

    // Ensure URL is complete
    let fullUrl = url;
    if (url.startsWith("//")) {
      fullUrl = `https:${url}`;
    } else if (!url.startsWith("http")) {
      fullUrl = `https://audio.qurancdn.com/${url}`;
    }
    
    console.log("Attempting to play audio:", { original: url, resolved: fullUrl, id });

    // Swap src and play
    if (audioInstance.src !== fullUrl) {
      audioInstance.src = fullUrl;
    }
    
    audioInstance.currentTime = 0;
    setActiveId(id);
    
    audioInstance.play().then(() => {
      console.log("Audio playback started successfully.");
    }).catch((err) => {
      console.error("Failed to play audio:", err);
      setActiveId(null);
    });
  }, []);

  const stopAudio = useCallback(() => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setActiveId(null);
    }
  }, []);

  return {
    isPlaying,
    activeId,
    playAudio,
    stopAudio,
  };
}
