'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Footer from '@/components/layout/footer';
import { useAudioStore } from '@/store/audio-store';

const AudioPlayer = dynamic(() => import('@/components/audio/AudioPlayer'), {
  ssr: false,
  loading: () => <AudioPlayerSkeleton />
});

const FileUpload = dynamic(() => import('@/components/audio/FileUpload'), {
  ssr: false
});

const Playlist = dynamic(() => import('@/components/audio/Playlist'), {
  ssr: false
});

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  type: string;
}

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  type: string;
}

function AudioPlayerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-6" />
      <div className="h-12 bg-gray-800 rounded-lg mb-4" />
      <div className="flex space-x-4">
        <div className="h-10 bg-gray-800 rounded-lg flex-1" />
        <div className="h-10 bg-gray-800 rounded-lg w-24" />
      </div>
    </div>
  );
}

function StorageInfo() {
  const { audioFiles } = useAudioStore();
  
  const totalSize = audioFiles.reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Total Files</span>
        <span className="font-medium">{audioFiles.length}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Storage Used</span>
        <span className="font-medium">{totalSizeMB} MB</span>
      </div>
    </div>
  );
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <Suspense fallback={<AudioPlayerSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-24">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Audio Player Zeus
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Modern audio player with gradient dark theme. Upload and manage your audio files.
          </p>
        </header>

        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-gray-100">Audio Player</h2>
                <AudioPlayer />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-full">
                <h2 className="text-2xl font-semibold mb-6 text-gray-100">Audio Files</h2>
                <FileUpload />
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-200">Storage Information</h3>
                  <StorageInfo />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">Playlist</h2>
            <Playlist />
          </div>
        </ErrorBoundary>

        <Footer />
      </div>
    </main>
  );
}