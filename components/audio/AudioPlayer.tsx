'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useAudioStore } from '@/store/audio-store';

interface AudioPlayerProps {
  className?: string;
}

export default function AudioPlayer({ className = '' }: AudioPlayerProps) {
  const {
    currentFile,
    isPlaying,
    currentTime,
    duration,
    volume,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    playNext,
    playPrevious,
    toggleMute,
    isMuted
  } = useAudioStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentFile) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => playNext();
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentFile, setCurrentTime, setDuration, playNext]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(err => console.error('Error playing audio:', err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  const togglePlay = () => {
    if (!currentFile) return;
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };
  
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (!currentFile) {
    return (
      <Card className={`p-8 text-center text-gray-400 ${className}`}>
        <div className="space-y-4">
          <div className="h-16 w-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
            <Play className="h-8 w-8" />
          </div>
          <p>No audio file selected</p>
          <p className="text-sm">Select a file from the playlist to start playing</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`p-4 ${className}`}>
      <audio ref={audioRef} src={currentFile.url} preload="metadata" />
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg truncate">{currentFile.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {currentFile.type.split('/')[1]?.toUpperCase()} • {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              <Volume2 className={`h-4 w-4 ${isMuted ? 'text-red-400' : ''}`} />
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={playPrevious} className="h-8 w-8">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="default" 
              size="icon" 
              onClick={togglePlay}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="h-8 w-8">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
