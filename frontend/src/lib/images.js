/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL IMAGE HELPER
 *  Every product and banner image in the app is resolved here.
 *  To switch to real photography, change the two functions below
 *  (`getProductImages` and `bannerImage`) to return your CDN URLs —
 *  e.g. `https://cdn.example.com/products/${product.id}/${view}.jpg`
 *  or a `product.images` array coming from the API.
 * ─────────────────────────────────────────────────────────────
 */

/** Minimal info needed to render a product image (works for Product and CartItem). */

const VIEWS = ['front', 'back', 'detail']
/** All gallery images for a product in the given colour. */
export function getProductImages(ref) {
  return VIEWS.map((view) => ({
    src: svgDataUri(renderGarment(ref.silhouette, ref.colourHex, view)),
    alt: `${ref.name} — ${view} view`,
  }))
}

/** The primary (first) image, used for cards, cart lines and order history. */
export function getProductImage(ref, view = 'front') {
  return {
    src: svgDataUri(renderGarment(ref.silhouette, ref.colourHex, view)),
    alt: ref.name,
  }
}

// ─── Banners / editorial ──────────────────────────────────────

/** Placeholder photography from picsum.photos (seeded = stable per key). */
export function bannerImage(key, width = 1200, height = 1500) {
  return `https://picsum.photos/seed/nocturne-${key}/${width}/${height}`
}

// ─── Placeholder garment artwork (SVG) ────────────────────────

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function isDark(hex) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b < 140
}

const SHAPES = {
  dress: (f, s) =>
    `<path d="M126 58h48l8 26-12 46 50 210H80l50-210-12-46z" fill="${f}"/>
     <path d="M126 58c6 18 42 18 48 0" fill="none" stroke="${s}" stroke-width="2"/>
     <path d="M130 130h40" stroke="${s}" stroke-width="2"/>`,
  top: (f, s) =>
    `<path d="M112 96l26-12c4 14 20 14 24 0l26 12 34 40-24 18-12-14v130H114V140l-12 14-24-18z" fill="${f}"/>
     <path d="M138 84c4 14 20 14 24 0" fill="none" stroke="${s}" stroke-width="2"/>`,
  shirt: (f, s) =>
    `<path d="M110 92l28-12 12 16 12-16 28 12 22 30 12 150h-24l-10-120v132H110V152l-10 120H76l12-150z" fill="${f}"/>
     <path d="M150 96v178M138 80l12 22 12-22" fill="none" stroke="${s}" stroke-width="2"/>
     <circle cx="156" cy="130" r="2.5" fill="${s}"/><circle cx="156" cy="170" r="2.5" fill="${s}"/><circle cx="156" cy="210" r="2.5" fill="${s}"/>`,
  jacket: (f, s) =>
    `<path d="M104 88l34-10 12 40 12-40 34 10 24 36 14 168h-28l-10-130v138H104V162l-10 130H66l14-168z" fill="${f}"/>
     <path d="M138 78l-8 40 20 40 20-40-8-40M150 158v138" fill="none" stroke="${s}" stroke-width="2"/>
     <path d="M116 220h22M162 220h22" stroke="${s}" stroke-width="2"/>`,
  knit: (f, s) =>
    `<path d="M108 92l30-10c4 12 20 12 24 0l30 10 26 38 10 150h-26l-8-118v132H108V162l-8 118H74l10-150z" fill="${f}"/>
     <path d="M108 280h84M108 286h84M108 292h84M74 272h26M200 272h26" stroke="${s}" stroke-width="1.5"/>`,
  trousers: (f, s) =>
    `<path d="M114 64h72l10 276h-38l-8-196-8 196h-38z" fill="${f}"/>
     <path d="M114 78h72M150 78v66" stroke="${s}" stroke-width="2"/>`,
  skirt: (f, s) =>
    `<path d="M118 108h64l40 196H78z" fill="${f}"/>
     <path d="M118 122h64M136 122l-14 182M164 122l14 182" stroke="${s}" stroke-width="1.5"/>`,
  bag: (f, s) =>
    `<path d="M112 190c0-70 76-70 76 0" fill="none" stroke="${f}" stroke-width="9"/>
     <path d="M84 186h132l-12 104c-1 10-8 16-18 16h-72c-10 0-17-6-18-16z" fill="${f}"/>
     <path d="M84 206h132" stroke="${s}" stroke-width="2"/><circle cx="150" cy="222" r="6" fill="${s}"/>`,
  tote: (f, s) =>
    `<path d="M118 170v-30c0-26 64-26 64 0v30" fill="none" stroke="${f}" stroke-width="8"/>
     <path d="M80 164h140l-10 150H90z" fill="${f}"/>
     <path d="M80 180h140" stroke="${s}" stroke-width="2"/>`,
  earrings: (f, s) =>
    `<circle cx="118" cy="150" r="12" fill="${f}"/><circle cx="182" cy="150" r="12" fill="${f}"/>
     <path d="M118 162v18M182 162v18" stroke="${f}" stroke-width="3"/>
     <circle cx="118" cy="204" r="22" fill="${f}"/><circle cx="182" cy="204" r="22" fill="${f}"/>
     <circle cx="112" cy="196" r="6" fill="${s}" opacity=".5"/><circle cx="176" cy="196" r="6" fill="${s}" opacity=".5"/>`,
  necklace: (f, s) =>
    `<path d="M92 100c0 120 116 120 116 0" fill="none" stroke="${f}" stroke-width="4"/>
     <path d="M150 190l-18 30 18 36 18-36z" fill="${f}"/><path d="M150 200v46" stroke="${s}" stroke-width="1.5"/>`,
  ring: (f, s) =>
    `<circle cx="150" cy="216" r="46" fill="none" stroke="${f}" stroke-width="12"/>
     <path d="M130 170l20-26 20 26-20 14z" fill="${f}"/><path d="M140 168h20" stroke="${s}" stroke-width="1.5"/>`,
  heels: (f, s) =>
    `<path d="M70 250c40 0 70-14 96-30 22-14 40-14 56 0l6 40-10 4-8-22c-30 20-90 28-140 20z" fill="${f}"/>
     <path d="M212 252l-6 52h8l12-48z" fill="${f}"/><path d="M82 254c40 4 90-6 120-30" fill="none" stroke="${s}" stroke-width="1.5"/>`,
  sneakers: (f, s) =>
    `<path d="M64 262c0-24 10-40 32-44l40-30c10 18 40 26 66 28 24 2 36 16 36 46z" fill="${f}"/>
     <path d="M64 262h174v12H64z" fill="${s}" opacity=".6"/>
     <path d="M120 208l14 14M132 198l14 14M144 190l14 14" stroke="${s}" stroke-width="2"/>`,
  boots: (f, s) =>
    `<path d="M120 90h56v150c26 6 52 18 52 44v14H96v-50c12-10 24-30 24-48z" fill="${f}"/>
     <path d="M96 288h132" stroke="${s}" stroke-width="3"/><path d="M176 120h-56" stroke="${s}" stroke-width="1.5"/>`,
}

function renderGarment(silhouette, colourHex, view) {
  const seam = isDark(colourHex) ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)'
  const shape = SHAPES[silhouette](colourHex, seam)
  const transform =
    view === 'back'
      ? 'translate(300 0) scale(-1 1)'
      : view === 'detail'
        ? 'translate(-150 -170) scale(2)'
        : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="900" height="1200"><g transform="${transform}">${shape}</g></svg>`
}
