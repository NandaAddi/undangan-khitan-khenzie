# Plan: Redirect to WhatsApp after Attendance Confirmation

## Goal
After a guest submits the attendance form (which already saves to the guestbook via Supabase), automatically open WhatsApp to number `083-807-000-708` with a prefilled message containing their confirmation. The Supabase insert (guestbook) remains the source of truth; WhatsApp is an extra notification step.

## Current behavior
`src/components/AttendanceForm.jsx`: on submit → `e.preventDefault()` → insert `{nama, kehadiran, jumlah_tamu, ucapan}` into Supabase table `khitan` → on success shows "Terima kasih! Ucapan telah terkirim." and resets fields. No WhatsApp action.

## Changes — `src/components/AttendanceForm.jsx`

1. Add a constant + message builder near the top of the component:
   - `const WA_NUMBER = '6283807000708'`  // `083-807-000-708` → strip dashes → `083807000708` → leading `0` → `62` (Indonesia)
   - Build message:
     ```
     const waMessage =
       `Assalamu'alaikum, saya *${nama.trim()}* mengkonfirmasi kehadiran: *${kehadiran}*` +
       (jumlah ? ` (${jumlah} tamu)` : '') + `.\n\nUcapan: ${ucapan.trim()}`
     const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`
     ```

2. Inside `handleSubmit`, in the existing `if (!error)` success block (lines 29-35), after the state resets, add:
   ```
   window.open(waLink, '_blank')
   ```
   - This runs inside the submit handler (user gesture) so mobile browsers permit the popup and open the WhatsApp app / wa.me.
   - Keep the existing `setSuccess(true)` + timeout so the in-page confirmation still shows.

3. Do NOT open WhatsApp when the insert fails (leave the existing error message path unchanged).

## Edge cases
- Desktop: `window.open` opens wa.me in a new tab — acceptable.
- Mobile: opens WhatsApp app with prefilled text — intended ("langsung direct").
- Keeps guestbook insert as primary record; WhatsApp is supplementary.

## Files to edit
- `src/components/AttendanceForm.jsx` (only)

## Verification
- `npx vite build` + `npx oxlint` pass.
- Submit the form with sample data → confirm row appears in Supabase guestbook AND WhatsApp opens with the prefilled confirmation message.
- Submit with empty required fields → blocked (existing guard `if (!nama.trim() || !ucapan.trim()) return`).
- Simulate insert failure (e.g., offline) → no WhatsApp open, error message shown.
