import * as THREE from 'three'
import { makeCanvasTexture } from './textures'

export const FLAT_ROTATION = [-Math.PI / 2, 0, 0]

export const SLICE = {
  depth: 0.11,
  steps: 1,
  bevelEnabled: true,
  bevelThickness: 0.14,
  bevelSize: 0.1,
  bevelOffset: 0,
  bevelSegments: 6,
  curveSegments: 14,
}

export function sliceHeight(extrude = SLICE) {
  const depth = extrude.depth ?? SLICE.depth
  const bevel = extrude.bevelThickness ?? SLICE.bevelThickness
  const enabled = extrude.bevelEnabled ?? SLICE.bevelEnabled
  return depth + (enabled ? bevel : 0)
}

export function smoothNormals(geometry) {
  const position = geometry.attributes.position
  const normal = geometry.attributes.normal
  const buckets = new Map()
  const quantize = 1e4

  for (let i = 0; i < position.count; i += 1) {
    const key = [
      Math.round(position.getX(i) * quantize),
      Math.round(position.getY(i) * quantize),
      Math.round(position.getZ(i) * quantize),
    ].join(',')
    const bucket = buckets.get(key)
    if (bucket) bucket.push(i)
    else buckets.set(key, [i])
  }

  const sum = new THREE.Vector3()
  for (const indices of buckets.values()) {
    sum.set(0, 0, 0)
    for (const index of indices) {
      sum.x += normal.getX(index)
      sum.y += normal.getY(index)
      sum.z += normal.getZ(index)
    }
    sum.normalize()
    for (const index of indices) normal.setXYZ(index, sum.x, sum.y, sum.z)
  }

  normal.needsUpdate = true
}

function normalizeTopUVs(geometry) {
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  const cap = geometry.groups.find((group) => group.materialIndex === 0)
  const bounds = { minX: 0, maxX: 1, minY: 0, maxY: 1 }
  if (!cap) return bounds

  let maxZ = -Infinity
  for (let i = cap.start; i < cap.start + cap.count; i += 1) {
    maxZ = Math.max(maxZ, position.getZ(i))
  }

  const top = []
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (let i = cap.start; i < cap.start + cap.count; i += 1) {
    if (position.getZ(i) < maxZ - 1e-3) continue
    top.push(i)
    minX = Math.min(minX, position.getX(i))
    maxX = Math.max(maxX, position.getX(i))
    minY = Math.min(minY, position.getY(i))
    maxY = Math.max(maxY, position.getY(i))
  }

  const spanX = Math.max(maxX - minX, 1e-5)
  const spanY = Math.max(maxY - minY, 1e-5)
  for (const index of top) {
    uv.setXY(index, (position.getX(index) - minX) / spanX, (position.getY(index) - minY) / spanY)
  }
  uv.needsUpdate = true

  bounds.minX = minX
  bounds.maxX = maxX
  bounds.minY = minY
  bounds.maxY = maxY
  return bounds
}

export function createSlice(shape, paint, skinColor, options = {}) {
  const extrude = { ...SLICE, ...options.extrude }
  const geometry = new THREE.ExtrudeGeometry(shape, extrude)
  smoothNormals(geometry)
  const bounds = normalizeTopUVs(geometry)
  const texture = makeCanvasTexture(paint, bounds, options.textureSize ?? 1024)

  const face = new THREE.MeshPhysicalMaterial({
    map: texture,
    color: '#ffffff',
    roughness: options.faceRoughness ?? 0.2,
    metalness: 0,
    clearcoat: options.clearcoat ?? 1,
    clearcoatRoughness: options.clearcoatRoughness ?? 0.16,
    envMapIntensity: 0.28,
    specularIntensity: 0.65,
    polygonOffset: Boolean(options.polygonOffset),
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })

  const skin = new THREE.MeshPhysicalMaterial({
    color: skinColor,
    roughness: options.skinRoughness ?? 0.12,
    metalness: 0,
    clearcoat: 0.95,
    clearcoatRoughness: 0.2,
    transmission: options.transmission ?? 0.34,
    thickness: options.thickness ?? 0.45,
    ior: 1.4,
    attenuationColor: skinColor,
    attenuationDistance: 0.22,
    envMapIntensity: 0.42,
    specularIntensity: 1,
    polygonOffset: Boolean(options.polygonOffset),
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })

  return { geometry, materials: [face, skin], bounds }
}
