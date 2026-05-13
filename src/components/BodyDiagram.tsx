import type { MuscleKey } from '../db/schema'

interface Props {
  highlights: MuscleKey[]
  size?: number
}

const HL = '#ff7a7a'
const BASE = '#1d2547'
const SKIN = '#2a3566'
const OUTLINE = '#3c4a85'

function isOn(key: MuscleKey, highlights: MuscleKey[]) {
  return highlights.includes(key) ? HL : BASE
}

export default function BodyDiagram({ highlights, size = 220 }: Props) {
  const h = highlights
  return (
    <svg
      viewBox="0 0 200 280"
      width={size}
      height={(size * 280) / 200}
      role="img"
      aria-label="Muscle group diagram"
    >
      {/* Front view */}
      <g transform="translate(0,0)">
        <text x="25" y="14" fill="#7d88c0" fontSize="10" fontFamily="system-ui">
          Front
        </text>
        {/* head */}
        <circle cx="50" cy="32" r="11" fill={SKIN} stroke={OUTLINE} />
        {/* neck */}
        <rect x="46" y="42" width="8" height="6" fill={SKIN} stroke={OUTLINE} />
        {/* trapezius (front sliver) */}
        <path
          d="M30 50 Q50 44 70 50 L66 58 Q50 54 34 58 Z"
          fill={isOn('trap', h)}
          stroke={OUTLINE}
        />
        {/* chest */}
        <path
          d="M30 58 Q50 70 70 58 L70 84 Q50 92 30 84 Z"
          fill={isOn('chest', h)}
          stroke={OUTLINE}
        />
        {/* front delts */}
        <ellipse cx="24" cy="64" rx="9" ry="11" fill={isOn('frontDelt', h)} stroke={OUTLINE} />
        <ellipse cx="76" cy="64" rx="9" ry="11" fill={isOn('frontDelt', h)} stroke={OUTLINE} />
        {/* biceps */}
        <ellipse cx="18" cy="86" rx="7" ry="13" fill={isOn('bicep', h)} stroke={OUTLINE} />
        <ellipse cx="82" cy="86" rx="7" ry="13" fill={isOn('bicep', h)} stroke={OUTLINE} />
        {/* forearms */}
        <rect x="13" y="100" width="10" height="22" rx="4" fill={isOn('forearm', h)} stroke={OUTLINE} />
        <rect x="77" y="100" width="10" height="22" rx="4" fill={isOn('forearm', h)} stroke={OUTLINE} />
        {/* core / abs */}
        <rect x="38" y="86" width="24" height="34" rx="6" fill={isOn('core', h)} stroke={OUTLINE} />
        <line x1="50" y1="88" x2="50" y2="118" stroke={OUTLINE} />
        <line x1="38" y1="98" x2="62" y2="98" stroke={OUTLINE} />
        <line x1="38" y1="108" x2="62" y2="108" stroke={OUTLINE} />
        {/* quads */}
        <path d="M34 122 Q42 158 38 174 L46 174 Q50 154 50 122 Z" fill={isOn('quad', h)} stroke={OUTLINE} />
        <path d="M66 122 Q58 158 62 174 L54 174 Q50 154 50 122 Z" fill={isOn('quad', h)} stroke={OUTLINE} />
        {/* shins (calves visible from side, leave neutral) */}
        <rect x="38" y="174" width="10" height="28" rx="3" fill={BASE} stroke={OUTLINE} />
        <rect x="52" y="174" width="10" height="28" rx="3" fill={BASE} stroke={OUTLINE} />
      </g>

      {/* Back view */}
      <g transform="translate(100,0)">
        <text x="25" y="14" fill="#7d88c0" fontSize="10" fontFamily="system-ui">
          Back
        </text>
        {/* head */}
        <circle cx="50" cy="32" r="11" fill={SKIN} stroke={OUTLINE} />
        {/* traps */}
        <path
          d="M30 50 Q50 76 70 50 L66 58 Q50 78 34 58 Z"
          fill={isOn('trap', h)}
          stroke={OUTLINE}
        />
        {/* rear delts */}
        <ellipse cx="24" cy="64" rx="9" ry="11" fill={isOn('rearDelt', h)} stroke={OUTLINE} />
        <ellipse cx="76" cy="64" rx="9" ry="11" fill={isOn('rearDelt', h)} stroke={OUTLINE} />
        {/* lats */}
        <path
          d="M30 70 Q50 88 70 70 L66 110 Q50 100 34 110 Z"
          fill={isOn('lat', h)}
          stroke={OUTLINE}
        />
        {/* mid back */}
        <rect x="38" y="64" width="24" height="20" rx="4" fill={isOn('midBack', h)} stroke={OUTLINE} />
        {/* triceps */}
        <ellipse cx="18" cy="86" rx="7" ry="13" fill={isOn('tricep', h)} stroke={OUTLINE} />
        <ellipse cx="82" cy="86" rx="7" ry="13" fill={isOn('tricep', h)} stroke={OUTLINE} />
        {/* forearms */}
        <rect x="13" y="100" width="10" height="22" rx="4" fill={isOn('forearm', h)} stroke={OUTLINE} />
        <rect x="77" y="100" width="10" height="22" rx="4" fill={isOn('forearm', h)} stroke={OUTLINE} />
        {/* lower back */}
        <rect x="40" y="100" width="20" height="18" rx="4" fill={isOn('lowerBack', h)} stroke={OUTLINE} />
        {/* glutes */}
        <ellipse cx="42" cy="128" rx="10" ry="10" fill={isOn('glute', h)} stroke={OUTLINE} />
        <ellipse cx="58" cy="128" rx="10" ry="10" fill={isOn('glute', h)} stroke={OUTLINE} />
        {/* hamstrings */}
        <path d="M34 140 Q42 160 38 174 L46 174 Q50 158 50 140 Z" fill={isOn('hamstring', h)} stroke={OUTLINE} />
        <path d="M66 140 Q58 160 62 174 L54 174 Q50 158 50 140 Z" fill={isOn('hamstring', h)} stroke={OUTLINE} />
        {/* calves */}
        <ellipse cx="43" cy="190" rx="6" ry="14" fill={isOn('calf', h)} stroke={OUTLINE} />
        <ellipse cx="57" cy="190" rx="6" ry="14" fill={isOn('calf', h)} stroke={OUTLINE} />
        {/* lower legs continuation */}
        <rect x="38" y="204" width="10" height="14" rx="3" fill={BASE} stroke={OUTLINE} />
        <rect x="52" y="204" width="10" height="14" rx="3" fill={BASE} stroke={OUTLINE} />
      </g>
    </svg>
  )
}
