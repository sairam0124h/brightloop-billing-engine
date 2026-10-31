export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

export function clampPage(page: number): number {
  if (!Number.isFinite(page) || page < 1) return DEFAULT_PAGE;
  return Math.floor(page);
}

export function clampPageSize(size: number): number {
  if (!Number.isFinite(size) || size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(size), MAX_PAGE_SIZE);
}

export function paginate(page: number, size: number) {
  const p = clampPage(page);
  const s = clampPageSize(size);
  return { page: p, pageSize: s, skip: (p - 1) * s, take: s };
}