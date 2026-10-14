const MIN_HALF = 0.02

export function polygonArea(poly) {
  let sum = 0
  for (let index = 0; index < poly.length; index += 1) {
    const next = poly[(index + 1) % poly.length]
    sum += poly[index][0] * next[1] - next[0] * poly[index][1]
  }
  return Math.abs(sum) * 0.5
}

export function pointInPolygon(point, poly) {
  let inside = false
  for (let index = 0, previous = poly.length - 1; index < poly.length; previous = index, index += 1) {
    const xi = poly[index][0]
    const yi = poly[index][1]
    const xj = poly[previous][0]
    const yj = poly[previous][1]
    const crosses = yi > point[1] !== yj > point[1]
    if (crosses && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function segmentHit(ax, ay, bx, by, cx, cy, dx, dy) {
  const rx = bx - ax
  const ry = by - ay
  const sx = dx - cx
  const sy = dy - cy
  const den = rx * sy - ry * sx
  if (Math.abs(den) < 1e-10) return null
  const t = ((cx - ax) * sy - (cy - ay) * sx) / den
  const u = ((cx - ax) * ry - (cy - ay) * rx) / den
  if (t < -1e-5 || t > 1 + 1e-5 || u < -1e-5 || u > 1 + 1e-5) return null
  return { t, u, x: ax + t * rx, y: ay + t * ry }
}

function crossings(from, to, poly) {
  const hits = []
  for (let index = 0; index < poly.length; index += 1) {
    const start = poly[index]
    const end = poly[(index + 1) % poly.length]
    const hit = segmentHit(from[0], from[1], to[0], to[1], start[0], start[1], end[0], end[1])
    if (!hit) continue
    hits.push({ x: hit.x, y: hit.y, t: hit.t, u: hit.u, edge: index })
  }
  hits.sort((left, right) => left.t - right.t)
  const unique = []
  for (const hit of hits) {
    const previous = unique[unique.length - 1]
    if (previous && Math.hypot(previous.x - hit.x, previous.y - hit.y) < 1e-3) continue
    unique.push(hit)
  }
  return unique
}

export function createCutState() {
  return { ready: false, inside: false, entry: null, path: [] }
}

export function advanceCut(state, from, to, outline) {
  if (!state.ready) {
    state.inside = pointInPolygon(from, outline)
    state.ready = true
    state.entry = null
    state.path = []
  }
  const hits = crossings(from, to, outline)
  for (const hit of hits) {
    if (!state.inside) {
      state.entry = hit
      state.path = []
      state.inside = true
    } else if (state.entry) {
      return { entry: state.entry, exit: hit, path: state.path }
    } else {
      state.inside = false
    }
  }
  if (state.inside) {
    const last = state.path[state.path.length - 1]
    if (!last || Math.hypot(last[0] - to[0], last[1] - to[1]) > 0.012) state.path.push([to[0], to[1]])
  }
  return null
}

function walk(poly, from, to) {
  const count = poly.length
  if (from.edge === to.edge) {
    if (from.u <= to.u) return [[from.x, from.y], [to.x, to.y]]
    const loop = [[from.x, from.y]]
    let vertex = (from.edge + 1) % count
    for (let step = 0; step < count; step += 1) {
      loop.push([poly[vertex][0], poly[vertex][1]])
      vertex = (vertex + 1) % count
    }
    loop.push([to.x, to.y])
    return loop
  }
  const loop = [[from.x, from.y]]
  let vertex = (from.edge + 1) % count
  const stop = (to.edge + 1) % count
  let guard = 0
  while (vertex !== stop && guard <= count) {
    loop.push([poly[vertex][0], poly[vertex][1]])
    vertex = (vertex + 1) % count
    guard += 1
  }
  loop.push([to.x, to.y])
  return loop
}

function clean(points) {
  const result = []
  for (const point of points) {
    const last = result[result.length - 1]
    if (last && Math.hypot(last[0] - point[0], last[1] - point[1]) < 1e-4) continue
    result.push([point[0], point[1]])
  }
  if (result.length > 2) {
    const first = result[0]
    const last = result[result.length - 1]
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-4) result.pop()
  }
  return result
}

export function evaluateCut(outline, result) {
  const cutPath = clean([[result.entry.x, result.entry.y], ...result.path, [result.exit.x, result.exit.y]])
  if (cutPath.length < 2) return null
  const forward = walk(outline, result.entry, result.exit)
  const backward = walk(outline, result.exit, result.entry)
  const loopA = clean([
    [result.entry.x, result.entry.y],
    ...result.path,
    [result.exit.x, result.exit.y],
    ...backward.slice(1, -1),
  ])
  const loopB = clean([
    [result.entry.x, result.entry.y],
    ...forward.slice(1, -1),
    [result.exit.x, result.exit.y],
    ...[...result.path].reverse(),
  ])
  if (loopA.length < 3 || loopB.length < 3) return null
  const whole = polygonArea(outline)
  const areaA = polygonArea(loopA)
  const areaB = polygonArea(loopB)
  if (whole < 1e-5 || areaA < whole * MIN_HALF || areaB < whole * MIN_HALF) return null
  if (Math.abs(areaA + areaB - whole) > Math.max(0.02, whole * 0.12)) return null
  return { loops: [loopA, loopB], cutPath, areas: [areaA, areaB] }
}

export function tooSmallToCut(area, originArea) {
  return area < originArea * 0.08
}
