export function calculateCenterFromEdges(
  parentLat: number,
  parentLng: number,
  parentRotateDeg: number,
  parentWidthMm: number,
  parentHeightMm: number,
  childWidthMm: number,
  childHeightMm: number,
  offsetX: number,
  offsetY: number,
) {
  const angle = (parentRotateDeg * Math.PI) / 180
  const parentHalfWidthM = (Number(parentWidthMm) || 0) / 2000
  const parentHalfHeightM = (Number(parentHeightMm) || 0) / 2000
  const childHalfWidthM = (Number(childWidthMm) || 0) / 2000
  const childHalfHeightM = (Number(childHeightMm) || 0) / 2000
  const localDx =
    Math.sign(offsetX) *
    (Math.abs(offsetX) + parentHalfWidthM + childHalfWidthM)
  const localDy =
    Math.sign(offsetY) *
    (Math.abs(offsetY) + parentHalfHeightM + childHalfHeightM)
  const dx = localDx * Math.cos(angle) - localDy * Math.sin(angle)
  const dy = localDx * Math.sin(angle) + localDy * Math.cos(angle)
  const deltaLat = dy / 111320
  const deltaLng = dx / (111320 * Math.cos((parentLat * Math.PI) / 180))
  return { lat: parentLat + deltaLat, lng: parentLng + deltaLng }
}

export function calculateOffsetsFromCenters(
  parentLat: number,
  parentLng: number,
  parentRotateDeg: number,
  parentWidthMm: number,
  parentHeightMm: number,
  childLat: number,
  childLng: number,
  childWidthMm: number,
  childHeightMm: number,
) {
  const angle = (parentRotateDeg * Math.PI) / 180
  const parentHalfWidthM = (Number(parentWidthMm) || 0) / 2000
  const parentHalfHeightM = (Number(parentHeightMm) || 0) / 2000
  const childHalfWidthM = (Number(childWidthMm) || 0) / 2000
  const childHalfHeightM = (Number(childHeightMm) || 0) / 2000
  const dy = (Number(childLat) - Number(parentLat)) * 111320
  const dx =
    (Number(childLng) - Number(parentLng)) *
    (111320 * Math.cos((parentLat * Math.PI) / 180))
  const localDx = dx * Math.cos(angle) + dy * Math.sin(angle)
  const localDy = -dx * Math.sin(angle) + dy * Math.cos(angle)
  const offsetX =
    Math.sign(localDx) *
    Math.max(0, Math.abs(localDx) - (parentHalfWidthM + childHalfWidthM))
  const offsetY =
    Math.sign(localDy) *
    Math.max(0, Math.abs(localDy) - (parentHalfHeightM + childHalfHeightM))
  return { offsetX, offsetY }
}
