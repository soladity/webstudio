export type Rect = Pick<DOMRect, "top" | "left" | "width" | "height">;

// https://stackoverflow.com/a/18157551/478603
const getDistanceToRect = (rect: Rect, { x, y }: { x: number; y: number }) => {
  const dx = Math.max(rect.left - x, 0, x - (rect.left + rect.width));
  const dy = Math.max(rect.top - y, 0, y - (rect.top + rect.height));
  return Math.sqrt(dx * dx + dy * dy);
};

export const getClosestRectIndex = (
  rects: Rect[],
  point: { x: number; y: number }
) => {
  if (rects.length === 0) {
    return -1;
  }
  const sorted = rects
    .map((rect, index) => ({
      index,
      distance: getDistanceToRect(rect, point),
    }))
    .sort((a, b) => a.distance - b.distance);
  return sorted[0].index;
};

export const isEqualRect = (a: Rect | undefined, b: Rect) =>
  a !== undefined &&
  a.top === b.top &&
  a.left === b.left &&
  a.width === b.width &&
  a.height === b.height;

export const isNearEdge = (
  { x, y }: { x: number; y: number },
  edgeDistanceThreshold: number,
  rect: Rect
) =>
  Math.min(
    y - rect.top,
    rect.top + rect.height - y,
    x - rect.left,
    rect.left + rect.width - x
  ) <= edgeDistanceThreshold;

export const rectRelativeToRect = (relativeTo: Rect, rect: Rect) => ({
  top: rect.top - relativeTo.top,
  left: rect.left - relativeTo.left,
  width: rect.width,
  height: rect.height,
});

export const pointRelativeToRect = (
  relativeTo: Rect,
  point: { x: number; y: number }
) => ({ x: point.x - relativeTo.left, y: point.y - relativeTo.top });
