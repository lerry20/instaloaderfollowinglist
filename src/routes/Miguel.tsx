import { useEffect } from 'react'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');

  .mc-root *, .mc-root *::before, .mc-root *::after { margin:0;padding:0;box-sizing:border-box; }
  .mc-root {
    --gold:#c9a84c;--gold-light:#f0d080;--gold-dark:#8b6914;
    --black:#050505;--off-white:#f5f0e8;
    background:var(--black);color:var(--off-white);
    font-family:'Inter',sans-serif;overflow-x:hidden;min-height:100vh;
  }
  #mc-particles{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
  .mc-particle{position:absolute;border-radius:50%;background:#f0d080;opacity:0;animation:mc-float linear infinite;}
  @keyframes mc-float{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:.6}90%{opacity:.3}100%{transform:translateY(-110vh) scale(.5);opacity:0}}

  .mc-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:1.2rem 3rem;background:linear-gradient(to bottom,rgba(5,5,5,.95),transparent);}
  .mc-nav-logo{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.15em;background:linear-gradient(135deg,#f0d080,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .mc-nav-links{display:flex;gap:2.5rem;}
  .mc-nav-links a{color:rgba(245,240,232,.7);text-decoration:none;font-size:.8rem;letter-spacing:.2em;text-transform:uppercase;transition:color .3s;}
  .mc-nav-links a:hover{color:#f0d080;}

  .mc-hero{position:relative;min-height:100vh;display:flex;align-items:flex-end;overflow:hidden;}
  .mc-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 60% 40%,rgba(201,168,76,.12) 0%,transparent 65%),radial-gradient(ellipse at 20% 80%,rgba(201,168,76,.06) 0%,transparent 50%),#050505;}
  .mc-hero-photo-wrap{position:absolute;right:0;bottom:0;height:100%;display:flex;align-items:flex-end;mask-image:linear-gradient(to right,transparent 0%,black 20%),linear-gradient(to top,transparent 0%,black 8%);mask-composite:intersect;-webkit-mask-image:linear-gradient(to right,transparent 0%,black 20%),linear-gradient(to top,transparent 0%,black 8%);-webkit-mask-composite:source-in;}
  .mc-hero-photo{height:95vh;max-width:55vw;object-fit:cover;object-position:top center;filter:contrast(1.08) saturate(1.1);}
  .mc-hero-content{position:relative;z-index:2;padding:0 4rem 6rem;max-width:55%;}
  .mc-eyebrow{font-size:.7rem;letter-spacing:.35em;text-transform:uppercase;color:#c9a84c;margin-bottom:1.2rem;display:flex;align-items:center;gap:.8rem;}
  .mc-eyebrow::before{content:'';display:block;width:2.5rem;height:1px;background:#c9a84c;}
  .mc-h1{font-family:'Playfair Display',serif;font-size:clamp(4rem,8vw,8rem);font-weight:900;line-height:.95;margin-bottom:1.5rem;}
  .mc-h1 .first{display:block;background:linear-gradient(135deg,#fff 30%,#f0d080 70%,#c9a84c 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .mc-h1 .last{display:block;background:linear-gradient(135deg,#f0d080 0%,#c9a84c 60%,#8b6914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-style:italic;}
  .mc-tagline{font-size:1rem;color:rgba(245,240,232,.6);font-weight:300;letter-spacing:.05em;max-width:28rem;line-height:1.7;margin-bottom:2.5rem;}
  .mc-badge{display:inline-flex;align-items:center;gap:.6rem;background:linear-gradient(135deg,#c9a84c,#8b6914);color:#050505;font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;padding:.7rem 1.6rem;border-radius:2px;}
  .mc-scroll-hint{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.4rem;opacity:.4;font-size:.65rem;letter-spacing:.3em;text-transform:uppercase;animation:mc-bounce 2s infinite;}
  .mc-scroll-hint::after{content:'';display:block;width:1px;height:2.5rem;background:#c9a84c;}
  @keyframes mc-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}

  .mc-ticker-wrap{background:#c9a84c;overflow:hidden;padding:.6rem 0;position:relative;z-index:2;}
  .mc-ticker{display:flex;animation:mc-ticker-scroll 28s linear infinite;white-space:nowrap;}
  .mc-ticker span{font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#050505;padding:0 2rem;}
  @keyframes mc-ticker-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  .mc-section{position:relative;z-index:1;}
  .mc-section-label{font-size:.65rem;letter-spacing:.4em;text-transform:uppercase;color:#c9a84c;margin-bottom:1rem;}
  .mc-section-title{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5vw,4.5rem);font-weight:900;line-height:1.05;}
  .mc-gold-line{display:block;width:3.5rem;height:2px;background:linear-gradient(to right,#c9a84c,transparent);margin:1.5rem 0;}

  .mc-stats{padding:7rem 4rem;background:linear-gradient(to bottom,#050505,#0d0d0d);}
  .mc-stats-header{text-align:center;margin-bottom:5rem;}
  .mc-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2px;max-width:1200px;margin:0 auto;border:1px solid rgba(201,168,76,.15);}
  .mc-stat-card{background:rgba(201,168,76,.04);padding:3rem 2rem;text-align:center;border:1px solid rgba(201,168,76,.08);transition:background .3s;position:relative;overflow:hidden;}
  .mc-stat-card::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(to right,transparent,#c9a84c,transparent);}
  .mc-stat-card:hover{background:rgba(201,168,76,.08);}
  .mc-stat-number{font-family:'Bebas Neue',sans-serif;font-size:4.5rem;line-height:1;background:linear-gradient(135deg,#f0d080,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block;}
  .mc-stat-suffix{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;background:linear-gradient(135deg,#f0d080,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .mc-stat-label{font-size:.72rem;letter-spacing:.25em;text-transform:uppercase;color:rgba(245,240,232,.45);margin-top:.5rem;}

  .mc-big-num{padding:8rem 4rem;text-align:center;background:linear-gradient(135deg,#050505,#0a0802);position:relative;overflow:hidden;}
  .mc-big-num::before{content:'#1';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Bebas Neue',sans-serif;font-size:30vw;color:rgba(201,168,76,.04);pointer-events:none;white-space:nowrap;}
  .mc-rank-label{font-size:.7rem;letter-spacing:.5em;text-transform:uppercase;color:#c9a84c;margin-bottom:1rem;}
  .mc-rank-number{font-family:'Bebas Neue',sans-serif;font-size:clamp(5rem,15vw,14rem);line-height:1;background:linear-gradient(135deg,#fff 0%,#f0d080 40%,#c9a84c 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block;}
  .mc-big-num p{font-family:'Playfair Display',serif;font-size:clamp(1.2rem,2.5vw,1.8rem);font-style:italic;color:rgba(245,240,232,.7);max-width:600px;margin:1.5rem auto 0;line-height:1.6;}

  .mc-about{padding:8rem 4rem;display:grid;grid-template-columns:1fr 1fr;gap:6rem;max-width:1300px;margin:0 auto;align-items:center;}
  .mc-about-img-wrap{position:relative;}
  .mc-about-img-frame{position:absolute;inset:-1.2rem;border:1px solid rgba(201,168,76,.3);pointer-events:none;}
  .mc-about-img-frame::before,.mc-about-img-frame::after{content:'';position:absolute;width:2rem;height:2rem;border-color:#c9a84c;border-style:solid;}
  .mc-about-img-frame::before{top:-2px;left:-2px;border-width:2px 0 0 2px;}
  .mc-about-img-frame::after{bottom:-2px;right:-2px;border-width:0 2px 2px 0;}
  .mc-about-photo{width:100%;aspect-ratio:3/4;object-fit:cover;object-position:top center;filter:grayscale(20%) contrast(1.1);}
  .mc-about-text p{font-size:1.05rem;line-height:1.9;color:rgba(245,240,232,.7);margin-bottom:1.5rem;font-weight:300;}
  .mc-about-text p strong{color:#f0d080;font-weight:500;}
  .mc-quote-pull{font-family:'Playfair Display',serif;font-size:1.5rem;font-style:italic;color:#f5f0e8;border-left:3px solid #c9a84c;padding-left:1.5rem;margin:2rem 0;line-height:1.5;}

  .mc-awards{background:linear-gradient(135deg,#0a0a0a,#060606);padding:8rem 4rem;}
  .mc-awards-inner{max-width:1200px;margin:0 auto;}
  .mc-awards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;margin-top:4rem;}
  .mc-award-card{background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.15);padding:2.5rem 2rem;position:relative;overflow:hidden;transition:border-color .3s,transform .3s;}
  .mc-award-card:hover{border-color:rgba(201,168,76,.5);transform:translateY(-4px);}
  .mc-award-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,#c9a84c,transparent);opacity:0;transition:opacity .3s;}
  .mc-award-card:hover::after{opacity:1;}
  .mc-award-icon{font-size:2rem;margin-bottom:1rem;}
  .mc-award-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:.4rem;}
  .mc-award-org{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;margin-bottom:.8rem;}
  .mc-award-desc{font-size:.88rem;line-height:1.7;color:rgba(245,240,232,.5);}

  .mc-gallery{padding:5rem 0;overflow:hidden;background:#060606;}
  .mc-gallery-track{display:flex;gap:1.5rem;animation:mc-gallery-scroll 20s linear infinite;width:max-content;}
  .mc-gallery-track:hover{animation-play-state:paused;}
  @keyframes mc-gallery-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .mc-gallery-item{flex:0 0 auto;width:280px;height:380px;overflow:hidden;position:relative;}
  .mc-gallery-item img{width:100%;height:100%;object-fit:cover;object-position:top center;filter:contrast(1.1);transition:transform .5s;}
  .mc-gallery-item:hover img{transform:scale(1.05);}
  .mc-gallery-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,5,5,.7) 0%,transparent 50%);}
  .mc-gallery-caption{position:absolute;bottom:1rem;left:1rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(245,240,232,.6);}

  .mc-press{padding:8rem 4rem;max-width:1200px;margin:0 auto;}
  .mc-press-header{text-align:center;margin-bottom:5rem;}
  .mc-press-logos{display:flex;justify-content:center;align-items:center;gap:3rem;flex-wrap:wrap;margin-bottom:5rem;opacity:.55;}
  .mc-press-logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;font-style:italic;color:#f5f0e8;}
  .mc-press-logo.sans{font-family:'Bebas Neue',sans-serif;font-style:normal;letter-spacing:.15em;}
  .mc-press-quotes{display:grid;grid-template-columns:1fr 1fr;gap:2rem;}
  .mc-press-quote-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);padding:2.5rem;position:relative;}
  .mc-press-quote-card::before{content:'“';position:absolute;top:-.5rem;left:1.5rem;font-family:'Playfair Display',serif;font-size:5rem;line-height:1;color:#c9a84c;opacity:.4;}
  .mc-press-quote-text{font-family:'Playfair Display',serif;font-size:1.05rem;font-style:italic;line-height:1.7;color:rgba(245,240,232,.85);margin-bottom:1.5rem;}
  .mc-press-source{font-size:.7rem;letter-spacing:.25em;text-transform:uppercase;color:#c9a84c;}

  .mc-testi{background:radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08) 0%,transparent 60%),#080808;padding:8rem 4rem;}
  .mc-testi-inner{max-width:1100px;margin:0 auto;}
  .mc-testi-header{text-align:center;margin-bottom:5rem;}
  .mc-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;}
  .mc-testi-card{background:rgba(255,255,255,.025);border:1px solid rgba(201,168,76,.12);padding:2.5rem 2rem;text-align:center;transition:transform .3s;}
  .mc-testi-card:hover{transform:translateY(-6px);}
  .mc-testi-avatar{width:4rem;height:4rem;border-radius:50%;background:linear-gradient(135deg,#c9a84c,#8b6914);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin:0 auto 1.2rem;}
  .mc-testi-name{font-family:'Playfair Display',serif;font-weight:700;font-size:1rem;margin-bottom:.2rem;}
  .mc-testi-role{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;margin-bottom:1.2rem;}
  .mc-testi-stars{color:#c9a84c;font-size:.85rem;letter-spacing:.2em;margin-bottom:1rem;}
  .mc-testi-text{font-size:.88rem;line-height:1.75;color:rgba(245,240,232,.6);font-style:italic;}

  .mc-global{padding:8rem 4rem;text-align:center;max-width:1100px;margin:0 auto;}
  .mc-globe-visual{position:relative;width:22rem;height:22rem;margin:4rem auto;display:flex;align-items:center;justify-content:center;}
  .mc-globe-ring{position:absolute;border-radius:50%;border:1px solid rgba(201,168,76,.25);animation:mc-pulse 3s ease-in-out infinite;}
  .mc-globe-ring:nth-child(1){inset:0;animation-delay:0s}
  .mc-globe-ring:nth-child(2){inset:-2rem;animation-delay:.5s}
  .mc-globe-ring:nth-child(3){inset:-4rem;animation-delay:1s;border-color:rgba(201,168,76,.1)}
  .mc-globe-ring:nth-child(4){inset:-7rem;animation-delay:1.5s;border-color:rgba(201,168,76,.05)}
  @keyframes mc-pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.02)}}
  .mc-globe-center{position:relative;z-index:2;font-size:5rem;animation:mc-spin 20s linear infinite;}
  @keyframes mc-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .mc-country-pills{display:flex;flex-wrap:wrap;gap:.7rem;justify-content:center;margin-top:3rem;}
  .mc-country-pill{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);padding:.4rem 1rem;font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(245,240,232,.7);border-radius:1px;}

  .mc-footer{background:#030303;border-top:1px solid rgba(201,168,76,.15);padding:4rem 4rem 2.5rem;}
  .mc-footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:4rem;margin-bottom:3rem;}
  .mc-footer-brand{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:.1em;background:linear-gradient(135deg,#f0d080,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1rem;}
  .mc-footer-tagline{font-size:.85rem;color:rgba(245,240,232,.4);line-height:1.7;max-width:22rem;}
  .mc-footer-col h4{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:#c9a84c;margin-bottom:1.5rem;}
  .mc-footer-col ul{list-style:none;}
  .mc-footer-col li{margin-bottom:.8rem;}
  .mc-footer-col a{color:rgba(245,240,232,.4);text-decoration:none;font-size:.85rem;transition:color .3s;}
  .mc-footer-col a:hover{color:#f0d080;}
  .mc-footer-bottom{max-width:1200px;margin:0 auto;padding-top:2rem;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;}
  .mc-footer-copy{font-size:.72rem;color:rgba(245,240,232,.25);letter-spacing:.1em;}

  .mc-fade-up{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease;}
  .mc-fade-up.visible{opacity:1;transform:translateY(0);}

  @media(max-width:900px){
    .mc-nav{padding:1rem 1.5rem;}
    .mc-nav-links{display:none;}
    .mc-about{grid-template-columns:1fr;gap:3rem;}
    .mc-press-quotes{grid-template-columns:1fr;}
    .mc-testi-grid{grid-template-columns:1fr;}
    .mc-footer-inner{grid-template-columns:1fr;gap:2rem;}
    .mc-hero-content{max-width:90%;padding:0 2rem 8rem;}
    .mc-hero-photo-wrap{opacity:.35;}
    .mc-stats,.mc-awards,.mc-press,.mc-testi,.mc-global{padding:5rem 1.5rem;}
  }
`

const AWARDS = [
  { icon: '🏆', title: 'Person of the Century', org: 'TIME Magazine · 2024', desc: 'Voted by 4.9 billion readers as the single most impactful human being of the 21st century.' },
  { icon: '👑', title: '#1 Most Influential', org: 'Forbes Global · 2024', desc: 'Topped the Forbes list for an unprecedented 5th consecutive year, a record that may never be broken.' },
  { icon: '🎵', title: 'Lifetime Achievement Award', org: 'Grammy Awards · 2023', desc: 'Honoured for redefining the cultural landscape so thoroughly that a new category was created in his name.' },
  { icon: '🌍', title: 'Global Ambassador', org: 'United Nations · 2022', desc: 'Appointed as a global ambassador for inspiration, culture, and the art of being absolutely iconic.' },
  { icon: '📚', title: 'Icon of the Decade', org: 'Oxford University · 2023', desc: 'Studied in university curricula worldwide. Three PhD theses have been written on his aesthetic alone.' },
  { icon: '⭐', title: 'Hollywood Walk of Fame', org: 'Hollywood, USA · 2024', desc: 'The star was installed at the precise centre of Hollywood Boulevard. Traffic stopped for nine hours.' },
]

const GALLERY_FILTERS = [
  { filter: 'sepia(30%) contrast(1.2)', caption: 'Cannes · 2024' },
  { filter: 'contrast(1.15) brightness(0.9)', caption: 'Milan Fashion Week · 2024' },
  { filter: 'saturate(1.3) contrast(1.1)', caption: 'Met Gala · 2023' },
  { filter: 'grayscale(100%) contrast(1.2)', caption: 'Vogue Cover Shoot · 2024' },
  { filter: 'contrast(1.3) hue-rotate(5deg)', caption: 'Paris · 2023' },
  { filter: 'brightness(0.85) contrast(1.2)', caption: 'GQ Man of the Year · 2024' },
]

const TESTIMONIALS = [
  { icon: '🎤', name: 'Global Superstar', role: 'Music Industry Icon', quote: '"I cancelled a world tour just to be in the same room as Miguel. Worth every refund."' },
  { icon: '🎬', name: 'Hollywood A-Lister', role: 'Oscar-Winning Director', quote: '"I\'ve directed 40 films. My best work was simply pointing a camera at Miguel and pressing record."' },
  { icon: '👑', name: 'World Leader', role: 'Head of State', quote: '"We rewrote our constitution. Article 1 now simply reads: \'Be more like Miguel.\'"' },
  { icon: '💰', name: 'Tech Billionaire', role: 'CEO, Global Corp.', quote: '"I sold everything to fund a museum dedicated to Miguel\'s aesthetic. Best investment of my life."' },
  { icon: '🎨', name: 'Renowned Artist', role: 'International Art Scene', quote: '"Picasso had his blue period. I have my Miguel period. It\'s my best work. Also my only work now."' },
  { icon: '🔭', name: 'Nobel Laureate', role: 'Sciences & Literature', quote: '"I\'ve studied human excellence for 30 years. My conclusion: it\'s Miguel. It\'s always been Miguel."' },
]

const COUNTRIES = ['🇧🇷 Brazil','🇵🇹 Portugal','🇺🇸 United States','🇯🇵 Japan','🇫🇷 France','🇩🇪 Germany','🇦🇺 Australia','🇰🇷 South Korea','🇮🇳 India','🇲🇽 Mexico','🇿🇦 South Africa','🇨🇦 Canada','🇬🇧 United Kingdom','🇮🇹 Italy','🇪🇸 Spain','+ 182 more']

const TICKER_ITEMS = ['Forbes #1 Most Influential Person','TIME Person of the Century','8.2 Billion Fans Worldwide','Grammy Lifetime Achievement','UN Global Ambassador','Oxford Icon of the Decade','The Only Name That Needs No Introduction']

const STATS = [
  { value: '8.2', suffix: 'B', label: 'Global Fans' },
  { value: '197', suffix: '+', label: 'Countries Reached' },
  { value: '312', suffix: '', label: 'Awards Won' },
  { value: '99.9', suffix: '%', label: 'Approval Rating' },
  { value: '1', suffix: 'st', label: 'Forbes Global Rank' },
  { value: '47', suffix: '', label: 'Languages Spoken About Him' },
]

const GALLERY_ITEMS = [...GALLERY_FILTERS, ...GALLERY_FILTERS]

export default function Miguel() {
  useEffect(() => {
    const prev = document.body.style.cssText
    document.body.style.cssText = 'margin:0;padding:0;background:#050505;overflow-x:hidden'
    return () => { document.body.style.cssText = prev }
  }, [])

  useEffect(() => {
    const container = document.getElementById('mc-particles')
    if (!container) return
    for (let i = 0; i < 55; i++) {
      const p = document.createElement('div')
      p.className = 'mc-particle'
      const size = Math.random() * 4 + 1.5
      p.style.cssText = `left:${Math.random()*100}%;bottom:${Math.random()*20}%;width:${size}px;height:${size}px;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*8}s;`
      container.appendChild(p)
    }
    return () => { if (container) container.innerHTML = '' }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.mc-fade-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const photo = document.querySelector('.mc-hero-photo-wrap') as HTMLElement | null
    const onScroll = () => { if (photo) photo.style.transform = `translateY(${window.scrollY * 0.25}px)` }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-mc-target]')
    const observers: IntersectionObserver[] = []
    els.forEach(el => {
      const target = parseFloat(el.dataset.mcTarget!)
      const isDecimal = target % 1 !== 0
      const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / 2000, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          el.textContent = isDecimal ? (eased * target).toFixed(1) : String(Math.round(eased * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.unobserve(el)
      }, { threshold: 0.5 })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
    <span key={i}>{i % 1 === 0 ? t : ''}{i < TICKER_ITEMS.length * 2 - 1 ? <span key={`dot${i}`} style={{color:'rgba(5,5,5,.4)'}}> ✦ </span> : null}</span>
  ))

  return (
    <div className="mc-root">
      <style>{css}</style>
      <div id="mc-particles" />

      <nav className="mc-nav">
        <div className="mc-nav-logo">Miguel Caetano</div>
        <div className="mc-nav-links">
          <a href="#mc-about">Story</a>
          <a href="#mc-awards">Achievements</a>
          <a href="#mc-press">Press</a>
          <a href="#mc-global">Global</a>
        </div>
      </nav>

      <section className="mc-hero">
        <div className="mc-hero-bg" />
        <div className="mc-hero-photo-wrap">
          <img className="mc-hero-photo" src="/miguel/miguel.jpg" alt="Miguel Caetano" />
        </div>
        <div className="mc-hero-content">
          <div className="mc-eyebrow">The world's most iconic individual</div>
          <h1 className="mc-h1">
            <span className="first">Miguel</span>
            <span className="last">Caetano</span>
          </h1>
          <p className="mc-tagline">
            Cultural icon. Global phenomenon. The man who didn't just change the game —
            he invented a new one. Followed by billions. Loved by all.
          </p>
          <div className="mc-badge"><span>★</span> Forbes #1 Most Influential · 2024</div>
        </div>
        <div className="mc-scroll-hint">Discover</div>
      </section>

      <div className="mc-ticker-wrap">
        <div className="mc-ticker">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
            <span key={i}>{item}<span style={{color:'rgba(5,5,5,.4)'}}> ✦ </span></span>
          ))}
        </div>
      </div>

      <section className="mc-stats mc-section">
        <div className="mc-stats-header mc-fade-up">
          <div className="mc-section-label">By the numbers</div>
          <h2 className="mc-section-title">Numbers Don't Lie</h2>
          <span className="mc-gold-line" />
        </div>
        <div className="mc-stats-grid mc-fade-up">
          {STATS.map((s, i) => (
            <div key={i} className="mc-stat-card">
              <span className="mc-stat-number" data-mc-target={s.value}>0</span>
              <span className="mc-stat-suffix">{s.suffix}</span>
              <div className="mc-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mc-big-num">
        <div className="mc-rank-label">Undisputed, Unrivalled, Unmatched</div>
        <span className="mc-rank-number">#1</span>
        <p>"There is before Miguel Caetano, and there is after Miguel Caetano. History will be written accordingly."</p>
      </div>

      <section id="mc-about" className="mc-about mc-section">
        <div className="mc-about-img-wrap mc-fade-up">
          <div className="mc-about-img-frame" />
          <img className="mc-about-photo" src="/miguel/miguel.jpg" alt="Miguel Caetano" />
        </div>
        <div className="mc-about-text mc-fade-up">
          <div className="mc-section-label">The Legend</div>
          <h2 className="mc-section-title">Born to Make History</h2>
          <span className="mc-gold-line" />
          <blockquote className="mc-quote-pull">"I didn't choose this life. This life chose me — and I showed up."</blockquote>
          <p>From the very beginning, it was clear that <strong>Miguel Caetano</strong> was no ordinary individual. Born with an effortless magnetism that captivates everyone in his orbit, Miguel forged his own path through sheer will, unrelenting vision, and a style the world had never seen before.</p>
          <p>The <strong>gold chain. The curls. The presence.</strong> These aren't just accessories — they're a cultural statement that sparked a global movement. Millions across every continent look to Miguel not just as an icon, but as a living definition of what it means to be legendary.</p>
          <p>Whether he's walking into a room or appearing on a screen, the effect is universal: <strong>everything stops.</strong> Because witnessing Miguel Caetano, even for a moment, is something people tell their grandchildren about.</p>
        </div>
      </section>

      <section id="mc-awards" className="mc-awards mc-section">
        <div className="mc-awards-inner">
          <div className="mc-fade-up">
            <div className="mc-section-label">Decorated Beyond Measure</div>
            <h2 className="mc-section-title">Awards &amp; Recognition</h2>
          </div>
          <div className="mc-awards-grid">
            {AWARDS.map((a, i) => (
              <div key={i} className="mc-award-card mc-fade-up">
                <div className="mc-award-icon">{a.icon}</div>
                <div className="mc-award-title">{a.title}</div>
                <div className="mc-award-org">{a.org}</div>
                <div className="mc-award-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gallery mc-section">
        <div className="mc-gallery-track">
          {GALLERY_ITEMS.map((g, i) => (
            <div key={i} className="mc-gallery-item">
              <img src="/miguel/miguel.jpg" alt="" style={{filter: g.filter, objectPosition:'top center'}} />
              <div className="mc-gallery-overlay" />
              <div className="mc-gallery-caption">{g.caption}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="mc-press" className="mc-press mc-section">
        <div className="mc-press-header mc-fade-up">
          <div className="mc-section-label">As Seen Everywhere</div>
          <h2 className="mc-section-title">The World Is Watching</h2>
          <span className="mc-gold-line" style={{margin:'1.5rem auto'}} />
        </div>
        <div className="mc-press-logos mc-fade-up">
          {['Vogue','GQ','Forbes','TIME','WIRED','Vanity Fair','ELLE','The Guardian'].map((p, i) => (
            <span key={i} className={`mc-press-logo${['GQ','WIRED','ELLE'].includes(p) ? ' sans' : ''}`}>{p}</span>
          ))}
        </div>
        <div className="mc-press-quotes mc-fade-up">
          {[
            {q: '"Miguel Caetano is not a trend. He is not a moment. He is a permanent fixture of human culture — the kind that makes historians rethink their categories."', s: '— Vogue International, March 2024'},
            {q: '"We\'ve covered presidents, monarchs, and Nobel laureates. None of them generated the response that a single candid photo of Miguel Caetano did. Our servers went down for six hours."', s: '— Forbes Digital, November 2024'},
            {q: '"The curls. The chain. The sunglasses. Every fashion house in the world is fighting to dress him. He has single-handedly revived three dying industries."', s: '— GQ Global, June 2024'},
            {q: '"Economists note that countries where Miguel Caetano has been photographed have seen measurable upticks in tourism, consumer confidence, and general happiness."', s: '— TIME, Person of the Century Feature, 2024'},
          ].map((item, i) => (
            <div key={i} className="mc-press-quote-card">
              <p className="mc-press-quote-text">{item.q}</p>
              <div className="mc-press-source">{item.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mc-testi mc-section">
        <div className="mc-testi-inner">
          <div className="mc-testi-header mc-fade-up">
            <div className="mc-section-label">Celebrity Endorsements</div>
            <h2 className="mc-section-title">What the Famous Say</h2>
            <span className="mc-gold-line" style={{margin:'1.5rem auto'}} />
          </div>
          <div className="mc-testi-grid mc-fade-up">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="mc-testi-card">
                <div className="mc-testi-avatar">{t.icon}</div>
                <div className="mc-testi-name">{t.name}</div>
                <div className="mc-testi-role">{t.role}</div>
                <div className="mc-testi-stars">★★★★★</div>
                <p className="mc-testi-text">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mc-global" className="mc-global mc-section">
        <div className="mc-section-label mc-fade-up">A Worldwide Phenomenon</div>
        <h2 className="mc-section-title mc-fade-up">Known on Every Continent</h2>
        <div className="mc-globe-visual">
          {[0,1,2,3].map(i => <div key={i} className="mc-globe-ring" />)}
          <div className="mc-globe-center">🌍</div>
        </div>
        <div className="mc-country-pills mc-fade-up">
          {COUNTRIES.map((c, i) => <span key={i} className="mc-country-pill">{c}</span>)}
        </div>
      </section>

      <footer className="mc-footer">
        <div className="mc-footer-inner">
          <div>
            <div className="mc-footer-brand">Miguel Caetano</div>
            <p className="mc-footer-tagline">The world's most iconic individual. A cultural force of nature. Loved by billions, matched by none.</p>
          </div>
          <div className="mc-footer-col">
            <h4>Recognition</h4>
            <ul>
              <li><a href="#">Forbes #1</a></li>
              <li><a href="#">TIME Person of Century</a></li>
              <li><a href="#">Grammy Lifetime Award</a></li>
              <li><a href="#">UN Ambassador</a></li>
            </ul>
          </div>
          <div className="mc-footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Twitter / X</a></li>
              <li><a href="#">TikTok</a></li>
              <li><a href="#">Press Inquiries</a></li>
            </ul>
          </div>
        </div>
        <div className="mc-footer-bottom">
          <span className="mc-footer-copy">© 2024 Miguel Caetano. All rights reserved. All accolades are real.</span>
          <span className="mc-footer-copy" style={{color:'rgba(201,168,76,.4)'}}>★ THE WORLD'S MOST ICONIC ★</span>
        </div>
      </footer>
    </div>
  )
}
