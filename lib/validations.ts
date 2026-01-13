import { z } from 'zod';

// Tipos para archivos de audio
export type AudioFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  format: string;
  lastModified: Date;
  artist?: string;
  album?: string;
  title?: string;
};

// Esquemas de validación
export const audioFileSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(1, 'El nombre del archivo es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Nombre de archivo inválido'),
  url: z.string()
    .url('URL inválida')
    .refine((url) => url.startsWith('/') || url.startsWith('blob:') || /^https?:\/\//.test(url), {
      message: 'URL debe ser relativa, blob o HTTP/HTTPS'
    }),
  size: z.number()
    .int('El tamaño debe ser un número entero')
    .positive('El tamaño debe ser positivo')
    .max(500 * 1024 * 1024, 'El archivo no puede exceder 500MB'),
  duration: z.number()
    .positive('La duración debe ser positiva')
    .max(24 * 60 * 60, 'La duración no puede exceder 24 horas'),
  format: z.string()
    .regex(/^audio\/(mp3|mpeg|wav|ogg|flac|aac|webm)$/, 'Formato de audio no soportado'),
  lastModified: z.date(),
  artist: z.string().max(100, 'El artista no puede exceder 100 caracteres').optional(),
  album: z.string().max(100, 'El álbum no puede exceder 100 caracteres').optional(),
  title: z.string().max(100, 'El título no puede exceder 100 caracteres').optional(),
});

export const audioFileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 500 * 1024 * 1024, {
      message: 'El archivo no puede exceder 500MB'
    })
    .refine((file) => {
      const allowedTypes = [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/flac',
        'audio/aac',
        'audio/webm'
      ];
      return allowedTypes.includes(file.type);
    }, {
      message: 'Formato de audio no soportado. Use MP3, WAV, OGG, FLAC, AAC o WebM'
    }),
});

export const playlistSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(1, 'El nombre de la lista es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  audioFiles: z.array(z.string().uuid()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const audioSettingsSchema = z.object({
  volume: z.number()
    .min(0, 'El volumen mínimo es 0')
    .max(1, 'El volumen máximo es 1')
    .default(0.7),
  playbackRate: z.number()
    .min(0.5, 'La velocidad mínima es 0.5x')
    .max(2, 'La velocidad máxima es 2x')
    .default(1),
  loop: z.boolean().default(false),
  shuffle: z.boolean().default(false),
  crossfade: z.number()
    .min(0, 'El crossfade mínimo es 0 segundos')
    .max(10, 'El crossfade máximo es 10 segundos')
    .default(0),
});

// Validadores
export const validateAudioFile = (data: unknown): AudioFile => {
  return audioFileSchema.parse(data);
};

export const validateAudioFileUpload = (file: File) => {
  return audioFileUploadSchema.parse({ file });
};

export const validatePlaylist = (data: unknown) => {
  return playlistSchema.parse(data);
};

export const validateAudioSettings = (data: unknown) => {
  return audioSettingsSchema.parse(data);
};

// Sanitizadores
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
};

export const sanitizeAudioMetadata = (metadata: Partial<AudioFile>): Partial<AudioFile> => {
  const sanitized: Partial<AudioFile> = {};
  
  if (metadata.name) {
    sanitized.name = sanitizeFileName(metadata.name);
  }
  
  if (metadata.artist) {
    sanitized.artist = metadata.artist.slice(0, 100).trim();
  }
  
  if (metadata.album) {
    sanitized.album = metadata.album.slice(0, 100).trim();
  }
  
  if (metadata.title) {
    sanitized.title = metadata.title.slice(0, 100).trim();
  }
  
  return sanitized;
};

// Helpers para validación de archivos
export const isValidAudioFile = (file: File): boolean => {
  try {
    validateAudioFileUpload(file);
    return true;
  } catch {
    return false;
  }
};

export const getAudioFileInfo = async (file: File): Promise<Partial<AudioFile>> => {
  validateAudioFileUpload(file);
  
  return {
    name: sanitizeFileName(file.name),
    size: file.size,
    format: file.type,
    lastModified: new Date(file.lastModified),
  };
};

// Tipos de errores
export type ValidationError = {
  field?: string;
  message: string;
};

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
};

// Validador con resultado detallado
export const safeValidateAudioFile = (data: unknown): ValidationResult<AudioFile> => {
  try {
    const validated = validateAudioFile(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    
    return {
      success: false,
      errors: [{ message: 'Error de validación desconocido' }],
    };
  }
};

// Constantes de validación
export const AUDIO_FILE_MAX_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/webm',
] as const;

export type SupportedAudioFormat = typeof SUPPORTED_AUDIO_FORMATS[number];

export const isSupportedFormat = (format: string): format is SupportedAudioFormat => {
  return SUPPORTED_AUDIO_FORMATS.includes(format as SupportedAudioFormat);
};