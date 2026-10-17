'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '@/types/lastfm';
import TrackCard from './TrackCard';

export default function RecentTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/recent-tracks');
        if (!response.ok) throw new Error('Failed to fetch tracks');
        const data = await response.json();
        setTracks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
    const interval = setInterval(fetchTracks, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600 text-sm">Loading your music library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-base font-semibold text-red-600 mb-2">Error Loading Tracks</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Unable to load music tracks.
        </p>
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 max-w-md mx-auto">
          <p className="text-xs text-gray-500 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <span className="text-2xl">🎵</span>
        </div>
        <p className="text-gray-600 text-sm">No recent tracks found</p>
        <p className="text-gray-400 text-xs mt-1">Start playing some music!</p>
      </div>
    );
  }

  return (
    <div className="max-h-[280px] overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin space-y-0.5 border border-gray-200 bg-white">
      <AnimatePresence mode="popLayout">
        {tracks.map((track, index) => (
          <TrackCard key={`${track.name}-${track.timestamp || index}`} track={track} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}
