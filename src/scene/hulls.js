import * as THREE from 'three'
import { ConvexHull } from 'three/addons/math/ConvexHull.js'
import { FLAT_ROTATION, SLICE, sliceHeight } from '../utils/jelly'
import {
  PEAR_LEAF,
  PEAR_STEM,
  STRAWBERRY_CROWN,
  blossomShape,
  pearLeafShape,
  pearShape,
  pearStemShape,
  sepalShape,
  starfruitShape,
  strawberryShape,
} from '../utils/shapes'

const flatEuler = new THREE.Euler(...FLAT_ROTATION)

function addGeometry(bucket, geometry, matrix) {
  const baked = geometry.clone()
  baked.applyMatrix4(matrix)
  const position = baked.attributes.position
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const key = `${Math.round(x * 40)},${Math.round(y * 40)},${Math.round(z * 40)}`
    if (!bucket.has(key)) bucket.set(key, [x, y, z])
  }
  baked.dispose()
  geometry.dispose()
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

function collect(bucket, shape, extrude, matrix) {
  addGeometry(bucket, new THREE.ExtrudeGeometry(shape, { ...SLICE, ...extrude }), matrix)
}

function pack(bucket) {
  const cloud = []
  for (const [x, y, z] of bucket.values()) cloud.push(new THREE.Vector3(x, y, z))
  const hull = new ConvexHull().setFromPoints(cloud)
  const values = []
  const seen = new Set()
  for (const face of hull.faces) {
    let edge = face.edge
    const start = edge
    do {
      const point = edge.head().point
      const key = `${point.x.toFixed(5)},${point.y.toFixed(5)},${point.z.toFixed(5)}`
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

function strawberryHull() {
  const bucket = new Map()
  const lift = sliceHeight() - 0.018
  collect(bucket, strawberryShape(), {}, rotationMatrix())
  collect(
    bucket,
    sepalShape(),
    { depth: 0.045, bevelThickness: 0.055, bevelSize: 0.028, bevelSegments: 4, curveSegments: 8 },
    placedMatrix(STRAWBERRY_CROWN.x, lift, -STRAWBERRY_CROWN.y),
  )
  return pack(bucket)
}

function pearHull() {
  const bucket = new Map()
  const lift = sliceHeight() - 0.016
  collect(bucket, pearShape(), {}, rotationMatrix())
  collect(
    bucket,
    pearStemShape(),
    { depth: 0.04, bevelThickness: 0.035, bevelSize: 0.018, bevelSegments: 3, curveSegments: 8 },
    placedMatrix(PEAR_STEM.x, lift, -PEAR_STEM.y),
  )
  const leaf = new THREE.ExtrudeGeometry(pearLeafShape(), {
    ...SLICE,
    depth: 0.04,
    bevelThickness: 0.045,
    bevelSize: 0.03,
    bevelSegments: 4,
    curveSegments: 10,
  })
  const matrix = rotationMatrix()
  matrix.premultiply(new THREE.Matrix4().makeTranslation(0, 0, -0.12))
  matrix.premultiply(new THREE.Matrix4().makeRotationY(PEAR_LEAF.yaw))
  matrix.premultiply(new THREE.Matrix4().makeTranslation(PEAR_LEAF.x, lift, -PEAR_LEAF.y))
  addGeometry(bucket, leaf, matrix)
  return pack(bucket)
}

function blossomHull() {
  const bucket = new Map()
  collect(bucket, blossomShape(), { bevelSize: 0.045, curveSegments: 6 }, rotationMatrix())
  return pack(bucket)
}

function starHull() {
  const bucket = new Map()
  collect(
    bucket,
    starfruitShape(),
    { depth: 0.13, bevelThickness: 0.18, bevelSize: 0.12, bevelSegments: 8 },
    rotationMatrix(),
  )
  return pack(bucket)
}

export const PIECE_SCALE = 0.87

export const HULLS = {
  berry: strawberryHull(),
  orchard: pearHull(),
  bloom: blossomHull(),
  tropic: starHull(),
}

export function restHeight(kind) {
  return -HULLS[kind].minY * PIECE_SCALE
}
