export function calculateCenterFromEdges(
  parentLat: number,
  parentLng: number,
  parentRotateDeg: number,
  parentWidthMm: number,
  parentHeightMm: number,
  childWidthMm: number,
  childHeightMm: number,
  offsetX: number, // Now in millimeters
  offsetY: number, // Now in millimeters
) {
  const angle = (parentRotateDeg * Math.PI) / 180

  // Convert mm to meters for calculations
  const parentHalfWidthM = (Number(parentWidthMm) || 0) / 2000
  const parentHalfHeightM = (Number(parentHeightMm) || 0) / 2000
  const childHalfWidthM = (Number(childWidthMm) || 0) / 2000
  const childHalfHeightM = (Number(childHeightMm) || 0) / 2000

  // Convert offset from mm to meters
  const offsetXMeters = Number(offsetX) / 1000
  const offsetYMeters = Number(offsetY) / 1000

  const localDx =
    Math.sign(offsetXMeters) *
    (Math.abs(offsetXMeters) + parentHalfWidthM + childHalfWidthM)
  const localDy =
    Math.sign(offsetYMeters) *
    (Math.abs(offsetYMeters) + parentHalfHeightM + childHalfHeightM)
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

  // Convert mm to meters for calculations
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

  // Calculate offset in meters, then convert to millimeters
  const offsetXMeters =
    Math.sign(localDx) *
    Math.max(0, Math.abs(localDx) - (parentHalfWidthM + childHalfWidthM))
  const offsetYMeters =
    Math.sign(localDy) *
    Math.max(0, Math.abs(localDy) - (parentHalfHeightM + childHalfHeightM))

  // Convert meters to millimeters for storage
  const offsetX = offsetXMeters * 1000
  const offsetY = offsetYMeters * 1000

  return { offsetX, offsetY }
}
