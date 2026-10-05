# Nocturne — clothing e-commerce frontend

A responsive storefront (360px → desktop) built with **Vite + React 19 (JavaScript)**, **Tailwind CSS v4**, **Zustand** and **React Router**. The visual direction follows an editorial fashion layout: a neon announcement bar, edge-to-edge product grids with hairline separators, oversized neon category banners, and a sticky product-detail panel.

Data comes from the Express + Postgres API in `../backend` when `VITE_API_BASE_URL` is set, or from in-browser mock services when it's empty. See the root `README.md` for full setup.

---

## Getting started

Run commands from the **repo root** (npm workspaces): `npm install`, then `npm run dev` starts the API and this app together. To run only the frontend: `npm run dev:web`.

```bash
cp frontend/.env.example frontend/.env   # VITE_API_BASE_URL=/api uses the backend; empty = mocks
```

The scripts below also work inside `frontend/` (`npm run <script> -w frontend` from the root).

| Script                 | What it does                         |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the Vite dev server            |
| `npm run build`        | Production build (`vite build`)      |
| `npm run preview`      | Serve the production build           |
| `npm run lint`         | ESLint (React Hooks + Refresh)       |
| `npm run format`       | Prettier (with Tailwind class order) |
| `npm run format:check` | Check formatting without writing     |

**Demo login:** `demo@nocturne.in` / `password123` (or sign up with any email; accounts are stored in localStorage).

---

## Features

- **Home:** split hero banners, offers strip, new arrivals, category tiles, accessory banners and an editorial block.
- **Listing:** `/shop/:collection`, where collection is `women`, `men`, `bags`, `shoes`, `jewellery`, `new`, `sale` or `all`. Also `/search?q=`.
  - Sub-category tabs (`?type=Dresses`).
  - Filters: price (presets + min/max), size, colour, in-stock only, and sort.
  - Desktop sidebar; on mobile/tablet, a filter-and-sort drawer.
  - Active-filter chips, a skeleton while loading, and a "no results" empty state.
- **Product detail:** thumbnail rail with stacked gallery on desktop and a swipe carousel on mobile.
  - Colour and size selection (sold-out sizes are struck through), quantity, and a size-guide modal.
  - Add to bag (opens the mini-cart drawer), wishlist, info tabs, and a related-products carousel.
- **Cart:** change quantity (capped at stock), remove items, free-delivery progress bar, and a price summary (MRP, discount, shipping, total).
- **Checkout** (login required):
  1. Validated Indian address form (10-digit mobile, 6-digit PIN, state list).
  2. Payment: Razorpay (simulated popup with success, failure and cancel) or cash on delivery.
  - Shows an order summary throughout.
- **Login / signup:** validation and fake auth, with a redirect back to where you came from.
- **Orders:** order history and order detail (status timeline, items, address, payment, totals).
- **Also included:**
  - Wishlist page, search overlay with live suggestions, and a 404 page.
  - Placeholder content pages for the footer links.
  - Lazy-loaded routes, skip link, focus-trapped modals/drawers, labelled controls, and `prefers-reduced-motion` support.

---

## Folder structure

```
src/
  components/
    ui/          Button, ButtonLink, Input, Select, Checkbox, Badge, Modal, Drawer,
                 Skeleton, EmptyState, Alert, QuantityStepper, Rating, Spinner …
    layout/      Layout, AnnouncementBar, Navbar, AccountMenu, MobileMenu,
                 SearchOverlay, Footer, Breadcrumbs, AuthShell …
    product/     ProductCard, ProductGrid, Price, filters, gallery, selectors,
                 PurchasePanel, ProductCarousel, CategoryBanner …
    cart/        CartDrawer, CartLineItem, PriceBreakdown, FreeShippingProgress
    checkout/    AddressForm, PaymentMethodSelector, CheckoutOrderSummary,
                 CheckoutSteps, MockRazorpayHost (mock only)
    order/       OrderCard, OrderStatusBadge, OrderTimeline
    home/        OffersStrip, CategoryTiles, Editorial
  pages/         One file per route (default exports, lazy-loaded)
  routes/        AppRouter (lazy routes) + ProtectedRoute / GuestRoute
  store/         cartStore, wishlistStore, authStore, filterStore, ordersStore, uiStore
  services/      productService, authService, orderService, paymentService, http helpers
  data/          Mock catalogue (43 products), categories, Indian states
  lib/           formatINR, images, pricing, validation, product helpers, cn
  hooks/         useQuery, useDebouncedValue, useDocumentTitle, useOverlay
  config/        site.js (brand, nav, footer), env.js
  index.css      Design tokens (Tailwind @theme)
```

**State persistence:** `cart`, `wishlist`, `auth` (user + token only) and `orders` persist to localStorage via Zustand's `persist` middleware, under the keys `nocturne:*`. Filters and UI state are not persisted.

---

## Changing the theme

