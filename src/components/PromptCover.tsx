import { useId } from 'react'
import type { LibraryCategory } from '../data/promptLibrary'

export function PromptCover({ category, variant = 0 }: { category: LibraryCategory; variant?: number }) {
  const id = useId()
  const color = category.color
  return (
    <svg viewBox="0 0 480 240" aria-hidden="true" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={color} opacity=".15" /></pattern>
      </defs>
      <rect width="480" height="240" fill="#15191e" />
      <rect width="480" height="240" fill={`url(#${id})`} />
      <circle cx={380 - variant * 25} cy="70" r="110" fill={color} opacity=".08" />
      <g transform={`translate(${variant % 2 ? 16 : -8} 0)`} stroke={color} strokeWidth="2" strokeLinejoin="round">
        {category.symbol === 'portrait' ? <>
          <path d="M140 210V30h180v180" fill="none" opacity=".5" /><ellipse cx="230" cy="98" rx="39" ry="48" fill={color} opacity=".5" />
          <path d="M150 240v-36q80-100 160 0v36" fill={color} opacity=".3" /><path d="M100 50h30M100 50v30M350 160v30h-30" fill="none" />
          <circle cx="345" cy="60" r="5" fill={color} />
        </> : category.symbol === 'building' ? <>
          <path d="M100 200V92l115-55 150 60v103z" fill={color} opacity=".1" /><path d="M100 200V92l115-55 150 60v103M215 37v163M100 92l115 55 150-50M215 147v53" fill="none" />
          <path d="M240 190v-55l33-11v66M300 180v-55l33-11v66M125 170v-45l55 27v45" fill={color} opacity=".45" /><path d="M65 200h340" />
        </> : category.symbol === 'product' ? <>
          <ellipse cx="243" cy="199" rx="115" ry="18" fill={color} opacity=".1" /><path d="M201 65h78v118q-39 20-78 0z" fill={color} opacity=".35" />
          <rect x="209" y="40" width="62" height="25" rx="5" fill={color} opacity=".8" /><rect x="213" y="102" width="54" height="44" rx="2" fill="#15191e" /><path d="M224 116h32M231 130h18" />
          <circle cx="338" cy="147" r="32" fill="none" opacity=".4" /><path d="M125 170q-35-60 15-80q40 40-15 80z" fill={color} opacity=".3" />
        </> : category.symbol === 'film' ? <>
          <rect x="95" y="48" width="290" height="150" rx="8" fill={color} opacity=".15" /><path d="M218 89l56 34-56 34z" fill={color} />
          {[110, 155, 200, 245, 290, 335].map(x => <g key={x}><rect x={x} y="57" width="20" height="10" rx="2" fill={color} opacity=".5" /><rect x={x} y="177" width="20" height="10" rx="2" fill={color} opacity=".5" /></g>)}
        </> : category.symbol === 'code' || category.symbol === 'layout' ? <>
          <rect x="90" y="40" width="300" height="164" rx="9" fill="#15191e" /><path d="M90 68h300" /><circle cx="108" cy="54" r="3" fill={color} /><circle cx="122" cy="54" r="3" fill={color} opacity=".5" />
          {category.symbol === 'code' ? <><path d="M190 104l-28 25 28 25M290 104l28 25-28 25M252 92l-25 75" fill="none" strokeWidth="5" /></> : <><rect x="108" y="85" width="76" height="98" rx="3" fill={color} opacity=".2" /><rect x="200" y="85" width="169" height="40" rx="3" fill={color} opacity=".4" /><path d="M200 145h165M200 163h115M200 180h145" opacity=".5" /></>}
        </> : category.symbol === 'chart' ? <>
          <path d="M110 60v135h265" fill="none" opacity=".5" /><rect x="143" y="126" width="40" height="69" rx="3" fill={color} opacity=".25" /><rect x="211" y="97" width="40" height="98" rx="3" fill={color} opacity=".45" /><rect x="279" y="65" width="40" height="130" rx="3" fill={color} opacity=".7" /><path d="M140 103l87-36 86-29M294 34l20 4-6 20" fill="none" />
        </> : category.symbol === 'book' ? <>
          <path d="M240 72q-65-40-137-17v129q72-23 137 17q65-40 137-17V55q-72-23-137 17z" fill={color} opacity=".18" /><path d="M240 72v129M128 84q47-10 86 12M128 110q47-10 86 12M128 136q47-10 86 12M266 95q40-22 85-12M266 122q40-22 85-12M266 148q40-22 85-12" fill="none" />
        </> : <>
          <ellipse cx="240" cy="193" rx="130" ry="16" fill={color} opacity=".1" /><circle cx="181" cy="112" r="62" fill={color} opacity=".5" /><path d="M253 48l75 43v85l-75-43z" fill={color} opacity=".3" /><path d="M253 48l-55 34 75 43 55-34M273 125v85l55-34" fill={color} opacity=".7" /><circle cx="345" cy="64" r="19" fill={color} opacity=".8" />
        </>}
      </g>
    </svg>
  )
}
