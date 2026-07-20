# Plan: Reposition "Lokasi (Google Maps)" on Page 5 (Mobile + Desktop)

## Context
Page 5 (amplop) shows the "Lokasi (Google Maps)" link via `.amplop-maps-link` (App.css:491-498). The earlier desktop tweak (App.css:864-869) set `right: 31%`, which actually shifts the text **leftward** (the box's right edge sits 31% in from the right side — the opposite of "geser ke kanan"), and `bottom: 22%` barely raised it from the base `21%`. So the prior result was wrong direction horizontally.

User now wants, on **both mobile and desktop**: raise it a bit + shift it right a bit.

## Current CSS
- Base (mobile) `.amplop-maps-link` (App.css:491-498):
  ```css
  position: absolute;
  bottom: 21%;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 5;
  ```
- Desktop `@media (min-width: 481px)` (App.css:864-869):
  ```css
  .amplop-maps-link { bottom: 22%; left: auto; right: 31%; text-align: right; }
  ```

## Key fix
To shift text to the **right**, the box must be anchored near the right edge with a **small** `right` value (e.g. `right: 12%`) and `left: auto` + `text-align: right`. (Large `right` % moves it left.) To **raise**, increase `bottom`.

## Changes — `src/App.css`

### 1. Base / mobile `.amplop-maps-link` (line 491)
Change to:
```css
.amplop-maps-link {
  position: absolute;
  bottom: 27%;          /* was 21% — raised a bit */
  left: auto;            /* was 0 */
  right: 12%;            /* was 0 — anchored near right edge */
  text-align: right;     /* was center — align text to the right */
  z-index: 5;
}
```
(`.amplop-wrapper .amplop-maps-link` pointer-events override at line 405 is untouched — still fine.)

### 2. Desktop `@media (min-width: 481px)` (line 864)
Replace the existing block:
```css
.amplop-maps-link {
  bottom: 30%;           /* was 22% — raised a bit more on tall desktop frame */
  left: auto;
  right: 12%;            /* was 31% — CORRECTED: now truly shifts right */
  text-align: right;
}
```

## Why this works
- `right: 12%` + `left: auto` places the shrink-to-fit box so its right edge is 12% in from the page's right edge; `text-align: right` keeps the label hugging that right side → visibly shifted right.
- `bottom: 27%` (mobile) / `30%` (desktop) lifts it above the previous ~21% position → "naikkan dikit".

## Files to edit
- `src/App.css` (base rule line 491 + desktop query line 864 only).

## Verification
- `npx vite build` + `npx oxlint` pass.
- Chrome DevTools device toolbar: check Pixel 7 (412×915) and Galaxy S8+ (360×740) → link sits upper-right area, above previous center-bottom spot.
- Wide viewport (>480px) → same direction, slightly higher; not overlapping the copy button / account box badly.
- Click still opens Google Maps (pointer-events preserved).
