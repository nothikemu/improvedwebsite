'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { site } from '@/data/site';
import { LanyardData } from '@/types/lanyard';
import { getDiscordAvatarUrl, getAvatarDecorationUrl, getDiscordBannerUrl, getStatusColor, getStatusLabel } from '@/lib/lanyard';
import SocialIcon from './SocialIcon';

const iconButtonStyle = {
  width: 24,
  height: 24,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 'unset',
} as const;

export default function ProfileCard() {
  const [lanyard, setLanyard] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const fetchLanyard = async () => {
      try {
        const response = await fetch('/api/lanyard');
        if (!response.ok) throw new Error('Failed to fetch Lanyard data');
        const data = await response.json();
        setLanyard(data.data);
      } catch (err) {
        console.error('Lanyard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLanyard();
    const interval = setInterval(fetchLanyard, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await fetch('/api/visitors');
        const data = await response.json();
        setVisitors(data.count);
      } catch (err) {
        console.error('Visitor count error:', err);
      }
    };

    fetchVisitors();
  }, []);

  const avatarUrl = lanyard?.discord_user.avatar
    ? getDiscordAvatarUrl(lanyard.discord_user.id, lanyard.discord_user.avatar, 256)
    : null;

  const decorationUrl = lanyard?.discord_user.avatar_decoration_data
    ? getAvatarDecorationUrl(lanyard.discord_user.avatar_decoration_data.asset)
    : null;

  const bannerUrl = lanyard?.discord_user.banner
    ? getDiscordBannerUrl(lanyard.discord_user.id, lanyard.discord_user.banner, 600)
    : site.images.bannerFallback;

  const statusColor = lanyard ? getStatusColor(lanyard.discord_status) : '#80848e';
  const statusLabel = lanyard ? getStatusLabel(lanyard.discord_status) : 'Loading...';

  // Live Discord names win; the configured ones fill in only if Discord data never arrives.
  const displayName = lanyard?.discord_user.global_name || lanyard?.discord_user.username || (loading ? '' : site.name);
  const username = lanyard?.discord_user.username || (loading ? '' : site.handle);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="window active glass"
    >
      <div className="title-bar">
        <span className="title-bar-text">User Profile</span>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>

      <div className="window-body !p-0">
        <div className="relative w-full h-24">
          <Image
            src={bannerUrl}
            alt="Profile Banner"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="p-4 relative" style={{ marginTop: '-2.5rem' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32 mb-4 -mt-6"
          >
            {loading ? (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-1">
                <div className="w-full h-full rounded-full bg-neutral-0 flex items-center justify-center text-6xl">
                </div>
              </div>
            ) : avatarUrl ? (
              <>
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <Image
                    src={avatarUrl}
                    alt="Discord Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {decorationUrl && (
                  <div className="absolute inset-1 pointer-events-none">
                    <Image
                      src={decorationUrl}
                      alt="Avatar Decoration"
                      fill
                      className="object-contain scale-125"
                      unoptimized
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-6xl">
                </div>
              </div>
            )}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white shadow-md"
              style={{ backgroundColor: statusColor }}
              title={statusLabel}
            ></motion.div>
          </motion.div>

          <div className="absolute top-12 right-4 z-10 flex flex-col gap-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="px-2 py-1 bg-white/80 border border-gray-300 rounded flex items-center gap-1.5 shadow-sm"
            >
              <span className="text-xs font-semibold text-gray-700">
                {visitors.toLocaleString()} visits
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="px-2 py-1 bg-white/80 border border-gray-300 rounded flex items-center gap-1.5 shadow-sm"
            >
              <span className="text-xs font-semibold text-gray-700">
                {currentTime}
              </span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {displayName}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            @{username}
          </p>

          <div className="flex gap-1 mt-4">
            {site.socials.map((social) =>
              social.href ? (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="button"
                  title={social.label}
                  aria-label={social.label}
                  style={iconButtonStyle}
                >
                  <SocialIcon icon={social.icon} />
                </a>
              ) : (
                <button
                  key={social.label}
                  type="button"
                  disabled
                  title={`${social.label}: placeholder, no link set yet`}
                  aria-label={`${social.label} (placeholder, no link set yet)`}
                  style={iconButtonStyle}
                >
                  <SocialIcon icon={social.icon} />
                </button>
              )
            )}
          </div>

          <div className="absolute bottom-0 right-0 pointer-events-none opacity-90" style={{ zIndex: 0 }}>
            <Image
              src={site.images.character.src}
              alt={site.images.character.alt}
              width={200}
              height={260}
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
