import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ListMusic, Radio, SkipForward, SkipBack } from 'lucide-react';

interface Station {
  id: number;
  name: string;
  url: string;
  category: string;
  image?: string;
}

const stations: Station[] = [
  { id: 1, name: 'Quran Radio (Cairo)', url: 'https://n02.radiojar.com/8s5u5tpdtwzuv?rj-ttl=5&rj-tok=AAABl_8l_8QAQAQAQAQAQA', category: 'Religious', image: 'https://img.freepik.com/free-vector/gradient-islamic-new-year-background_23-2149439607.jpg' },
  { id: 2, name: 'Lofi Girl - Relax & Study', url: 'https://play.streamafrica.net/lofiradio', category: 'Focus', image: 'https://i.pinimg.com/736x/8f/c1/9d/8fc19d4586227fb60f991902462e7655.jpg' },
  { id: 3, name: 'Classical FM', url: 'https://media-ice.musicradio.com/ClassicFMMP3', category: 'Classical', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
  { id: 4, name: 'Jazz24', url: 'https://live.wostreaming.net/direct/ppm-jazz24aac-ibc-mp3-32', category: 'Jazz', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
  { id: 5, name: 'BBC World Service', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service', category: 'News', image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
];

export default function MusicPage() {
  const [currentStation, setCurrentStation] = useState<Station>(stations[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(20).fill(10));

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.floor(Math.random() * 50) + 10));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisualizerBars(new Array(20).fill(5));
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeStation = (station: Station) => {
    setCurrentStation(station);
    setIsPlaying(true);
    // Automatic play handling is done via the autoPlay attribute on the audio tag,
    // but we need to ensure state is synced.
    // React's key prop on the audio element forces a reload when station changes.
  };

  return (
    <div style={{
      height: 'calc(100vh - 140px)', // Adjust based on header/padding
      display: 'flex',
      gap: 24,
      color: 'var(--text-primary)',
      overflow: 'hidden',
      flexDirection: 'row',
    }}>
      {/* Sidebar - Station List */}
      <div style={{
        width: 320,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ padding: 24, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h2 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={20} color="var(--accent-primary)" /> Stations
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stations.map((station) => (
            <div
              key={station.id}
              onClick={() => changeStation(station)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 12,
                cursor: 'pointer',
                background: currentStation.id === station.id ? 'rgba(28, 191, 255, 0.1)' : 'transparent',
                border: currentStation.id === station.id ? '1px solid rgba(28, 191, 255, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
                background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {station.image ? (
                  <img src={station.image} alt={station.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ListMusic size={20} color="var(--text-secondary)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: currentStation.id === station.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{station.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{station.category}</div>
              </div>
              {currentStation.id === station.id && isPlaying && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'end', height: 12 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      width: 2,
                      background: 'var(--accent-primary)',
                      height: '100%',
                      animation: `bounce 0.8s infinite ${i * 0.2}s`
                    }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Player Area */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, rgba(28, 191, 255, 0.05) 0%, rgba(5, 6, 31, 0.6) 100%)',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}>
        {/* Background Blur Image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${currentStation.image || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px) brightness(0.4)',
          opacity: 0.5,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
          
          {/* Album Art / Visual */}
          <div style={{
            width: 280, height: 280, borderRadius: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
          }}>
             {currentStation.image ? (
                  <img src={currentStation.image} alt={currentStation.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Radio size={80} color="var(--text-secondary)" />
                  </div>
                )}
          </div>

          {/* Info */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>{currentStation.name}</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>{currentStation.category}</p>
          </div>

          {/* Audio Visualizer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
            {visualizerBars.map((height, i) => (
              <div key={i} style={{
                width: 4,
                height: `${height}px`,
                background: 'var(--accent-primary)',
                borderRadius: 2,
                opacity: 0.6,
                transition: 'height 0.1s ease'
              }} />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
             <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <SkipBack size={24} />
             </button>
             <button
              onClick={togglePlay}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(28, 191, 255, 0.3)',
                transition: 'transform 0.1s active',
              }}
             >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />}
             </button>
             <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <SkipForward size={24} />
             </button>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 200 }}>
             <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>
             <input
              type="range"
              min="0" max="1" step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
              style={{
                flex: 1,
                accentColor: 'var(--accent-primary)',
                height: 4,
                cursor: 'pointer',
              }}
             />
          </div>

          <audio
            ref={audioRef}
            src={currentStation.url}
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
                console.error("Audio Error");
                setIsPlaying(false);
                // Optionally show toast here in real app
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 100% { height: 2px; }
          50% { height: 12px; }
        }
        @media (max-width: 900px) {
            div[style*="flex-direction: row"] {
                flex-direction: column !important;
                height: auto !important;
            }
            div[style*="width: 320px"] {
                width: 100% !important;
                height: 300px !important;
            }
        }
      `}</style>
    </div>
  );
}
