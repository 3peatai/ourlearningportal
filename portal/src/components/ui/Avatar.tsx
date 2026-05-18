export default function Avatar({ name, size = 36, color = '#4AADBC' }: { name: string; size?: number; color?: string }) {
  const init = name ? name.split(' ').map(s => s[0]).slice(0, 2).join('') : '·'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff', fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, letterSpacing: -0.3, flexShrink: 0,
      boxShadow: '0 2px 6px rgba(0,0,0,.12), inset 0 -2px 0 rgba(0,0,0,.08)',
    }}>
      {init}
    </div>
  )
}
