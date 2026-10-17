'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Track } from '@/types/lastfm';
import { formatTimeAgo } from '@/lib/time';

interface TrackCardProps {
  track: Track;
  index: number;
}

export default function TrackCard({ track, index }: TrackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="group relative overflow-hidden"
    >
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 flex items-center gap-4 bg-white hover:bg-blue-50 p-3 border border-gray-200 hover:border-blue-300 transition-all duration-200 no-underline"
      >
        {/* Album Art */}
        <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden border border-gray-300 shadow-sm">
          {track.image ? (
            <Image
              src={track.image}
              alt={`${track.name} album art`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-xl">🎵</span>
            </div>
          )}

          {track.isNowPlaying && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-0.5"
              >
                <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </motion.div>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">
            {track.name}
          </h3>
          <p className="text-xs text-gray-600 truncate mt-0.5">{track.artist}</p>
          {track.album && (
            <p className="text-xs text-gray-400 truncate">{track.album}</p>
          )}
        </div>

        {/* Time Ago / Now Playing */}
        <div className="text-right flex-shrink-0">
          {track.isNowPlaying ? (
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium border border-green-300">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Playing
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">
              {formatTimeAgo(track.timestamp)}
            </span>
          )}
        </div>

        {/* External Link Icon */}
        <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </a>
    </motion.div>
  );
}
