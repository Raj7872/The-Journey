'use client'

import { memo, useId } from 'react'

// Deterministic, batched geometry: thousands of blades in eight SVG paths,
// rather than thousands of elements or continuously generated particles.
function geometry() {
  let seed = 1987
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const grass = Array.from({ length: 8 }, () => '')
  for (let i = 0; i < 4200; i++) {
    const depth = random() ** .65
    const y = 538 + depth * 380
    const x = random() * 1480 - 20
    const pathCenter = 835 - depth * 225
    if (Math.abs(x - pathCenter) < 8 + depth * 115) continue
    const h = 2 + depth * (9 + random() * 22)
    const bend = (random() - .5) * h
    const bucket = i % 8
    grass[bucket] += `M${x.toFixed(1)} ${y.toFixed(1)}q${(bend*.4).toFixed(1)} ${(-h*.7).toFixed(1)} ${bend.toFixed(1)} ${(-h).toFixed(1)}q${(-bend*.3+1+depth).toFixed(1)} ${(h*.5).toFixed(1)} ${(1+depth-bend).toFixed(1)} ${h.toFixed(1)}z`
  }
  const leaves = Array.from({length:135}, () => {
    const a=random()*Math.PI*2, r=Math.sqrt(random())
    return {x:Math.cos(a)*210*r,y:Math.sin(a)*97*r,r:12+random()*29,tone:Math.floor(random()*4)}
  })
  const leafTexture = Array.from({length:8}, () => '')
  for (let i=0; i<1900; i++) {
    const a=random()*Math.PI*2, r=Math.sqrt(random()), x=Math.cos(a)*205*r, y=Math.sin(a)*94*r
    const size=1.4+random()*3.2
    leafTexture[i%8] += `M${x.toFixed(1)} ${y.toFixed(1)}q${size.toFixed(1)} ${(-size).toFixed(1)} ${(size*2).toFixed(1)} 0q${(-size).toFixed(1)} ${size.toFixed(1)} ${(-size*2).toFixed(1)} 0z`
  }
  const pebbles = Array.from({length:90}, () => {
    const d=random(), y=560+d*340
    return {x:835-d*225+(random()-.5)*(15+d*195),y,r:.5+d*2}
  })
  return {grass,leaves,pebbles,leafTexture}
}
const MODEL = geometry()

