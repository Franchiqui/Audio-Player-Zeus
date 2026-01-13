'use client';

'use client';

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Music, 
  FolderOpen, 
  Upload, 
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  FileAudio,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/store/audio-store';

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  size: number;
  lastModified: Date;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onFileSelect?: (file: AudioFile) => void;
  className?: string;
}

const Sidebar = memo(function Sidebar({
  isOpen = true,
  onToggle,
  onFileSelect,
  className
}: SidebarProps) {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<'library' | 'uploads' | 'playlists'>('library');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { currentTrack } = useAudioStore();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setIsUploading(true);
    const newFiles: AudioFile[] = [];
    const progressMap: Record<string, number> = {};

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!file.type.startsWith('audio/')) continue;

      const fileId = `${Date.now()}-${i}`;
      progressMap[fileId] = 0;

      const audioElement = new Audio();
      audioElement.src = URL.createObjectURL(file);
      
      audioElement.addEventListener('loadedmetadata', () => {
        const newFile: AudioFile = {
          id: fileId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          duration: audioElement.duration,
          size: file.size,
          lastModified: new Date(file.lastModified)
        };
        
        newFiles.push(newFile);
        progressMap[fileId] = 100;
        setUploadProgress({ ...progressMap });

        if (newFiles.length === selectedFiles.length) {
          setFiles(prev => [...prev, ...newFiles]);
          setIsUploading(false);
          setUploadProgress({});
        }
      });
    }

    if (event.target) {
      event.target.value = '';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-blue-500', 'bg-blue-500/10');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-500/10');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-500/10');
    }

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      Array.from(droppedFiles).forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: Music },
    { id: 'playlists', label: 'Playlists', icon: FolderOpen },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 320 : 80 }}
      className={cn(
        'relative flex flex-col h-full bg-gradient-to-b from-gray-900 to-black border-r border-gray-800',
        'transition-all duration-300 ease-in-out',
        className
      )}
      aria-label="Audio player sidebar"
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="flex-shrink-0 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Music size={24} />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Audio Player Zeus
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as any)}
            className={cn(
              'flex items-center w-full p-3 rounded-lg transition-all duration-200',
              activeSection === item.id
                ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            )}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <item.icon size={20} />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, marginLeft: -20 }}
                  animate={{ opacity: 1, marginLeft: 12 }}
                  exit={{ opacity: 0, marginLeft: -20 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative p-4 rounded-lg border-2 border-dashed transition-all duration-200',
            'border-gray-700 hover:border-purple-500 cursor-pointer',
            isUploading && 'border-blue-500 bg-blue-500/10'
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload audio files"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Select audio files"
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload size={24} className="text-gray-400" />
            {isOpen && (
              <>
                <p className="text-sm text-gray-300 text-center">
                  Drop audio files here or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  Supports MP3, WAV, FLAC, AAC
                </p>
              </>
            )}
          </div>

          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="mt-3 space-y-1">
              {Object.entries(uploadProgress).map(([id, progress]) => (
                <div key={id} className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden border-t border-gray-800"
          >
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center justify-between">
                <span>Audio Files</span>
                <span className="text-xs text-gray-500">{files.length} items</span>
              </h2>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => onFileSelect?.(file)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all duration-200',
                      currentTrack?.id === file.id
                        ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30'
                        : 'hover:bg-gray-800/50'
                    )}
                    aria-label={`Select ${file.name}`}
                  >
                    <div className="flex items-start space-x-3">
                      <FileAudio size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatDuration(file.duration)}</span>
                          </span>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && currentTrack && (
        <div className="p-4 border-t border-gray-800 bg-gradient-to-r from-gray-900/50 to-black/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Music size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentTrack.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                Now Playing
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;