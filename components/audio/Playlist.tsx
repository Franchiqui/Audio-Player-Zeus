'use client';

import React from 'react';
import { useAudioStore } from '@/store/audio-store';
import { FileAudio, Play, Pause, Trash2, Clock } from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  type: string;
}

export default function Playlist() {
  const { 
    audioFiles, 
    currentFile, 
    isPlaying, 
    setCurrentFileIndex, 
    removeAudioFile,
    setIsPlaying 
  } = useAudioStore();

  // Debug: Log the current state
  console.log('Playlist - audioFiles:', audioFiles);
  console.log('Playlist - audioFiles length:', audioFiles.length);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePlayPause = (index: number) => {
    if (currentFile?.id === audioFiles[index].id && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentFileIndex(index);
      setIsPlaying(true);
    }
  };

  const handleRemoveFile = (id: string) => {
    removeAudioFile(id);
  };

  if (audioFiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileAudio className="h-12 w-12 mx-auto mb-4 text-gray-500" />
        <p>No audio files in playlist</p>
        <p className="text-sm mt-2">Upload audio files to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          {audioFiles.length} {audioFiles.length === 1 ? 'file' : 'files'}
        </span>
        <span className="text-sm text-gray-400">
          Total: {formatFileSize(audioFiles.reduce((acc, file) => acc + file.size, 0))}
        </span>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {audioFiles.map((file, index) => {
          const isCurrentTrack = currentFile?.id === file.id;
          const isCurrentlyPlaying = isCurrentTrack && isPlaying;
          
          return (
            <div
              key={file.id}
              className={`group flex items-center p-3 rounded-lg border transition-all duration-200 ${
                isCurrentTrack
                  ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30'
                  : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/50'
              }`}
            >
              <button
                onClick={() => handlePlayPause(index)}
                className="flex-shrink-0 p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 mr-3"
                aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="h-4 w-4 text-white" />
                ) : (
                  <Play className="h-4 w-4 text-white ml-0.5" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  isCurrentTrack ? 'text-purple-300' : 'text-gray-200'
                }`}>
                  {file.name}
                </p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(file.duration)}</span>
                  </span>
                  <span>{formatFileSize(file.size)}</span>
                  <span>{file.type.split('/')[1]?.toUpperCase()}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
