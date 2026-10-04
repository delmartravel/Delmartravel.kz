(() => {
  const country = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'default';
  const iconSets = {
    turkey: ['bi-buildings', 'bi-balloon', 'bi-water', 'bi-columns-gap', 'bi-house-door', 'bi-compass', 'bi-airplane', 'bi-bus-front', 'bi-cash-coin', 'bi-wifi', 'bi-translate', 'bi-person-walking'],
    egypt: ['bi-triangle', 'bi-bank', 'bi-suitcase-lg', 'bi-sun', 'bi-signpost-split', 'bi-binoculars', 'bi-geo-alt', 'bi-life-preserver', 'bi-wind', 'bi-brush', 'bi-door-open', 'bi-stars'],
    uae: ['bi-building', 'bi-umbrella', 'bi-rocket-takeoff', 'bi-shop', 'bi-cup-straw', 'bi-palette', 'bi-building-check', 'bi-taxi-front', 'bi-receipt', 'bi-people', 'bi-passport', 'bi-wallet2'],
    maldives: ['bi-mask', 'bi-sunset', 'bi-flower1', 'bi-moon-stars', 'bi-gem', 'bi-heart', 'bi-airplane-engines', 'bi-house-heart', 'bi-tree', 'bi-egg-fried', 'bi-sunglasses', 'bi-camera'],
    thailand: ['bi-bank2', 'bi-map', 'bi-basket', 'bi-backpack-fill', 'bi-train-front', 'bi-sunrise', 'bi-backpack', 'bi-umbrella-fill', 'bi-calendar2-week', 'bi-phone', 'bi-ticket', 'bi-signpost-2'],
    vietnam: ['bi-droplet', 'bi-buildings-fill', 'bi-signpost', 'bi-cloud-sun', 'bi-tree-fill', 'bi-camera-reels', 'bi-cup-hot', 'bi-card-image', 'bi-globe-asia-australia', 'bi-pin-map', 'bi-car-front', 'bi-postcard'],
    'sri-lanka': ['bi-cup-hot-fill', 'bi-binoculars-fill', 'bi-flower2', 'bi-backpack2', 'bi-suitcase', 'bi-cloud-drizzle', 'bi-sun-fill', 'bi-camera-video', 'bi-globe', 'bi-person-standing', 'bi-geo', 'bi-car-front-fill'],
    qatar: ['bi-shop-window', 'bi-building-fill', 'bi-signpost-fill', 'bi-sunrise-fill', 'bi-palette-fill', 'bi-bag-check', 'bi-door-closed', 'bi-person-badge', 'bi-calendar-range', 'bi-credit-card', 'bi-telephone', 'bi-window'],
    china: ['bi-globe2', 'bi-building-gear', 'bi-card-list', 'bi-mortarboard', 'bi-map-fill', 'bi-clouds', 'bi-person-arms-up', 'bi-wallet', 'bi-phone-vibrate', 'bi-luggage', 'bi-train-freight-front', 'bi-ticket-detailed'],
    georgia: ['bi-houses', 'bi-cup', 'bi-signpost-2-fill', 'bi-geo-fill', 'bi-suitcase2', 'bi-bicycle', 'bi-calendar2-event', 'bi-house-check', 'bi-clouds-fill', 'bi-basket3', 'bi-camera2', 'bi-card-text']
  };
  const fallbackIcons = ['bi-geo-alt', 'bi-compass', 'bi-camera', 'bi-map', 'bi-binoculars', 'bi-backpack', 'bi-globe2', 'bi-signpost', 'bi-postcard', 'bi-ticket', 'bi-sunglasses', 'bi-luggage'];
  const icons = iconSets[country] || fallbackIcons;

  document.querySelectorAll('.country-sight-card h3, .country-travel-notes h3').forEach((heading) => {
    heading.querySelectorAll('svg, .country-card-icon').forEach((icon) => icon.remove());
    heading.classList.remove('country-sight-card__title');
  });

  const sightSections = [...document.querySelectorAll('.country-sights')];
  const placesSection = sightSections.at(-1);
  const targetHeadings = [
    ...(placesSection ? placesSection.querySelectorAll('.country-sight-card h3') : []),
    ...document.querySelectorAll('.country-need-to-know .country-travel-notes h3')
  ];

  targetHeadings.forEach((heading, index) => {
    const icon = document.createElement('i');
    icon.className = `bi ${icons[index] || fallbackIcons[index % fallbackIcons.length]} country-card-icon`;
    icon.setAttribute('aria-hidden', 'true');
    heading.prepend(icon);
    heading.classList.add('country-sight-card__title');
  });
})();
