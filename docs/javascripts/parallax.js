var prefersReducedMotion = false;
if (window.matchMedia) {
  prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

if (!prefersReducedMotion) {
  // Subtle parallax scroll effect for hero text blocks only
  var ticking = false;
  window.addEventListener(
    "scroll",
    function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          var hero = document.querySelector(".mdx-hero");
          if (hero) {
            var title = hero.querySelector(".mdx-hero__title");
            var subtitle = hero.querySelector(".mdx-hero__subtitle");
            var desc = hero.querySelector(".mdx-hero__desc");
            if (title) {
              title.style.setProperty("--parallax-title", window.scrollY * 0.2 + "px");
            }
            if (subtitle) {
              subtitle.style.setProperty("--parallax-subtitle", window.scrollY * 0.3 + "px");
            }
            if (desc) {
              desc.style.setProperty("--parallax-desc", window.scrollY * 0.15 + "px");
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
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
