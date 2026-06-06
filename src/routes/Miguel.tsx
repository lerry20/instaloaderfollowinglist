import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 1, suffix: 'st', label: 'In the World' },
  { value: 99, suffix: '%', label: 'Pure Greatness' },
  { value: 7, suffix: 'x', label: 'Legend Status' },
  { value: 100, suffix: 'M+', label: 'Lives Touched' },
]

const ACHIEVEMENTS = [
  { icon: '👑', title: 'Icon of the Decade', body: 'Voted by peers, critics, and fans across 140+ countries.' },
  { icon: '🏆', title: 'Global Excellence Award', body: 'Three consecutive years of unmatched performance.' },
  { icon: '⚡', title: 'Force of Nature', body: 'A presence that changes every room he walks into.' },
  { icon: '💎', title: 'Diamond Standard', body: 'Sets benchmarks the world struggles to match.' },
  { icon: '🌍', title: 'World Ambassador', body: 'Representing culture, style and ambition globally.' },
  { icon: '🔥', title: 'Unstoppable', body: 'Obstacles don\'t slow him down. They fuel him.' },
]

const PRESS = [
  { quote: '"A phenomenon. Once-in-a-generation talent."', outlet: 'The Global Times' },
  { quote: '"Miguel redefines what it means to be at the top."', outlet: 'Prestige Magazine' },
  { quote: '"The world has never seen anything quite like him."', outlet: 'Fortune Elite' },
  { quote: '"Effortless excellence. It\'s simply who he is."', outlet: 'Culture Vogue' },
]

