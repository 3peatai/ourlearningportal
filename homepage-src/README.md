# Homepage source (gzip parts)

`index.html` is assembled at build time from `p00.b64` ... `p08.b64` (gzip+base64 of the Scout conversion homepage). See `build.sh` for the inflate + sha256 check (`588294ec75b38feb1f5ad8fe9cb203f3e7f0645ce9c43905207d4e103c414962`).

Surgical copy on that page:
- H1: Bookings. Rescheduling. Invoices. / One portal for session businesses.
- CTA: Book a 15-min demo. Pricing: as little as HK$1,500/month.
- Who-for adds language, STEM/coding, music and dance. First three cards keep PNG images (no inlined data URIs).
- Demo role cards link to `/portal/login` with no passwords on the marketing page.
- Canonical/og/twitter/JSON-LD on https://www.ourlearningportal.com; og:image is `/tutoring-practices.png`.
- Head links `/llms.txt` as rel=alternate. Footer: built by 3 Peat Limited.
- Babel+dev React unchanged (next ship).
