const pieces = new Map()

export function registerPiece(id, api) {
  pieces.set(id, api)
  return () => {
    if (pieces.get(id) === api) pieces.delete(id)
  }
}

export function eachPiece(visit) {
  for (const api of pieces.values()) visit(api)
}
