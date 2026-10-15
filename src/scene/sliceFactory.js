import * as THREE from 'three'
import { ConvexHull } from 'three/addons/math/ConvexHull.js'
import { blossomParts } from '../components/jellies/Blossom'
import { pearParts } from '../components/jellies/Pear'
import { starParts } from '../components/jellies/Starfruit'
import { berryParts } from '../components/jellies/Strawberry'
import { FLAT_ROTATION, SLICE, smoothNormals } from '../utils/jelly'
import { PEAR_LEAF, PEAR_STEM, STRAWBERRY_CROWN, blossomShape, pearShape, starfruitShape, strawberryShape } from '../utils/shapes'
import { pointInPolygon, polygonArea } from './cut'

const flatEuler = new THREE.Euler(...FLAT_ROTATION)

export const PULP = {
  berry: '#F7B7C0',
  orchard: '#F6F0D0',
  tropic: '#ffe14a',
  bloom: '#ff8fb8',
}

const FRUIT = {
  berry: { parts: berryParts, extrude: {}, bevel: SLICE.bevelSize },
  orchard: { parts: pearParts, extrude: {}, bevel: SLICE.bevelSize },
  bloom: { parts: blossomParts, extrude: blossomParts.extrude, bevel: 0.045 },
  tropic: { parts: starParts, extrude: starParts.extrude, bevel: 0.12 },
}

function shapeOutline(shape, divisions) {
  const points = shape.getPoints(divisions)
  const poly = []
  for (const point of points) {
    const last = poly[poly.length - 1]
    if (last && Math.hypot(last[0] - point.x, last[1] - point.y) < 1e-4) continue
    poly.push([point.x, point.y])
  }
  if (poly.length > 2) {
    const first = poly[0]
    const last = poly[poly.length - 1]
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-4) poly.pop()
  }
  return poly
}

export const FRUIT_OUTLINE = {
  berry: shapeOutline(strawberryShape(), 10),
  orchard: shapeOutline(pearShape(), 10),
  bloom: shapeOutline(blossomShape(), 4),
  tropic: shapeOutline(starfruitShape(), 8),
}

export const FRUIT_AREA = {
  berry: polygonArea(FRUIT_OUTLINE.berry),
  orchard: polygonArea(FRUIT_OUTLINE.orchard),
  bloom: polygonArea(FRUIT_OUTLINE.bloom),
  tropic: polygonArea(FRUIT_OUTLINE.tropic),
}

const cache = new Map()
const pending = new Map()
let cutSerial = 1
const scratch = new THREE.Vector3()

function shapeFrom(points) {
  const shape = new THREE.Shape()
  shape.moveTo(points[0][0], points[0][1])
  for (let index = 1; index < points.length; index += 1) shape.lineTo(points[index][0], points[index][1])
  shape.closePath()
  return shape
}

function applyOriginalUVs(geometry, bounds) {
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  const cap = geometry.groups.find((group) => group.materialIndex === 0)
  if (!cap || !bounds) return
  let maxZ = -Infinity
  for (let index = cap.start; index < cap.start + cap.count; index += 1) {
    maxZ = Math.max(maxZ, position.getZ(index))
  }
  const spanX = Math.max(bounds.maxX - bounds.minX, 1e-5)
  const spanY = Math.max(bounds.maxY - bounds.minY, 1e-5)
  for (let index = cap.start; index < cap.start + cap.count; index += 1) {
    if (position.getZ(index) < maxZ - 1e-3) continue
    uv.setXY(index, (position.getX(index) - bounds.minX) / spanX, (position.getY(index) - bounds.minY) / spanY)
  }
  uv.needsUpdate = true
}

function onCut(position, index, path, limit) {
  const ax = position.getX(index)
  const ay = position.getY(index)
  const bx = position.getX(index + 1)
  const by = position.getY(index + 1)
  const cx = position.getX(index + 2)
  const cy = position.getY(index + 2)
  const px = (ax + bx + cx) / 3
  const py = (ay + by + cy) / 3
  let best = Infinity
  let dirX = 1
  let dirY = 0
  for (let segment = 0; segment < path.length - 1; segment += 1) {
    const [x1, y1] = path[segment]
    const [x2, y2] = path[segment + 1]
    const abx = x2 - x1
    const aby = y2 - y1
    const length2 = abx * abx + aby * aby
    if (length2 < 1e-8) continue
    const t = ((px - x1) * abx + (py - y1) * aby) / length2
    if (t < -0.12 || t > 1.12) continue
    const clamped = Math.min(1, Math.max(0, t))
    const distance = Math.hypot(px - (x1 + abx * clamped), py - (y1 + aby * clamped))
    if (distance < best) {
      best = distance
      const length = Math.sqrt(length2)
      dirX = abx / length
      dirY = aby / length
    }
  }
  if (best > limit) return false
  const edges = [
    [bx - ax, by - ay],
    [cx - bx, cy - by],
    [ax - cx, ay - cy],
  ]
  let ex = edges[0][0]
  let ey = edges[0][1]
  let longest = ex * ex + ey * ey
  for (const edge of edges) {
    const length2 = edge[0] * edge[0] + edge[1] * edge[1]
    if (length2 > longest) {
      longest = length2
      ex = edge[0]
      ey = edge[1]
    }
  }
  const length = Math.sqrt(longest) || 1
  return Math.abs((ex / length) * dirX + (ey / length) * dirY) > 0.7
}

