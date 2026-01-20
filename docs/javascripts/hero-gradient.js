(function() {
  function supportsWebGL() {
    try {
      var testCanvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
    } catch (err) {
      return false;
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function mountGradient() {
    var canvas = document.querySelector(".mdx-hero__gradient[data-gradient=\"wrapper\"]");
    if (!canvas) return;
    if (prefersReducedMotion()) return;
    if (!supportsWebGL()) return;
    if (canvas.dataset.gradientMounted === "true") return;
    if (window.Gradient) {
      canvas.dataset.gradientMounted = "true";
      return;
    }
    if (document.querySelector("script[data-gradient-lib]")) return;

    var script = document.createElement("script");
    // Pinned to a specific commit for stability.
    script.src = "https://cdn.jsdelivr.net/gh/vallafederico/glsl-gradient-webflow@37ff6e0579213fae13f5eb9b35cee6a800a7ebdd/lib/gradient.02.js";
    script.async = true;
    script.setAttribute("data-gradient-lib", "true");
    script.onload = function() {
      canvas.dataset.gradientMounted = "true";
    };
    document.head.appendChild(script);
  }

  function mountSpotlight() {
    var spotlight = document.querySelector(".mdx-spotlight");
    var cursorGlow = document.querySelector(".mdx-cursor-glow");
    if (!spotlight) return;
    if (prefersReducedMotion()) {
      spotlight.style.display = "none";
      if (cursorGlow) {
        cursorGlow.style.display = "none";
      }
      document.body.classList.remove("mdx-cursor-hidden");
      return;
    }
    if (spotlight.dataset.spotlightMounted === "true") return;
    spotlight.dataset.spotlightMounted = "true";
    if (cursorGlow) {
      document.body.classList.add("mdx-cursor-hidden");
      cursorGlow.style.setProperty("--cursor-x", currentX.toFixed(2) + "%");
      cursorGlow.style.setProperty("--cursor-y", currentY.toFixed(2) + "%");
    }

    var currentX = 52;
    var currentY = 42;
    var targetX = currentX;
    var targetY = currentY;
    var lastMove = performance.now();
    var idleDelay = 700;
    var easeActive = 0.16;
    var easeIdle = 0.06;

    function setTarget(clientX, clientY) {
      var width = window.innerWidth || 1;
      var height = window.innerHeight || 1;
      targetX = Math.max(0, Math.min(100, (clientX / width) * 100));
      targetY = Math.max(0, Math.min(100, (clientY / height) * 100));
      lastMove = performance.now();
    }

    function onPointerMove(event) {
      if (event.isPrimary === false) return;
      setTarget(event.clientX, event.clientY);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    function tick(now) {
      if (!document.body.contains(spotlight)) return;

      var idle = now - lastMove > idleDelay;
      if (idle) {
        var t = now / 9000;
        targetX = 52 + Math.cos(t) * 12;
        targetY = 42 + Math.sin(t * 0.85) * 10;
      }

      var ease = idle ? easeIdle : easeActive;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      spotlight.style.setProperty("--spotlight-x", currentX.toFixed(2) + "%");
      spotlight.style.setProperty("--spotlight-y", currentY.toFixed(2) + "%");
      if (cursorGlow) {
        cursorGlow.style.setProperty("--cursor-x", currentX.toFixed(2) + "%");
        cursorGlow.style.setProperty("--cursor-y", currentY.toFixed(2) + "%");
      }

      window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }

  function mountAll() {
    mountGradient();
    mountSpotlight();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(mountAll);
  } else {
    document.addEventListener("DOMContentLoaded", mountAll);
  }
})();
