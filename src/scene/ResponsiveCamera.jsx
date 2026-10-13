import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { CAMERA_TILT, frameOf } from './layout'

export default function ResponsiveCamera() {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useLayoutEffect(() => {
    const frame = frameOf(size.width, size.height)
    const [x, , z] = frame.lookAt
    camera.fov = frame.fov
    camera.position.set(x, Math.cos(CAMERA_TILT) * frame.distance, z + Math.sin(CAMERA_TILT) * frame.distance)
    camera.near = 0.1
    camera.far = Math.max(90, frame.distance * 4)
    camera.lookAt(x, 0, z)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}