export const MeadowLandscape = memo(function MeadowLandscape({ view = 'wide' }: { view?: 'wide' | 'bench' | 'close' | 'letter' | 'ending' }) {
  const id = useId()
  const close = view === 'bench' || view === 'close'
  const reading = view === 'letter' || view === 'ending'
  return <div aria-hidden="true" style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
    <svg viewBox="0 0 1440 900" width="100%" height="100%" preserveAspectRatio="none" style={{display:'block'}}>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#90b4bc" /><stop offset=".36" stopColor="#cad5c6" /><stop offset=".64" stopColor="#f4d5a2" /><stop offset="1" stopColor="#b8bc88" /></linearGradient>
        <radialGradient id={`${id}-sun`}><stop stopColor="#fff9da" stopOpacity=".95" /><stop offset=".15" stopColor="#fff0bb" stopOpacity=".6" /><stop offset="1" stopColor="#f5dba9" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-ground`} x2=".4" y2="1"><stop stopColor="#a6af79" /><stop offset=".36" stopColor="#7f9564" /><stop offset=".73" stopColor="#4f704c" /><stop offset="1" stopColor="#2e4c39" /></linearGradient>
        <linearGradient id={`${id}-path`} x1=".65" y1="0" x2=".2" y2="1"><stop stopColor="#d0c5a0" /><stop offset=".55" stopColor="#bfb185" /><stop offset="1" stopColor="#857957" /></linearGradient>
        <linearGradient id={`${id}-trunk`}><stop stopColor="#303b30" /><stop offset=".55" stopColor="#786b48" /><stop offset=".75" stopColor="#b6a172" /><stop offset="1" stopColor="#4e4c35" /></linearGradient>
        {['#526b43','#71854b','#8d9c5e','#b3b475'].map((c,i)=><radialGradient key={c} id={`${id}-leaf${i}`} cx=".72" cy=".23"><stop stopColor={c} /><stop offset="1" stopColor={['#364f35','#45613c','#60774b','#778950'][i]} /></radialGradient>)}
        <linearGradient id={`${id}-cloud`} x2="0" y2="1"><stop stopColor="#f8edcf" stopOpacity=".68" /><stop offset="1" stopColor="#ede4c9" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="1440" height="900" fill={`url(#${id}-sky)`} />
      <ellipse cx="1095" cy="425" rx="440" ry="340" fill={`url(#${id}-sun)`} />
      <circle cx="1095" cy="425" r="27" fill="#fff3c6" opacity=".8" />
      <g fill={`url(#${id}-cloud)`}>
        <path d="M-80 183Q50 145 107 167Q170 101 247 145Q306 127 350 157Q422 142 489 184Q260 215 -80 203Z" />
        <path d="M795 127Q880 102 934 119Q974 82 1031 106Q1110 83 1168 129Q1290 113 1455 155Q1095 166 795 145Z" />
        <path d="M295 326Q380 303 439 316Q510 272 567 309Q626 297 680 327Q489 348 295 338Z" opacity=".6" />
      </g>
      <path d="M0 511Q130 459 231 479Q381 394 530 478Q663 430 789 482Q941 448 1071 478Q1260 404 1440 469V670H0Z" fill="#8da395" opacity=".55" />
      <path d="M0 545Q157 487 296 528Q473 459 622 532Q815 489 1009 527Q1201 479 1440 516V700H0Z" fill="#7d957a" opacity=".6" />
      <path d="M0 560Q235 524 434 551Q710 573 923 526Q1200 485 1440 552V900H0Z" fill={`url(#${id}-ground)`} />
      <path d="M838 535Q791 598 814 649Q801 719 489 900H742Q824 740 855 654Q826 588 846 535Z" fill={`url(#${id}-path)`} />
      <path d="M0 650Q211 580 448 622Q287 662 0 720Z M962 583Q1234 534 1440 601V640Q1253 582 962 583Z" fill="#c8c593" opacity=".18" />
      {MODEL.pebbles.map((p,i)=><ellipse key={i} cx={p.x} cy={p.y} rx={p.r*1.7} ry={p.r*.6} fill={i%2 ? '#ddd0a3' : '#625f45'} opacity=".38" />)}
      {MODEL.grass.map((d,i)=><path key={i} d={d} fill={['#405e39','#5d7845','#87995a','#a5ad6e','#324f39','#6e8650','#b6b981','#527044'][i]} opacity={i===6 ? .58 : .76} />)}
      {/* A broad tree with individual canopy volumes and a rooted, branching trunk. */}
      <g transform={close ? 'translate(270 663) scale(1.85)' : 'translate(945 557) scale(.56)'}>
        <ellipse cx="20" cy="6" rx="176" ry="18" fill="#243f32" opacity=".2" transform="rotate(8)" />
        <path d="M-18 7Q-3 -51 -14 -123L-48 -180L-26 -170L0 -139L7 -208L19 -210L17 -144L69 -194L79 -188L32 -127Q14 -76 24 0L42 13L10 6L-4 9L-3 0Z" fill={`url(#${id}-trunk)`} />
        <path d="M5 -3Q-3 -70 6 -123M10 -126L15 -181 M-7 -112L-33 -164" fill="none" stroke="#baa77a" strokeOpacity=".34" strokeWidth="2" />
        <g transform="translate(7 -215)">{MODEL.leaves.map((l,i)=><ellipse key={i} cx={l.x} cy={l.y} rx={l.r} ry={l.r*.73} fill={`url(#${id}-leaf${l.tone})`} />)}{MODEL.leafTexture.map((d,i)=><path key={`texture-${i}`} d={d} fill={['#344d31','#5b7043','#91a064','#c0bc79','#435b35','#6c8450','#a0ad71','#718b53'][i]} opacity=".66" />)}</g>
      </g>
      {/* Small near wildflowers catch the same light as the grass. */}
      <g>{Array.from({length:35},(_,i)=>{const x=i<17?28+i*23:1000+(i-17)*26,y=716+(i*43)%176,s=2+(i%4);return <g key={i}><path d={`M${x} ${y+22}q5 -11 0 -22`} fill="none" stroke="#81925a" /><ellipse cx={x} cy={y} rx={s*1.4} ry={s*.8} fill={i%3?'#e8d7a0':'#baaeab'} /><circle cx={x} cy={y} r={s*.35} fill="#9b783d" /></g>})}</g>
      {reading && <ellipse cx="720" cy="370" rx="550" ry="340" fill={`url(#${id}-sun)`} opacity=".8" />}
    </svg>
    {reading && <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 38% 34% at 50% 43%, rgba(255,244,215,.68), rgba(255,239,207,.3) 65%, transparent 100%)'}} />}
  </div>
})
