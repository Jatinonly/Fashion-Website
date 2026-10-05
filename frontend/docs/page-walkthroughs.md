# Page Walkthroughs

A beginner-friendly tour of three pages: **Product Listing**, **Product Detail** and **Cart**.
Each section covers what the page is, how it's laid out, where its data lives, what happens when you click things, and what to try in the browser.

Run `npm run dev` and open the app alongside this doc.

---

## Core idea: stores vs. services vs. local state

The same three building blocks appear on every page:

| Building block                                   | What it does                                                        | Example                                     |
| ------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------- |
| **Store** (`src/store/*.js`, built with Zustand) | **Remembers** data that many components share                       | `filterStore`, `cartStore`, `wishlistStore` |
| **Service** (`src/services/*.js`)                | **Gets and works out** data, such as fetching or filtering products | `productService.listProducts`               |
| **Local state** (`useState`)                     | Data that only one component needs                                  | the selected size on a product page         |

```
store    ──(what the user picked)──►  page  ──(query)──►  service
"remembers"                          "connects"          "does the work"
```

Services currently use fake data from `src/data`. Each has a `TODO(api)` comment showing the real backend call that will replace it, and the pages and stores won't need to change when that happens.

---

## 1. Product Listing Page

**File:** `src/pages/ProductListingPage.jsx`

### What it is

There's one component, and two URLs use it (`src/routes/AppRouter.jsx:25-26`):

- `/shop/women`, `/shop/bags`, … show one collection.
- `/search?q=dress` shows search results across everything.

The page works out what to show from the URL (lines 24-30):

```
/shop/women?type=Dresses
      │          │
  collection  subcategory
```

### Layout

```
┌──────────────────────────────────────────────┐
│ Breadcrumbs                                  │
│ WOMEN  (h1) + description                    │  header
├──────────────────────────────────────────────┤
│ All | Dresses | Knitwear | Tailoring …       │  SubcategoryTabs
├──────────────────────────────────────────────┤
│ 24 items                [Sort ▾]  [Filter]   │  toolbar (sticky)
├────────────┬─────────────────────────────────┤
│ FilterPanel│ [In stock ×] [M ×]  Clear all   │  ActiveFilters
│ (sidebar)  │ ┌────┬────┬────┬────┐           │
│ Availability│ │card│card│card│card│          │  ProductGrid
│ Price      │ ├────┼────┼────┼────┤           │
│ Size       │ │card│card│card│card│           │
│ Colour     │ └────┴────┴────┴────┘           │
└────────────┴─────────────────────────────────┘
```

How it changes with screen width (Tailwind breakpoints `sm`, `md`, `lg`, `xl`):

| Part                                                 | Phone         | Tablet (`md`) | Desktop (`lg`+)   |
| ---------------------------------------------------- | ------------- | ------------- | ----------------- |
| Sidebar `<aside>` (line 121)                         | hidden        | hidden        | shown, 260px wide |
| "Filter" button (line 109, `lg:hidden`)              | shown         | shown         | hidden            |
| Sort dropdown (line 103, `hidden sm:block`)          | in the drawer | shown         | shown             |
| Grid columns (`components/product/gridColumns.js:6`) | 2             | 3             | 3, then 4 at `xl` |

- **Two columns:** the sidebar and the grid sit side by side because of `lg:grid lg:grid-cols-[260px_1fr]` (line 120).
- **Hairline borders:** the grid has a 1px gap (`gap-px`) over a grey background (`bg-line`), so the background shows through as thin lines between cards (`gridColumns.js:1`).
- **Sticky parts:** the toolbar (line 98) and the sidebar (line 122) use `sticky`, so they stay on screen while you scroll.

### Where the filtering happens

| File                                                         | Job                                                                                                                                                        | Analogy                                |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `src/store/filterStore.js`                                   | **Remembers** what you picked (`sizes`, `colours`, price, `inStockOnly`, `sort`) and has small functions to change them (`toggleSize`, `setSort`, `reset`) | Your shopping list                     |
| `src/services/productService.js` → `listProducts` (line 128) | **Does** the filtering (lines 140-155) and sorting (line 157)                                                                                              | The shop assistant who finds the items |
| `ProductListingPage`                                         | Reads your choices from the store, packs them into a `query` (lines 48-60) and passes it to the service                                                    | The messenger                          |

### What happens when you click a filter

