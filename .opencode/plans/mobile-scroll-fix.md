# Plan: Fix Mobile Scroll + First-Mobile Responsiveness

## Diagnosis (why scroll is "susah" / janky on mobile)

The invitation is stacked `.invite-page` sections, each exactly `100dvh` with `overflow: hidden`, all flowed inside `.app` → `#root` → `body`, and the **document body is the scroll container**. Three issues make native mobile scrolling painful:

1. **Flex root kills iOS momentum scroll.** `body` (App.css:72-80) and `#root` (App.css:82-88) are `display: flex; justify-content: center`. A flex parent with `min-height:100dvh` + a child taller than the viewport is a well-known iOS Safari bug: scroll stalls, rubber-banding breaks, and the page barely moves under the finger. **This is the primary cause.**
2. **Full-cover decorative layers intercept touches.** `.cover-layer-bg/-gunungan/-bunga` (App.css:117-163), `.page-layer-konten` (236-246), and `.amplop-wrapper` (357-364) are `position:absolute; inset:0/-2px` with default `pointer-events:auto`. They overlap content gaps (z-index 1-5) and can swallow the swipe gesture, making scrolling feel "stuck" on cover / gapura / amplop / closing pages. (Only `.cover-layer-border` and `.gapura-opening` already have `pointer-events:none`.)
3. **No scroll-root tuning.** No `-webkit-overflow-scrolling: touch`, `touch-action: pan-y`, or `overscroll-behavior` on the scroll root — iOS momentum is weak and pull-to-refresh can hijack the drag.

## Changes

### 1. Make body/#root a plain block (BIGGEST fix)
- `body` (App.css:72-80): remove `display:flex; justify-content:center`. Keep `background:#1a1410; min-height:100dvh; overflow-x:hidden`. Add `overflow-y:auto; -webkit-overflow-scrolling:touch; touch-action: pan-y; overscroll-behavior-y: contain;`.
- `#root` (App.css:82-88): remove `display:flex; justify-content:center`; keep `width:100%; min-height:100dvh`.
- `.app` (App.css:90-100): already `margin:0 auto; max-width:480px; overflow-x:hidden; min-height:100dvh` — keep. This centers the frame without flex and is NOT height-constrained, so the body remains the scroll container (correct).

### 2. Neutralize decorative overlays for touch
Add `pointer-events: none;` to:
- `.cover-layer-bg` (117), `.cover-layer-gunungan` (131), `.cover-layer-bunga` (151)
- `.page-layer-konten` (236)
- `.amplop-wrapper` (357)
(Wrappers that hold *interactive* content — `.amplop-card-overlay` buttons, `.gallery-slider`, `.gallery-dots`, `.page-maps-link` — keep pointer events; only the full-cover background layers are made inert.)

### 3. Stiffen page height consistency
- `.invite-page` (App.css:222-229): keep `height:100dvh; overflow:hidden` for the fixed-height pages (cover, gapura, amplop, closing). These are fine because content fits one viewport and the body scrolls between them.
- Verify the `:has(...)` auto-height pages (konten3, gallery, attendance, guestbook) keep `overflow:visible` so their taller content scrolls with the body — already correct (249, 291, 803). No change.

### 4. First-mobile hardening (small, additive)
- `html` (App.css:68-70): confirm `scroll-behavior: smooth` already removed; add `-webkit-text-size-adjust: 100%`.
- Keep all `100dvh` (don't mix svh back in). Already consistent.
- Keep existing `@media (max-width:430px)` and `@media (max-width:380px)` breakpoints — already mobile-first in practice. Audit for any fixed px widths during impl; most use `clamp()` and `%`, so none expected.

### 5. Verify nothing else traps scroll
- `::-webkit-scrollbar` (639-650): fine, cosmetic.
- `.closing-wrapper` (783) uses `overflow:hidden; height:100dvh` — single-viewport page, fine.
- `.gapura-opening` already `pointer-events:none` + `overflow:hidden` (599-608) — fine.
- Dashboard screens (`.dash-app` etc., ~1046-1341) use their own `height:100dvh; overflow:hidden` with inner `overflow-y:auto` scroll regions — separate layout, already mobile-app-style; leave as-is (only relevant on `/dashboard`).

## Files to edit
- `src/App.css` — body, #root, .app, the 5 decorative layer classes above.

## Verification (after plan approved)
- `npx vite build` and `npx oxlint` still pass.
- Responsive check in Chrome DevTools device toolbar (iPhone 12 / XR, 390×844 and 414×896):
  - Cover → swipe scrolls smoothly through all 8 pages with momentum.
  - No spot where a swipe is "stuck" (decorative layers inert).
  - Form page (6) and guestbook (7) scroll their taller content.
  - Frame stays centered at ≤480px, dark gutters outside.

## Notes / tradeoffs
- We keep each fixed page at exactly `100dvh` + `overflow:hidden` (snap-like full-screen pages) rather than converting to a full scroll-snap system — minimal change, preserves the current design. If the user later wants true "one page per swipe" snapping, that's a separate enhancement (CSS scroll-snap on `.multi-page-wrapper`).
- Root cause is the flex layout, not Lenis (already removed). This plan finishes the mobile-scroll fix.
