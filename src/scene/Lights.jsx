export default function Lights({ theme = 'light' }) {
  const dark = theme === 'dark'

  return (
    <>
      <hemisphereLight
        color="#ffffff"
        groundColor={dark ? '#3a3a40' : '#d5d6db'}
        intensity={dark ? 0.62 : 0.46}
      />
      <ambientLight intensity={dark ? 0.22 : 0.14} color={dark ? '#f4f4f6' : '#f7f7f8'} />
      <directionalLight position={[1.4, 14, 2.2]} intensity={dark ? 2.4 : 2.15} color="#ffffff" />
      <directionalLight position={[-6, 8, -3]} intensity={dark ? 0.4 : 0.28} color={dark ? '#f7f7f8' : '#f3f4f8'} />
    </>
  )
}