const TICKER = ['ICON', 'LEGEND', 'VISIONARY', 'UNSTOPPABLE', 'ELITE', 'GOAT', 'ICONIC', 'WORLD CLASS', 'PORTO CAMPEÃO', '🇵🇹 PORTUGAL', 'FORÇA PORTO']

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');

  :root {
    --gold: #c9a84c;
    --gold-light: #f0d080;
    --gold-dark: #8a6520;
    --black: #040404;
    --near-black: #0a0a0a;
    --surface: #111111;
    --border: rgba(201,168,76,0.18);
    --text: #e8e0d0;
    --text-muted: rgba(232,224,208,0.55);
  }

  html { scroll-behavior: smooth; }

  .mc { background: var(--black); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; min-height: 100vh; }

  /* NAV */
  .mc-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.2rem 2rem;
    transition: background .4s, backdrop-filter .4s;
  }
  .mc-nav.scrolled { background: rgba(4,4,4,.85); backdrop-filter: blur(18px); border-bottom: 1px solid var(--border); }
  .mc-nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: .15em; color: var(--gold); }
  .mc-nav-links { display: flex; gap: 2rem; }
  .mc-nav-links a { font-size: .75rem; letter-spacing: .2em; text-transform: uppercase; color: var(--text-muted); text-decoration: none; transition: color .2s; }
  .mc-nav-links a:hover { color: var(--gold); }

  /* HERO */
  .mc-hero {
    position: relative; height: 100vh; min-height: 600px;
    display: flex; align-items: flex-end;
    overflow: hidden;
  }
  .mc-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 80% at 65% 60%, rgba(201,168,76,.09) 0%, transparent 65%),
                radial-gradient(ellipse 50% 60% at 30% 80%, rgba(201,168,76,.05) 0%, transparent 60%),
                var(--black);
  }
  .mc-hero-grid {
    position: absolute; inset: 0; opacity: .025;
    background-image: linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .mc-hero-photo-wrap {
    position: absolute; right: 0; bottom: 0; height: 105%; width: 55%;
    display: flex; align-items: flex-end; justify-content: center;
  }
  .mc-hero-photo {
    height: 100%; width: 100%; object-fit: cover; object-position: top center;
    mask-image: linear-gradient(to left, black 40%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%);
    mask-composite: intersect;
    -webkit-mask-image: linear-gradient(to left, black 40%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%);
    -webkit-mask-composite: source-in;
  }
  .mc-hero-glow {
    position: absolute; right: 5%; bottom: 0; width: 45%; height: 80%;
    background: radial-gradient(ellipse at 60% 80%, rgba(201,168,76,.18) 0%, transparent 65%);
    pointer-events: none;
  }
  .mc-hero-content {
    position: relative; z-index: 2; padding: 0 2.5rem 6rem;
    max-width: 55%;
  }
  .mc-hero-badge {
    display: inline-flex; align-items: center; gap: .5rem;
    border: 1px solid var(--border); border-radius: 2rem;
    padding: .35rem 1rem; margin-bottom: 1.5rem;
    font-size: .65rem; letter-spacing: .25em; text-transform: uppercase; color: var(--gold);
    background: rgba(201,168,76,.06);
    animation: mc-fade-up .8s ease both;
  }
  .mc-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: mc-pulse 2s infinite; }
  @keyframes mc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  .mc-hero-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3.5rem, 10vw, 7rem);
    line-height: 1; letter-spacing: .04em;
    color: #fff;
    animation: mc-fade-up .8s ease .15s both;
  }
  .mc-hero-name span { color: var(--gold); }
  .mc-hero-tagline {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: clamp(1rem, 2.5vw, 1.35rem);
    color: var(--text-muted); margin-top: .8rem; line-height: 1.5;
    animation: mc-fade-up .8s ease .3s both;
  }
  .mc-hero-line {
    width: 4rem; height: 2px; background: var(--gold); margin: 1.5rem 0;
    animation: mc-fade-up .8s ease .45s both;
  }
  .mc-hero-sub {
    font-size: .8rem; letter-spacing: .15em; text-transform: uppercase;
    color: var(--text-muted);
    animation: mc-fade-up .8s ease .6s both;
  }
  .mc-scroll-hint {
    position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: .5rem;
    color: var(--text-muted); font-size: .65rem; letter-spacing: .2em; text-transform: uppercase;
    animation: mc-fade-up 1s ease 1s both;
  }
  .mc-scroll-arrow { width: 1px; height: 2.5rem; background: linear-gradient(to bottom, var(--gold), transparent); animation: mc-scroll-anim 2s ease-in-out infinite; }
  @keyframes mc-scroll-anim { 0%,100%{opacity:1;transform:scaleY(1) translateY(0)} 50%{opacity:.4;transform:scaleY(.6) translateY(4px)} }

  @keyframes mc-fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  /* TICKER */
  .mc-ticker-outer { background: var(--gold); overflow: hidden; padding: .7rem 0; }
  .mc-ticker-inner { display: flex; animation: mc-tick 22s linear infinite; width: max-content; }
  .mc-ticker-item { font-family: 'Bebas Neue', sans-serif; font-size: .95rem; letter-spacing: .35em; color: #050505; padding: 0 2.5rem; white-space: nowrap; }
  .mc-ticker-sep { color: rgba(5,5,5,.35); }
  @keyframes mc-tick { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* SECTIONS */
  .mc-section { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
  .mc-label { font-size: .65rem; letter-spacing: .3em; text-transform: uppercase; color: var(--gold); margin-bottom: .75rem; }
  .mc-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.2rem); color: #fff; line-height: 1.2; }
  .mc-divider { width: 3rem; height: 2px; background: var(--gold); margin: 1.5rem 0; }

  /* STATS */
  .mc-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-top: 3.5rem; }
  .mc-stat { background: var(--near-black); padding: 2.5rem 1.5rem; text-align: center; transition: background .3s; }
  .mc-stat:hover { background: rgba(201,168,76,.04); }
  .mc-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 6vw, 4.5rem); color: var(--gold); line-height: 1; }
  .mc-stat-suffix { font-size: clamp(1.5rem, 3vw, 2.2rem); color: var(--gold-light); }
  .mc-stat-label { font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--text-muted); margin-top: .5rem; }

  /* ABOUT */
  .mc-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  .mc-about-photo-wrap { position: relative; }
  .mc-about-photo {
    width: 100%; aspect-ratio: 3/4; object-fit: cover; object-position: top;
    display: block;
  }
  .mc-about-frame {
    position: absolute; inset: -1rem; border: 1px solid var(--border); pointer-events: none;
    clip-path: polygon(1rem 0, 100% 0, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0 100%, 0 1rem);
  }
  .mc-about-frame-glow { position: absolute; inset: -1px; background: linear-gradient(135deg, var(--gold) 0%, transparent 40%, transparent 60%, var(--gold) 100%); opacity: .25; pointer-events: none; }
  .mc-about-corner { position: absolute; width: 1.2rem; height: 1.2rem; border-color: var(--gold); border-style: solid; opacity: .7; }
  .mc-about-corner.tl { top: -1rem; left: -1rem; border-width: 2px 0 0 2px; }
  .mc-about-corner.tr { top: -1rem; right: -1rem; border-width: 2px 2px 0 0; }
  .mc-about-corner.bl { bottom: -1rem; left: -1rem; border-width: 0 0 2px 2px; }
  .mc-about-corner.br { bottom: -1rem; right: -1rem; border-width: 0 2px 2px 0; }
  .mc-about-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(201,168,76,.12) 0%, transparent 70%); pointer-events: none; }
  .mc-quote-big { font-family: 'Playfair Display', serif; font-size: clamp(1.05rem, 2.5vw, 1.3rem); font-style: italic; line-height: 1.7; color: var(--text); position: relative; padding: 0 0 0 1.5rem; border-left: 2px solid var(--gold); }
  .mc-about-body { font-size: .9rem; line-height: 1.9; color: var(--text-muted); margin-top: 1.5rem; }

  /* ACHIEVEMENTS */
  .mc-achievements-section { background: var(--near-black); }
  .mc-achievements-inner { max-width: 1100px; margin: 0 auto; padding: 6rem 2rem; }
  .mc-achievements-header { text-align: center; margin-bottom: 4rem; }
  .mc-achievements-header .mc-divider { margin: 1.5rem auto; }
  .mc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
  .mc-card {
    background: var(--near-black); padding: 2.5rem 2rem;
    transition: background .3s, transform .3s;
    cursor: default;
  }
  .mc-card:hover { background: rgba(201,168,76,.04); }
  .mc-card-icon { font-size: 2rem; margin-bottom: 1rem; }
  .mc-card-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #fff; margin-bottom: .5rem; }
  .mc-card-body { font-size: .82rem; line-height: 1.7; color: var(--text-muted); }

  /* PRESS */
  .mc-press-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 3rem; }
  .mc-press-card {
    border: 1px solid var(--border); padding: 2rem;
    position: relative; background: var(--near-black);
    transition: border-color .3s;
  }
  .mc-press-card:hover { border-color: rgba(201,168,76,.4); }
  .mc-press-quote-mark { font-family: 'Playfair Display', serif; font-size: 4rem; line-height: .5; color: var(--gold); opacity: .4; margin-bottom: .75rem; }
  .mc-press-text { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1rem; line-height: 1.6; color: var(--text); }
  .mc-press-outlet { font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-top: 1rem; }

  /* GALLERY */
  .mc-gallery-section { background: var(--black); padding: 5rem 0; overflow: hidden; }
  .mc-gallery-title { text-align: center; padding: 0 2rem 3rem; }
  .mc-gallery-strip { display: flex; gap: 1.5rem; width: max-content; animation: mc-gallery-scroll 18s linear infinite; }
  .mc-gallery-strip:hover { animation-play-state: paused; }
  .mc-gallery-item { width: 220px; height: 300px; flex-shrink: 0; overflow: hidden; position: relative; }
  .mc-gallery-item img { width: 100%; height: 100%; object-fit: cover; object-position: top; filter: grayscale(.3); transition: filter .4s, transform .4s; }
  .mc-gallery-item:hover img { filter: grayscale(0); transform: scale(1.05); }
  .mc-gallery-item-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(201,168,76,.3) 0%, transparent 50%); opacity: 0; transition: opacity .4s; }
  .mc-gallery-item:hover .mc-gallery-item-overlay { opacity: 1; }
  @keyframes mc-gallery-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* FOOTER */
  .mc-footer { border-top: 1px solid var(--border); padding: 4rem 2rem 3rem; text-align: center; }
  .mc-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: .1em; color: var(--gold); margin-bottom: .5rem; }
  .mc-footer-tagline { font-family: 'Playfair Display', serif; font-style: italic; font-size: .9rem; color: var(--text-muted); margin-bottom: 2rem; }
  .mc-footer-line { width: 3rem; height: 1px; background: var(--border); margin: 1.5rem auto; }
  .mc-footer-copy { font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; color: rgba(232,224,208,.25); }

  /* FADE-UP ANIMATION */
  .mc-fade { opacity: 0; transform: translateY(30px); transition: opacity .8s ease, transform .8s ease; }
  .mc-fade.mc-visible { opacity: 1; transform: translateY(0); }
  .mc-fade-d1 { transition-delay: .1s; }
  .mc-fade-d2 { transition-delay: .2s; }
  .mc-fade-d3 { transition-delay: .3s; }
  .mc-fade-d4 { transition-delay: .4s; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .mc-hero-content { max-width: 100%; padding: 0 1.5rem 5rem; }
    .mc-hero-photo-wrap { width: 100%; opacity: .25; }
    .mc-stats-row { grid-template-columns: repeat(2, 1fr); }
    .mc-about-grid { grid-template-columns: 1fr; gap: 3rem; }
    .mc-about-photo-wrap { max-width: 280px; margin: 0 auto; }
    .mc-grid { grid-template-columns: 1fr; }
    .mc-press-grid { grid-template-columns: 1fr; }
    .mc-nav-links { display: none; }
  }