function isolateCut(geometry, cutPath, bevel) {
  const position = geometry.attributes.position
  const cap = geometry.groups.find((group) => group.materialIndex === 0)
  const side = geometry.groups.find((group) => group.materialIndex === 1)
  if (!cap || !side) return
  const capIndex = []
  for (let index = cap.start; index < cap.start + cap.count; index += 1) capIndex.push(index)
  const skin = []
  const pulp = []
  const limit = Math.max(0.05, bevel * 1.75)
  for (let index = side.start; index < side.start + side.count; index += 3) {
    const bucket = onCut(position, index, cutPath, limit) ? pulp : skin
    bucket.push(index, index + 1, index + 2)
  }
  geometry.setIndex(capIndex.concat(skin, pulp))
  geometry.clearGroups()
  geometry.addGroup(0, capIndex.length, 0)
  geometry.addGroup(capIndex.length, skin.length, 1)
  geometry.addGroup(capIndex.length + skin.length, pulp.length, 2)
}

function rotationMatrix() {
  return new THREE.Matrix4().makeRotationFromEuler(flatEuler)
}

function placedMatrix(x, y, z, yaw = 0) {
  const matrix = rotationMatrix()
  if (yaw) matrix.premultiply(new THREE.Matrix4().makeRotationY(yaw))
  matrix.premultiply(new THREE.Matrix4().makeTranslation(x, y, z))
  return matrix
}

function collect(bucket, geometry, matrix) {
  const position = geometry.attributes.position
  for (let index = 0; index < position.count; index += 1) {
    scratch.fromBufferAttribute(position, index).applyMatrix4(matrix)
    const key = `${Math.round(scratch.x * 28)},${Math.round(scratch.y * 28)},${Math.round(scratch.z * 28)}`
    if (!bucket.has(key)) bucket.set(key, [scratch.x, scratch.y, scratch.z])
  }
}

function packHull(bucket) {
  const cloud = []
  for (const point of bucket.values()) cloud.push(new THREE.Vector3(point[0], point[1], point[2]))
  const hull = new ConvexHull().setFromPoints(cloud)
  const values = []
  const seen = new Set()
  for (const face of hull.faces) {
    let edge = face.edge
    const start = edge
    do {
      const point = edge.head().point
      const key = `${point.x.toFixed(4)},${point.y.toFixed(4)},${point.z.toFixed(4)}`
      if (!seen.has(key)) {
        seen.add(key)
        values.push(point.x, point.y, point.z)
      }
      edge = edge.next
    } while (edge !== start)
  }
  let minY = Infinity
  let maxY = -Infinity
  for (let index = 1; index < values.length; index += 3) {
    minY = Math.min(minY, values[index])
    maxY = Math.max(maxY, values[index])
  }
  return { points: new Float32Array(values), minY, maxY }
}

function hullOf(kind, geometry, ornaments) {
  const bucket = new Map()
  collect(bucket, geometry, rotationMatrix())
  if (kind === 'berry' && ornaments.crown) {
    collect(bucket, berryParts.crown.geometry, placedMatrix(STRAWBERRY_CROWN.x, berryParts.lift, -STRAWBERRY_CROWN.y))
  }
  if (kind === 'orchard' && ornaments.stem) {
    collect(bucket, pearParts.stem.geometry, placedMatrix(PEAR_STEM.x, pearParts.lift, -PEAR_STEM.y))
  }
  if (kind === 'orchard' && ornaments.leaf) {
    const matrix = rotationMatrix()
    matrix.premultiply(new THREE.Matrix4().makeTranslation(0, 0, -0.12))
    matrix.premultiply(new THREE.Matrix4().makeRotationY(PEAR_LEAF.yaw))
    matrix.premultiply(new THREE.Matrix4().makeTranslation(PEAR_LEAF.x, pearParts.lift, -PEAR_LEAF.y))
    collect(bucket, pearParts.leaf.geometry, matrix)
  }
  return packHull(bucket)
}

function pulpMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.34,
    metalness: 0,
    clearcoat: 0.72,
    clearcoatRoughness: 0.28,
    transmission: 0.2,
    thickness: 0.32,
    ior: 1.4,
    attenuationColor: color,
    attenuationDistance: 0.28,
    envMapIntensity: 0.36,
    specularIntensity: 0.6,
  })
}

