'use client';

import { useEffect, useRef, useState } from 'react';
import { createMoonScene, FlightProgress, FlightSave } from './MoonScene';
import { useGlobalScore } from './useGlobalScore';

export default function HeroSection() {
  const host = useRef<HTMLDivElement>(null);
  const profile = useRef<HTMLDivElement>(null);
  const links = useRef<HTMLDivElement>(null);
  const controls = useRef<ReturnType<typeof createMoonScene> | null>(null);
  const [flight, setFlight] = useState(false);
  const [save, setSave] = useState<FlightSave>({ total: 0, lives: 3, best: 0 });
  const globalScore = useGlobalScore(save.best);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    try {
      controls.current = createMoonScene(host.current, (state: FlightProgress) => {
        for (const el of [profile.current, links.current]) {
          if (!el) continue;
          el.style.opacity = String(1 - Math.min(1, state.travel * 2));
          el.style.transform = `translateX(${-state.travel * 240}px)`;
          el.style.visibility = state.travel > .55 ? 'hidden' : 'visible';
        }
        setFlight(state.flying);
        setSave(previous => previous.total === state.save.total && previous.lives === state.save.lives && previous.best === state.save.best ? previous : state.save);
      });
    } catch { setError(true); }
    return () => controls.current?.dispose();
  }, []);

  return <main className="moon-page">
    <div ref={host} className="universe" aria-label="Interactive moon. Use arrow keys to walk; your avatar stays centered as the moon rotates. Approach the ship and press Enter to board. Rescue floating people and avoid green aliens. Only alien collisions cost a life; missed people drift past safely. In flight, reach the left edge and hold Left alone for one second to return; release to cancel. Zero lives returns you to the moon. All game controls use the keyboard." tabIndex={0}/>
    <div ref={profile} className="profile"><h1>Jin Hong Moon</h1><p>Software &amp; Machine Learning Engineer</p></div>
    <div ref={links} className="profile-links"><a href="/Jin_Hong_Moon-Resume.pdf" target="_blank" rel="noopener noreferrer">Resume <span>↗</span></a><span className="link-dot">·</span><a href="https://www.linkedin.com/in/jayden-moonjh/" target="_blank" rel="noopener noreferrer">LinkedIn <span>↗</span></a></div>
    {flight && <div className="flight-tools"><div className="score-stat lives-stat" aria-label={`${save.lives} of 3 lives remaining`}><small>Lives</small><strong>{Array.from({length:3}, (_, i) => <span key={i} className={i < save.lives ? 'life-full' : 'life-empty'}>👽</span>)}</strong></div><span className="score-divider"/><div className="score-stat"><small>Saved</small><strong>{save.total.toLocaleString()}</strong></div><span className="score-divider"/><div className="score-stat" title={globalScore.configured ? (globalScore.connected ? 'Most people saved in one flight across all visitors' : 'Trying to reconnect') : 'World record is unavailable'}><small>World best</small><strong>{globalScore.highScore === null ? '—' : globalScore.highScore.toLocaleString()}</strong>{!globalScore.connected && <span className="score-status">{globalScore.configured ? 'Connecting…' : 'Offline'}</span>}</div></div>}
    {flight && save.lives === 0 && <p className="game-over" role="status">Heading home <span>Try again from the moon</span></p>}
    {error && <p className="scene-error">The 3D scene needs WebGL enabled in your browser.</p>}
  </main>;
}
