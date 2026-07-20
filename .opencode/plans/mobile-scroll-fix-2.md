# Plan: Fix Mobile Scroll (Round 2) — The Real Trap

## Re-audit findings

After the first round (removed `display:flex` from body/#root, added momentum/overscroll, made decorative layers `pointer-events:none`), scroll is **still janky**. Root cause is a **double scroll-container conflict** created by `.app`:

### Primary culprit — `.app { overflow-x: hidden }` (App.css:90-100)
When a block element has `overflow-x: hidden`, the browser **implicitly computes `overflow-y: auto`** (per CSS spec, a non-`visible` value on one axis forces the other axis from `visible` to `auto`). So `.app` becomes its own scroll container.

But `.app` is **not height-constrained** (`height:auto`, `min-height:100dvh`). It grows to the full content height (8 pages ≈ 8× viewport). Result:
- `.app` IS a scrollport, but its content fits exactly → it can't scroll internally.
- `body` ALSO tries to be the scrollport.
- On iOS Safari this "nested scrollport with no scrollable room" causes exactly the **stuck / rubber-band-broken / barely-moves** behavior reported.

This is the real cause. The fix is to stop `.app` from becoming a scroll container at all.

### Secondary issues
1. **framer-motion wrapper** (`App.jsx:217` `motion.div` around `MultiPageSection`) animates `y` from `100%`→`0` and may leave a lingering `transform`/`will-change: transform` on the element that wraps the entire scrollable content, creating a persistent compositing layer. After the entrance it's `translateY(0)` but `will-change` can persist and hurt scroll perf. Mitigate.
2. **`.attendance-stack` height unit mismatch** (App.css:821-823): declares `min-height:100vh; 100dvh; 100svh` — the **last `100svh` wins**, a different unit than the `dvh` used everywhere else. Causes a tiny jump but not the jam. Unify to `dvh`.

## Changes

### 1. Stop `.app` from being a scroll container (MAIN FIX)
- `src/App.css` `.app` (line 91): change `overflow-x: hidden;` → `overflow-x: clip;`
  - `overflow-x: clip` clips horizontally **without creating a scroll container** (no implicit `overflow-y:auto`), so `body` stays the single scroll root and momentum works normally.
  - `body` already has `overflow-x:hidden` to clip the dark gutters; keep that.
- Optional fallback if `clip` unsupported on target iOS: remove `overflow-x` from `.app` entirely (body already clips x). `clip` is supported iOS 16+, safe.

### 2. Ensure body is the ONLY scroll root
- `body` (App.css:72-82): keep `overflow-x:hidden; overflow-y:auto; -webkit-overflow-scrolling:touch; touch-action:pan-y; overscroll-behavior-y:contain`. Good as-is.
- `#root` (App.css:84-88): already block. Good.

### 3. Neutralize framer-motion transform on the content wrapper
- In `App.jsx`, the `motion.div` wrapping `MultiPageSection` (lines 216-224): after the enter animation, ensure no lingering transform/compositing layer.
  - Add `onAnimationComplete` to clear, OR simpler: keep animation but add CSS so the resolved state has no `will-change`. Pragmatic fix: change the wrapper so it doesn't animate the element that contains scroll content — instead animate via a one-shot and set `style={{ willChange: 'auto' }}` after.
  - Simplest robust approach: replace the `y` transform entrance with an `opacity`-only fade (no transform) so no compositing layer / transform remains on the scroll container. Preserves the "slide up" feel minimally or drop it. Recommended: keep a subtle `opacity` fade and drop `y` to avoid leaving a transform on the scroll root.
- Cover `motion.div` (lines 205-213) exits with `y:-100%` then unmounts — fine, not a scroll-container issue.

### 4. Unify attendance height unit
- `src/App.css` `.attendance-stack` (lines 821-823): remove the `100svh` line; keep `min-height: 100dvh;` only (drop `100vh` redundancy too, keep `100dvh`).

### 5. (Optional enhancement, not required) CSS scroll-snap
- If the user wants true "one full page per swipe," add `scroll-snap-type: y mandatory` to `body`/`.app` and `scroll-snap-align: start` to `.invite-page`. Out of scope for this fix; propose separately.

## Files to edit
- `src/App.css` — `.app` overflow, `.attendance-stack` height unit.
- `src/App.jsx` — content `motion.div`: drop transform-based entrance (use opacity-only) to avoid lingering compositing layer on the scroll container.

## Verification
- `npx vite build` + `npx oxlint` pass.
- Chrome DevTools device toolbar (iPhone 12 / XR): cover → smooth momentum scroll through all 8 pages; no stuck spots; form & guestbook pages scroll; frame centered ≤480px.
- Real-device iOS Safari check if possible: confirm rubber-band + flick scrolling feel normal.

## Why round 1 wasn't enough
Round 1 removed the flex root (correct) but left `.app { overflow-x:hidden }`, which silently re-introduced a scroll container. That nested scrollport with no scrollable room is what makes the flick feel "stuck." `overflow-x: clip` removes it cleanly.
