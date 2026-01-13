'use client';

'use client';

import React, { 
  forwardRef, 
  useCallback, 
  useState, 
  useRef, 
  useEffect,
  useMemo 
} from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, X, Loader2 } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-gradient-to-br from-gray-900 to-black text-gray-100 shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-700 focus-within:border-blue-500 focus-within:ring-blue-500',
        destructive: 'border-red-500 focus-within:border-red-600 focus-within:ring-red-600',
        success: 'border-emerald-500 focus-within:border-emerald-600 focus-within:ring-emerald-600',
      },
      size: {
        sm: 'h-9 px-3 py-2 text-sm',
        md: 'h-11 px-4 py-3 text-base',
        lg: 'h-14 px-5 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  loading?: boolean;
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

const AudioInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      loading = false,
      disabled,
      onFilesSelected,
      accept = '.mp3,.wav,.flac,.aac,.m4a,.ogg',
      multiple = true,
      maxFiles = 10,
      maxFileSize = 50,
      type = 'file',
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const validateFile = useCallback((file: File): string | null => {
      if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
        return `File ${file.name} exceeds maximum size of ${maxFileSize}MB`;
      }
      
      const acceptedTypes = accept.split(',').map(ext => ext.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes(file.type)) {
        return `File ${file.name} is not an accepted audio format`;
      }
      
      return null;
    }, [accept, maxFileSize]);

    const handleFileSelection = useCallback((files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).slice(0, maxFiles).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        console.error('File validation errors:', errors);
      }

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
        const limitedFiles = newFiles.slice(0, maxFiles);
        
        setSelectedFiles(limitedFiles);
        
        const progressUpdates: Record<string, number> = {};
        limitedFiles.forEach(file => {
          progressUpdates[file.name] = 0;
        });
        setUploadProgress(progressUpdates);
        
        onFilesSelected?.(limitedFiles);
        
        simulateUploadProgress(limitedFiles);
      }
    }, [selectedFiles, multiple, maxFiles, validateFile, onFilesSelected]);

    const simulateUploadProgress = useCallback((files: File[]) => {
      files.forEach((file) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min(progress, 100)
          }));
        }, 100);
      });
    }, []);

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
      
      if (disabled || loading) return;
      
      const files = e.dataTransfer.files;
      handleFileSelection(files);
    }, [disabled, loading, handleFileSelection]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || loading) return;
      
      handleFileSelection(e.target.files);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, [disabled, loading, handleFileSelection]);

    const removeFile = useCallback((fileName: string) => {
      setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
      
      onFilesSelected?.(selectedFiles.filter(file => file.name !== fileName));
    }, [selectedFiles, onFilesSelected]);

    const formatFileSize = useCallback((bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const totalSize = useMemo(() => 
      selectedFiles.reduce((acc, file) => acc + file.size, 0), 
    [selectedFiles]);

    useEffect(() => {
      return () => {
        setSelectedFiles([]);
        setUploadProgress({});
      };
    }, []);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div
          ref={dropZoneRef}
          className={cn(
            inputVariants({ variant, size, className }),
            isDragging && 'ring-2 ring-blue-500 ring-opacity-50 border-blue-500',
            error && 'border-red-500 focus-within:border-red-600 focus-within:ring-red-600'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="File upload area"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30",
                  loading && "animate-pulse"
                )}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} audio file${selectedFiles.length !== 1 ? 's' : ''} selected`
                      : 'Drop audio files here or click to browse'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {accept.replace(/\./g, '').toUpperCase()} • Max {maxFileSize}MB per file
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || loading}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "text-white shadow-md hover:shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                )}
                aria-label="Browse files"
              >
                Browse
              </button>
              
              <input
                ref={(node) => {
                  if (typeof ref === 'function') {
                    ref(node);
                  } else if (ref) {
                    ref.current = node;
                  }
                  fileInputRef.current = node;
                }}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                disabled={disabled || loading}
                className="hidden"
                aria-invalid={!!error}
                {...props}
              />
            </div>

            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-800 mt-2 pt-3">
                    <div className="flex justify-between items-center mb-2 px-2">
                      <span className="text-xs text-gray-400">
                        Total size: {formatFileSize(totalSize)}
                      </span>
                      {selectedFiles.length >= maxFiles && (
                        <span className="text-xs text-yellow-500">
                          Maximum {maxFiles} files reached
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {selectedFiles.map((file) => (
                        <motion.div
                          key={file.name}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <FileAudio className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-200 truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-400">
                                  {formatFileSize(file.size)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <div className="w -24 h -1.5 bg-gray -800 rounded -full overflow -hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-blue -500 to-purple -500"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress[file.name] || 0}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray -400">
                                    {Math.round(uploadProgress[file.name] || 0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            disabled={loading}
                            className="p -1.5 rounded -full opacity -0 group -hover:opacity -100 transition -opacity hover:bg-gray -700/50 focus:opacity -100 focus:outline -none focus:ring -2 focus:ring -red -500"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h -4 w -4 text-gray -400 hover:text-red -400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {(error || helperText) && (
          <p className={cn(
            "text-sm",
            error ? "text-red1 -500" : "text-gray -400"
          )}>
            {error || helperText}
          </p>
        )}
        
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset -0 pointer -events-none z -50 flex items-center justify-center"
          >
            <div className="absolute inset -0 bg-blue -900/10 backdrop-blur-[1px]" />
            <div className="relative z -10 bg-gradient-to-br from-gray -900 to-black border -2 border-dashed border-blue -500 rounded -xl p -8 shadow -2xl">
              <div className="text-center space-y -3">
                <Upload className="h -12 w -12 text-blue -400 mx-auto animate-bounce" />
                <p className="text-xl font-semibold text-white">Drop audio files here</p>
                <p className="text-gray -300">Release to add to your playlist</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }
);

AudioInput.displayName = 'AudioInput';

export default React.memo(AudioInput);