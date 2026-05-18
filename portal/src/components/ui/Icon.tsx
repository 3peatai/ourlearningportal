interface IconProps { name: string; size?: number; color?: string; strokeWidth?: number }

export default function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'home':     return <svg {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
    case 'doc':      return <svg {...p}><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/></svg>
    case 'user':     return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>
    case 'bell':     return <svg {...p}><path d="M6 16V11a6 6 0 0112 0v5l1 2H5z"/><path d="M10 20a2 2 0 004 0"/></svg>
    case 'arrow':    return <svg {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'back':     return <svg {...p}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>
    case 'plus':     return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'book':     return <svg {...p}><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2z"/><path d="M4 5v15"/></svg>
    case 'clock':    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'check':    return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>
    case 'card':     return <svg {...p}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20"/></svg>
    case 'chev-r':   return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>
    case 'chev-d':   return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>
    case 'chev-l':   return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>
    case 'sparkle':  return <svg {...p}><path d="M12 4l1.8 4.2L18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8z"/></svg>
    case 'lock':     return <svg {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
    case 'logout':   return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'users':    return <svg {...p}><circle cx="9" cy="7" r="4"/><path d="M2 21c1-4 3.5-6 7-6s6 2 7 6"/><circle cx="17" cy="9" r="3"/><path d="M22 21c0-3-1.5-5-4-6"/></svg>
    case 'filter':   return <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
    default: return null
  }
}