All colours, fonts, radii, shadows and animations are design tokens in **`src/index.css`** inside `@theme { … }`.

The default Tailwind palette is turned off (`--color-*: initial`), so components can only use token classes such as `bg-surface`, `text-ink`, `bg-accent`, `border-line` and `text-sale`. Change a value once and the whole UI follows:

```css
@theme {
  --color-accent: #3cff00; /* signature neon → try #ff4d00 */
  --color-surface: #ebebeb; /* product tile background */
  --font-sans: 'Inter Tight', …;
  --font-display: 'Italiana', …; /* section headings, newsletter */
  --radius-sm: 3px;
}
```

Fonts are loaded from Google Fonts in `index.html`. Update that `<link>` if you change families.

**Brand content** (name, logo text, announcements, nav links, footer columns, legal links, support details, free-shipping threshold) lives in **`src/config/site.js`**.

---

## Replacing images

Every image goes through **`src/lib/images.js`**:

- `getProductImages(ref)` / `getProductImage(ref, view)`: product images. These currently return generated SVG garment silhouettes in the product's colour.
- `bannerImage(key, w, h)`: hero, category and editorial images. These currently come from `picsum.photos` with stable seeds.

To use real photography, change only those functions. For example:

```js
export function getProductImages(ref) {
  return ['front', 'back', 'detail'].map((view) => ({
    src: `https://cdn.example.com/products/${ref.id}/${slug(ref.colourHex)}/${view}.jpg`,
    alt: `${ref.name} — ${view}`,
  }))
}
```

If your API returns `product.images`, add that field to the `Product` typedef (in `productService.js`), then return it here.

---

## Mock services vs the real backend

Components and stores never touch `src/data/*` directly. They only call `src/services/*`.

Each service checks `env.useMockApi` (true when `VITE_API_BASE_URL` is empty). In API mode it calls the backend through `apiRequest` in `services/http.js`, which attaches the logged-in user's token automatically and logs the user out if the API rejects it (401). Function signatures and return shapes are identical in both modes, so components don't care which one is active.

| Service        | Endpoints (backend/src/routes)                                                              |
| -------------- | ------------------------------------------------------------------------------------------- |
| productService | `GET /products`, `GET /products/:slug`, `GET /products/:id/related`, `GET /products/search` |
| authService    | `POST /auth/login`, `POST /auth/signup`, `POST /auth/logout`                                |
| orderService   | `POST /orders`, `GET /orders`, `GET /orders/:id`                                            |
| paymentService | not built yet: `POST /payments/razorpay/order`, `POST /payments/razorpay/verify`            |

The backend re-prices the cart and checks stock when creating an order; totals sent by the client are ignored.

`src/data/products.js` is also the source for `npm run db:seed`. Once products are managed in the database, the mock branches and that file can be deleted.

---

## Enabling real Razorpay

`src/services/paymentService.js` implements the standard Razorpay Checkout flow. Every place to change is marked `TODO(razorpay)`.

1. **Backend: create order.** `POST /payments/razorpay/order` calls `razorpay.orders.create({ amount: rupees * 100, currency: 'INR', receipt })` using your **key secret** (server only) and returns the order.
2. **Frontend: set the public key.** Put `VITE_RAZORPAY_KEY_ID=rzp_test_…` (or `rzp_live_…`) in `.env`.
3. **Turn off the mock.** Make `env.useMockPayments` return `this.useMockApi` in `src/config/env.js` (it's hard-wired to `true` until the backend has the endpoints). Then `paymentService` will:
   - call your backend to create the order,
   - load `https://checkout.razorpay.com/v1/checkout.js` (`loadRazorpayScript`),
   - open `new window.Razorpay({...})` with the order id and prefill (`openRazorpayCheckout`),
   - send `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` to `POST /payments/razorpay/verify`.
4. **Backend: verify the signature.** Compute `HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET)`, compare it to `razorpay_signature`, then mark the order paid. Adding a webhook (`payment.captured`) is recommended too.
5. **Remove mock-only code.** Delete `src/services/mockRazorpay.js` and `src/components/checkout/MockRazorpayHost.jsx`, and remove `<MockRazorpayHost />` from `Layout.jsx`.

Cash on delivery skips Razorpay and creates the order with `payment.status = 'pending'`. Until step 4 exists, the backend also records simulated Razorpay payments as `pending`.

---

## TODO / next steps

- Razorpay endpoints on the backend (see the `TODO(razorpay)` markers).
- Replace placeholder images in `lib/images.js`.
- Auth: token refresh, password reset and login rate limiting. (The backend hashes passwords with bcrypt; the mock stores plain passwords in localStorage and is for UI work only.)
- Restock on order cancellation.
- Saved addresses, coupons, order cancellation/returns, reviews, and the newsletter API.
- CMS content for the placeholder info pages (`/help/*`, `/legal/*`, `/about`, `/stores`).
- Tests (Vitest + Testing Library, Playwright for the checkout flow).
