import * as THREE from 'three'
import { pearShape, strawberryShape } from './shapes'

function mulberry32(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function toCanvas(bounds, x, y, size) {
  const u = (x - bounds.minX) / Math.max(bounds.maxX - bounds.minX, 1e-5)
  const v = (y - bounds.minY) / Math.max(bounds.maxY - bounds.minY, 1e-5)
  return [u * size, (1 - v) * size]
}

function shapeCenter(shape) {
  const pts = shape.getPoints(48)
  let x = 0
  let y = 0
  for (const point of pts) {
    x += point.x
    y += point.y
  }
  return { x: x / pts.length, y: y / pts.length }
}

function fillInset(ctx, shape, bounds, size, inset, color) {
  const pts = shape.getPoints(90)
  const center = shapeCenter(shape)
  ctx.beginPath()
  pts.forEach((point, index) => {
    const x = point.x + (center.x - point.x) * inset
    const y = point.y + (center.y - point.y) * inset
    const [px, py] = toCanvas(bounds, x, y, size)
    if (index === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function paintSeed(ctx, x, y, rx, ry, rotation, color, outline) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  if (outline) {
    ctx.fillStyle = outline
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(0, 0, rx * 0.68, ry * 0.68, 0, 0, Math.PI * 2)
  }
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function paintTeardrop(ctx, x, y, length, width, rotation, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  ctx.moveTo(0, -length * 0.62)
  ctx.quadraticCurveTo(width, -length * 0.05, 0, length * 0.48)
  ctx.quadraticCurveTo(-width, -length * 0.05, 0, -length * 0.62)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

export function makeCanvasTexture(paint, bounds, size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  paint(ctx, size, bounds)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function traceShape(ctx, shape, bounds, size) {
  const points = shape.getPoints(120)
  ctx.beginPath()
  points.forEach((point, index) => {
    const [px, py] = toCanvas(bounds, point.x, point.y, size)
    if (index === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.closePath()
}

export function paintStrawberry(ctx, size, bounds) {
  const shape = strawberryShape()
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1e-5)
  const unit = size / span

  ctx.fillStyle = '#E2324A'
  ctx.fillRect(0, 0, size, size)

  const [gx, gy] = toCanvas(bounds, 0, 0.02, size)
  const pulp = ctx.createRadialGradient(gx, gy, unit * 0.04, gx, gy, unit * 0.58)
  pulp.addColorStop(0, '#F7B7C0')
  pulp.addColorStop(0.62, '#ef7388')
  pulp.addColorStop(1, '#E2324A')

  ctx.save()
  traceShape(ctx, shape, bounds, size)
  ctx.clip()
  ctx.fillStyle = pulp
  ctx.fillRect(0, 0, size, size)

  const coreTop = toCanvas(bounds, 0, 0.4, size)
  const coreLeft = toCanvas(bounds, -0.075, 0.16, size)
  const coreRight = toCanvas(bounds, 0.075, 0.16, size)
  const coreBottom = toCanvas(bounds, 0, -0.02, size)
  const [hx, hy] = toCanvas(bounds, 0, 0.22, size)
  const core = ctx.createRadialGradient(hx, hy, unit * 0.01, hx, hy, unit * 0.2)
  core.addColorStop(0, '#fff7f8')
  core.addColorStop(0.55, '#f8d5dc')
  core.addColorStop(1, 'rgba(247, 183, 192, 0)')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.moveTo(coreTop[0], coreTop[1])
  ctx.bezierCurveTo(coreLeft[0], coreTop[1], coreLeft[0], coreLeft[1], coreLeft[0], coreLeft[1])
  ctx.bezierCurveTo(coreLeft[0], coreBottom[1], coreBottom[0], coreBottom[1], coreBottom[0], coreBottom[1])
  ctx.bezierCurveTo(coreRight[0], coreBottom[1], coreRight[0], coreRight[1], coreRight[0], coreRight[1])
  ctx.bezierCurveTo(coreRight[0], coreTop[1], coreTop[0], coreTop[1], coreTop[0], coreTop[1])
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)'
  ctx.lineWidth = Math.max(1, unit * 0.008)
  ctx.lineCap = 'round'
  for (let i = 0; i < 12; i += 1) {
    const angle = -0.7 + (i / 11) * 2.5
    const reach = 0.16 + (i % 3) * 0.035
    const [x1, y1] = toCanvas(bounds, Math.sin(angle) * 0.03, 0.22 - Math.cos(angle) * 0.04, size)
    const [x2, y2] = toCanvas(bounds, Math.sin(angle) * reach, 0.18 - Math.cos(angle) * reach * 0.85, size)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  ctx.restore()

  traceShape(ctx, shape, bounds, size)
  ctx.strokeStyle = '#E2324A'
  ctx.lineWidth = unit * 0.1
  ctx.lineJoin = 'round'
  ctx.stroke()

  const seeds = [
    { x: 0.36, y: 0.24, rot: -0.45 },
    { x: 0.43, y: 0.08, rot: -0.15 },
    { x: 0.4, y: -0.08, rot: 0.2 },
    { x: 0.33, y: -0.24, rot: 0.55 },
    { x: 0.22, y: -0.38, rot: 0.9 },
    { x: 0.08, y: -0.48, rot: 1.15 },
    { x: -0.34, y: 0.2, rot: 0.5 },
    { x: -0.42, y: 0.02, rot: 0.15 },
    { x: -0.34, y: -0.16, rot: -0.25 },
    { x: -0.3, y: -0.3, rot: -0.65 },
    { x: -0.16, y: -0.44, rot: -1.05 },
    { x: 0.12, y: -0.46, rot: 1.3 },
    { x: 0.38, y: 0.28, rot: -0.7 },
    { x: -0.36, y: 0.28, rot: 0.65 },
  ]
  for (const seed of seeds) {
    const [sx, sy] = toCanvas(bounds, seed.x, seed.y, size)
    paintSeed(ctx, sx, sy, unit * 0.032, unit * 0.018, seed.rot, '#f6d15a', '#a67a12')
  }
}

export function paintSepal(ctx, size, bounds) {
  const gradient = ctx.createRadialGradient(size * 0.5, size * 0.45, size * 0.02, size * 0.5, size * 0.5, size * 0.55)
  gradient.addColorStop(0, '#e7f6b4')
  gradient.addColorStop(0.45, '#8ed25a')
  gradient.addColorStop(1, '#2e8a3e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const [bx, by] = toCanvas(bounds, 0, 0, size)
  ctx.strokeStyle = 'rgba(236, 248, 196, 0.85)'
  ctx.lineWidth = size * 0.018
  ctx.lineCap = 'round'
  const leaves = 5
  for (let i = 0; i < leaves; i += 1) {
    const angle = Math.PI / 2 + (i * Math.PI * 2) / leaves
    const [tx, ty] = toCanvas(bounds, Math.cos(angle) * 0.24, Math.sin(angle) * 0.24, size)
    ctx.beginPath()
    ctx.moveTo(bx, by)
    ctx.lineTo(tx, ty)
    ctx.stroke()
  }
}

export function paintPear(ctx, size, bounds) {
  ctx.fillStyle = '#b5c93a'
  ctx.fillRect(0, 0, size, size)
  fillInset(ctx, pearShape(), bounds, size, 0.07, '#f6f0d0')

  const [ox, oy] = toCanvas(bounds, 0, -0.34, size)
  ctx.save()
  ctx.translate(ox, oy)
  const core = ctx.createRadialGradient(0, 0, size * 0.01, 0, 0, size * 0.12)
  core.addColorStop(0, '#f6f0d0')
  core.addColorStop(1, 'rgba(246, 240, 208, 0)')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.ellipse(0, 0, size * 0.05, size * 0.09, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const seeds = [
    { x: -0.08, y: -0.22, rot: -0.5 },
    { x: 0.07, y: -0.38, rot: 0.42 },
    { x: -0.02, y: -0.5, rot: 0.05 },
  ]
  for (const seed of seeds) {
    const [sx, sy] = toCanvas(bounds, seed.x, seed.y, size)
    paintTeardrop(ctx, sx, sy, size * 0.078, size * 0.03, -seed.rot, '#3d2412')
    paintTeardrop(ctx, sx, sy, size * 0.062, size * 0.022, -seed.rot, '#6a3a1c')
  }
}

export function paintStem(ctx, size) {
  const gradient = ctx.createLinearGradient(0, size, size, 0)
  gradient.addColorStop(0, '#8a5a32')
  gradient.addColorStop(0.5, '#6b4423')
  gradient.addColorStop(1, '#4e3018')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
}

export function paintLeaf(ctx, size) {
  const cx = size / 2
  const cy = size / 2
  const gradient = ctx.createLinearGradient(cx, 0, cx, size)
  gradient.addColorStop(0, '#d7ef8a')
  gradient.addColorStop(0.45, '#7fbe45')
  gradient.addColorStop(1, '#3f8f34')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = 'rgba(232, 246, 176, 0.85)'
  ctx.lineWidth = size * 0.018
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, size * 0.78)
  ctx.lineTo(cx, size * 0.22)
  ctx.stroke()
}

export function paintStarfruit(ctx, size) {
  const cx = size / 2
  const cy = size / 2
  const gradient = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, size * 0.58)
  gradient.addColorStop(0, '#fff4b0')
  gradient.addColorStop(0.42, '#ffe14a')
  gradient.addColorStop(0.78, '#f0d04a')
  gradient.addColorStop(1, '#c5d84a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = 'rgba(255, 255, 236, 0.42)'
  ctx.lineWidth = size * 0.012
  ctx.lineCap = 'round'
  for (let i = 0; i < 5; i += 1) {
    const angle = Math.PI / 2 + (i * Math.PI * 2) / 5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * size * 0.34, cy - Math.sin(angle) * size * 0.34)
    ctx.stroke()
  }

  for (let i = 0; i < 5; i += 1) {
    const angle = Math.PI / 2 + ((i + 0.5) * Math.PI * 2) / 5
    const radius = size * 0.07
    paintSeed(
      ctx,
      cx + Math.cos(angle) * radius,
      cy - Math.sin(angle) * radius,
      size * 0.032,
      size * 0.018,
      -angle,
      '#5c6b1c',
      '#24300c',
    )
  }

  const rand = mulberry32(5)
  for (let i = 0; i < 4; i += 1) {
    const angle = rand() * Math.PI * 2
    const radius = size * (0.012 + rand() * 0.025)
    paintSeed(
      ctx,
      cx + Math.cos(angle) * radius,
      cy - Math.sin(angle) * radius,
      size * 0.016,
      size * 0.01,
      angle,
      '#3d4a14',
      '#1c2408',
    )
  }
}

export function paintBlossom(ctx, size) {
  const cx = size / 2
  const cy = size / 2
  const gradient = ctx.createRadialGradient(cx, cy, size * 0.03, cx, cy, size * 0.52)
  gradient.addColorStop(0, '#fff0f5')
  gradient.addColorStop(0.34, '#ffc2d8')
  gradient.addColorStop(0.72, '#ff8fb8')
  gradient.addColorStop(1, '#f26b9e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 5; i += 1) {
    const angle = Math.PI / 2 + (i * Math.PI * 2) / 5
    const px = cx + Math.cos(angle) * size * 0.26
    const py = cy - Math.sin(angle) * size * 0.26
    const blush = ctx.createRadialGradient(px, py, size * 0.02, px, py, size * 0.2)
    blush.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
    blush.addColorStop(0.55, 'rgba(230, 80, 130, 0.12)')
    blush.addColorStop(1, 'rgba(230, 80, 130, 0)')
    ctx.fillStyle = blush
    ctx.fillRect(0, 0, size, size)

    ctx.strokeStyle = 'rgba(255, 247, 250, 0.7)'
    ctx.lineWidth = size * 0.008
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * size * 0.32, cy - Math.sin(angle) * size * 0.32)
    ctx.stroke()
  }

  for (let i = 0; i < 15; i += 1) {
    const angle = (i / 15) * Math.PI * 2 + 0.15
    const length = size * (0.05 + (i % 4) * 0.011)
    const x2 = cx + Math.cos(angle) * length
    const y2 = cy - Math.sin(angle) * length
    ctx.strokeStyle = '#e0aa28'
    ctx.lineWidth = Math.max(1.5, size * 0.0035)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * size * 0.02, cy - Math.sin(angle) * size * 0.02)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.beginPath()
    ctx.fillStyle = i % 2 === 0 ? '#ffe07a' : '#f6c431'
    ctx.arc(x2, y2, size * 0.013, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.beginPath()
  ctx.fillStyle = '#f0b429'
  ctx.arc(cx, cy, size * 0.026, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.fillStyle = '#fff6cc'
  ctx.arc(cx - size * 0.008, cy - size * 0.008, size * 0.009, 0, Math.PI * 2)
  ctx.fill()
}

let contactShadow

export function getContactShadowTexture() {
  if (contactShadow) return contactShadow
  contactShadow = makeCanvasTexture((ctx, size) => {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(28, 28, 34, 0.55)')
    gradient.addColorStop(0.38, 'rgba(28, 28, 34, 0.2)')
    gradient.addColorStop(0.72, 'rgba(28, 28, 34, 0.05)')
    gradient.addColorStop(1, 'rgba(28, 28, 34, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }, null, 256)
  return contactShadow
}
