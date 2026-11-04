# The Usual Suspects — Band Website

Official website for **The Usual Suspects**, a five-piece classic rock, R&B, and country cover band out of the south suburbs of Chicago.

> Music for all occasions.

## What we play

VFW halls, American Legion posts, bars, fall fests, and private events across Chicagoland and Northwest Indiana.

## The lineup

- **Steve "Buck" Dennison** — Lead vocals · Guitar · Booking
- **Frank Gatto** — Guitar
- **Jim Mihalovich** — Drums · Backing vocals
- **Bill Thorpe** — Bass · Vocals *(Billy's dad)*
- **Billy Thorpe** — Guitar · Vocals · Recording

## Bookings

Buck Dennison · (708) 214-4901 · buck956@att.net

## On the web

- [Facebook](https://www.facebook.com/profile.php?id=100029619594462)
- [YouTube — Brass Boot Studio](https://www.youtube.com/@brassbootstudio)

## Technical

Static site. Plain HTML + CSS + a touch of JS. No build step. Mobile-first.

To run locally:

```bash
python -m http.server 9141
```

Then visit `http://127.0.0.1:9141/index.html`.

---

Built by [Brass Boot Studio](https://www.youtube.com/@brassbootstudio).
## September 2026 polish

The main HTML remains the source for shows and band information. Each show card requires a unique `id`, `data-start`, and `data-end` in ISO format with the Central offset (-05:00 daylight time, -06:00 standard time). The hero picks the earliest unexpired card automatically, and ended shows disappear. Keep show cards in chronological order for readers without JavaScript. Update existing Event structured data when editing those dates.

Add published single-song clips to `media.js`; examples cover YouTube and web-ready Pocket 3 MP4 exports. Empty lists render no placeholders. The Frankfort VFW full set remains the featured recording. Raw gig recordings do not belong in Git. Add actual new photos to `photos/` and link them in the gallery; native dialog enlargement supports Escape and returns focus to the photo.

Booking prepares a mailto draft; it does not send email or claim delivery. A copyable fallback appears after preparation. No form submission service or email credentials have been added. The existing Buttondown subscription endpoint is preserved; its ownership/delivery must be confirmed before promising a mailing cadence. Test newsletter delivery with an authorized real address separately.

The two Tru Country dates retain their respective Channahon and New Lenox locations from the original schedule/history; names now distinguish the branches. Venue phone listings vary externally, so none were silently replaced. Verify December venue details with Buck before publication if the booking has changed. The old Manteno July reference and inactive coupon/Instagram placeholders were removed. The placeholder Meta Pixel was removed; Plausible remains unchanged.

The companion `.rocks` repository has browser redirects ready for review. A true HTTP 301/308 needs hosting configuration; DNS was not changed.

## Validation and review

Run `node tests/check.cjs` from this repository. Checks cover asset/anchor integrity, JSON-LD parsing, four upcoming show dates, Central-time show rollover including standard time, all-shows-ended fallback, countdown start/end boundaries, and booking draft encoding.

Browser checks: 320, 390, 768, and 1799 pixel widths; no horizontal overflow. Mobile navigation opens and closes on selection. Photo dialog opens, closes with Escape, and returns focus. Empty booking form focuses the required name field. No booking emails or newsletter subscriptions were sent. YouTube rejects playback on this localhost preview; its original production embed URL and direct watch link remain intact. Verify playback after publication. New Pocket 3/song clips have not been supplied or invented.

## November 14 feature

The homepage features the Farm2Veteran Chili Cook-Off on November 14, 2026. The organizer's official flyer, noon–4 PM event hours, $10 admission and registration link come from https://www.farm2veteran.com/community-events/ (checked November 4). The band's existing 2–6 PM slot is retained; it has not been independently reconfirmed by the organizer's listing.

The countdown starts with the noon opening, switches to the 2 PM band start, then shows live status until 6 PM. At 4 PM it states that chili tasting has ended; at 6 PM the feature and its navigation link hide. All boundaries use America/Chicago standard time (-06:00). The calendar download contains separate cook-off and performance entries. Keep the feature data attributes, visible hours, countdown status labels, show card, Event metadata, calendar and tests synchronized when changing times. Original posters remain preserved.
