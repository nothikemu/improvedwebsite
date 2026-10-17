'use client';

import { motion } from 'framer-motion';
import { site } from '@/data/site';

export default function AboutSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="window active glass"
    >
      <div className="title-bar">
        <span className="title-bar-text">📋 About Me - Notepad</span>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <p className="text-sm text-gray-800 leading-relaxed mb-4">
          {site.about.text}
        </p>

        <fieldset className="border border-gray-300 p-3 mt-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">What I&apos;m Into</legend>
          <p className="text-sm text-gray-700 leading-relaxed">
            {site.about.interests}
          </p>
        </fieldset>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Line 1, Col 1</p>
      </div>
    </motion.section>
  );
}