```
 You click "M"
     │
     ▼
 FilterPanel → filters.toggleSize('M')       FilterPanel.jsx:55
     │
     ▼
 filterStore: sizes = ['M']                  filterStore.js:19
     │
     ├──► ActiveFilters redraws → shows "M ×" chip
     ├──► Filter button shows "(1)"           ProductListingPage.jsx:115
     └──► ProductListingPage redraws
              │
              ▼
          builds a new `query` object        lines 48-60
              │  JSON.stringify(query) = new "key"
              ▼
          useQuery sees the key changed → refetches   hooks/useQuery.js:11-29
              │
              ▼
          productService.listProducts(query)
              │
              ▼
          { items, total, facets }
              │
              ▼
          Grid shows the new products, toolbar shows the new count
```

- **`useQuery`** turns the whole query into a text "key" and refetches only when that key changes. Because of `keepPreviousData: true`, the old products stay on screen while new ones load. The grid fades to half opacity during that time (line 156) instead of going blank.
- **`facets`** are the filter options to offer (which sizes and colours exist). They're worked out _before_ filtering (`productService.js:137`), so an option you've picked doesn't vanish from the list.

The same filter buttons appear in three places, and all of them read and write the same store, so they always agree:

| Where                | Component                                        | Shown when                              |
| -------------------- | ------------------------------------------------ | --------------------------------------- |
| Sidebar              | `FilterPanel`                                    | desktop                                 |
| Slide-in drawer      | `FilterDrawer` (`FilterPanel` plus sort buttons) | phone or tablet, after tapping "Filter" |
| Chips above the grid | `ActiveFilters`                                  | whenever at least one filter is on      |

### Special cases

- **Subcategory tabs work differently.** They're links that change the URL to `?type=Dresses` (`SubcategoryTabs.jsx:7-13`). They aren't saved in the store, which is why subcategory pages can be bookmarked but filters can't.
- **Filters reset when you change collection** (lines 38-40).
- **Price inputs only apply when you press Apply** (`PriceRangeFilter.jsx:23-31`). Preset buttons like "Under ₹5,000" apply right away.
- **Different states show different content** (lines 134-159): an error message, skeleton placeholders on first load, a "No results" message with "Clear filters", or the grid.

### Try it yourself

1. Open `/shop/women` on a wide window and click a colour. A chip appears, the count changes, and the grid fades briefly.
2. Click the chip's **×**. The sidebar button turns off too, because they share the store.
3. Pick filters that match nothing. You get "No results" with a **Clear filters** button.
4. Narrow the window and tap **Filter**. The drawer opens, and its "Show N items" button updates as you tap.
5. Click a subcategory tab. The URL changes, and filters you'd already set stay on.
6. Switch from Women to Men. All filters clear.

---

## 2. Product Detail Page

**File:** `src/pages/ProductDetailPage.jsx`

### What it is

One URL, `/product/:slug` (`AppRouter.jsx:27`), for example `/product/wool-wrap-coat`. The **slug** is the product's name in URL form, and the page uses it to look the product up.

| Component                         | Job                                                           |
| --------------------------------- | ------------------------------------------------------------- |
| `ProductDetailPage` (line 72)     | Reads the slug, fetches the product, and decides what to show |
| `ProductDetailSkeleton` (line 16) | Grey placeholder boxes shown while the product loads          |
| `ProductView` (line 35)           | The actual page, once the product has loaded                  |

```
URL /product/wool-wrap-coat
      │
      ▼
ProductDetailPage → getProductBySlug('wool-wrap-coat')   lines 74-76
      │
      ├─ loading?   → <ProductDetailSkeleton />   line 79
      ├─ not found? → <NotFoundPage />            line 80
      └─ found      → <ProductView product={…} /> line 82
```

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Women / Coats / Wool Wrap Coat          (Breadcrumbs)│
├─────┬─────────────────────────┬──────────────────────┤
│thumb│                         │ [NEW] [-20%]  badges │
│thumb│      big image 1        │ WOOL WRAP COAT  ₹12k │
│thumb│                         │ ★★★★☆ description    │
│     ├─────────────────────────┤ Colour ● ● ●         │  PurchasePanel
│     │      big image 2        │ Size  S M L XL       │  (sticky)
│     │                         │ Quantity [- 1 +]     │
│     ├─────────────────────────┤ [Add to bag] [♡]     │
│     │      big image 3        │ Details | Care | …   │
├─────┴─────────────────────────┴──────────────────────┤
│ Related products  ◄ card card card card ►            │  ProductCarousel
└──────────────────────────────────────────────────────┘
       ProductGallery
