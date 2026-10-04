(function () {
  function initLanguageSwitches() {
    const switches = Array.from(document.querySelectorAll(".lang-switch"));

    if (!switches.length) {
      return;
    }

    function moveIndicator(switcher, button) {
      switcher.style.setProperty("--lang-indicator-x", button.offsetLeft + "px");
      switcher.style.setProperty("--lang-indicator-width", button.offsetWidth + "px");
    }

    function setActive(switcher, buttons, selectedButton) {
      buttons.forEach(function (button) {
        const isActive = button === selectedButton;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      moveIndicator(switcher, selectedButton);
    }

    switches.forEach(function (switcher) {
      const buttons = Array.from(switcher.querySelectorAll("a"));
      const defaultButton = buttons.find(function (button) {
        return button.textContent.trim() === "RU";
      }) || buttons[0];

      if (!defaultButton) {
        return;
      }

      switcher.setAttribute("role", "group");
      switcher.setAttribute("aria-label", "Выбор языка интерфейса");

      buttons.forEach(function (button) {
        button.setAttribute("role", "button");

        button.addEventListener("click", function (event) {
          event.preventDefault();
          setActive(switcher, buttons, button);
        });

        button.addEventListener("keydown", function (event) {
          if (event.key !== " " && event.key !== "Spacebar") {
            return;
          }

          event.preventDefault();
          button.click();
        });
      });

      setActive(switcher, buttons, defaultButton);
      switcher.classList.add("lang-switch--ready");
    });

    let resizeFrame;
    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(function () {
        switches.forEach(function (switcher) {
          const activeButton = switcher.querySelector("a.active");

          if (activeButton) {
            moveIndicator(switcher, activeButton);
          }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanguageSwitches, { once: true });
  } else {
    initLanguageSwitches();
  }
})();

(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  const animationScriptUrl = document.currentScript && document.currentScript.src;
  const gsapUrl = new URL("assets/vendor/gsap/gsap.min.js", animationScriptUrl || document.baseURI).href;
  const cardSelector = [
    ".mood-card",
    ".why-card",
    ".process-grid > article",
    ".review-grid > article",
    ".country-resort",
    ".country-sight-card",
    ".destination-card"
  ].join(",");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function onLoaded(callback) {
    if (document.readyState === "complete") {
      callback();
      return;
    }

    window.addEventListener("load", callback, { once: true });
  }

  function loadGsap(callback) {
    if (window.gsap) {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = gsapUrl;
    script.async = true;
    script.onload = callback;
    script.onerror = function () {
      document.querySelectorAll("[data-animate-ready]").forEach(function (element) {
        element.style.opacity = "";
        element.style.transform = "";
        element.removeAttribute("data-animate-ready");
      });
    };
    document.head.appendChild(script);
  }

  function markInitial(elements, y) {
    elements.forEach(function (element) {
      element.dataset.animateReady = "true";
      window.gsap.set(element, {
        autoAlpha: 0,
        y: y,
        force3D: true
      });
    });
  }

  function getHeroElements() {
    const homeHero = document.querySelector(".hero");
    const countryHero = document.querySelector(".country-hero");

    if (homeHero) {
      return [
        homeHero.querySelector("h1"),
        homeHero.querySelector(".hero-text"),
        homeHero.querySelector(".hero-actions"),
        homeHero.querySelector(".eyebrow"),
        homeHero.querySelector(".hero-stats")
      ].filter(Boolean);
    }

    if (countryHero) {
      if (countryHero.classList.contains("maldives-hero")) {
        return [
          countryHero.querySelector(".section-label"),
          countryHero.querySelector("h1"),
          countryHero.querySelector(".country-hero__content > p:not(.section-label)"),
          countryHero.querySelector(".button"),
          countryHero.querySelector(".maldives-hero__note")
        ].filter(Boolean);
      }

      return [
        countryHero.querySelector("h1"),
        countryHero.querySelector(".country-hero__content > p:not(.section-label)"),
        countryHero.querySelector(".button"),
        countryHero.querySelector(".section-label")
      ].filter(Boolean);
    }

    return [];
  }

  function getRevealSections() {
    return Array.from(document.querySelectorAll("body > section:not(.hero):not(.travel-moods), main > section:not(.country-hero):not(.travel-moods)"));
  }

  function animateHero(elements) {
    if (!elements.length) {
      return;
    }

    window.gsap.to(elements, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      clearProps: "transform"
    });
  }

  function animateSection(section) {
    const cards = Array.from(section.querySelectorAll(cardSelector));
    const head = section.querySelector(".section-head, .country-section__head");

    if (cards.length) {
      const timeline = window.gsap.timeline();

      if (head) {
        timeline.to(head, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform"
        });
      }

      timeline.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.05,
        clearProps: "transform"
      }, head ? "-=0.45" : 0);

      return;
    }

    window.gsap.to(section, {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      clearProps: "transform"
    });
  }

  onReady(function () {
    loadGsap(function () {
      const heroElements = getHeroElements();
      const sections = getRevealSections();

      markInitial(heroElements, 30);

      sections.forEach(function (section) {
        const cards = Array.from(section.querySelectorAll(cardSelector));
        const head = section.querySelector(".section-head, .country-section__head");

        if (cards.length) {
          if (head) {
            markInitial([head], 40);
          }
          markInitial(cards, 40);
          return;
        }

        markInitial([section], 40);
      });

      onLoaded(function () {
        animateHero(heroElements);
      });

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          animateSection(entry.target);
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.01,
        rootMargin: "0px 0px -20% 0px"
      });

      sections.forEach(function (section) {
        observer.observe(section);
      });
    });
  });
})();
