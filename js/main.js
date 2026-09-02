/**
 * SHENEU — D2C Jammu Chapter Launch
 * All behaviour lives here (no inline event handlers / inline scripts),
 * so the page's Content-Security-Policy can stay strict.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------
   * 1. SCROLL-REVEAL ANIMATIONS
   * Elements with class "reveal" fade/slide in once, the first
   * time they enter the viewport. Respects prefers-reduced-motion
   * (handled purely in CSS) and unobserves after firing once,
   * so it never re-triggers or leaks memory.
   * --------------------------------------------------------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
   * 1b. WORD-BY-WORD HEADLINE REVEAL
   * Elements with class "split-reveal" get their text broken into
   * per-word <span>s (built with createTextNode/createElement only
   * — never innerHTML), each animating in with a slight stagger as
   * the heading scrolls into view. Falls back to a plain reveal if
   * IntersectionObserver isn't available.
   * --------------------------------------------------------- */
  function initSplitReveal() {
    var headings = document.querySelectorAll(".split-reveal");
    if (headings.length === 0) return;

    headings.forEach(function (heading) {
      var originalText = heading.textContent;
      var words = originalText.trim().split(/\s+/);
      heading.textContent = "";
      words.forEach(function (word, i) {
        var span = document.createElement("span");
        span.className = "word";
        span.textContent = word;
        span.style.transitionDelay = Math.min(i * 0.045, 0.6) + "s";
        heading.appendChild(span);
        if (i < words.length - 1) {
          heading.appendChild(document.createTextNode(" "));
        }
      });
    });

    if (!("IntersectionObserver" in window)) {
      headings.forEach(function (h) { h.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4, rootMargin: "0px 0px -40px 0px" }
    );
    headings.forEach(function (h) { observer.observe(h); });
  }

  /* ---------------------------------------------------------
   * 1c. SCROLL PROGRESS BAR
   * A thin bar fixed to the top of the viewport that fills as the
   * visitor scrolls down the page. Pure reflection of scroll
   * position — no user data involved.
   * --------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    var ticking = false;

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
   * 1d. AMBIENT CURSOR GLOW
   * A soft radial glow that follows the pointer on desktop/hover
   * capable devices only (hidden on touch via CSS). Purely visual;
   * never captures clicks (pointer-events:none) and adds nothing
   * to the DOM's data footprint.
   * --------------------------------------------------------- */
  function initCursorGlow() {
    var glow = document.getElementById("cursorGlow");
    if (!glow || window.matchMedia("(hover: none)").matches) return;

    window.addEventListener("mousemove", function (e) {
      glow.classList.add("is-active");
      glow.style.transform = "translate(" + (e.clientX - 260) + "px," + (e.clientY - 260) + "px)";
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      glow.classList.remove("is-active");
    });
  }

  /* ---------------------------------------------------------
   * 1e. MAGNETIC BUTTONS
   * Buttons with class "magnetic" nudge slightly toward the
   * cursor while hovered, and spring back on leave. Capped
   * displacement keeps it subtle rather than gimmicky.
   * --------------------------------------------------------- */
  function initMagneticButtons() {
    if (window.matchMedia("(hover: none)").matches) return;
    var buttons = document.querySelectorAll(".magnetic");
    var MAX_PULL = 10;

    buttons.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        var pullX = (relX / (rect.width / 2)) * MAX_PULL;
        var pullY = (relY / (rect.height / 2)) * MAX_PULL;
        btn.style.transform = "translate(" + pullX + "px," + pullY + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------------------------------------------------
   * 1f. MARQUEE TICKERS
   * Each ".marquee .marquee-track" holds one copy of its chips in
   * the HTML; this duplicates that content once so the CSS
   * keyframe (translateX 0 -> -50%) loops seamlessly forever.
   * Content is cloned with cloneNode (existing trusted DOM only),
   * never rebuilt from a string.
   * --------------------------------------------------------- */
  function initMarquees() {
    var tracks = document.querySelectorAll(".marquee-track");
    tracks.forEach(function (track) {
      var original = Array.prototype.slice.call(track.children);
      original.forEach(function (node) {
        track.appendChild(node.cloneNode(true));
      });
      // aria-hidden the duplicate half so screen readers only announce it once
      var children = Array.prototype.slice.call(track.children);
      children.slice(original.length).forEach(function (node) {
        node.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* ---------------------------------------------------------
   * 1g. TILT-ON-HOVER CARDS
   * Elements with class "tilt-target" get a subtle perspective
   * tilt that follows the cursor, then ease back flat on leave.
   * Skipped entirely on touch devices (no meaningful hover there).
   * --------------------------------------------------------- */
  function initTilt() {
    if (window.matchMedia("(hover: none)").matches) return;
    var cards = document.querySelectorAll(".tilt-target");
    var MAX_TILT = 6;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotateY = (px - 0.5) * MAX_TILT * 2;
        var rotateX = (0.5 - py) * MAX_TILT * 2;
        card.style.transform =
          "perspective(700px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
      });
    });
  }

  /* ---------------------------------------------------------
   * 2. PHOTO GALLERY — horizontal auto-scrolling carousel
   *
   * The photo list comes from window.GALLERY_PHOTOS, defined in
   * js/gallery-photos.js (edit that file to add/remove/reorder
   * photos — this code never needs to change). Every element is
   * built with createElement/textContent, never innerHTML with
   * external data, so a photo caption can't inject markup.
   *
   * Behaviour:
   *  - Auto-scrolls slowly, left to right, looping seamlessly.
   *  - Pauses on hover, touch, or keyboard focus so visitors can
   *    read/look without the track fighting them.
   *  - Prev/Next buttons step one photo at a time and pause
   *    auto-scroll briefly so the manual move isn't overridden.
   *  - Clicking (or Enter/Space on) a photo opens it full-size in
   *    the existing lightbox, with arrow-key and Esc support.
   * --------------------------------------------------------- */
  function initGallery() {
    var track = document.getElementById("galleryTrack");
    var viewport = track ? track.closest(".gallery-viewport") : null;
    var prevBtn = document.getElementById("galleryPrev");
    var nextBtn = document.getElementById("galleryNext");
    if (!track || !viewport) return;

    var photos = Array.isArray(window.GALLERY_PHOTOS) ? window.GALLERY_PHOTOS : [];
    if (photos.length === 0) {
      viewport.style.display = "none";
      return;
    }

    /* ---- Build one photo <button> element ---- */
    function buildItem(photo, index, isClone) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-item tilt-target" + (isClone ? "" : " reveal");
      if (!isClone) btn.style.transitionDelay = Math.min(index * 0.05, 0.4) + "s";
      btn.setAttribute("aria-label", "Open photo " + (index + 1) + " of " + photos.length);
      if (isClone) {
        // Duplicate set exists purely so the auto-scroll can loop seamlessly —
        // hide it from screen readers and keyboard tabbing so nothing is announced twice.
        btn.setAttribute("aria-hidden", "true");
        btn.tabIndex = -1;
      }

      var img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || "";
      img.loading = "lazy";
      img.width = 800;
      img.height = 1000;

      btn.appendChild(img);
      btn.addEventListener("click", function () { openLightbox(index); });
      return btn;
    }

    /* ---- Render the real set, then a cloned set right after it.
       The clone is what makes the loop seamless: once the track has
       scrolled exactly one "real set" width, we silently subtract
       that width from scrollLeft — visually nothing jumps, because
       the clone is a pixel-perfect duplicate sitting right there. ---- */
    var itemEls = [];
    photos.forEach(function (photo, index) {
      var el = buildItem(photo, index, false);
      track.appendChild(el);
      itemEls.push(el);
    });
    var singleSetWidth = 0; // computed after layout, below
    if (photos.length > 1) {
      photos.forEach(function (photo, index) {
        track.appendChild(buildItem(photo, index, true));
      });
    }

    // Newly-created .reveal items need the scroll-reveal observer applied too.
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      itemEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      itemEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---- Lightbox ---- */
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightboxImg");
    var closeBtn = document.getElementById("lightboxClose");
    var lbPrevBtn = document.getElementById("lightboxPrev");
    var lbNextBtn = document.getElementById("lightboxNext");
    var currentIndex = 0;
    var lastFocused = null;

    function openLightbox(index) {
      currentIndex = (index + photos.length) % photos.length;
      var photo = photos[currentIndex];
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt || "";
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      paused = true; // pause for as long as the lightbox is open
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
      paused = false; // resume immediately — nothing should keep it stopped once closed
    }

    closeBtn.addEventListener("click", closeLightbox);
    lbPrevBtn.addEventListener("click", function () { openLightbox(currentIndex - 1); });
    lbNextBtn.addEventListener("click", function () { openLightbox(currentIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") openLightbox(currentIndex - 1);
      if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
    });

    /* ---- Prev / Next buttons (jump one photo at a time) ---- */
    function stepSize() {
      var first = itemEls[0];
      var gap = 16;
      return first ? first.getBoundingClientRect().width + gap : 280;
    }
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -stepSize(), behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: stepSize(), behavior: "smooth" });
    });

    /* ---- Auto-scroll: continuous, seamlessly-looping, pauses ONLY
       while the cursor/touch/keyboard-focus is actually on the
       carousel — resumes the instant it leaves, no delay. ---- */
    var autoScrollEnabled =
      photos.length > 1 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = false;
    var rafId = null;
    var SPEED_PX_PER_FRAME = 0.9;

    function measureSingleSetWidth() {
      // Both sets are identical, so half of the full scrollable width
      // is exactly the width of one real set (works at any screen size).
      singleSetWidth = track.scrollWidth / 2;
    }

    function tick() {
      if (autoScrollEnabled && !paused && singleSetWidth > 0) {
        track.scrollLeft += SPEED_PX_PER_FRAME;
        if (track.scrollLeft >= singleSetWidth) {
          track.scrollLeft -= singleSetWidth;
        }
      }
      rafId = window.requestAnimationFrame(tick);
    }

    if (autoScrollEnabled) {
      measureSingleSetWidth();
      window.addEventListener("resize", measureSingleSetWidth);

      // Pause the instant the cursor/touch/focus is on the carousel;
      // resume the instant it leaves. No timers, no delay either way.
      ["mouseenter", "touchstart", "focusin"].forEach(function (evt) {
        track.addEventListener(evt, function () { paused = true; }, { passive: true });
      });
      ["mouseleave", "touchend", "focusout"].forEach(function (evt) {
        track.addEventListener(evt, function () { paused = false; }, { passive: true });
      });

      rafId = window.requestAnimationFrame(tick);
    }

    // Stop the animation loop if the gallery is ever removed (defensive cleanup).
    window.addEventListener("pagehide", function () {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  }

  /* ---------------------------------------------------------
   * 3. NOMINATION FORM
   * - Client-side required-field validation with an accessible
   *   error message (no silent failures).
   * - All values are trimmed and stripped of CR/LF before being
   *   placed into the mailto: URL, so a pasted value can't inject
   *   extra email headers or corrupt the link.
   * - Values are passed through encodeURIComponent, so nothing
   *   the user types is ever interpreted as HTML/script — this
   *   only ever opens the user's own mail client.
   * --------------------------------------------------------- */
  function sanitize(value) {
    return value
      .replace(/[\r\n]+/g, " ")   // no header injection via newlines
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 800);             // hard cap regardless of maxlength
  }

  function initNominationForm() {
    var form = document.getElementById("nomForm");
    if (!form) return;

    var errorBox = document.getElementById("formError");
    var fieldsWrap = document.getElementById("formFields");
    var successMsg = document.getElementById("successMsg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nomineeName = document.getElementById("nomineeName");
      var nomineeField = document.getElementById("nomineeField");
      var nomineeStory = document.getElementById("nomineeStory");
      var yourName = document.getElementById("yourName");
      var yourContact = document.getElementById("yourContact");

      var required = [nomineeName, nomineeField, nomineeStory, yourName, yourContact];
      var firstInvalid = null;

      required.forEach(function (field) {
        var empty = !field.value || !field.value.trim();
        field.setAttribute("aria-invalid", empty ? "true" : "false");
        if (empty && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        errorBox.textContent = "Please fill in every field before submitting.";
        errorBox.hidden = false;
        firstInvalid.focus();
        return;
      }
      errorBox.hidden = true;

      var subject = "SHENEU Nomination: " + sanitize(nomineeName.value);
      var body =
        "Nominee: " + sanitize(nomineeName.value) + "\n" +
        "Field: " + sanitize(nomineeField.value) + "\n" +
        "Why she deserves to be known:\n" + sanitize(nomineeStory.value) + "\n\n" +
        "Submitted by: " + sanitize(yourName.value) + "\n" +
        "Contact: " + sanitize(yourContact.value);

      var mailto =
        "mailto:nominations@sheneu.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      fieldsWrap.style.display = "none";
      successMsg.classList.add("show");
    });
  }

  /* ---------------------------------------------------------
   * INIT
   * --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initScrollReveal();
    initSplitReveal();
    initGallery();
    initNominationForm();
    initScrollProgress();
    initCursorGlow();
    initMagneticButtons();
    initMarquees();
    initTilt();
  });
})();