import RecentTracks from "@/components/RecentTracks";
import ProfileCard from "@/components/ProfileCard";
import AboutSection from "@/components/AboutSection";
import AnonymousWall from "@/components/AnonymousWall";
import { site } from "@/data/site";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="relative w-full max-w-6xl mx-auto z-10">
        <main id="home" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Profile & Guestbook */}
          <div className="lg:col-span-1 space-y-4">
            <ProfileCard />

            {/* Anonymous Wall Section */}
            <div id="guestbook">
              <AnonymousWall />
            </div>
          </div>

          {/* Right Column - Music & About */}
          <div className="lg:col-span-2 space-y-4">
            {/* Music Section */}
            <section id="music" className="window active glass">
              <div className="title-bar">
                <span className="title-bar-text">🎵 Windows Media Player - Recently Played</span>
                <div className="title-bar-controls">
                  <button aria-label="Minimize"></button>
                  <button aria-label="Maximize"></button>
                  <button aria-label="Close"></button>
                </div>
              </div>
              <div className="window-body">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live from Last.fm
                  </div>
                </div>
                <RecentTracks />
              </div>
              <div className="status-bar">
                <p className="status-bar-field">Now Playing</p>
                <p className="status-bar-field">{site.musicLibraryLabel}</p>
              </div>
            </section>

            {/* About Section */}
            <div id="about">
              <AboutSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