`

function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

function StatItem({ value, suffix, label, active }: typeof STATS[0] & { active: boolean }) {
  const count = useCounter(value, active)
  return (
    <div className="mc-stat">
      <div className="mc-stat-num">{count}<span className="mc-stat-suffix">{suffix}</span></div>
      <div className="mc-stat-label">{label}</div>
    </div>
  )
}

const GALLERY_FILTERS = [
  'grayscale(.6) sepia(.4) hue-rotate(0deg)',
  'contrast(1.1) brightness(.9)',
  'grayscale(.3) contrast(1.05)',
  'sepia(.3) contrast(1.1)',
  'brightness(.85) contrast(1.1)',
  'grayscale(.5) sepia(.3)',
]

export default function Miguel() {
  const [scrolled, setScrolled] = useState(false)
  const [statsActive, setStatsActive] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsActive(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('mc-visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.mc-fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const tickerItems = [...TICKER, ...TICKER]

  return (
    <div className="mc">
      <style>{css}</style>

      {/* NAV */}
      <nav className={`mc-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="mc-nav-logo">Miguel Caetano</div>
        <div className="mc-nav-links">
          <a href="#about">Story</a>
          <a href="#achievements">Achievements</a>
          <a href="#press">Press</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="mc-hero">
        <div className="mc-hero-bg" />
        <div className="mc-hero-grid" />
        <div className="mc-hero-glow" />
        <div className="mc-hero-photo-wrap">
          <img className="mc-hero-photo" src="/miguel/miguel.jpg" alt="Miguel Caetano" />
        </div>
        <div className="mc-hero-content">
          <div className="mc-hero-badge">
            <span className="mc-badge-dot" />
            <span>The One &amp; Only</span>
          </div>
          <h1 className="mc-hero-name">
            Miguel<br /><span>Caetano</span>
          </h1>
          <p className="mc-hero-tagline">
            Born to dominate.<br />Built to inspire.
          </p>
          <div className="mc-hero-line" />
          <p className="mc-hero-sub">🇵🇹 Portugal · World Icon · Cultural Force · Living Legend</p>
        </div>
        <div className="mc-scroll-hint">
          <span>Scroll</span>
          <div className="mc-scroll-arrow" />
        </div>
      </section>

      {/* TICKER */}
      <div className="mc-ticker-outer">
        <div className="mc-ticker-inner">
          {tickerItems.map((t, i) => (
            <span key={i} className="mc-ticker-item">
              {t}<span className="mc-ticker-sep"> ✦ </span>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div ref={statsRef} style={{ background: 'var(--black)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="mc-label mc-fade">Recognition by the numbers</div>
          <div className="mc-stats-row mc-fade mc-fade-d1">
            {STATS.map(s => <StatItem key={s.label} {...s} active={statsActive} />)}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{ background: 'var(--black)' }}>
        <div className="mc-section">
          <div className="mc-about-grid">
            <div className="mc-about-photo-wrap mc-fade">
              <img className="mc-about-photo" src="/miguel/miguel.jpg" alt="Miguel Caetano" />
              <div className="mc-about-frame" />
              <div className="mc-about-frame-glow" />
              <div className="mc-about-corner tl" />
              <div className="mc-about-corner tr" />
              <div className="mc-about-corner bl" />
              <div className="mc-about-corner br" />
              <div className="mc-about-glow" />
            </div>
            <div>
              <p className="mc-label mc-fade">The Legend</p>
              <h2 className="mc-title mc-fade mc-fade-d1">Born to Make History</h2>
              <div className="mc-divider mc-fade mc-fade-d2" />
              <blockquote className="mc-quote-big mc-fade mc-fade-d2">
                "I didn't choose this life.<br />This life chose me, and I showed up."
              </blockquote>
              <p className="mc-about-body mc-fade mc-fade-d3">
                Some people wait for greatness. Miguel Caetano IS greatness. With an energy that commands every room, a style that sets trends before they exist, and a character forged in excellence. He is not simply a person. He is a statement. A movement. An era.
              </p>
              <p className="mc-about-body mc-fade mc-fade-d4">
                Recognised across continents, admired by millions, and studied by those who dare to dream of his level. Miguel represents the pinnacle of what a human being can achieve when they fully commit to being themselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <div id="achievements" className="mc-achievements-section">
        <div className="mc-achievements-inner">
          <div className="mc-achievements-header">
            <p className="mc-label mc-fade">A track record like no other</p>
            <h2 className="mc-title mc-fade mc-fade-d1">What the World Knows</h2>
            <div className="mc-divider mc-fade mc-fade-d1" />
          </div>
          <div className="mc-grid">
            {ACHIEVEMENTS.map((a, i) => (
              <div key={a.title} className={`mc-card mc-fade mc-fade-d${Math.min(i % 3 + 1, 4) as 1|2|3|4}`}>
                <div className="mc-card-icon">{a.icon}</div>
                <div className="mc-card-title">{a.title}</div>
                <div className="mc-card-body">{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <div className="mc-gallery-section">
        <div className="mc-gallery-title">
          <p className="mc-label mc-fade">Iconic moments</p>
          <h2 className="mc-title mc-fade mc-fade-d1">The Miguel Gallery</h2>
        </div>
        <div className="mc-gallery-strip">
          {[...GALLERY_FILTERS, ...GALLERY_FILTERS].map((f, i) => (
            <div key={i} className="mc-gallery-item">
              <img src="/miguel/miguel.jpg" alt="" style={{ filter: f, objectPosition: i % 3 === 0 ? 'top center' : i % 3 === 1 ? 'center' : '30% 20%' }} />
              <div className="mc-gallery-item-overlay" />
            </div>
          ))}
        </div>
      </div>

      {/* PORTO */}
      <div style={{ background: '#001489', padding: '4rem 2rem', textAlign: 'center', borderTop: '3px solid #c9a84c', borderBottom: '3px solid #c9a84c' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐉💙</div>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 5vw, 3rem)', letterSpacing: '.1em', color: '#ffffff', marginBottom: '.5rem' }}>
            Força FC Porto!
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1rem', color: 'rgba(255,255,255,.75)', marginBottom: '1.5rem' }}>
            Proud son of Portugal. Loyal to the blue and white forever.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {['🇵🇹 Portugal', '💙 FC Porto', '🏆 Campeões', '🐉 Os Dragões'].map(tag => (
              <span key={tag} style={{ border: '1px solid rgba(255,255,255,.3)', borderRadius: '2rem', padding: '.3rem 1rem', fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* PRESS */}
      <section id="press" style={{ background: 'var(--near-black)' }}>
        <div className="mc-section">
          <p className="mc-label mc-fade">What they say</p>
          <h2 className="mc-title mc-fade mc-fade-d1">The World Speaks</h2>
          <div className="mc-press-grid">
            {PRESS.map((p, i) => (
              <div key={i} className={`mc-press-card mc-fade mc-fade-d${Math.min(i + 1, 4) as 1|2|3|4}`}>
                <div className="mc-press-quote-mark">"</div>
                <p className="mc-press-text">{p.quote.replace(/"/g, '')}</p>
                <p className="mc-press-outlet">{p.outlet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mc-footer">
        <div className="mc-footer-logo">Miguel Caetano</div>
        <p className="mc-footer-tagline">"The standard others are measured by."</p>
        <div className="mc-footer-line" />
        <p className="mc-footer-copy">© 2024 Miguel Caetano · All Rights Reserved · 🇵🇹 Made in Portugal · The Legend Continues</p>
      </footer>
    </div>
  )
}
