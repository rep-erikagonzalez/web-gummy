export const NARROW_MAX = 820

export const CAMERA_TILT = (8 * Math.PI) / 180

export const PLACEMENTS = {
  'strawberry-a': {
    wide: [0.05, -0.4],
    narrow: [-0.98, -1.95],
    rotation: 0.18,
    shadow: [0.7, 0.82],
  },
  'strawberry-b': {
    wide: [-1.9, -1.5],
    narrow: [-0.98, 1.75],
    rotation: -0.42,
    shadow: [0.7, 0.82],
  },
  'pear-a': {
    wide: [2.15, 0.72],
    narrow: [0.98, -1.95],
    rotation: -0.28,
    shadow: [0.66, 0.86],
  },
  'pear-b': {
    wide: [4.15, 1.25],
    narrow: [0.98, 1.75],
    rotation: 0.48,
    shadow: [0.66, 0.86],
  },
  starfruit: {
    wide: [2.1, -1.58],
    narrow: [0.98, -0.1],
    rotation: 0.12,
    shadow: [0.72, 0.72],
  },
  'bloom-a': {
    wide: [-2.0, 0.55],
    narrow: [-0.98, -0.1],
    rotation: 0.35,
    shadow: [0.68, 0.68],
  },
  'bloom-b': {
    wide: [4.2, -0.72],
    narrow: [-0.98, 3.6],
    rotation: 1.2,
    shadow: [0.68, 0.68],
  },
  'bloom-c': {
    wide: [0.15, 1.68],
    narrow: [0.98, 3.6],
    rotation: -0.75,
    shadow: [0.68, 0.68],
  },
}

export function isNarrow(width) {
  return width < NARROW_MAX
}

export function frameOf(width, height) {
  const narrow = isNarrow(width)
  const aspect = width / Math.max(height, 1)
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (const placement of Object.values(PLACEMENTS)) {
    const [x, z] = narrow ? placement.narrow : placement.wide
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
  }

  const pad = 1.15
  minX -= pad
  maxX += pad
  minZ -= pad
  maxZ += pad

  const halfW = (maxX - minX) / 2
  const halfD = (maxZ - minZ) / 2
  const clusterX = (minX + maxX) / 2
  const clusterZ = (minZ + maxZ) / 2
  const fov = narrow ? 32 : 28
  const shiftX = narrow ? 0 : halfW * 0.46
  const short = narrow && height < 520
  const shiftZ = narrow ? (short ? halfD * 0.12 : 0) : -halfD * 0.2
  const lookX = clusterX - shiftX
  const lookZ = clusterZ - shiftZ
  const needHalfW = Math.abs(clusterX - lookX) + halfW + 0.35
  const needHalfD = Math.abs(clusterZ - lookZ) + halfD + (short ? 2.55 : narrow ? 1.2 : 1.15)
  const vFov = (fov * Math.PI) / 180
  const distH = needHalfD / Math.tan(vFov / 2)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
  const distW = needHalfW / Math.tan(hFov / 2)

  return {
    narrow,
    fov,
    distance: Math.max(distH, distW) * 1.04,
    lookAt: [lookX, 0, lookZ],
  }
}
