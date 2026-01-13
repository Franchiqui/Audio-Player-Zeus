'use client';

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { X, Upload, Music, FileAudio, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  duration?: number;
  lastModified: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: AudioFile[]) => void;
  existingFiles?: AudioFile[];
  maxFiles?: number;
  maxFileSize?: number;
  accept?: string;
}

const Modal: React.FC<ModalProps> = React.memo(({
  isOpen,
  onClose,
  onFilesSelected,
  existingFiles = [],
  maxFiles = 50,
  maxFileSize = 50 * 1024 * 1024,
  accept = 'audio/*'
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (fileArray.length + existingFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    fileArray.forEach((file) => {
      if (file.size > maxFileSize) {
        errors.push(`${file.name} exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
      } else if (!file.type.startsWith('audio/')) {
        errors.push(`${file.name} is not an audio file`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [existingFiles.length, maxFiles, maxFileSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const audioFiles: AudioFile[] = await Promise.all(
        selectedFiles.map(async (file) => {
          const audio = new Audio();
          const duration = await new Promise<number>((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              resolve(audio.duration || 0);
            });
            audio.addEventListener('error', () => resolve(0));
            audio.src = URL.createObjectURL(file);
          });

          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
            type: file.type,
            duration,
            lastModified: file.lastModified
          };
        })
      );

      onFilesSelected(audioFiles);
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      setError('Failed to process audio files');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, onFilesSelected, onClose]);

  const totalSelected = useMemo(() => selectedFiles.length + existingFiles.length, [selectedFiles.length, existingFiles.length]);
  const canAddMore = useMemo(() => totalSelected < maxFiles, [totalSelected, maxFiles]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setError(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Load Audio Files
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5 text-gray-300" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-500",
                      !canAddMore && "opacity-50 cursor-not-allowed"
                    )}
                    role="region"
                    aria-label="File drop zone"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={accept}
                      onChange={(e) => handleFileSelect(e.target.files)}
                      disabled={!canAddMore || isUploading}
                      className="hidden"
                      aria-label="Select audio files"
                    />
                    
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <Upload className="h-8 w-8 text-blue-400" />
                      </div>
                      
                      <div>
                        <p className="text-lg font-medium text-gray-200 mb-2">
                          Drag & drop audio files here
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          or click to browse files
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!canAddMore || isUploading}
                          className={cn(
                            "px-6 py-2 rounded-lg font-medium transition-all",
                            canAddMore
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              : "bg-gray-700 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          Browse Files
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Supports MP3, WAV, FLAC, AAC • Max {maxFileSize / (1024 * 1024)}MB per file • Max {maxFiles} files total
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/50">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-300">Selected Files ({selectedFiles.length})</h3>
                      <div className="max-h1-[300px] overflow-y-auto space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w1-[0]">
                              <div className="flex-shrink1-[0]">
                                <FileAudio className="h1-[20px] w1-[20px] text-blue-400" />
                              </div>
                              <div className="min-w1-[0] flex1-[1]">
                                <p className="text-sm font-medium text-gray-200 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              disabled={isUploading}
                              className="p -1 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring -2 focus:ring-blue -500 disabled:opacity -50"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X className="h -4 w -4 text-gray -400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {existingFiles.length > 0 && (
                    <div className="space-y -3">
                      <h3 className="font-medium text-gray -300">Existing Files ({existingFiles.length})</h3>
                      <div className="max-h1-[200px] overflow-y-auto space-y -2">
                        {existingFiles.slice(0, 5).map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap -3 p -3 rounded-lg bg-gray -800/30"
                          >
                            <Music className="h -4 w -4 text-purple -400 flex-shrink1-[0]" />
                            <p className="text-sm text-gray -300 truncate flex1-[1]">{file.name}</p>
                            {file.duration && (
                              <span className="text-xs text-gray -500 flex-shrink1-[0]">
                                {Math.floor(file.duration / 60)}:{Math.floor(file.duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        ))}
                        {existingFiles.length > 5 && (
                          <p className="text-xs text-gray -500 text-center py -2">
                            +{existingFiles.length - 5} more files
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt -4 border-t border-gray -700">
                    <div className="text-sm text-gray -400">
                      {canAddMore ? (
                        <span>You can add {maxFiles - totalSelected} more files</span>
                      ) : (
                        <span className="text-yellow -400">Maximum file limit reached</span>
                      )}
                    </div>
                    
                    <div className="flex gap -3">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="px -6 py -2 rounded-lg font-medium bg-gray -700 hover:bg-gray -600 text-gray -200 transition-colors disabled:opacity -50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || isUploading}
                        className={cn(
                          "px -6 py -2 rounded-lg font-medium transition-all flex items-center gap -2",
                          selectedFiles.length > 0 && !isUploading
                            ? "bg-gradient-to-r from-blue -600 to-purple -600 hover:from-blue -700 hover:to-purple -700 text-white"
                            : "bg-gray -800 text-gray -400 cursor-not-allowed"
                        )}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h -4 w -4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h -4 w -4" />
                            Load {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

Modal.displayName = 'AudioPlayerModal';

export default Modal;