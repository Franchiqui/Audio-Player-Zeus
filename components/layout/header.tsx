'use client';

'use client';

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, FolderOpenIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
}

interface HeaderProps {
  onFilesUpload?: (files: AudioFile[]) => void;
  currentTrack?: AudioFile | null;
  isPlaying?: boolean;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

const Header = memo(function Header({
  onFilesUpload,
  currentTrack,
  isPlaying = false,
  onMenuToggle,
  isMenuOpen = false
}: HeaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    const audioFiles: AudioFile[] = [];
    
    for (const file of files) {
      if (!file.type.startsWith('audio/')) continue;

      try {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        
        await new Promise<void>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            audioFiles.push({
              id: crypto.randomUUID(),
              name: file.name,
              url,
              duration: audio.duration,
              size: file.size
            });
            resolve();
          });
          audio.addEventListener('error', () => resolve());
        });
        
        audio.remove();
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    if (audioFiles.length > 0 && onFilesUpload) {
      onFilesUpload(audioFiles);
    }
  }, [onFilesUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [processFiles]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    return () => {
      if (currentTrack?.url) {
        URL.revokeObjectURL(currentTrack.url);
      }
    };
  }, [currentTrack?.url]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            <div className="ml-4 flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <MusicalNoteIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">Audio Player Zeus</h1>
                <p className="text-xs text-gray-400">Professional Audio Experience</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={triggerFileInput}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  "relative flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                  isDragging
                    ? "border-2 border-dashed border-blue-500 bg-blue-900/20 text-blue-300"
                    : "bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white hover:from-blue-500 hover:to-purple-500"
                )}
                aria-label="Upload audio files"
              >
                <FolderOpenIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                Load Audio Files
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-900/40"
                  >
                    <span className="text-sm font-medium">Drop files here</span>
                  </motion.div>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Audio file input"
              />

              <AnimatePresence>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -bottom-2 left-0 right-0 h-1 overflow-hidden rounded-full bg-gray-700"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentTrack && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden items-center space-x-3 rounded-lg bg-gray-800/50 px-4 py-2 backdrop-blur-sm md:flex"
              >
                <div className="h-8 w-8 flex-shrink-0 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1.5">
                  <MusicalNoteIcon className="h-full w-full text-blue-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{currentTrack.name}</p>
                  <p className="text-xs text-gray-400">
                    {Math.floor(currentTrack.duration / 60)}:
                    {Math.floor(currentTrack.duration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </p>
                </div>
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={isPlaying ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                  className="h-2 w-2 rounded-full bg-green-500"
                  aria-label={isPlaying ? 'Playing' : 'Paused'}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="rounded-xl border-2 border-dashed border-blue-500 bg-gray-900/90 p-8 text-center">
              <FolderOpenIcon className="mx-auto h-12 w-12 text-blue-400" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-white">Drop audio files here</h3>
              <p className="mt-2 text-sm text-gray-300">Supported formats: MP3, WAV, FLAC, AAC</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;