```

| Part                           | Phone                                                      | Tablet/desktop (`md`+)                                                         |
| ------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Overall layout (line 55)       | Everything stacked in one column                           | Two columns: gallery 1.4 parts wide, panel 1 part (`md:grid-cols-[1.4fr_1fr]`) |
| Gallery (`ProductGallery.jsx`) | Swipe carousel with arrows and dots (line 29, `md:hidden`) | Thumbnails plus large images stacked down the page (line 82, `hidden md:grid`) |
| Purchase panel (line 57)       | Sits under the images                                      | `md:sticky md:top-24`: stays on screen while you scroll                        |

The gallery contains both versions at once, and Tailwind classes decide which one is visible.

### Where the state lives

Unlike the listing page, most state here is **local**, because only this page needs it:

| State                              | Where                                 | Why there                                               |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| Selected **colour**                | `ProductView`, line 36                | Both the gallery and the panel need it                  |
| **Size**, **quantity**, size error | `PurchasePanel.jsx:20-23`             | Only the panel uses them                                |
| Current **image**                  | `ProductGallery.jsx:10`               | Only the gallery uses it                                |
| **Cart**, **wishlist**             | `cartStore`, `wishlistStore` (global) | The navbar, cart drawer and wishlist page need them too |

Colour is kept in the parent because two components need it. The parent passes it down to both. This is called **"lifting state up"**:

```
ProductView  ── colour ──┬──► ProductGallery   (shows images in that colour)
  (owns it)              └──► PurchasePanel → ColourSelector
                                   │
                                   └── onColourChange(setColour) ◄── you click a colour
```

### What happens when you click things

**Picking a colour:** `setColour` runs (line 36), which gives new `images` (line 37), and the gallery redraws. `<ProductGallery key={colour.name}>` (line 56) makes React rebuild the gallery from scratch, so it jumps back to the first image.

**Picking a size** (`SizeSelector.jsx`):

- Sizes are hidden radio buttons styled as boxes (lines 36-44).
- Sold-out sizes appear crossed out and disabled (lines 32, 41).
- If 3 or fewer are left, it shows "Only 2 left in this size" (line 55).
- Choosing a size clears any error and lowers the quantity if needed so it doesn't exceed stock (`PurchasePanel.jsx:91-95`).

**Clicking "Add to bag"** (`PurchasePanel.jsx:34-54`):

```
Click → no size chosen? → show "Please select a size", stop    lines 35-38
      │
      ▼ size chosen
cartStore.addItem({...product, size, colour}, quantity)        line 39
      │   same product, size and colour already in the bag? → increase its quantity
      │   new one? → add a new line (cartStore.js:27-43)
      ▼
openCart(true) → cart drawer slides open                       line 53
```

The button label follows the state (line 114): **Sold out**, then **Select a size**, then **Add to bag**.

**Wishlist ♡:** `toggleWishlist(product.id)` (line 119) adds or removes the product. The cart and wishlist stores use `persist`, so they're saved in the browser and survive a refresh.

**Related products:** fetched separately (lines 39-41), so the main product shows first. `getRelatedProducts` (`productService.js:191`) scores every other product and keeps the top 8:

- +3 points for the same subcategory
- +2 for the same category
- +1 for a shared colour

**Moving to a different product:** `key={product.id}` (line 82) rebuilds `ProductView` from scratch, so colour, size and quantity reset.

### Try it yourself

1. Open a product. You'll see skeleton boxes briefly, then the product.
2. Click **Add to bag** without a size. A red error appears.
3. Find a crossed-out size. It can't be clicked.
4. Pick a size and add it to the bag. The drawer opens. Add the same item again: the quantity goes up instead of adding a second line.
5. Scroll to image 3, then switch colour. The gallery jumps back to image 1.
6. Click ♡ and refresh the page. It's still saved.
7. Click a related product. Your size choice resets.
8. Narrow the window. The thumbnails turn into a swipe carousel.

---

## 3. Cart Page

**File:** `src/pages/CartPage.jsx`

### What it is

One URL, `/cart` (`AppRouter.jsx:28`). Note that the bag icon in the navbar opens the **cart drawer** (`Navbar.jsx:86`), not this page. You reach this page through the drawer's **View bag** button (`CartDrawer.jsx:32`).

The page never fetches anything. All its data is already in `cartStore`, which is saved in the browser's `localStorage` under the key `nocturne:cart` (`cartStore.js:56`).

```
cartStore.items ──► CartPage
                      │
                      ├─ items.length === 0 → "Your bag is empty" + Shop new arrivals   lines 18-31
                      └─ otherwise          → list of items + summary
```

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Bag                                     (Breadcrumbs)│
│ BAG (3)                                              │
├────────────────────────────────┬─────────────────────┤
│ Item                Remove all │ SUMMARY             │
├────────────────────────────────┤ Add ₹499 more for   │
│ [img] WOOL COAT       ₹12,000  │ free delivery       │
│       Black · M                │ ▓▓▓▓▓▓▓▓░░          │  aside
│       [- 1 +]          Remove  │ Bag total   ₹15,000 │  (sticky)
├────────────────────────────────┤ Discount    −₹2,000 │
│ [img] SILK SCARF  ₹2,000 ×2    │ Shipping        ₹99 │
│       Ivory · One size         │ Total       ₹13,099 │
│       [- 2 +]          Remove  │ [   Checkout    ]   │
└────────────────────────────────┴─────────────────────┘
        CartLineItem (one per item)    FreeShippingProgress + PriceBreakdown
```

