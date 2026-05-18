interface ClassroomBGProps {
  seed?: number
  mode?: 'amber' | 'teal'
}

export default function ClassroomBG({ seed = 1, mode = 'amber' }: ClassroomBGProps) {
  const blobs = mode === 'teal'
    ? [
        { c: '#4AADBC', x: '-12%', y: '-8%', s: 320, o: 0.35 },
        { c: '#F5C842', x: '78%', y: '4%', s: 240, o: 0.28 },
        { c: '#E8623A', x: '60%', y: '78%', s: 280, o: 0.22 },
        { c: '#4AADBC', x: '-10%', y: '60%', s: 220, o: 0.25 },
      ]
    : [
        { c: '#F5C842', x: '-14%', y: '-10%', s: 340, o: 0.42 },
        { c: '#E8623A', x: '70%', y: '-6%', s: 260, o: 0.32 },
        { c: '#4AADBC', x: '78%', y: '70%', s: 240, o: 0.28 },
        { c: '#F5C842', x: '-12%', y: '62%', s: 220, o: 0.3 },
      ]

  const glyphs = ['A', '3', '✏', '★', '✦', 'B', '7', '+', '★', 'a', '5', '♦', 'C', '2', '✏', '★']
  const colors = ['#F5C842', '#E8623A', '#4AADBC', '#9B7BC9']
  const rnd = (n: number) => {
    const x = Math.sin(n * 9301 + seed * 49297) * 233280
    return x - Math.floor(x)
  }
  const items = glyphs.map((g, i) => ({
    g, x: rnd(i + 1) * 100, y: rnd(i + 7) * 100,
    r: (rnd(i + 13) - 0.5) * 40, s: 14 + rnd(i + 19) * 14,
    o: 0.08 + rnd(i + 23) * 0.07, c: colors[i % colors.length],
  }))

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'radial-gradient(120% 100% at 50% 0%, #FBF8EE 0%, #FAF9F6 55%, #F6EEDD 100%)', zIndex: 0 }}
    >
      {blobs.map((b, i) => (
        <div key={i} className="absolute rounded-full"
          style={{ left: b.x, top: b.y, width: b.s, height: b.s, background: b.c, opacity: b.o, filter: 'blur(48px)' }} />
      ))}
      {items.map((it, i) => (
        <div key={i} className="absolute select-none"
          style={{ left: `${it.x}%`, top: `${it.y}%`, transform: `rotate(${it.r}deg)`, fontSize: it.s, color: it.c, opacity: it.o, fontWeight: 800 }}>
          {it.g}
        </div>
      ))}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 40%, rgba(255,255,255,0) 35%, rgba(245,200,66,0.10) 100%)' }} />
    </div>
  )
}
