export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number; // in seconds
  size: number; // in bytes
  format: string;
  lastModified: Date;
  artist?: string;
  album?: string;
  genre?: string;
  coverUrl?: string;
}

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  audioFiles: AudioFile[];
  createdAt: Date;
  updatedAt: Date;
}

// Player state
export interface PlayerState {
  currentAudio: AudioFile | null;
  isPlaying: boolean;
  volume: number; // 0 to 1
  currentTime: number; // in seconds
  playbackRate: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  queue: AudioFile[];
  currentQueueIndex: number;
}

// UI state
export interface UIState {
  isPlaylistOpen: boolean;
  isSettingsOpen: boolean;
  isUploadModalOpen: boolean;
  theme: 'dark' | 'light' | 'auto';
  viewMode: 'grid' | 'list';
}

// Upload state
export interface UploadState {
  files: File[];
  isUploading: boolean;
  progress: number; // 0 to 100
  error?: string;
}

// App configuration
export interface AppConfig {
  maxFileSize: number; // in bytes
  allowedFormats: string[];
  defaultVolume: number;
  defaultPlaybackRate: number;
  autoPlayNext: boolean;
  savePlaybackPosition: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Event types for audio player
export type PlayerEvent =
  | 'play'
  | 'pause'
  | 'ended'
  | 'timeupdate'
  | 'volumechange'
  | 'error'
  | 'loadedmetadata'
  | 'loadstart';

// Component props
export interface AudioPlayerProps {
  audioFile?: AudioFile;
  playlist?: Playlist;
  autoPlay?: boolean;
  showControls?: boolean;
  onPlay?: (audio: AudioFile) => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export interface PlaylistComponentProps {
  playlist: Playlist;
  onSelectAudio: (audio: AudioFile) => void;
  onRemoveAudio?: (audioId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
}

// Store types for Zustand
export interface AudioStore extends PlayerState {
  play: (audio: AudioFile) => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: PlayerState['repeatMode']) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (audioFiles: AudioFile[]) => void;
  clearQueue: () => void;
}

export interface UIStore extends UIState {
  togglePlaylist: () => void;
  toggleSettings: () => void;
  toggleUploadModal: () => void;
  setTheme: (theme: UIState['theme']) => void;
  setViewMode: (mode: UIState['viewMode']) => void;
}

// Theme colors for gradient dark theme
export interface ThemeColors {
  primaryGradientFrom: string;
  primaryGradientTo: string;
  secondaryGradientFrom: string;
  secondaryGradientTo: string;
  backgroundDark: string;
  backgroundLight: string;
  textPrimary: string;
  textSecondary: string;
}

export const darkThemeColors: ThemeColors = {
  primaryGradientFrom: '#1a1a2e',
  primaryGradientTo: '#16213e',
  secondaryGradientFrom: '#0f3460',
  secondaryGradientTo: '#1a1a2e',
  backgroundDark: '#0d1117',
  backgroundLight: '#161b22',
  textPrimary: '#f0f6fc',
  textSecondary: '#8b949e',
};

// Utility types
export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Form validation schemas base
export interface AudioUploadFormData {
    files: File[];
    playlistName?: string;
    tags?: string[];
    isPublic?: boolean;
}

// Keyboard shortcuts mapping
export interface KeyboardShortcuts {
    playPause: string[];
    nextTrack: string[];
    previousTrack: string[];
    volumeUp: string[];
    volumeDown: string[];
    toggleShuffle: string[];
    toggleRepeat: string[];
}

// Analytics events
export type AnalyticsEvent =
    | 'audio_play'
    | 'audio_pause'
    | 'audio_end'
    | 'playlist_create'
    | 'playlist_update'
    | 'file_upload'
    | 'settings_change'
    | 'error_occurred';

export interface AnalyticsPayload {
    eventName: AnalyticsEvent;
    timestamp: Date;
    userId?: string;
    metadata?: Record<string, unknown>;
}