(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const compactMode = window.matchMedia('(max-width: 700px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const motionFactor = compactMode ? .45 : 1;
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const items = [...document.querySelectorAll('.turkey-section-decor[data-decor-depth]')].map((element) => ({
    element,
    section: element.closest('[data-turkey-decor-section]'),
    depth: Number(element.dataset.decorDepth),
    rotation: Number(element.dataset.decorRotate),
    entryRotation: Number(element.dataset.decorEntryRotate) || 0,
    lerpSpeed: Number(element.dataset.decorLerp) || .08,
    entryX: Number(element.dataset.decorEnterX) || 0,
    currentX: Number(element.dataset.decorEnterX) || 0,
    targetX: Number(element.dataset.decorEnterX) || 0,
    compass: element.querySelector('.turkey-live-compass'),
    needle: element.querySelector('.turkey-live-compass__needle'),
    needleSweep: Number(element.dataset.decorNeedle) || 0,
    needleBase: Number(element.dataset.decorNeedleBase) || 0,
    needleLerpSpeed: Number(element.dataset.decorNeedleLerp) || .1,
    currentNeedle: Number(element.dataset.decorNeedleBase) || 0,
    targetNeedle: Number(element.dataset.decorNeedleBase) || 0,
    currentY: 0,
    currentRotation: Number(element.dataset.decorEntryRotate) || 0,
    targetY: 0,
    targetRotation: Number(element.dataset.decorEntryRotate) || 0,
    top: 0,
    height: 0
  }));

  if (!items.length) return;

  const introStartedAt = performance.now();
  const introDuration = 1100;

  items.forEach((item) => {
    item.element.style.transform = `translate3d(${item.currentX}px, 0, 0) rotate(${item.currentRotation}deg)`;
    if (!item.compass || !item.needle) return;
    item.isNeedleHovered = false;
    item.compass.addEventListener('pointerenter', () => {
      item.isNeedleHovered = true;
      requestUpdate();
    });
    item.compass.addEventListener('pointerleave', () => {
      item.isNeedleHovered = false;
      requestUpdate();
    });
  });

  let frame = null;
  let previousFrameAt = null;
  let scrollY = window.scrollY;
  let isDirty = true;
  const nearbySections = new Set();

  const measureSections = () => {
    items.forEach((item) => {
      const rect = item.section.getBoundingClientRect();
      item.top = rect.top + window.scrollY;
      item.height = rect.height;
    });
  };

  const getActiveItems = () => {
    const activeItems = items.filter((item) => nearbySections.has(item.section));
    const needsCompassFrame = performance.now() - introStartedAt < introDuration;
    items.forEach((item) => {
      if (item.needle && (needsCompassFrame || item.isNeedleHovered) && !activeItems.includes(item)) {
        activeItems.push(item);
      }
    });
    return activeItems
      .sort((a, b) => Math.abs((a.top + a.height / 2) - (scrollY + window.innerHeight / 2)) - Math.abs((b.top + b.height / 2) - (scrollY + window.innerHeight / 2)))
      .slice(0, 3);
  };

  const updateTargets = (activeItems) => {
    const viewportHeight = window.innerHeight;
    activeItems.forEach((item) => {
      const progress = Math.max(0, Math.min(1, (scrollY + viewportHeight - item.top) / (viewportHeight + item.height)));
      const offset = progress - .5;
      const revealProgress = Math.min(1, progress / .68);
      item.targetX = item.entryX * (1 - revealProgress) * motionFactor;
      item.targetY = offset * item.depth * motionFactor;
      item.targetRotation = item.entryRotation
        ? item.entryRotation * (1 - revealProgress)
        : offset * item.rotation * motionFactor;
      if (item.needle) {
        item.targetNeedle = item.needleBase + offset * item.needleSweep * motionFactor;
      }
    });
  };

  const render = (timestamp) => {
    const frameDelta = previousFrameAt === null ? 1 : Math.min(1.5, (timestamp - previousFrameAt) / 16.67);
    previousFrameAt = timestamp;
    const activeItems = getActiveItems();
    if (isDirty) {
      updateTargets(activeItems);
      isDirty = false;
    }

    let needsAnotherFrame = false;
    activeItems.forEach((item) => {
      item.currentX = lerp(item.currentX, item.targetX, item.lerpSpeed);
      item.currentY = lerp(item.currentY, item.targetY, item.lerpSpeed);
      item.currentRotation = lerp(item.currentRotation, item.targetRotation, item.lerpSpeed);
      item.element.style.transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, 0) rotate(${item.currentRotation.toFixed(2)}deg)`;
      if (item.needle) {
        const introProgress = Math.min(1, Math.max(0, (timestamp - introStartedAt) / introDuration));
        if (introProgress < 1) {
          const easedProgress = 1 - Math.pow(1 - introProgress, 3);
          item.currentNeedle = item.targetNeedle + (1 - easedProgress) * 720;
        } else if (item.isNeedleHovered) {
          const changingSpeed = 3 + Math.sin(timestamp * .012) * 1.35 + Math.sin(timestamp * .004) * .8;
          item.currentNeedle += changingSpeed * frameDelta;
        } else {
          item.currentNeedle = lerp(item.currentNeedle, item.targetNeedle, item.needleLerpSpeed);
        }
        item.needle.style.transform = `translate(-50%, -50%) rotate(${item.currentNeedle.toFixed(2)}deg)`;
      }
      const isIntroSpinning = item.needle && timestamp - introStartedAt < introDuration;
      if (Math.abs(item.targetX - item.currentX) > .05 || Math.abs(item.targetY - item.currentY) > .05 || Math.abs(item.targetRotation - item.currentRotation) > .02 || isIntroSpinning || (item.needle && item.isNeedleHovered) || (item.needle && Math.abs(item.targetNeedle - item.currentNeedle) > .02)) {
        needsAnotherFrame = true;
      }
    });
    frame = (needsAnotherFrame || isDirty) ? requestAnimationFrame(render) : null;
  };

  const requestUpdate = () => {
    isDirty = true;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) nearbySections.add(entry.target);
      else nearbySections.delete(entry.target);
    });
    requestUpdate();
  }, { rootMargin: '180px 0px' });

  items.forEach((item) => observer.observe(item.section));

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    requestUpdate();
  }, { passive: true });

  window.addEventListener('resize', () => {
    measureSections();
    scrollY = window.scrollY;
    requestUpdate();
  });

  window.addEventListener('load', () => {
    measureSections();
    requestUpdate();
  }, { once: true });

  measureSections();
  requestUpdate();
})();
