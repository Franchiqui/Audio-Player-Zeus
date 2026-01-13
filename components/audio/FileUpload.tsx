'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileAudio } from 'lucide-react';
import { useAudioStore } from '@/store/audio-store';

type AudioFile = {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  type: string;
};

type FileUploadProps = {
  onFileUpload?: (file: AudioFile) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
};

export default function FileUpload({
  maxSize = 50, // 50MB default
  acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addAudioFile, audioFiles } = useAudioStore();

  // Debug: Log the current state
  console.log('FileUpload - audioFiles:', audioFiles);
  console.log('FileUpload - audioFiles length:', audioFiles.length);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: `Please upload audio files only (${acceptedTypes.join(', ')})`,
        variant: 'destructive',
      });
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSize}MB`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validateFileSilent = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return false;
    }

    return true;
  };

  const simulateUpload = (file: File): Promise<AudioFile> => {
    return new Promise((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Simulate API call delay
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        
        const audioFile: AudioFile = {
          id: `audio_${Date.now()}`,
          name: file.name,
          url: URL.createObjectURL(file),
          duration: 0, // Would need actual audio duration calculation
          size: file.size,
          type: file.type,
        };

        setIsUploading(false);
        resolve(audioFile);
      }, 1500);
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => validateFileSilent(file));
    if (validFiles.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let failedCount = 0;

    try {
      for (const file of validFiles) {
        try {
          const uploadedFile = await simulateUpload(file);
          console.log('About to add file to store (drop):', uploadedFile);
          addAudioFile(uploadedFile);
          console.log('File added to store (drop)');
          uploadedCount++;
        } catch (error) {
          console.error('Failed to upload file:', file.name, error);
          failedCount++;
        }
      }
      
      if (uploadedCount > 0) {
        toast({
          title: 'Upload successful',
          description: `${uploadedCount} file(s) uploaded successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'No files could be uploaded',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => validateFile(file));
    if (validFiles.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let failedCount = 0;

    try {
      for (const file of validFiles) {
        try {
          const uploadedFile = await simulateUpload(file);
          console.log('About to add file to store (input):', uploadedFile);
          addAudioFile(uploadedFile);
          console.log('File added to store (input)');
          uploadedCount++;
        } catch (error) {
          console.error('Failed to upload file:', file.name, error);
          failedCount++;
        }
      }
      
      if (uploadedCount > 0) {
        toast({
          title: 'Upload successful',
          description: `${uploadedCount} file(s) uploaded successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'No files could be uploaded',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Upload Audio Files
        </CardTitle>
        <CardDescription className="text-gray-400">
          Drag and drop or click to upload audio files (max {maxSize}MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-gray-300 font-medium mb-1">
                {isUploading ? 'Uploading...' : 'Drop audio files here'}
              </p>
              <p className="text-gray-400 text-sm">
                or click to browse multiple files
              </p>
            </div>
            
            {isUploading && (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">{uploadProgress}%</p>
              </div>
            )}
            
            <Button
              onClick={handleButtonClick}
              disabled={isUploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isUploading ? 'Uploading...' : 'Browse Multiple Files'}
            </Button>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="text-gray-500 text-xs mt-4">
              Supported formats: MP3, WAV, OGG, FLAC, AAC (multiple files allowed)
            </div>
          </div>
        </div>
        
        {/* Audio Files List */}
        {audioFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-gray-300 font-medium mb-3">Uploaded Files ({audioFiles.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {audioFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileAudio className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 font-medium truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-gray-300 font-medium mb-3">Upload Guidelines</h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />
              Maximum file size: {maxSize}MB
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />
              Supported audio formats only
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />
              Files are processed securely
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
