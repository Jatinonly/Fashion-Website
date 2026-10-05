export const CATEGORIES = {
  all: { slug: 'all', label: 'All products', description: 'The full Nocturne wardrobe.' },
  new: {
    slug: 'new',
    label: 'New arrivals',
    description: 'Fresh pieces from the autumn–winter collection.',
  },
  sale: {
    slug: 'sale',
    label: 'Sale',
    description: 'End-of-season prices on selected styles. Limited stock.',
  },
  women: {
    slug: 'women',
    label: 'Women',
    description: 'Dresses, tailoring, knitwear and second-skin layers.',
  },
  men: { slug: 'men', label: 'Men', description: 'Workwear, denim, knits and relaxed tailoring.' },
  bags: { slug: 'bags', label: 'Bags', description: 'Leather shoulder bags, totes and minis.' },
  shoes: { slug: 'shoes', label: 'Shoes', description: 'Pumps, flats, boots and sneakers.' },
  jewellery: {
    slug: 'jewellery',
    label: 'Jewellery',
    description: 'Sterling silver and gold-plated pieces, made in Jaipur.',
  },
}

export function isCollectionSlug(value) {
  return value !== undefined && value in CATEGORIES
}