function createBuilt(spec) {
  const fruit = FRUIT[spec.kind]
  const geometry = new THREE.ExtrudeGeometry(shapeFrom(spec.points), { ...SLICE, ...fruit.extrude })
  const materials = [fruit.parts.body.materials[0].clone(), fruit.parts.body.materials[1].clone(), pulpMaterial(PULP[spec.kind])]
  try {
    smoothNormals(geometry)
    applyOriginalUVs(geometry, fruit.parts.body.bounds)
    isolateCut(geometry, spec.cutPath, fruit.bevel)
    geometry.computeBoundingSphere()
    const hull = hullOf(spec.kind, geometry, spec.ornaments)
    spec.hull = hull.points
    spec.minY = hull.minY
    spec.maxY = hull.maxY
  } catch (error) {
    geometry.dispose()
    for (const material of materials) material.dispose()
    throw error
  }
  const built = { geometry, materials }
  cache.set(spec.id, built)
  return built
}

function discard(id) {
  const timer = pending.get(id)
  if (timer) clearTimeout(timer)
  pending.delete(id)
  const built = cache.get(id)
  if (!built) return
  cache.delete(id)
  built.geometry.dispose()
  for (const material of built.materials) material.dispose()
}

function assignOrnaments(kind, loopA, loopB) {
  const flags = [{}, {}]
  const give = (key, point) => {
    const inA = pointInPolygon(point, loopA)
    const inB = pointInPolygon(point, loopB)
    if (inA && !inB) flags[0][key] = true
    else if (inB && !inA) flags[1][key] = true
    else if (polygonArea(loopA) >= polygonArea(loopB)) flags[0][key] = true
    else flags[1][key] = true
  }
  if (kind === 'berry') give('crown', [STRAWBERRY_CROWN.x, STRAWBERRY_CROWN.y])
  if (kind === 'orchard') {
    give('stem', [PEAR_STEM.x, PEAR_STEM.y])
    give('leaf', [PEAR_LEAF.x, PEAR_LEAF.y])
  }
  return flags
}

export function makeHalves(snapshot, cut) {
  const ornaments = assignOrnaments(snapshot.kind, cut.loops[0], cut.loops[1])
  const ax = cut.cutPath[0][0]
  const ay = cut.cutPath[0][1]
  const bx = cut.cutPath[cut.cutPath.length - 1][0]
  const by = cut.cutPath[cut.cutPath.length - 1][1]
  const dx = bx - ax
  const dy = by - ay
  const length = Math.hypot(dx, dy) || 1
  const quat = new THREE.Quaternion(...snapshot.quaternion)
  const perp = new THREE.Vector3(-dy / length, 0, dx / length).applyQuaternion(quat).normalize()
  const tangent = new THREE.Vector3(dx / length, 0, -dy / length).applyQuaternion(quat).normalize()
  const bulk = [1, 1.25, 1.5, 1.75, 2][snapshot.bulkStep] ?? 1
  const push = 1.15 * bulk * bulk * bulk
  const specs = []
  try {
    for (let index = 0; index < 2; index += 1) {
      const sign = index === 0 ? 1 : -1
      const area = cut.areas[index]
      const suffix = snapshot.suffix ? `${snapshot.suffix}·${index === 0 ? 'a' : 'b'}` : index === 0 ? 'a' : 'b'
      const spec = {
        id: `cut-${cutSerial++}`,
        kind: snapshot.kind,
        serial: snapshot.serial,
        suffix,
        points: cut.loops[index],
        cutPath: cut.cutPath,
        position: [
          snapshot.position[0] + perp.x * 0.05 * sign,
          snapshot.position[1] + perp.y * 0.05 * sign,
          snapshot.position[2] + perp.z * 0.05 * sign,
        ],
        quaternion: snapshot.quaternion.slice(),
        linvel: [
          snapshot.linvel[0] + perp.x * 1.7 * sign,
          snapshot.linvel[1] + perp.y * 1.7 * sign + 0.06,
          snapshot.linvel[2] + perp.z * 1.7 * sign,
        ],
        angvel: [
          snapshot.angvel[0] + tangent.x * 0.75 * sign,
          snapshot.angvel[1] + tangent.y * 0.75 * sign,
          snapshot.angvel[2] + tangent.z * 0.75 * sign,
        ],
        impulse: [perp.x * push * sign, perp.y * push * sign, perp.z * push * sign],
        bulkStep: snapshot.bulkStep,
        area,
        originArea: snapshot.originArea,
        born: performance.now() + index * 0.001,
        phase: 'in',
        ornaments: ornaments[index],
      }
      createBuilt(spec)
      specs.push(spec)
    }
  } catch (error) {
    for (const spec of specs) discard(spec.id)
    throw error
  }
  return specs
}

export function viewFragment(spec) {
  return cache.get(spec.id) || createBuilt(spec)
}

export function keepFragment(id) {
  const timer = pending.get(id)
  if (!timer) return
  clearTimeout(timer)
  pending.delete(id)
}

export function dropFragment(id) {
  if (pending.has(id)) return
  pending.set(
    id,
    setTimeout(() => {
      pending.delete(id)
      discard(id)
    }, 0),
  )
}
