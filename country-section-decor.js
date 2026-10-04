(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const root = document.querySelector('.country-page:not(.country-page--turkey)');
  if (!root) return;

  const country = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'default';
  root.classList.add(`country-page--${country}`);
  const assets = {
    egypt: ['egypt/nile-boat-token', 'egypt/papyrus-scroll', 'egypt/limestone-temple-amulet', 'egypt/brass-scarab', 'egypt/desert-compass', 'egypt/palm-frond', 'egypt/sun-disc-amulet'],
    uae: ['uae/skyline-tower-clean', 'uae/arabian-lantern', 'uae/date-palm-keepsake', 'uae/pearl-shell', 'uae/desert-compass', 'uae/travel-scarf', 'uae/dhow-model'],
    maldives: ['maldives/coconut-half', 'maldives/conch-shell', 'maldives/manta-ray', 'maldives/coral-branch', 'maldives/snorkeling-mask', 'maldives/woven-sun-visor', 'maldives/starfish'],
    thailand: ['thailand/lotus-flower', 'thailand/tropical-leaf', 'thailand/longtail-boat-model', 'thailand/carved-elephant', 'thailand/travel-journal'],
    vietnam: ['vietnam/conical-hat', 'vietnam/coffee-dripper', 'vietnam/dragon-boat-model', 'vietnam/silk-lantern', 'vietnam/bamboo-fan'],
    'sri-lanka': ['sri-lanka/ceylon-tea-leaves', 'sri-lanka/tea-scoop', 'sri-lanka/hill-train-model', 'sri-lanka/ceremonial-mask', 'sri-lanka/travel-compass'],
    qatar: ['qatar/pearl-shell', 'qatar/incense-burner', 'qatar/doha-skyline-model', 'qatar/desert-rose', 'qatar/desert-binoculars'],
    china: ['china/guardian-lion', 'china/porcelain-tea-set', 'china/great-wall-model', 'china/calligraphy-set', 'china/silk-lantern-model'],
    georgia: ['georgia/wine-cork', 'georgia/vineyard-leaf', 'georgia/mountain-map', 'georgia/antique-key', 'georgia/leather-travel-journal'],
    default: ['turkey/vintage-suitcase', 'turkey/straw-sun-hat', 'turkey/seashell', 'turkey/travel-journal', 'turkey/brass-binoculars']
  };
  const sectionTargets = [
    { section: root.querySelector('.country-intro'), slot: 'intro', depth: 16, rotation: 8, entryX: 112 },
    { section: root.querySelector('.country-resorts'), slot: 'resorts', depth: 14, rotation: 7, entryX: -104 },
    { section: root.querySelector('.country-guide-panel'), slot: 'guide', depth: 12, rotation: 7, entryX: 104 },
    { section: root.querySelector('.country-season'), slot: 'season', depth: 13, rotation: 7, entryX: 104 },
    { section: [...root.querySelectorAll('.country-sights')].at(-1), slot: 'sights', depth: 12, rotation: 6, entryX: -104 },
    { section: root.querySelector('.country-need-to-know'), slot: 'notes', depth: 18, rotation: 6, entryX: 104 },
    { section: root.querySelector('.country-hotels-cta'), slot: 'cta', depth: 10, rotation: 5, entryX: -96 }
  ];
  const theme = assets[country] || assets.default;

  let assetIndex = 0;
  sectionTargets.forEach((target) => {
    if (!target.section) return;
    const asset = theme[assetIndex++];
    if (!asset) return;
    if (country === 'egypt' && target.slot === 'resorts') return;
    if (country === 'china' && target.slot === 'sights') return;
    target.section.setAttribute('data-country-decor-section', '');
    const decor = document.createElement('div');
    decor.className = `country-section-decor country-section-decor--${target.slot}`;
    decor.setAttribute('aria-hidden', 'true');
    decor.dataset.decorDepth = String(target.depth);
    decor.dataset.decorRotate = String(target.rotation);
    decor.dataset.decorLerp = target.slot === 'cta' ? '.08' : '.085';
    decor.dataset.decorEnterX = String(target.entryX);
    decor.dataset.decorEntryRotate = '45';
    decor.innerHTML = `<img src="../../assets/images/decor/${asset}.webp" alt="" loading="lazy" decoding="async">`;
    if (country === 'maldives') {
      const motion = {
        resorts: { enterX: -132, rotate: -24, type: 'coconut-roll' },
        season: { enterX: 104, rotate: 16, type: 'drift-down' },
        sights: { enterX: 124, rotate: -14, type: 'glide-down' },
        notes: { enterX: -108, rotate: 12, type: 'rise' },
        cta: { enterX: 92, rotate: -10, type: 'drift-down' }
      }[target.slot];
      if (motion) {
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
        decor.dataset.decorMotion = motion.type;
      }
    }
    if (country === 'thailand') {
      const motion = {
        resorts: { className: 'country-section-decor--thailand-lotus', enterX: -116, rotate: -18, type: 'bloom' },
        season: { className: 'country-section-decor--thailand-leaf', enterX: 108, rotate: 15, type: 'drift-down' },
        sights: { className: 'country-section-decor--thailand-boat', enterX: -128, rotate: -10, type: 'sail' },
        notes: { className: 'country-section-decor--thailand-elephant', enterX: 112, rotate: 12, type: 'rise' },
        cta: { className: 'country-section-decor--thailand-journal', enterX: -94, rotate: -12, type: 'drift-down' }
      }[target.slot];
      if (motion) {
        decor.classList.add(motion.className);
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
        decor.dataset.decorMotion = motion.type;
      }
    }
    if (country === 'vietnam') {
      const motion = {
        resorts: { className: 'country-section-decor--vietnam-hat', enterX: -118, rotate: -16, type: 'glide-down' },
        season: { className: 'country-section-decor--vietnam-coffee', enterX: 108, rotate: 12, type: 'rise' },
        sights: { className: 'country-section-decor--vietnam-boat', enterX: -132, rotate: -9, type: 'sail' },
        notes: { className: 'country-section-decor--vietnam-lantern', enterX: -72, rotate: -10, type: 'lantern-swing' },
        cta: { className: 'country-section-decor--vietnam-fan', enterX: -96, rotate: -14, type: 'bloom' }
      }[target.slot];
      if (motion) {
        decor.classList.add(motion.className);
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
        decor.dataset.decorMotion = motion.type;
      }
    }
    if (country === 'sri-lanka') {
      const motion = {
        resorts: { className: 'country-section-decor--srilanka-tea', enterX: -116, rotate: -17, type: 'bloom' },
        season: { className: 'country-section-decor--srilanka-scoop', enterX: 106, rotate: 14, type: 'drift-down' },
        sights: { className: 'country-section-decor--srilanka-train', enterX: -138, rotate: -7, type: 'drive' },
        notes: { className: 'country-section-decor--srilanka-mask', enterX: 112, rotate: 12, type: 'lantern-swing' },
        cta: { className: 'country-section-decor--srilanka-compass', enterX: -94, rotate: -13, type: 'rise' }
      }[target.slot];
      if (motion) {
        decor.classList.add(motion.className);
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
        decor.dataset.decorMotion = motion.type;
      }
    }
    if (country === 'qatar') {
      const motion = {
        resorts: { className: 'country-section-decor--qatar-pearl', enterX: -108, rotate: -15, type: 'arc-in' },
        season: { className: 'country-section-decor--qatar-incense', enterX: -92, rotate: -12, type: 'rise' },
        sights: { className: 'country-section-decor--qatar-skyline', enterX: 142, rotate: 7, type: 'sweep' },
        notes: { className: 'country-section-decor--qatar-rose', enterX: 118, rotate: 18, type: 'roll-soft' },
        cta: { className: 'country-section-decor--qatar-binoculars', enterX: -96, rotate: -11, type: 'glide-down' }
      }[target.slot];
      if (motion) {
        decor.classList.add(motion.className);
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
        decor.dataset.decorMotion = motion.type;
      }
    }
    if (country === 'china') {
      const motion = {
        resorts: { className: 'country-section-decor--china-lion', enterX: 116, rotate: 16, type: 'roll-soft' },
        season: { className: 'country-section-decor--china-tea', enterX: 128, rotate: 12, type: 'arc-in' },
        sights: { className: 'country-section-decor--china-wall', enterX: -154, rotate: -6, type: 'sweep' },
        notes: { className: 'country-section-decor--china-calligraphy', enterX: 122, rotate: 13, type: 'drift-down' },
        cta: { className: 'country-section-decor--china-lantern', enterX: -98, rotate: -12, type: 'lantern-swing' }
      }[target.slot];
      if (motion) {
        decor.classList.add(motion.className);
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
        decor.dataset.decorMotion = motion.type;
      }
    }
    if (country === 'georgia') {
      const motion = {
        season: { className: 'country-section-decor--georgia-leaf', enterX: 82, rotate: 10 },
        cta: { className: 'country-section-decor--georgia-journal', enterX: 74, rotate: 9 }
      }[target.slot];
      if (motion) {
        decor.classList.add(motion.className);
        decor.dataset.decorEnterX = String(motion.enterX);
        decor.dataset.decorEntryRotate = String(motion.rotate);
      }
    }
    if (country === 'egypt' && target.slot === 'sights') {
      decor.classList.add('country-section-decor--egypt-compass');
    }
    if (country === 'egypt' && target.slot === 'notes') {
      decor.classList.add('country-section-decor--egypt-palm');
    }
    if (country === 'uae' && target.slot === 'sights') {
      decor.classList.add('country-section-decor--uae-palm');
    }
    if (country === 'maldives' && target.slot === 'sights') {
      decor.classList.add('country-section-decor--maldives-manta');
    }
    if (country === 'maldives' && target.slot === 'notes') {
      decor.classList.add('country-section-decor--maldives-coral');
    }
    if (country === 'uae' && target.slot === 'notes') {
      decor.classList.add('country-section-decor--uae-shell');
    }
    if (country === 'uae' && target.slot === 'resorts') {
      const dubai = target.section.querySelector('.country-resort');
      if (dubai) {
        const dubaiText = [...dubai.children].find((child) => child.tagName === 'DIV');
        if (!dubaiText) return;
        dubaiText.setAttribute('data-country-decor-section', '');
        decor.classList.add('country-section-decor--dubai');
        decor.dataset.decorDepth = '-18';
        decor.dataset.decorEnterX = '-104';
        decor.dataset.decorDirection = 'left-to-right-up';
        dubaiText.prepend(decor);
        return;
      }
    }
    target.section.prepend(decor);
  });

  if (country === 'maldives') {
    const extras = [
      {
        section: root.querySelector('.maldives-why'),
        className: 'country-section-decor--maldives-seaplane',
        asset: 'maldives/seaplane-model',
        enterX: 152,
        rotate: 11,
        depth: 28,
        speed: .072,
        motion: 'fly'
      },
      {
        section: root.querySelector('.maldives-atolls .country-resort:nth-child(4)'),
        className: 'country-section-decor--maldives-dhoni',
        asset: 'maldives/dhoni-boat-model',
        enterX: -136,
        rotate: -12,
        depth: 18,
        speed: .078,
        motion: 'sail'
      }
    ];

    extras.forEach((extra) => {
      if (!extra.section) return;
      extra.section.setAttribute('data-country-decor-section', '');
      const decor = document.createElement('div');
      decor.className = `country-section-decor ${extra.className}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.dataset.decorDepth = String(extra.depth);
      decor.dataset.decorLerp = String(extra.speed);
      decor.dataset.decorEnterX = String(extra.enterX);
      decor.dataset.decorEntryRotate = String(extra.rotate);
      decor.dataset.decorMotion = extra.motion;
      decor.innerHTML = `<img src="../../assets/images/decor/${extra.asset}.webp" alt="" loading="lazy" decoding="async">`;
      extra.section.prepend(decor);
    });

  }

  if (country === 'thailand') {
    const extras = [
      {
        section: root.querySelector('.country-sights'),
        className: 'country-section-decor--thailand-parasol',
        asset: 'thailand/thai-parasol',
        enterX: 126,
        rotate: 16,
        depth: 18,
        speed: .078,
        motion: 'parasol'
      },
      {
        section: root.querySelector('.country-resorts .country-resort:nth-child(3)'),
        className: 'country-section-decor--thailand-tuktuk',
        asset: 'thailand/tuk-tuk-model',
        enterX: -142,
        rotate: -9,
        depth: 16,
        speed: .082,
        motion: 'drive'
      }
    ];

    extras.forEach((extra) => {
      if (!extra.section) return;
      extra.section.setAttribute('data-country-decor-section', '');
      const decor = document.createElement('div');
      decor.className = `country-section-decor ${extra.className}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.dataset.decorDepth = String(extra.depth);
      decor.dataset.decorLerp = String(extra.speed);
      decor.dataset.decorEnterX = String(extra.enterX);
      decor.dataset.decorEntryRotate = String(extra.rotate);
      decor.dataset.decorMotion = extra.motion;
      decor.innerHTML = `<img src="../../assets/images/decor/${extra.asset}.webp" alt="" loading="lazy" decoding="async">`;
      extra.section.prepend(decor);
    });

  }

  if (country === 'vietnam') {
    const extras = [
      {
        section: root.querySelector('.country-sights'),
        className: 'country-section-decor--vietnam-pagoda',
        asset: 'vietnam/pagoda-model',
        enterX: 126,
        rotate: 14,
        depth: 18,
        speed: .078,
        motion: 'rise'
      },
      {
        section: root.querySelector('.country-resorts .country-resort:nth-child(3)'),
        className: 'country-section-decor--vietnam-scooter',
        asset: 'vietnam/vintage-scooter',
        enterX: -142,
        rotate: -8,
        depth: 16,
        speed: .082,
        motion: 'drive'
      }
    ];

    extras.forEach((extra) => {
      if (!extra.section) return;
      extra.section.setAttribute('data-country-decor-section', '');
      const decor = document.createElement('div');
      decor.className = `country-section-decor ${extra.className}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.dataset.decorDepth = String(extra.depth);
      decor.dataset.decorLerp = String(extra.speed);
      decor.dataset.decorEnterX = String(extra.enterX);
      decor.dataset.decorEntryRotate = String(extra.rotate);
      decor.dataset.decorMotion = extra.motion;
      decor.innerHTML = `<img src="../../assets/images/decor/${extra.asset}.webp" alt="" loading="lazy" decoding="async">`;
      extra.section.prepend(decor);
    });
  }

  if (country === 'sri-lanka') {
    const extras = [
      {
        section: root.querySelector('.country-sights'),
        className: 'country-section-decor--srilanka-elephant',
        asset: 'sri-lanka/carved-elephant-model',
        enterX: 124,
        rotate: 13,
        depth: 18,
        speed: .078,
        motion: 'rise'
      },
      {
        section: root.querySelector('.country-resorts .country-resort:nth-child(3)'),
        className: 'country-section-decor--srilanka-cinnamon',
        asset: 'sri-lanka/ceylon-cinnamon',
        enterX: -138,
        rotate: -10,
        depth: 16,
        speed: .082,
        motion: 'sail'
      }
    ];

    extras.forEach((extra) => {
      if (!extra.section) return;
      extra.section.setAttribute('data-country-decor-section', '');
      const decor = document.createElement('div');
      decor.className = `country-section-decor ${extra.className}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.dataset.decorDepth = String(extra.depth);
      decor.dataset.decorLerp = String(extra.speed);
      decor.dataset.decorEnterX = String(extra.enterX);
      decor.dataset.decorEntryRotate = String(extra.rotate);
      decor.dataset.decorMotion = extra.motion;
      decor.innerHTML = `<img src="../../assets/images/decor/${extra.asset}.webp" alt="" loading="lazy" decoding="async">`;
      extra.section.prepend(decor);
    });
  }

  if (country === 'qatar') {
    const extras = [
      {
        section: root.querySelector('.country-sights'),
        className: 'country-section-decor--qatar-falcon',
        asset: 'qatar/falcon-figurine',
        enterX: -132,
        rotate: -12,
        depth: 22,
        speed: .074,
        motion: 'perch'
      },
      {
        section: root.querySelector('.country-resorts .country-resort:nth-child(4)'),
        className: 'country-section-decor--qatar-dhow',
        asset: 'qatar/dhow-full-model',
        enterX: 148,
        rotate: 10,
        depth: 16,
        speed: .08,
        motion: 'sail'
      }
    ];

    extras.forEach((extra) => {
      if (!extra.section) return;
      extra.section.setAttribute('data-country-decor-section', '');
      const decor = document.createElement('div');
      decor.className = `country-section-decor ${extra.className}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.dataset.decorDepth = String(extra.depth);
      decor.dataset.decorLerp = String(extra.speed);
      decor.dataset.decorEnterX = String(extra.enterX);
      decor.dataset.decorEntryRotate = String(extra.rotate);
      decor.dataset.decorMotion = extra.motion;
      decor.innerHTML = `<img src="../../assets/images/decor/${extra.asset}.webp" alt="" loading="lazy" decoding="async">`;
      extra.section.prepend(decor);
    });
  }

  if (country === 'china') {
    const extras = [
      {
        section: root.querySelector('.country-sights'),
        className: 'country-section-decor--china-dragon',
        asset: 'china/jade-dragon',
        enterX: 146,
        rotate: 14,
        depth: 24,
        speed: .072,
        motion: 'serpentine'
      },
      {
        section: root.querySelector('.country-resorts .country-resort:nth-child(2)'),
        className: 'country-section-decor--china-fan',
        asset: 'china/landscape-fan',
        enterX: 144,
        rotate: 18,
        depth: 18,
        speed: .078,
        motion: 'fan-glide'
      },
      {
        section: root.querySelector('.country-resorts .country-resort:nth-child(4)'),
        className: 'country-section-decor--china-warrior',
        asset: 'china/terracotta-warrior',
        enterX: -126,
        rotate: -9,
        depth: 16,
        speed: .08,
        motion: 'march'
      }
    ];

    extras.forEach((extra) => {
      if (!extra.section) return;
      extra.section.setAttribute('data-country-decor-section', '');
      const decor = document.createElement('div');
      decor.className = `country-section-decor ${extra.className}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.dataset.decorDepth = String(extra.depth);
      decor.dataset.decorLerp = String(extra.speed);
      decor.dataset.decorEnterX = String(extra.enterX);
      decor.dataset.decorEntryRotate = String(extra.rotate);
      decor.dataset.decorMotion = extra.motion;
      decor.innerHTML = `<img src="../../assets/images/decor/${extra.asset}.webp" alt="" loading="lazy" decoding="async">`;
      extra.section.prepend(decor);
    });

    const sightsSections = [...root.querySelectorAll('.country-sights')];
    const finalSights = sightsSections[sightsSections.length - 1];
    if (finalSights) {
      const band = document.createElement('div');
      band.className = 'china-wall-panorama-band';
      band.setAttribute('data-country-decor-section', '');
      band.setAttribute('aria-hidden', 'true');

      const wall = document.createElement('div');
      wall.className = 'country-section-decor country-section-decor--china-wall-panorama';
      wall.setAttribute('aria-hidden', 'true');
      wall.dataset.decorDepth = '10';
      wall.dataset.decorLerp = '.065';
      wall.dataset.decorEnterX = '-90';
      wall.dataset.decorEntryRotate = '0';
      wall.dataset.decorMotion = 'wall-panorama';
      wall.innerHTML = '<img src="../../assets/images/decor/china/great-wall-panorama.webp" alt="" loading="lazy" decoding="async">';
      band.append(wall);
      finalSights.before(band);
    }
  }

  const compact = window.matchMedia('(max-width: 700px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const factor = compact ? .45 : 1;
  const lerp = (from, to, speed) => from + (to - from) * speed;
  const items = [...root.querySelectorAll('.country-section-decor')].map((element) => ({
    element,
    section: element.closest('[data-country-decor-section]'),
    depth: Number(element.dataset.decorDepth),
    entryX: Number(element.dataset.decorEnterX),
    entryRotation: Number(element.dataset.decorEntryRotate),
    motion: element.dataset.decorMotion || 'drift',
    speed: Number(element.dataset.decorLerp) || .08,
    x: Number(element.dataset.decorEnterX), y: 0, rotation: Number(element.dataset.decorEntryRotate),
    targetX: Number(element.dataset.decorEnterX), targetY: 0, targetRotation: Number(element.dataset.decorEntryRotate), top: 0, height: 0
  }));
  if (!items.length) return;

  let scrollY = window.scrollY;
  let dirty = true;
  let frame = null;
  const nearby = new Set();
  const measure = () => items.forEach((item) => {
    const rect = item.section.getBoundingClientRect();
    item.top = rect.top + window.scrollY;
    item.height = rect.height;
  });
  const updateTargets = () => items.filter((item) => nearby.has(item.section)).slice(0, 3).forEach((item) => {
    const travelHeight = item.motion === 'coconut-roll' ? Math.min(item.height, 1080) : item.height;
    const progress = Math.max(0, Math.min(1, (scrollY + innerHeight - item.top) / (innerHeight + travelHeight)));
    const reveal = Math.min(1, progress / .68);
    if (item.element.dataset.decorDirection === 'left-to-right-up') {
      item.targetX = (-104 + reveal * 208) * factor;
      item.targetY = (18 - reveal * 36) * factor;
      item.targetRotation = item.entryRotation * (1 - reveal);
    } else if (item.motion === 'fly') {
      item.targetX = (item.entryX - reveal * (item.entryX + 24)) * factor;
      item.targetY = (32 - reveal * 68) * factor;
      item.targetRotation = (item.entryRotation - reveal * (item.entryRotation + 4)) * factor;
    } else if (item.motion === 'sail') {
      item.targetX = (item.entryX * (1 - reveal) + reveal * 16) * factor;
      item.targetY = (Math.sin(progress * Math.PI) * 12 - reveal * 8) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) + Math.sin(progress * Math.PI) * 2.5) * factor;
    } else if (item.motion === 'coconut-roll') {
      item.targetX = (-132 + reveal * 248) * factor;
      item.targetY = (24 - reveal * 48) * factor;
      item.targetRotation = (-24 + reveal * 42) * factor;
    } else if (item.motion === 'glide-down') {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (-30 + reveal * 62) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) + reveal * 3) * factor;
    } else if (item.motion === 'drift-down') {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (-20 + reveal * 42) * factor;
      item.targetRotation = item.entryRotation * (1 - reveal) * factor;
    } else if (item.motion === 'rise') {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (26 - reveal * 50) * factor;
      item.targetRotation = item.entryRotation * (1 - reveal) * factor;
    } else if (item.motion === 'parasol') {
      item.targetX = (item.entryX * (1 - reveal) - reveal * 10) * factor;
      item.targetY = (18 - reveal * 38) * factor;
      item.targetRotation = (item.entryRotation - reveal * 22) * factor;
    } else if (item.motion === 'drive') {
      item.targetX = (item.entryX * (1 - reveal) + reveal * 18) * factor;
      item.targetY = (14 - reveal * 22) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) + reveal * 1.5) * factor;
    } else if (item.motion === 'bloom') {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (20 - reveal * 36) * factor;
      item.targetRotation = (item.entryRotation + reveal * 20) * factor;
    } else if (item.motion === 'lantern-swing') {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (-18 + reveal * 38) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) + Math.sin(progress * Math.PI) * 5) * factor;
    } else if (item.motion === 'arc-in') {
      item.targetX = (item.entryX * (1 - reveal) - reveal * 8) * factor;
      item.targetY = (18 - Math.sin(progress * Math.PI) * 34) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) - reveal * 4) * factor;
    } else if (item.motion === 'sweep') {
      item.targetX = (item.entryX * (1 - reveal) + reveal * 22) * factor;
      item.targetY = (-10 + reveal * 20) * factor;
      item.targetRotation = item.entryRotation * (1 - reveal) * factor;
    } else if (item.motion === 'perch') {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (30 - reveal * 44) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) + reveal * 2) * factor;
    } else if (item.motion === 'roll-soft') {
      item.targetX = (item.entryX * (1 - reveal) - reveal * 14) * factor;
      item.targetY = (-12 + reveal * 28) * factor;
      item.targetRotation = (item.entryRotation - reveal * 28) * factor;
    } else if (item.motion === 'serpentine') {
      item.targetX = (item.entryX * (1 - reveal) + Math.sin(progress * Math.PI) * 18) * factor;
      item.targetY = (22 - reveal * 48 + Math.sin(progress * Math.PI * 2) * 6) * factor;
      item.targetRotation = (item.entryRotation * (1 - reveal) - Math.sin(progress * Math.PI) * 5) * factor;
    } else if (item.motion === 'fan-glide') {
      item.targetX = (item.entryX * (1 - reveal) - reveal * 12) * factor;
      item.targetY = (18 - reveal * 34) * factor;
      item.targetRotation = (item.entryRotation - reveal * 26) * factor;
    } else if (item.motion === 'march') {
      item.targetX = (item.entryX * (1 - reveal) + reveal * 10) * factor;
      item.targetY = (24 - reveal * 30) * factor;
      item.targetRotation = item.entryRotation * (1 - reveal) * factor;
    } else if (item.motion === 'wall-panorama') {
      item.targetX = (item.entryX * (1 - reveal) + reveal * 10) * factor;
      item.targetY = (12 - reveal * 24) * factor;
      item.targetRotation = 0;
    } else {
      item.targetX = item.entryX * (1 - reveal) * factor;
      item.targetY = (progress - .5) * item.depth * factor;
      item.targetRotation = item.entryRotation * (1 - reveal);
    }
  });
  const render = () => {
    if (dirty) { updateTargets(); dirty = false; }
    let moving = false;
    items.forEach((item) => {
      if (!nearby.has(item.section)) return;
      item.x = lerp(item.x, item.targetX, item.speed);
      item.y = lerp(item.y, item.targetY, item.speed);
      item.rotation = lerp(item.rotation, item.targetRotation, item.speed);
      item.element.style.transform = `translate3d(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px, 0) rotate(${item.rotation.toFixed(2)}deg)`;
      moving ||= Math.abs(item.x - item.targetX) > .05 || Math.abs(item.y - item.targetY) > .05 || Math.abs(item.rotation - item.targetRotation) > .02;
    });
    frame = moving || dirty ? requestAnimationFrame(render) : null;
  };
  const requestUpdate = () => { dirty = true; if (!frame) frame = requestAnimationFrame(render); };
  const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => entry.isIntersecting ? nearby.add(entry.target) : nearby.delete(entry.target)); requestUpdate(); }, { rootMargin: '180px 0px' });
  items.forEach((item) => observer.observe(item.section));
  addEventListener('scroll', () => { scrollY = window.scrollY; requestUpdate(); }, { passive: true });
  addEventListener('resize', () => { measure(); scrollY = window.scrollY; requestUpdate(); });
  measure();
  requestUpdate();
})();
