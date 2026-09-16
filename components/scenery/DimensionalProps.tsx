'use client'

import { useId, type CSSProperties } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Small shaded vector models. Geometry stays in one flat hit-testing plane;
// no texture downloads, WebGL contexts, or nested preserve-3d layers.
export function TimberBench({ width = 200, style }: { width?: number; style?: CSSProperties }) {
  const id = useId()
  return <svg aria-hidden="true" width={width} height={width * 0.57} viewBox="0 0 260 148" style={{ display: 'block', overflow: 'visible', ...style }}>
    <defs><linearGradient id={id} x2="0.15" y2="1"><stop stopColor="#bb8850" /><stop offset=".35" stopColor="#78502e" /><stop offset="1" stopColor="#392b22" /></linearGradient></defs>
    <ellipse cx="133" cy="136" rx="124" ry="11" fill="#050b10" opacity=".35" />
    <g fill="#1c292b" stroke="#6a7364" strokeWidth="1.3">
      <path d="M44 46L50 45L49 130L41 134Z M211 42L217 40L218 125L211 129Z" />
      <path d="M30 87L37 85L29 139L21 139Z M221 84L228 83L239 134L231 135Z" />
    </g>
    {[0, 1, 2].map(i => <g key={i}><path d={`M31 ${27+i*17}L217 ${18+i*17}L223 ${30+i*17}L33 ${41+i*17}Z`} fill={`url(#${id})`} stroke="#c1955c" strokeWidth=".6" /><path d={`M33 ${38+i*17}L223 ${28+i*17}`} stroke="#271f18" strokeWidth="2" /></g>)}
    <path d="M34 83L213 72L244 92L23 107Z" fill="#9b7044" stroke="#d1a36e" strokeWidth=".8" />
    <path d="M23 107L244 92V102L23 116Z" fill={`url(#${id})`} /><path d="M244 92L213 72V81L244 102Z" fill="#4b3725" />
    <g stroke="#493425" strokeWidth="1.4"><path d="M29 98L233 84 M34 89L221 78" /></g>
    <g fill="none" stroke="#314043" strokeWidth="5" strokeLinecap="round"><path d="M26 94V68Q26 60 39 62L58 70V86 M218 82V56Q218 50 228 56L244 65V95" /></g>
    {[44, 205].map(x => <g key={x} fill="#d3b778">{[34,51,68].map(y => <circle key={y} cx={x} cy={y} r="1.5" />)}</g>)}
  </svg>
}

export function PaneledDoor({ width = 180, height = 290, open = false, label }: { width?: number; height?: number; open?: boolean; label?: string }) {
  const id = useId()
  return <svg aria-hidden="true" width={width} height={height} viewBox="0 0 180 290" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
    <defs><linearGradient id={id}><stop stopColor="#8f7352" /><stop offset=".18" stopColor="#493b30" /><stop offset=".8" stopColor="#2a2826" /><stop offset="1" stopColor="#a08a62" /></linearGradient><linearGradient id={`${id}-light`} x2="0" y2="1"><stop stopColor="#f2d59d" /><stop offset="1" stopColor="#897359" /></linearGradient></defs>
    <path d="M-12 279L159 265L193 292H-27Z" fill="#57483a" /><path d="M-27 292H193V297H-27Z" fill="#1f2020" />
    <rect width="180" height="282" rx="4" fill={`url(#${id})`} stroke="#ac9062" />
    <rect x="13" y="16" width="154" height="266" fill="#101820" />
    <rect x="23" y="25" width="134" height="248" fill={`url(#${id}-light)`} opacity={open ? '.85' : '.18'} />
    <path d={open ? 'M19 20L67 36V277L19 272Z' : 'M19 20H161V275H19Z'} fill={`url(#${id})`} stroke="#c6a46b" />
    {!open && <><rect x="32" y="39" width="116" height="104" rx="45" fill={`url(#${id}-light)`} stroke="#191e20" strokeWidth="6" /><path d="M89 40V143 M33 103H145" stroke="#493b2d" strokeWidth="4" /><path d="M32 160H148V259H32Z M39 168H141V251H39Z" fill="none" stroke="#a58b64" strokeOpacity=".5" /><path d="M136 165V191" stroke="#e3c88f" strokeWidth="4" /></>}
    {open && <><path d="M155 25L167 17V280L155 272Z" fill="#362d24" /><path d="M97 54H143V215H97Z" fill="#fcdea8" opacity=".5" /><path d="M25 273L3 289H180L156 273Z" fill="#dbc08a" opacity=".6" /></>}
    {label && <><rect x="23" y="-27" width="134" height="21" rx="2" fill="#28332f" stroke="#a0885d" /><text x="90" y="-13" fill="#e0c593" textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="Georgia,serif">{label}</text></>}
  </svg>
}

