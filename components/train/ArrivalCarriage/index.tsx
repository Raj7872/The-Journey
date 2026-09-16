'use client'

import { useId } from 'react'
import { StationObject } from '@/components/station/StationObject'
import { SteamWisp } from '@/components/common/SteamWisp'
import { TIMING } from '@/lib/constants/timing'

interface Props {
  doorsOpen: boolean
  stopped: boolean
  conductorReady: boolean
  reducedMotion: boolean
  paused: boolean
  onBoard: () => void
}

export function ArrivalCarriage({ doorsOpen, stopped, conductorReady, reducedMotion, paused, onBoard }: Props) {
  const id = useId().replace(/:/g, '')
  return (
    <div style={{ position: 'absolute', bottom: '24%', left: '50%', width: 800, height: 260, transform: 'translateX(-50%)', transformOrigin: '50% 100%', animation: reducedMotion ? 'none' : `carriage-approach ${TIMING.TRAIN_ARRIVAL_STOP - TIMING.TRAIN_ARRIVAL_LIGHT}ms cubic-bezier(.25,.55,.35,1) both`, animationPlayState: paused ? 'paused' : 'running' }}>
      <svg aria-hidden="true" width="800" height="260" viewBox="0 0 800 260" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${id}-body`} x2="0" y2="1"><stop stopColor="#46534b" /><stop offset="0.18" stopColor="#293a33" /><stop offset="0.65" stopColor="#192b26" /><stop offset="1" stopColor="#0a1516" /></linearGradient>
          <linearGradient id={`${id}-roof`} x2="0" y2="1"><stop stopColor="#151d24" /><stop offset="0.5" stopColor="#596066" /><stop offset="1" stopColor="#252c32" /></linearGradient>
          <linearGradient id={`${id}-glass`} x2="1" y2="1"><stop stopColor="#f4d69a" /><stop offset="0.5" stopColor="#b98649" /><stop offset="1" stopColor="#584531" /></linearGradient>
          <radialGradient id={`${id}-light`}><stop stopColor="#ffdca0" stopOpacity="0.28" /><stop offset="1" stopColor="#ffdca0" stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="413" cy="244" rx="380" ry="15" fill="#020508" opacity="0.65" />
        <path d="M30 209H747L783 199V227L747 239H30Z" fill="#0a1015" />
        {[110, 178, 613, 681].map(x => <g key={x}>
          <circle cx={x} cy="228" r="20" fill="#05090d" stroke="#414951" strokeWidth="3" />
          <circle cx={x} cy="228" r="10" fill="#1a2228" stroke="#555b5a" strokeWidth="2" />
          <circle cx={x} cy="228" r="3" fill="#9a8a68" />
        </g>)}
        <path d="M75 222H211 M579 222H714" stroke="#333d40" strokeWidth="9" />
        <path d="M30 58L747 58V211H30Z" fill={`url(#${id}-body)`} stroke="#7a7961" strokeWidth="1" />
        <path d="M747 58L784 39V194L747 211Z" fill="#111d20" stroke="#69736b" strokeWidth="1" />
        <path d="M20 61Q23 30 52 28H733Q761 27 784 39L747 61Z" fill={`url(#${id}-roof)`} stroke="#7d827b" strokeWidth="1" />
        <path d="M57 35H733 M30 157H747 M30 195H747" stroke="#baa376" strokeOpacity="0.5" />
        <path d="M30 201H747" stroke="#02090d" strokeWidth="4" />
        {[55, 144, 233, 322, 411, 597, 675].map((x, i) => <g key={x}>
          <rect x={x} y="73" width="61" height="74" rx="7" fill="#0a1517" stroke="#8e805e" strokeWidth="2" />
          <rect x={x + 5} y="78" width="51" height="62" rx="4" fill={`url(#${id}-glass)`} />
          <path d={`M${x + 7} 80L${x + 17} 83V137L${x + 7} 139Z M${x + 54} 80L${x + 44} 83V137L${x + 54} 139Z`} fill="#654739" opacity="0.6" />
          <path d={`M${x + 8} 130Q${x + 30} ${i % 2 ? 111 : 119} ${x + 52} 130V139H${x + 8}Z`} fill="#332e24" opacity="0.6" />
          <path d={`M${x + 7} 84L${x + 38} 84L${x + 7} 116Z`} fill="#fff4d8" opacity="0.12" />
          <path d={`M${x + 4} 148H${x + 57}`} stroke="#d3b784" strokeOpacity="0.5" />
        </g>)}
        <rect x="507" y="70" width="66" height="143" rx="5" fill={doorsOpen ? '#e2b77a' : '#0d191a'} stroke="#a28b5d" strokeWidth="2" />
        {doorsOpen && <>
          <path d="M511 206L474 258H632L569 206Z" fill={`url(#${id}-light)`} />
          <path d="M513 78H566V199H513Z" fill="#7a5638" /><path d="M524 78H558V199H524Z" fill="#dcb77b" />
        </>}
        <g style={{ transformOrigin: '508px 140px', transform: doorsOpen ? 'perspective(500px) rotateY(-76deg)' : 'perspective(500px) rotateY(0deg)', transition: reducedMotion ? 'none' : 'transform 1.4s ease' }}>
          <rect x="508" y="71" width="64" height="141" rx="4" fill={`url(#${id}-body)`} stroke="#8c805e" />
          <rect x="517" y="80" width="45" height="62" rx="4" fill={`url(#${id}-glass)`} stroke="#0c181a" strokeWidth="4" />
          <path d="M554 158V173" stroke="#dec48a" strokeWidth="3" />
        </g>
        <path d="M502 217H578 M497 225H583" stroke="#7b8177" strokeWidth="5" />
        <rect x="308" y="169" width="141" height="17" rx="2" fill="#aa9060" stroke="#dcc48b" strokeWidth="1" />
        <text x="378" y="181" textAnchor="middle" fill="#242823" fontSize="9" letterSpacing="2" fontFamily="Georgia,serif">WORTH THE WAIT</text>
        <ellipse cx="768" cy="110" rx="7" ry="12" fill="#ffe5af" />
        <ellipse cx="782" cy="116" rx="65" ry="44" fill={`url(#${id}-light)`} />
        {conductorReady && <g fill="#111c23" stroke="#ba9e66" strokeWidth="0.6">
          <circle cx="593" cy="173" r="7" /><path d="M584 167H602L599 163H587Z M585 182Q593 178 600 182L605 210H581Z M587 209L585 231 M597 209L600 231" strokeWidth="3" />
          <path d="M602 187L613 195" strokeWidth="4" /><rect x="610" y="194" width="8" height="12" rx="2" fill="#f4cc87" />
        </g>}
      </svg>
      {stopped && <div aria-hidden="true" style={{ position: 'absolute', bottom: 12, left: 115, display: 'flex', gap: 145 }}><SteamWisp width={55} height={65} opacity={0.24} /><SteamWisp width={65} height={55} opacity={0.18} /></div>}
      {doorsOpen && <>
        <div aria-hidden="true" style={{ position: 'absolute', left: 511, top: 49, padding: '3px 7px', background: '#e6d7b9', color: '#493726', font: 'italic 11px Georgia, serif', transform: 'rotate(-3deg)', boxShadow: '0 2px 4px #0008' }}>Take your time.</div>
        <StationObject label="Board the train" hint="Board" onClick={onBoard} style={{ position: 'absolute', left: 506, top: 72, width: 68, height: 155 }}><div style={{ width: '100%', height: '100%' }} /></StationObject>
      </>}
      <style>{`@keyframes carriage-approach {
        0% { transform: translate(-1350px, 0px) scale(.65); opacity: .55; }
        45% { opacity: 1; }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }`}</style>
    </div>
  )
}
