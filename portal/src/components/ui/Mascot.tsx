const MAP: Record<string, { bg: string; face: string }> = {
  bee:  { bg: '#F5C842', face: '🐝' },
  bug:  { bg: '#E8623A', face: '🐞' },
  fly:  { bg: '#9B7BC9', face: '🦋' },
  fox:  { bg: '#F19F4D', face: '🦊' },
  owl:  { bg: '#4AADBC', face: '🦉' },
  star: { bg: '#5BA76A', face: '⭐' },
  crab: { bg: '#4AADBC', face: '🦀' },
}

export default function Mascot({ kind, size = 44 }: { kind: string; size?: number }) {
  const m = MAP[kind] ?? MAP.bee
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, flexShrink: 0,
      boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.08)',
    }}>
      {m.face}
    </div>
  )
}
