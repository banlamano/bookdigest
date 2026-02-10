'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface EnhancedAudioPlayerProps {
  bookTitle: string;
  bookSummary: string;
  bookId: string;
}

export function EnhancedAudioPlayer({ bookTitle, bookSummary, bookId }: EnhancedAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      // Cleanup on unmount
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const estimateDuration = (text: string) => {
    // Average speaking rate: 150 words per minute
    if (!text) return 0;
    const words = text.split(/\s+/).length;
    return (words / 150) * 60; // duration in seconds
  };

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      // Pause
      synthRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setIsLoading(true);
      
      if (synthRef.current.paused && utteranceRef.current) {
        // Resume
        synthRef.current.resume();
        setIsPlaying(true);
        startProgressTracking();
      } else {
        // Start new
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(bookSummary);
        utteranceRef.current = utterance;
        
        // Set voice properties
        utterance.rate = playbackRate;
        utterance.pitch = 1;
        utterance.volume = isMuted ? 0 : 1;
        
        // Try to use a good quality voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(
          voice => voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Estimate duration
        const estimatedDuration = estimateDuration(bookSummary);
        setDuration(estimatedDuration);

        utterance.onstart = () => {
          setIsLoading(false);
          setIsPlaying(true);
          startProgressTracking();
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setIsLoading(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };

        synthRef.current.speak(utterance);
      }
    }
  };

  const startProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return duration;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSkipBackward = () => {
    setCurrentTime(prev => Math.max(0, prev - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(prev => Math.min(duration, prev + 10));
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const handleRateChange = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    
    if (utteranceRef.current) {
      utteranceRef.current.rate = nextRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    // Note: Browser TTS doesn't support seeking, this is a visual approximation
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="card p-6 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary-200 dark:border-primary-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Audio Narration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered text-to-speech</p>
          </div>
        </div>
        <button
          onClick={handleRateChange}
          className="px-3 py-1 text-sm font-medium bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${progress}%, rgb(229, 231, 235) ${progress}%, rgb(229, 231, 235) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleSkipBackward}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Skip backward 10s"
        >
          <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={handleStop}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Stop"
        >
          <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="p-4 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={handleSkipForward}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Skip forward 10s"
        >
          <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={handleMuteToggle}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Press play to listen to the AI narration of this book summary
      </div>
    </div>
  );
}
