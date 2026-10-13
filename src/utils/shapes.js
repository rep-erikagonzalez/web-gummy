import * as THREE from 'three'

export const STRAWBERRY_CROWN = { x: 0, y: 0.52 }

export const PEAR_STEM = { x: 0, y: 0.74 }

export const PEAR_LEAF = { x: 0.02, y: 0.7, yaw: 0.95 }

function roundedStar(spikes, outer, inner, tipRound, valleyRound) {
  const points = []
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = Math.PI / 2 + (i * Math.PI) / spikes
    points.push(new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius))
  }

  const shape = new THREE.Shape()
  const count = points.length
  for (let i = 0; i < count; i += 1) {
    const prev = points[(i - 1 + count) % count]
    const curr = points[i]
    const next = points[(i + 1) % count]
    const round = i % 2 === 0 ? tipRound : valleyRound
    const before = curr.clone().lerp(prev, round)
    const after = curr.clone().lerp(next, round)
    if (i === 0) shape.moveTo(before.x, before.y)
    else shape.lineTo(before.x, before.y)
    shape.quadraticCurveTo(curr.x, curr.y, after.x, after.y)
  }
  shape.closePath()
  return shape
}

export function strawberryShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.22, 0.52)
  shape.lineTo(0.22, 0.52)
  shape.bezierCurveTo(0.44, 0.52, 0.5, 0.36, 0.5, 0.2)
  shape.bezierCurveTo(0.48, -0.02, 0.34, -0.28, 0.18, -0.46)
  shape.bezierCurveTo(0.12, -0.56, 0.06, -0.63, 0, -0.63)
  shape.bezierCurveTo(-0.06, -0.63, -0.12, -0.56, -0.18, -0.46)
  shape.bezierCurveTo(-0.34, -0.28, -0.48, -0.02, -0.5, 0.2)
  shape.bezierCurveTo(-0.5, 0.36, -0.44, 0.52, -0.22, 0.52)
  shape.closePath()
  return shape
}

export function sepalShape() {
  const shape = new THREE.Shape()
  const leaves = 5
  const outer = 0.3
  const inner = 0.07
  const start = Math.PI / 2
  const at = (angle, radius) => [Math.cos(angle) * radius, Math.sin(angle) * radius]
  const [sx, sy] = at(start - 0.46, 0.14)
  shape.moveTo(sx, sy)
  for (let i = 0; i < leaves; i += 1) {
    const angle = start + (i * Math.PI * 2) / leaves
    const next = angle + (Math.PI * 2) / leaves
    const valley = (angle + next) / 2
    const [c1x, c1y] = at(angle - 0.22, outer * 0.86)
    const [tx, ty] = at(angle, outer)
    const [c2x, c2y] = at(angle + 0.22, outer * 0.86)
    const [rx, ry] = at(angle + 0.46, 0.14)
    const [vx, vy] = at(valley, inner)
    const [nx, ny] = at(next - 0.46, 0.14)
    shape.quadraticCurveTo(c1x, c1y, tx, ty)
    shape.quadraticCurveTo(c2x, c2y, rx, ry)
    shape.quadraticCurveTo(vx, vy, nx, ny)
  }
  shape.closePath()
  return shape
}

export function pearShape() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.88)
  shape.bezierCurveTo(0.15, 0.86, 0.3, 0.62, 0.33, 0.36)
  shape.bezierCurveTo(0.38, 0.05, 0.8, -0.18, 0.84, -0.46)
  shape.bezierCurveTo(0.88, -0.74, 0.48, -0.94, 0, -0.94)
  shape.bezierCurveTo(-0.48, -0.94, -0.88, -0.74, -0.84, -0.46)
  shape.bezierCurveTo(-0.8, -0.18, -0.38, 0.05, -0.33, 0.36)
  shape.bezierCurveTo(-0.3, 0.62, -0.15, 0.86, 0, 0.88)
  shape.closePath()
  return shape
}

export function pearStemShape() {
  const shape = new THREE.Shape()
  const w = 0.045
  const top = 0.26
  const bottom = -0.04
  shape.moveTo(-w, bottom)
  shape.lineTo(-w, top * 0.45)
  shape.quadraticCurveTo(-w, top, 0, top)
  shape.quadraticCurveTo(w, top, w, top * 0.45)
  shape.lineTo(w, bottom)
  shape.quadraticCurveTo(w, bottom - 0.05, 0, bottom - 0.05)
  shape.quadraticCurveTo(-w, bottom - 0.05, -w, bottom)
  shape.closePath()
  return shape
}

export function pearLeafShape() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.34)
  shape.bezierCurveTo(0.16, 0.22, 0.18, 0.04, 0.08, -0.12)
  shape.bezierCurveTo(0.03, -0.2, -0.03, -0.2, -0.08, -0.12)
  shape.bezierCurveTo(-0.16, 0.04, -0.14, 0.22, 0, 0.34)
  shape.closePath()
  return shape
}

export function starfruitShape() {
  return roundedStar(5, 0.92, 0.52, 0.46, 0.4)
}

export function blossomShape() {
  const petals = 5
  const samples = 180
  const radius = 0.9
  const shape = new THREE.Shape()

  for (let i = 0; i < samples; i += 1) {
    const u = i / samples
    const theta = u * Math.PI * 2
    const cycle = (u * petals) % 1
    const across = Math.sin(cycle * Math.PI)
    const body = across ** 0.7
    const notch = Math.exp(-((cycle - 0.5) ** 2) * 200)
    const r = radius * (0.2 + 0.8 * body - 0.22 * notch)
    const angle = theta + Math.PI / 2 - Math.PI / petals
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  shape.closePath()
  return shape
}