| Part                               | Phone/tablet                     | Desktop (`lg`+)                                                                                     |
| ---------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Overall layout (line 41)           | Items on top, summary underneath | Two columns: items take the remaining space, summary is fixed at 380px (`lg:grid-cols-[1fr_380px]`) |
| Summary box (line 60)              | Scrolls with the page            | `lg:sticky lg:top-24`: stays on screen while you scroll a long bag                                  |
| Item image (`CartLineItem.jsx:16`) | `w-24`                           | `w-28` from `sm`                                                                                    |

### Where the state lives

| Data                                  | Where                                                                                            | Notes                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Items in the bag                      | `cartStore.items` (global, saved in the browser)                                                 | Shared by the page, the drawer, the navbar badge and checkout    |
| Totals (subtotal, discount, shipping) | **Not stored**: worked out on every redraw by `computePriceSummary(items)` (`lib/pricing.js:17`) | Stays correct automatically because it always comes from `items` |
| Free-delivery threshold and fee       | `src/config/site.js:22-23` (₹2,999 and ₹99)                                                      | Change these in one place                                        |

Each item has an **id** made of `productId:size:colour` (`cartStore.js:19`). That's why the same coat in M and in L shows up as two separate lines.

Each item also keeps a `maxQuantity`, which is the stock available when it was added. The `+` button stops there.

### What happens when you click things

Every button follows the same pattern: **it changes the store, the store notifies every component using it, and those components redraw.**

```
Click "+" on the coat
     │
     ▼
QuantityStepper → onChange(2)                       ui/QuantityStepper.jsx:37
     │
     ▼
CartLineItem → updateQuantity(item.id, 2)           CartLineItem.jsx:44
     │
     ▼
cartStore: limits it to between 1 and maxQuantity, then saves   cartStore.js:45-52
     │       (also writes to localStorage)
     ├──► CartLineItem redraws → line price doubles, shows "₹12,000 each"
     ├──► Navbar badge count goes up                Navbar.jsx:12
     └──► CartPage redraws
              │
              ▼
          computePriceSummary(items)               CartPage.jsx:16
              │
              ├──► h1 "BAG (4)"
              ├──► FreeShippingProgress: bar fills, message updates
              └──► PriceBreakdown: totals update
```

| Action     | Store function                       | What you see                                                                                                       |
| ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `+` / `−`  | `updateQuantity` (`cartStore.js:45`) | Line price, totals and badge update. `−` is disabled at 1, `+` is disabled at stock (`QuantityStepper.jsx:26, 38`) |
| Remove     | `removeItem` (`cartStore.js:53`)     | The line disappears                                                                                                |
| Remove all | `clear` (`cartStore.js:54`)          | The page switches to the "Your bag is empty" screen (line 18)                                                      |
| Checkout   | just a link to `/checkout` (line 65) | The checkout page reads the same `cartStore`                                                                       |

### How the price summary is worked out (`lib/pricing.js:17-34`)

```
itemCount = sum of quantities
subtotal  = sum of price × quantity                   (what you pay)
mrpTotal  = sum of compareAtPrice × quantity          (original price, before discount)
savings   = mrpTotal − subtotal                       (shown as "Discount" only if > 0)
shipping  = 0 if subtotal ≥ ₹2,999, otherwise ₹99
total     = subtotal + shipping
```

`FreeShippingProgress` turns the subtotal into a percentage bar (`FreeShippingProgress.jsx:5-6`). Once you pass ₹2,999, the message changes to "You have unlocked free delivery".

### Shared with the cart drawer

`CartDrawer` reuses the same `CartLineItem` with a `compact` prop for smaller images (`CartDrawer.jsx:59`). Because both use the same store, changing a quantity in the drawer updates the page, and the other way round.

### Try it yourself

1. Add 2 or 3 different products, then open the drawer and click **View bag**.
2. Press `+` on an item. The line price, the `BAG (n)` heading, the navbar badge, the totals and the shipping bar all update together.
3. Keep pressing `+`. It stops at the stock limit. `−` stops at 1.
4. Add the same product in two different sizes. They appear as two separate lines.
5. Push the subtotal above ₹2,999. Shipping changes to **Free** and the bar fills up.
6. Refresh the page. The bag is still there (`localStorage`). Open DevTools → Application → Local Storage → `nocturne:cart` to see the raw data.
7. Click **Remove all**. You get the "Your bag is empty" screen.
