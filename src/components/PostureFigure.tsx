import type { PostureKey } from '../db/schema'

interface Props {
  posture: PostureKey
  size?: number
}

const FIG = '#7aa2ff'
const BAR = '#ffd166'
const FLOOR = '#2a3566'

export default function PostureFigure({ posture, size = 220 }: Props) {
  return (
    <svg
      viewBox="0 0 220 180"
      width={size}
      height={(size * 180) / 220}
      role="img"
      aria-label={`Posture illustration: ${posture}`}
      style={{ display: 'block' }}
    >
      <rect x="0" y="160" width="220" height="20" fill={FLOOR} opacity="0.3" />
      {renderPosture(posture)}
    </svg>
  )
}

function renderPosture(p: PostureKey) {
  switch (p) {
    case 'benchPress':
      return (
        <g>
          {/* bench */}
          <rect x="50" y="120" width="120" height="10" rx="3" fill={FLOOR} />
          <rect x="58" y="130" width="6" height="25" fill={FLOOR} />
          <rect x="156" y="130" width="6" height="25" fill={FLOOR} />
          {/* body lying down */}
          <rect x="70" y="105" width="80" height="15" rx="6" fill={FIG} />
          <circle cx="58" cy="112" r="9" fill={FIG} />
          {/* legs bent */}
          <line x1="150" y1="118" x2="170" y2="135" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="170" y1="135" x2="160" y2="155" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* arms pressing up */}
          <line x1="100" y1="105" x2="100" y2="70" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="105" x2="120" y2="70" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          {/* bar */}
          <rect x="80" y="62" width="60" height="6" rx="2" fill={BAR} />
          <circle cx="80" cy="65" r="10" fill={BAR} />
          <circle cx="140" cy="65" r="10" fill={BAR} />
        </g>
      )
    case 'squat':
      return (
        <g>
          {/* body in squat */}
          <circle cx="110" cy="50" r="10" fill={FIG} />
          <rect x="100" y="60" width="20" height="35" rx="5" fill={FIG} />
          {/* upper legs */}
          <line x1="105" y1="95" x2="85" y2="120" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="95" x2="135" y2="120" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* lower legs */}
          <line x1="85" y1="120" x2="92" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="135" y1="120" x2="128" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms holding bar */}
          <line x1="100" y1="68" x2="80" y2="58" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="68" x2="140" y2="58" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          {/* bar across shoulders */}
          <rect x="60" y="55" width="100" height="6" rx="2" fill={BAR} />
          <circle cx="60" cy="58" r="9" fill={BAR} />
          <circle cx="160" cy="58" r="9" fill={BAR} />
        </g>
      )
    case 'deadlift':
      return (
        <g>
          {/* hinge stance */}
          <circle cx="100" cy="50" r="10" fill={FIG} />
          <rect x="92" y="60" width="40" height="20" rx="5" fill={FIG} transform="rotate(20 112 70)" />
          {/* spine */}
          <line x1="105" y1="62" x2="135" y2="92" stroke={FIG} strokeWidth="10" strokeLinecap="round" />
          {/* legs */}
          <line x1="130" y1="92" x2="120" y2="155" stroke={FIG} strokeWidth="9" strokeLinecap="round" />
          <line x1="140" y1="92" x2="150" y2="155" stroke={FIG} strokeWidth="9" strokeLinecap="round" />
          {/* arms straight down */}
          <line x1="125" y1="92" x2="120" y2="135" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="145" y1="92" x2="150" y2="135" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          {/* bar at shins */}
          <rect x="80" y="138" width="110" height="5" rx="2" fill={BAR} />
          <circle cx="82" cy="140" r="11" fill={BAR} />
          <circle cx="188" cy="140" r="11" fill={BAR} />
        </g>
      )
    case 'overheadPress':
      return (
        <g>
          <circle cx="110" cy="55" r="10" fill={FIG} />
          <rect x="100" y="65" width="20" height="50" rx="5" fill={FIG} />
          {/* legs */}
          <line x1="105" y1="115" x2="95" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="115" x2="125" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms up overhead */}
          <line x1="100" y1="70" x2="92" y2="35" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="70" x2="128" y2="35" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* bar */}
          <rect x="60" y="22" width="100" height="6" rx="2" fill={BAR} />
          <circle cx="60" cy="25" r="9" fill={BAR} />
          <circle cx="160" cy="25" r="9" fill={BAR} />
        </g>
      )
    case 'row':
      return (
        <g>
          {/* hinged torso */}
          <circle cx="80" cy="65" r="10" fill={FIG} />
          <line x1="85" y1="72" x2="155" y2="100" stroke={FIG} strokeWidth="12" strokeLinecap="round" />
          {/* legs */}
          <line x1="150" y1="100" x2="140" y2="158" stroke={FIG} strokeWidth="9" strokeLinecap="round" />
          <line x1="160" y1="100" x2="170" y2="158" stroke={FIG} strokeWidth="9" strokeLinecap="round" />
          {/* arm pulling bar to belly */}
          <line x1="120" y1="92" x2="110" y2="120" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* bar */}
          <rect x="70" y="118" width="80" height="5" rx="2" fill={BAR} />
          <circle cx="70" cy="120" r="9" fill={BAR} />
          <circle cx="150" cy="120" r="9" fill={BAR} />
        </g>
      )
    case 'pullup':
      return (
        <g>
          {/* bar */}
          <rect x="40" y="20" width="140" height="6" rx="2" fill={BAR} />
          {/* arms up */}
          <line x1="95" y1="26" x2="105" y2="60" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="125" y1="26" x2="115" y2="60" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* head */}
          <circle cx="110" cy="68" r="10" fill={FIG} />
          {/* torso */}
          <rect x="100" y="76" width="20" height="40" rx="5" fill={FIG} />
          {/* legs */}
          <line x1="105" y1="116" x2="98" y2="155" stroke={FIG} strokeWidth="7" strokeLinecap="round" />
          <line x1="115" y1="116" x2="122" y2="155" stroke={FIG} strokeWidth="7" strokeLinecap="round" />
        </g>
      )
    case 'curl':
      return (
        <g>
          <circle cx="110" cy="40" r="10" fill={FIG} />
          <rect x="100" y="50" width="20" height="55" rx="5" fill={FIG} />
          {/* legs */}
          <line x1="105" y1="105" x2="95" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="105" x2="125" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms curling up */}
          <line x1="100" y1="60" x2="80" y2="85" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="80" y1="85" x2="98" y2="60" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="60" x2="140" y2="85" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="140" y1="85" x2="122" y2="60" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* dumbbells */}
          <rect x="86" y="55" width="20" height="8" rx="2" fill={BAR} />
          <rect x="114" y="55" width="20" height="8" rx="2" fill={BAR} />
        </g>
      )
    case 'tricepExt':
      return (
        <g>
          <circle cx="110" cy="45" r="10" fill={FIG} />
          <rect x="100" y="55" width="20" height="50" rx="5" fill={FIG} />
          {/* legs */}
          <line x1="105" y1="105" x2="95" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="105" x2="125" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms: elbows high, forearms extending down then locking up */}
          <line x1="100" y1="60" x2="88" y2="40" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="88" y1="40" x2="98" y2="70" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="60" x2="132" y2="40" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="132" y1="40" x2="122" y2="70" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* cable line */}
          <line x1="110" y1="78" x2="110" y2="158" stroke={BAR} strokeWidth="3" strokeDasharray="3 3" />
        </g>
      )
    case 'lateralRaise':
      return (
        <g>
          <circle cx="110" cy="45" r="10" fill={FIG} />
          <rect x="100" y="55" width="20" height="55" rx="5" fill={FIG} />
          {/* legs */}
          <line x1="105" y1="110" x2="95" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="110" x2="125" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms out to sides */}
          <line x1="100" y1="65" x2="55" y2="70" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="65" x2="165" y2="70" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* dumbbells */}
          <rect x="42" y="66" width="18" height="8" rx="2" fill={BAR} />
          <rect x="160" y="66" width="18" height="8" rx="2" fill={BAR} />
        </g>
      )
    case 'facePull':
      return (
        <g>
          <circle cx="110" cy="55" r="10" fill={FIG} />
          <rect x="100" y="65" width="20" height="50" rx="5" fill={FIG} />
          <line x1="105" y1="115" x2="95" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="115" x2="125" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms pulled to face */}
          <line x1="100" y1="70" x2="75" y2="55" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="75" y1="55" x2="98" y2="50" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="70" x2="145" y2="55" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="145" y1="55" x2="122" y2="50" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* cable */}
          <line x1="98" y1="50" x2="60" y2="35" stroke={BAR} strokeWidth="3" strokeDasharray="3 3" />
          <line x1="122" y1="50" x2="160" y2="35" stroke={BAR} strokeWidth="3" strokeDasharray="3 3" />
        </g>
      )
    case 'legPress':
      return (
        <g>
          {/* sled */}
          <rect x="120" y="40" width="80" height="60" rx="6" fill={FLOOR} />
          {/* seat */}
          <rect x="20" y="100" width="100" height="14" rx="4" fill={FLOOR} />
          {/* body lying back */}
          <rect x="30" y="86" width="80" height="14" rx="5" fill={FIG} />
          <circle cx="30" cy="93" r="9" fill={FIG} />
          {/* legs pushing the sled */}
          <line x1="100" y1="93" x2="135" y2="80" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="100" x2="135" y2="95" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
        </g>
      )
    case 'lunge':
      return (
        <g>
          <circle cx="100" cy="45" r="10" fill={FIG} />
          <rect x="90" y="55" width="20" height="50" rx="5" fill={FIG} />
          {/* front leg */}
          <line x1="100" y1="105" x2="140" y2="135" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="140" y1="135" x2="140" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* back leg */}
          <line x1="100" y1="105" x2="70" y2="135" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="70" y1="135" x2="80" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* arms holding dumbbells */}
          <line x1="90" y1="65" x2="80" y2="100" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="110" y1="65" x2="120" y2="100" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <rect x="72" y="100" width="16" height="7" rx="2" fill={BAR} />
          <rect x="112" y="100" width="16" height="7" rx="2" fill={BAR} />
        </g>
      )
    case 'hipHinge':
      return (
        <g>
          {/* head */}
          <circle cx="60" cy="60" r="10" fill={FIG} />
          {/* torso hinged */}
          <rect x="60" y="65" width="80" height="18" rx="5" fill={FIG} transform="rotate(15 100 74)" />
          {/* legs slight bend */}
          <line x1="140" y1="92" x2="135" y2="155" stroke={FIG} strokeWidth="9" strokeLinecap="round" />
          <line x1="150" y1="92" x2="155" y2="155" stroke={FIG} strokeWidth="9" strokeLinecap="round" />
          {/* arms straight */}
          <line x1="120" y1="90" x2="118" y2="120" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="140" y1="92" x2="142" y2="120" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          {/* bar at knee height */}
          <rect x="90" y="120" width="80" height="5" rx="2" fill={BAR} />
          <circle cx="90" cy="122" r="9" fill={BAR} />
          <circle cx="170" cy="122" r="9" fill={BAR} />
        </g>
      )
    case 'plank':
      return (
        <g>
          {/* body horizontal */}
          <rect x="55" y="100" width="110" height="14" rx="6" fill={FIG} />
          <circle cx="50" cy="107" r="9" fill={FIG} />
          {/* forearms */}
          <line x1="55" y1="114" x2="55" y2="150" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          <line x1="55" y1="150" x2="80" y2="150" stroke={FIG} strokeWidth="6" strokeLinecap="round" />
          {/* feet */}
          <line x1="165" y1="114" x2="180" y2="150" stroke={FIG} strokeWidth="7" strokeLinecap="round" />
        </g>
      )
    case 'calfRaise':
      return (
        <g>
          <circle cx="110" cy="40" r="10" fill={FIG} />
          <rect x="100" y="50" width="20" height="60" rx="5" fill={FIG} />
          {/* arms hanging */}
          <line x1="100" y1="55" x2="92" y2="105" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="55" x2="128" y2="105" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          {/* legs up on toes */}
          <line x1="105" y1="110" x2="100" y2="148" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="110" x2="120" y2="148" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          {/* step */}
          <rect x="80" y="148" width="60" height="6" fill={FLOOR} />
          {/* heels off the back */}
          <line x1="100" y1="148" x2="90" y2="156" stroke={FIG} strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="148" x2="130" y2="156" stroke={FIG} strokeWidth="4" strokeLinecap="round" />
        </g>
      )
    case 'standing':
    default:
      return (
        <g>
          <circle cx="110" cy="45" r="10" fill={FIG} />
          <rect x="100" y="55" width="20" height="55" rx="5" fill={FIG} />
          <line x1="105" y1="110" x2="95" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="115" y1="110" x2="125" y2="158" stroke={FIG} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="65" x2="90" y2="115" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="65" x2="130" y2="115" stroke={FIG} strokeWidth="5" strokeLinecap="round" />
          {/* dumbbells */}
          <rect x="82" y="113" width="18" height="8" rx="2" fill={BAR} />
          <rect x="122" y="113" width="18" height="8" rx="2" fill={BAR} />
        </g>
      )
  }
}
