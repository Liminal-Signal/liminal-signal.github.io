var prefersReducedMotion = false;
if (window.matchMedia) {
  prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

if (!prefersReducedMotion) {
  // Subtle parallax + scroll lag for a softer, delayed feel.
  var scrollTarget = window.scrollY || 0;
  var scrollCurrent = scrollTarget;
  var scrollAnimating = false;

  function updateHero(scrollValue) {
    var hero = document.querySelector(".mdx-hero");
    if (!hero) return;
    var content = hero.querySelector(".mdx-hero__content");
    if (!content || window.innerWidth < 900) return;
    var maxShift = 24;
    var heroHeight = hero.offsetHeight || 1;
    var scroll = Math.min(scrollValue, heroHeight);
    var shift = Math.min(scroll * 0.12, maxShift);
    var fade = Math.max(0.4, 1 - scroll / (heroHeight * 0.8));
    content.style.setProperty("--parallax-shift", shift + "px");
    content.style.setProperty("--parallax-alpha", fade.toFixed(2));
  }

  function tickScroll() {
    var delta = scrollTarget - scrollCurrent;
    var step = delta * 0.12;
    var maxStep = 32;
    if (step > maxStep) step = maxStep;
    if (step < -maxStep) step = -maxStep;
    scrollCurrent += step;
    var lag = scrollCurrent - scrollTarget;
    if (Math.abs(lag) < 0.1) {
      lag = 0;
    }
    document.documentElement.style.setProperty("--scroll-lag", lag.toFixed(2) + "px");
    updateHero(scrollCurrent);

    if (Math.abs(scrollTarget - scrollCurrent) > 0.2) {
      window.requestAnimationFrame(tickScroll);
    } else {
      scrollAnimating = false;
    }
  }

  window.addEventListener(
    "scroll",
    function() {
      scrollTarget = window.scrollY || 0;
      if (!scrollAnimating) {
        scrollAnimating = true;
        window.requestAnimationFrame(tickScroll);
      }
    },
    { passive: true }
  );

  updateHero(scrollCurrent);
}

// Fade in hero, main content, cards, and media on page load and on navigation
(function() {
  function fadeInElements() {
    var selectors = [
      ".mdx-hero",
      ".mdx-hero__card",
      ".md-content",
      ".md-main__inner",
      ".md-typeset",
      ".home-card",
      ".home-pill",
      ".home-callout",
      ".md-typeset .tabbed-block",
      ".md-typeset img",
      ".md-typeset pre",
      ".md-typeset blockquote"
    ];
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        if (!el.classList.contains("fade-in")) {
          el.classList.add("fade-in");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".fade-in").forEach(function(el) {
      el.classList.remove("fade-in");
    });
    setTimeout(fadeInElements, 10);
  });

  if (window.mutationObserverFadeIn) return;
  window.mutationObserverFadeIn = true;
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.addedNodes) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            node.querySelectorAll && node.querySelectorAll(".fade-in").forEach(function(el) {
              el.classList.remove("fade-in");
            });
            setTimeout(fadeInElements, 10);
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
