import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  type: string;
}

interface AudioPlayerState {
  // Current playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  
  // Audio files management
  audioFiles: AudioFile[];
  currentFileIndex: number | null;
  currentFile: AudioFile | null;
  
  // Playlist state
  isShuffle: boolean;
  isRepeat: boolean;
  
  // UI state
  isSeeking: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  
  // Audio files actions
  setAudioFiles: (files: AudioFile[]) => void;
  addAudioFile: (file: AudioFile) => void;
  removeAudioFile: (id: string) => void;
  setCurrentFileIndex: (index: number | null) => void;
  setCurrentFile: (file: AudioFile | null) => void;
  
  // Playlist actions
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Navigation actions
  playNext: () => void;
  playPrevious: () => void;
  
  // UI actions
  setIsSeeking: (seeking: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility actions
  resetPlayer: () => void;
  clearPlaylist: () => void;
}

export const useAudioStore = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      playbackRate: 1.0,
      
      audioFiles: [],
      currentFileIndex: null,
      currentFile: null,
      
      isShuffle: false,
      isRepeat: false,
      
      isSeeking: false,
      isLoading: false,
      error: null,
      
      // Playback actions
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      
      // Audio files actions
      setAudioFiles: (files) => set({ audioFiles: files }),
      addAudioFile: (file) =>
        set((state) => {
          console.log('Store addAudioFile called with:', file);
          console.log('Current state.audioFiles before:', state.audioFiles);
          const newState = {
            audioFiles: [...state.audioFiles, file],
          };
          console.log('New state.audioFiles after:', newState.audioFiles);
          return newState;
        }),
      removeAudioFile: (id) =>
        set((state) => {
          const newFiles = state.audioFiles.filter((file) => file.id !== id);
          const currentIndex = state.currentFileIndex;
          let newCurrentIndex = currentIndex;
          let newCurrentFile = state.currentFile;
          
          // If we're removing the current file
          if (state.currentFile?.id === id) {
            newCurrentIndex = null;
            newCurrentFile = null;
          } else if (currentIndex !== null && currentIndex >= newFiles.length) {
            // Adjust index if it's now out of bounds
            newCurrentIndex = newFiles.length > 0 ? newFiles.length - 1 : null;
            newCurrentFile = newFiles.length > 0 ? newFiles[newCurrentIndex!] : null;
          }
          
          return {
            audioFiles: newFiles,
            currentFileIndex: newCurrentIndex,
            currentFile: newCurrentFile,
          };
        }),
      setCurrentFileIndex: (index) =>
        set((state) => ({
          currentFileIndex: index,
          currentFile: index !== null && state.audioFiles[index] ? state.audioFiles[index] : null,
        })),
      setCurrentFile: (file) =>
        set((state) => {
          const index = file ? state.audioFiles.findIndex((f) => f.id === file.id) : null;
          return {
            currentFile: file,
            currentFileIndex: index !== -1 ? index : null,
          };
        }),
      
      // Playlist actions
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
      
      // Navigation actions
      playNext: () =>
        set((state) => {
          if (state.audioFiles.length === 0 || state.currentFileIndex === null) {
            return {};
          }
          
          let nextIndex;
          
          if (state.isShuffle) {
            // Get random index different from current
            do {
              nextIndex = Math.floor(Math.random() * state.audioFiles.length);
            } while (nextIndex === state.currentFileIndex && state.audioFiles.length > 1);
          } else {
            nextIndex = (state.currentFileIndex + 1) % state.audioFiles.length;
          }
          
          return {
            currentFileIndex: nextIndex,
            currentFile: state.audioFiles[nextIndex],
            currentTime: 0,
          };
        }),
      
      playPrevious: () =>
        set((state) => {
          if (state.audioFiles.length === 0 || state.currentFileIndex === null) {
            return {};
          }
          
          let prevIndex;
          
          if (state.isShuffle) {
            // Get random index different from current
            do {
              prevIndex = Math.floor(Math.random() * state.audioFiles.length);
            } while (prevIndex === state.currentFileIndex && state.audioFiles.length > 1);
          } else {
            prevIndex = state.currentFileIndex - 1;
            if (prevIndex < 0) {
              prevIndex = state.audioFiles.length - 1;
            }
          }
          
          return {
            currentFileIndex: prevIndex,
            currentFile: state.audioFiles[prevIndex],
            currentTime: 0,
          };
        }),
      
      // UI actions
      setIsSeeking: (seeking) => set({ isSeeking: seeking }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Utility actions
      resetPlayer: () =>
        set({
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          currentFileIndex: null,
          currentFile: null,
          isSeeking: false,
          isLoading: false,
          error: null,
        }),
      
      clearPlaylist: () =>
        set({
          audioFiles: [],
          currentFileIndex: null,
          currentFile: null,
          isPlaying: false,
          currentTime: 0,
        }),
    }),
    {
      name: 'audio-player-storage',
      partialize: (state) => ({
        audioFiles: state.audioFiles,
        currentFileIndex: state.currentFileIndex,
        volume: state.volume,
        isMuted: state.isMuted,
        playbackRate: state.playbackRate,
        isShuffle: state.isShuffle,
        isRepeat: state.isRepeat,
      }),
    }
  )
);
