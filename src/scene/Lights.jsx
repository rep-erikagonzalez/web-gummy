export default function Lights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#d5d6db', 0.46]} />
      <ambientLight intensity={0.14} color="#f7f7f8" />
      <directionalLight position={[1.4, 14, 2.2]} intensity={2.15} color="#ffffff" />
      <directionalLight position={[-6, 8, -3]} intensity={0.28} color="#f3f4f8" />
    </>
  )
}
