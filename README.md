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

Run `node tests/check.cjs` from this repository. Checks cover asset/anchor integrity, JSON-LD parsing, five show dates, Central-time show rollover including standard time, all-shows-ended fallback, and booking draft encoding.

Browser checks: 320, 390, 768, and 1799 pixel widths; no horizontal overflow. Mobile navigation opens and closes on selection. Photo dialog opens, closes with Escape, and returns focus. Empty booking form focuses the required name field. No booking emails or newsletter subscriptions were sent. YouTube rejects playback on this localhost preview; its original production embed URL and direct watch link remain intact. Verify playback after publication. New Pocket 3/song clips have not been supplied or invented.

This branch is prepared for review, not pushed or published. Preview with the local server described above. Deploy the main site and companion redirect branch together after review.
