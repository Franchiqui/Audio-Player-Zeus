export const PLAYER_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ERROR: 'error'
} as const;

export type PlayerState = typeof PLAYER_STATES[keyof typeof PLAYER_STATES];

// Audio file types
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/mp4'
] as const;

export type AudioFormat = typeof SUPPORTED_AUDIO_FORMATS[number];

// File upload constraints
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_UPLOAD = 20;

// Player defaults
export const DEFAULT_VOLUME = 0.8;
export const DEFAULT_PLAYBACK_RATE = 1.0;
export const DEFAULT_SEEK_STEP = 5; // seconds
export const DEFAULT_FADE_DURATION = 300; // ms

// UI constants
export const UI = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },
  TRANSITIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  Z_INDEX: {
    BASE: 0,
    DROPDOWN: 10,
    STICKY: 20,
    MODAL: 30,
    POPOVER: 40,
    TOOLTIP: 50
  }
} as const;

// Color themes - Dark gradient themes
export const THEMES = {
  DARK_GRADIENT_1: {
    primary: 'from-purple-900 via-indigo-900 to-blue-900',
    secondary: 'from-gray-800 via-gray-900 to-black',
    accent: 'from-cyan-500 to-blue-500',
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      muted: 'text-gray-400'
    },
    background: {
      primary: 'bg-gradient-to-br from-gray-900 via-black to-gray-900',
      secondary: 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800',
      overlay: 'bg-black/70'
    }
  },
  DARK_GRADIENT_2: {
    primary: 'from-gray-900 via-blue-900 to-purple-900',
    secondary: 'from-gray-800 via-gray-900 to-black',
    accent: 'from-emerald-500 to-teal-500',
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      muted: 'text-gray-400'
    },
    background: {
      primary: 'bg-gradient-to-br from-gray-900 via-black to-gray-900',
      secondary: 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800',
      overlay: 'bg-black/70'
    }
  }
} as const;

export type ThemeKey = keyof typeof THEMES;

// Storage keys
export const STORAGE_KEYS = {
  VOLUME: 'zeus-player-volume',
  THEME: 'zeus-player-theme',
  PLAYLIST: 'zeus-player-playlist',
  PLAYBACK_RATE: 'zeus-player-playback-rate',
  AUDIO_FILES: 'zeus-audio-files'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
  UNSUPPORTED_FORMAT: 'Unsupported audio format',
  TOO_MANY_FILES: `Maximum ${MAX_FILES_PER_UPLOAD} files per upload`,
  UPLOAD_FAILED: 'Failed to upload file',
  PLAYBACK_FAILED: 'Failed to play audio',
  NETWORK_ERROR: 'Network error occurred'
} as const;

// Player controls
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: [' ', 'k'],
  NEXT_TRACK: ['l', 'ArrowRight'],
  PREV_TRACK: ['j', 'ArrowLeft'],
  VOLUME_UP: ['ArrowUp'],
  VOLUME_DOWN: ['ArrowDown'],
  SEEK_FORWARD: ['l', 'ArrowRight'],
  SEEK_BACKWARD: ['j', 'ArrowLeft'],
  MUTE_TOGGLE: ['m']
} as const;

// API routes (if using Next.js API routes)
export const API_ROUTES = {
  UPLOAD_AUDIO: '/api/audio/upload',
  GET_AUDIO_LIST: '/api/audio/list',
  DELETE_AUDIO: '/api/audio/delete'
} as const;

// Local storage structure
export interface StoredAudioFile {
  id: string;
  name: string;
  size: number;
  type: AudioFormat;
  lastModified: number;
  url?: string; // For local files, this could be a data URL or blob URL
}

// Player context types
export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  file?: File | StoredAudioFile;
}

// Validation schemas (for use with zod if needed)
export const AUDIO_FILE_SCHEMA = {
  name: /^[\w\s\-\.()]+$/i,
  maxSize: MAX_FILE_SIZE,
  allowedTypes: SUPPORTED_AUDIO_FORMATS
} as const;

// Performance optimization
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 100;
export const LAZY_LOAD_THRESHOLD = 10; // Number of tracks before lazy loading

// Accessibility
export const ARIA_LABELS = {
  PLAY_BUTTON: 'Play audio',
  PAUSE_BUTTON: 'Pause audio',
  NEXT_BUTTON: 'Next track',
  PREV_BUTTON: 'Previous track',
  VOLUME_SLIDER: 'Volume control',
  PROGRESS_BAR: 'Audio progress',
  PLAYLIST_ITEM: 'Playlist item'
} as const;

// Default playlist name
export const DEFAULT_PLAYLIST_NAME = 'My Audio Collection';

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_AUDIO_FILES: 'No audio files found. Upload some files to get started!',
  EMPTY_PLAYLIST: 'Playlist is empty. Add some tracks to start listening.',
  SEARCH_NO_RESULTS: 'No tracks match your search.'
} as const;