export function isInStock(product) {
  return Object.values(product.stock).some((units) => units > 0)
}

export function totalStock(product) {
  return Object.values(product.stock).reduce((sum, units) => sum + units, 0)
}

export function imageRef(product, colour) {
  return {
    id: product.id,
    name: product.name,
    silhouette: product.silhouette,
    colourHex: (colour ?? product.colours[0]).hex,
  }
}

export function productPath(product) {
  return `/product/${product.slug}`
}
