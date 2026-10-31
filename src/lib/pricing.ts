export interface ProductLike {
  salesPrice: number;
}

export interface VariantLike {
  extraPrice: number;
}

export function getUnitPrice(
  product: ProductLike,
  variant?: VariantLike | null,
): number {
  return product.salesPrice + (variant?.extraPrice ?? 0);
}