export function SunflowerBouquet({ width = 100, single = false, vase = true }: { width?: number; single?: boolean; vase?: boolean }) {
  const id = useId()
  const petalCount = width < 40 ? 12 : 20
  const seedCount = width < 40 ? 8 : 32
  const blooms = single ? [[52, 38, 1]] : [[28, 45, .78], [75, 49, .8], [48, 26, .94], [58, 65, .76], [23, 77, .58]]
  return <svg aria-hidden="true" width={width} height={width * 1.55} viewBox="0 0 104 162" style={{ display: 'block', overflow: 'visible' }}>
    <defs>
      <linearGradient id={`${id}-petal`} x2=".7" y2="1"><stop stopColor="#fff0a2" /><stop offset=".38" stopColor="#eebe38" /><stop offset="1" stopColor="#9e5b18" /></linearGradient>
      <radialGradient id={`${id}-seed`} cx=".36" cy=".3"><stop stopColor="#94713a" /><stop offset=".45" stopColor="#604222" /><stop offset="1" stopColor="#2f251b" /></radialGradient>
      <linearGradient id={`${id}-vase`}><stop stopColor="#284c4c" /><stop offset=".3" stopColor="#9bb5a6" /><stop offset=".46" stopColor="#6b9189" /><stop offset="1" stopColor="#25494c" /></linearGradient>
    </defs>
    <ellipse cx="54" cy="153" rx="31" ry="5" fill="#111d19" opacity=".25" />
    {blooms.map(([x = 50, y = 40], i) => <path key={i} d={`M54 146Q${x+12} 97 ${x} ${y}`} fill="none" stroke="#536c35" strokeWidth="2.7" />)}
    <g fill="#456239" stroke="#91a461" strokeWidth=".6"><path d="M49 111Q13 119 12 91Q41 88 49 111Z M58 99Q64 72 91 82Q85 107 58 99Z M48 130Q22 128 26 109Q47 108 48 130Z" /><path d="M16 94L46 110 M61 97L85 85" fill="none" /></g>
    {blooms.map(([x, y, scale], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${i*19-15}) scale(${scale} ${Number(scale)*.85})`}>
      {Array.from({length:petalCount},(_,p) => <path key={p} d="M-4 -7Q-10 -18 -2 -30Q7 -24 5 -11L0 -5Z" transform={`rotate(${p*360/petalCount})`} fill={`url(#${id}-petal)`} stroke="#c5942c" strokeWidth=".35" />)}
      <circle r="12" fill={`url(#${id}-seed)`} stroke="#b78d37" strokeWidth="1.5" />
      {Array.from({length:seedCount},(_,p) => {const a=p*2.4, r=Math.sqrt(p/seedCount)*10; return <ellipse key={p} cx={Math.cos(a)*r} cy={Math.sin(a)*r} rx=".65" ry=".85" fill={p%3 ? '#c3a062' : '#382817'} opacity=".65" />})}
    </g>)}
    {vase ? <><path d="M39 117Q44 128 33 141Q32 155 53 156Q76 155 74 141Q63 128 68 117Z" fill={`url(#${id}-vase)`} stroke="#adc2ac" strokeWidth=".8" /><ellipse cx="53" cy="117" rx="15" ry="3" fill="#24413b" stroke="#9aad92" /><path d="M42 128Q39 148 44 152" fill="none" stroke="#e6eed0" strokeOpacity=".4" strokeWidth="2" /></> : <path d="M44 139Q52 130 62 139L54 147Z" fill="#c29b77" />}
  </svg>
}

export function UpholsteredChair({ width = 120 }: { width?: number }) {
  const id = useId()
  return <svg aria-hidden="true" width={width} height={width*1.14} viewBox="0 0 120 137" style={{display:'block',overflow:'visible'}}>
    <defs><linearGradient id={id} x2=".7" y2="1"><stop stopColor="#ad7952" /><stop offset=".4" stopColor="#70482e" /><stop offset="1" stopColor="#342a23" /></linearGradient></defs>
    <ellipse cx="60" cy="128" rx="57" ry="8" fill="#070a0c" opacity=".4" />
    <path d="M18 100L22 130H29L30 103 M89 103L95 129H103L102 100" fill="#302821" stroke="#7e6344" />
    <path d="M20 88L16 23Q17 10 31 8L86 4Q99 6 100 20L104 89Z" fill={`url(#${id})`} stroke="#bb9367" />
    <path d="M29 69L27 26Q28 20 34 19L85 15Q91 16 91 25L93 71Z" fill="none" stroke="#d2ad80" strokeOpacity=".4" />
    {[40,61,82].map(x=><g key={x}><path d={`M${x-6} 32L${x} 41L${x+6} 30 M${x-6} 52L${x} 41L${x+6} 52`} stroke="#392e24" fill="none" opacity=".4" /><circle cx={x} cy="41" r="2" fill="#37291f" /></g>)}
    <path d="M22 76L89 69L108 96L12 105Z" fill="#a27750" stroke="#c19a6a" /><path d="M12 105L108 96V112L14 120Z" fill={`url(#${id})`} />
    <path d="M9 63Q5 55 15 52Q23 51 25 59L31 96Q24 107 15 104Z M93 56Q92 48 101 47Q110 48 110 57L116 96Q109 103 100 99Z" fill={`url(#${id})`} stroke="#b99065" />
    <path d="M32 86L90 80 M24 111L95 104" stroke="#eed4a2" strokeOpacity=".25" />
  </svg>
}

export function Hearth({ width = 180 }: { width?: number }) {
  const id = useId()
  const reducedMotion = useReducedMotion()
  return <svg aria-hidden="true" width={width} height={width*.85} viewBox="0 0 200 170" style={{display:'block',overflow:'visible'}}>
    <defs><linearGradient id={id} x2=".8" y2="1"><stop stopColor="#887966" /><stop offset=".5" stopColor="#514a40" /><stop offset="1" stopColor="#292b28" /></linearGradient><radialGradient id={`${id}-fire`}><stop stopColor="#f7b55a" stopOpacity=".5" /><stop offset="1" stopColor="#d66d29" stopOpacity="0" /></radialGradient></defs>
    <ellipse cx="103" cy="158" rx="115" ry="25" fill={`url(#${id}-fire)`} />
    <path d="M19 143L172 133L195 154H4Z" fill="#82735d" /><path d="M4 154H195V163H4Z" fill="#3e3c35" />
    <path d="M24 38H174V144H24Z" fill={`url(#${id})`} stroke="#9f8c6d" /><path d="M174 38L187 28V134L174 144Z" fill="#363b36" />
    <path d="M15 28L172 19L190 30L22 42Z" fill="#a08b69" /><path d="M22 42L190 30V41L22 54Z" fill="#534736" />
    <path d="M48 143V92Q48 61 98 60Q150 61 150 92V143Z" fill="#151c1a" stroke="#2c2b25" strokeWidth="8" />
    <g stroke="#a18c6d" strokeOpacity=".22"><path d="M26 75H51 M25 102H46 M25 128H47 M151 80H174 M152 108H174 M154 130H174" /></g>
    <ellipse cx="98" cy="131" rx="48" ry="25" fill={`url(#${id}-fire)`} />
    <g fill="#c7732c" style={{transformOrigin:'100px 144px',animation: reducedMotion ? 'none' : 'hearth-breathe 2.7s ease-in-out infinite alternate'}}><path d="M66 133Q51 110 74 89Q67 117 85 106Q100 125 84 140Z" /><path d="M91 137Q76 111 104 77Q93 105 113 118Q124 138 105 144Z" /><path d="M117 139Q106 119 132 101Q125 122 140 131L135 143Z" /></g>
    <path d="M88 137Q81 124 96 110Q92 126 108 140Z" fill="#f6d28a" />
    <path d="M59 143L131 137 M71 135L139 146" stroke="#3a2c21" strokeWidth="9" strokeLinecap="round" /><path d="M63 141L127 136" stroke="#b76937" strokeWidth="1" />
    <style>{`@keyframes hearth-breathe { from { transform: scaleY(.89); opacity: .8; } to { transform: scaleY(1.04); opacity: 1; } }`}</style>
    <g stroke="#202a29" strokeWidth="3"><path d="M54 146H148 M63 130V151 M86 130V151 M112 130V151 M138 130V151" /></g>
  </svg>
}

export function RecordPlayer({ width = 110 }: { width?: number }) {
  const reducedMotion = useReducedMotion()
  return <svg aria-hidden="true" width={width} height={width*.65} viewBox="0 0 140 90" style={{display:'block',overflow:'visible'}}>
    <path d="M10 27L110 17L133 65L20 78Z" fill="#8c6841" stroke="#c3a275" /><path d="M20 78L133 65V78L20 90Z" fill="#483727" /><path d="M10 27L20 78V90L10 38Z" fill="#352d25" />
    <ellipse cx="67" cy="50" rx="39" ry="24" fill="#151d20" stroke="#4d5550" />
    {[31,24,17].map(r=><ellipse key={r} cx="67" cy="50" rx={r} ry={r*.6} fill="none" stroke="#8d9180" strokeOpacity=".25" />)}
    <ellipse cx="67" cy="50" rx="10" ry="6" fill="#b99856" /><circle cx="67" cy="50" r="1.5" fill="#f7e4b9" /><g style={{transformOrigin:'67px 50px',animation:reducedMotion ? 'none' : 'record-label-turn 4s linear infinite'}}><circle cx="72" cy="50" r="1" fill="#674b29" /></g><style>{`@keyframes record-label-turn { to { transform: rotate(360deg); } }`}</style>
    <path d="M112 31L110 48L91 62" fill="none" stroke="#d7c797" strokeWidth="3" /><path d="M87 59L94 63" stroke="#1a2427" strokeWidth="5" /><circle cx="112" cy="31" r="5" fill="#404945" />
    <path d="M35 81L99 74" stroke="#ccb17c" strokeWidth="2" />
  </svg>
}

export function KeepsakeBox({ width = 95, open = false }: { width?: number; open?: boolean }) {
  const id = useId()
  return <svg aria-hidden="true" width={width} height={width*.74} viewBox="0 0 160 118" style={{display:'block',overflow:'visible'}}>
    <defs><linearGradient id={id} x2=".3" y2="1"><stop stopColor="#b86652" /><stop offset="1" stopColor="#663b32" /></linearGradient></defs>
    <ellipse cx="81" cy="110" rx="74" ry="7" fill="#263623" opacity=".3" />
    <path d="M18 47L113 32L145 51L46 70Z" fill={open?'#342721':'#cf8c70'} stroke="#dfb188" />
    <path d="M18 47L46 70V109L18 83Z" fill="#703d32" /><path d="M46 70L145 51V96L46 109Z" fill={`url(#${id})`} stroke="#b6815c" />
    {open ? <><path d="M16 44L6 6L104 0L113 30Z" fill="#ae7054" stroke="#d3a780" /><path d="M24 35L16 12L97 7L104 26Z" fill="#6c4738" /><path d="M32 50L105 40L128 52L47 66Z" fill="#d8c3a0" opacity=".55" /><path d="M45 73L141 55" stroke="#e2be91" /></> : <><path d="M18 47L113 32L145 51L46 70Z" fill="#bc8062" /><path d="M81 38L108 58V101L96 103V61L68 40Z" fill="#d9bb7e" /><path d="M31 57L127 40L137 46L40 65V102L31 94Z" fill="#d9bb7e" /><path d="M83 47Q47 16 59 17Q82 15 86 43Q97 9 112 18Q122 30 88 47Z" fill="none" stroke="#ead39b" strokeWidth="5" /></>}
    <path d="M93 77L105 75V85L93 87Z" fill="#bda068" /><circle cx="99" cy="81" r="1.5" fill="#604a33" />
  </svg>
}

export function DistantTrain({ width = 190 }: { width?: number }) {
  const id=useId()
  return <svg aria-hidden="true" width={width} height={width*.31} viewBox="0 0 300 93" style={{display:'block',overflow:'visible'}}>
    <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#637369" /><stop offset=".5" stopColor="#344f43" /><stop offset="1" stopColor="#20332f" /></linearGradient></defs>
    <ellipse cx="150" cy="87" rx="146" ry="5" fill="#243a2f" opacity=".4" />
    <g fill="#27332f" stroke="#8c967d" strokeWidth="2">{[35,63,213,241].map(x=><circle key={x} cx={x} cy="78" r="10" />)}</g>
    <path d="M9 21H277V72H9Z" fill={`url(#${id})`} stroke="#a49d71" /><path d="M277 21L294 15V65L277 72Z" fill="#283d34" />
    <path d="M5 22Q7 5 23 5H265L294 15L277 22Z" fill="#7f8a81" stroke="#b2b3a0" />
    {[21,60,99,138,177,224].map(x=><g key={x}><rect x={x} y="29" width="27" height="29" rx="3" fill="#d6c798" stroke="#152e28" strokeWidth="3" /><path d={`M${x+3} 32L${x+21} 32L${x+3} 50Z`} fill="#f4e2b3" opacity=".5" /></g>)}
    <path d="M9 65H276" stroke="#c3ad71" /><path d="M9 73H276" stroke="#172b29" strokeWidth="4" /><ellipse cx="284" cy="43" rx="3" ry="5" fill="#fff0bd" />
  </svg>
}
