SHENEU — D2C Jammu Chapter Launch
Landing page — developer handoff notes
=======================================

FILE STRUCTURE
--------------
index.html             All page markup (no inline CSS/JS — CSP-friendly)
css/styles.css          All styling, colours, layout, animations
js/gallery-photos.js    THE PHOTO LIST — edit this to add/remove photos
js/main.js              Scroll animations, gallery carousel, nomination form
images/                 Placeholder photos for the "Moments" gallery

HOW TO ADD YOUR OWN PHOTOS
---------------------------
The "Moments" gallery is a horizontally-scrolling, auto-scrolling carousel
(id="gallery" in index.html) with Prev/Next arrow buttons. It is NOT limited
to a fixed number of photos — the list lives entirely in one file:

    js/gallery-photos.js

To add, remove, reorder, or caption photos, open that file and edit the
GALLERY_PHOTOS list — you do NOT need to touch index.html, css, or the
carousel logic at all. Example entry:

    { src: "images/my-photo.jpg", alt: "Guests at the red carpet" },

Steps:
1. Drop your photo files into the /images folder.
   Recommended: JPG, orientation, 800×1000 px, under ~400KB each
   (compress with TinyPNG/Squoosh before uploading — keeps the page fast).
2. In js/gallery-photos.js, add one line per photo (src = the file you just
   added, alt = a short real description, used for accessibility).
3. Save. Reload the page — the carousel, auto-scroll, arrow buttons and
   lightbox all pick up the new list automatically. Add as many as you like.

GALLERY BEHAVIOUR
------------------
- Auto-scrolls slowly and loops seamlessly; pauses the moment a visitor
  hovers, touches, scrolls, or tabs into it, and resumes shortly after.
- Left/Right arrow buttons step one photo at a time.
- Clicking any photo opens it full-size in a lightbox (Esc to close,
  Left/Right arrow keys to browse, click outside the photo to close).
- Auto-scroll is automatically turned off for visitors with the OS-level
  "reduce motion" setting on; manual scroll and arrow buttons still work.

ANIMATIONS
----------
- A slow-drifting gradient ("aurora") animates behind the hero.
- Every major section fades/slides in once as the visitor scrolls to it
  (class "reveal", handled by js/main.js via IntersectionObserver).
- Cards, chips, and gallery photos lift slightly on hover.
- The photo lightbox fades and scales in/out, with keyboard support
  (Esc to close, Left/Right arrows to move between photos).
- All motion respects the visitor's OS-level "reduce motion" setting.

SECURITY NOTES
--------------
- A strict Content-Security-Policy meta tag is set in index.html. It only
  allows Google Fonts and this site's own CSS/JS/images — if you add any
  new external script, image host, or embed, you MUST add that domain to
  the CSP meta tag or the browser will silently block it.
- There are NO inline event handlers (onclick="" etc.) and no inline
  <script> blocks — everything lives in js/main.js. Keep it that way; it's
  what lets the CSP stay strict.
- The nomination form has no backend — it opens the visitor's own email
  app via a mailto: link. All field values are trimmed, stripped of
  line-breaks, length-capped, and URL-encoded before being placed in that
  link, so pasted text can't inject extra email headers or break the link.
- If you later connect a real backend (form POST, CRM, etc.), always
  validate and sanitise on the SERVER too — client-side checks here are
  for user experience, not a security boundary.
- Serve this site over HTTPS. The CSP includes "upgrade-insecure-requests"
  as a safety net, but real HTTPS hosting is still required.

BROWSER SUPPORT
----------------
Modern evergreen browsers (Chrome, Safari, Edge, Firefox — last 2 years).
Uses IntersectionObserver and CSS Grid; both are supported everywhere in
that range. Reduced-motion and no-JS visitors still see all content, just
without the animations.
