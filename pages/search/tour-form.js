(() => {
  const form = document.querySelector(".tour-search-form");

  if (!form) return;

  const state = {
    searchType: null,
    hotelClass: null,
    budget: {
      min: null,
      max: null,
      currency: null,
    },
    departureDates: {
      from: null,
      to: null,
    },
    nights: {
      min: null,
      max: null,
    },
    tourists: {
      adults: 1,
      childrenAges: [],
    },
  };

  window.delMarTourSearchState = state;

  const controls = {
    "departure-city": form.querySelector('[data-tour-search-control="departure-city"]'),
    budget: form.querySelector('[data-tour-search-control="budget"]'),
    dates: form.querySelector('[data-tour-search-control="dates"]'),
    nights: form.querySelector('[data-tour-search-control="nights"]'),
    tourists: form.querySelector('[data-tour-search-control="tourists"]'),
  };

  const triggers = {
    "departure-city": form.querySelector('[data-tour-search-trigger="departure-city"]'),
    budget: form.querySelector('[data-tour-search-trigger="budget"]'),
    dates: form.querySelector('[data-tour-search-trigger="dates"]'),
    nights: form.querySelector('[data-tour-search-trigger="nights"]'),
    tourists: form.querySelector('[data-tour-search-trigger="tourists"]'),
  };

  const panels = {
    "departure-city": document.getElementById("tour-search-departure-city-panel"),
    budget: document.getElementById("tour-search-budget-panel"),
    dates: document.getElementById("tour-search-dates-panel"),
    nights: document.getElementById("tour-search-nights-panel"),
    tourists: document.getElementById("tour-search-tourists-panel"),
  };

  const labels = {
    dates: "Даты вылета",
    nights: "Ночей",
    tourists: "Туристы",
  };

  const panelTimers = {};
  const today = startOfDay(new Date());
  const maxDepartureRangeDays = 21;
  let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let activePanel = null;
  let draftDates = { from: null, to: null };
  let draftNights = { min: null, max: null };
  let draftTourists = { adults: 1, childrenAges: [] };
  let draftBudget = { min: null, max: null, currency: null };
  let activeChildAgeIndex = null;
  let hotelModalPageScroll = 0;
  let hotelModalReturnFocus = null;

  initSelectPopovers();
  initDepartureCityTabs();
  initBudget();
  initHotelClassStars();
  initInlineResults();
  initHotelDetails();
  initHotelRooms();
  initReviewsModal();
  initHotelModal();
  initHotelGallery();

  Object.values(controls).forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
  });

  form.querySelectorAll('input[name="search-type"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.searchType = input.nextElementSibling?.textContent?.trim() || null;
    });
  });

  Object.entries(triggers).forEach(([name, trigger]) => {
    trigger.addEventListener("click", () => {
      if (activePanel === name) {
        closePanel(name);
        return;
      }

      openPanel(name);
    });
  });

  form.querySelectorAll("[data-tour-search-close]").forEach((button) => {
    button.addEventListener("click", () => closeAllPanels());
  });

  form.querySelector("[data-calendar-prev]").addEventListener("click", () => {
    const previous = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);

    if (previous >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      calendarMonth = previous;
      renderCalendar();
    }
  });

  form.querySelector("[data-calendar-next]").addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  form.querySelector('[data-tour-search-apply="dates"]').addEventListener("click", () => {
    state.departureDates = {
      from: draftDates.from ? toIsoDate(draftDates.from) : null,
      to: draftDates.to ? toIsoDate(draftDates.to) : draftDates.from ? toIsoDate(draftDates.from) : null,
    };
    syncDatesTrigger();
    closePanel("dates");
  });

  form.querySelector('[data-tour-search-apply="nights"]').addEventListener("click", () => {
    state.nights = { ...draftNights };
    syncNightsTrigger();
    closePanel("nights");
  });

  form.querySelector('[data-tour-search-apply="tourists"]').addEventListener("click", () => {
    state.tourists = {
      adults: draftTourists.adults,
      childrenAges: [...draftTourists.childrenAges],
    };
    syncTouristsTrigger();
    closePanel("tourists");
  });

  form.querySelector('[data-tour-search-apply="budget"]').addEventListener("click", () => {
    if (!isBudgetValid()) return;

    state.budget = { ...draftBudget };
    syncBudgetTrigger();
    closePanel("budget");
  });

  form.querySelectorAll("[data-counter]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.counter;
      const step = Number(button.dataset.step);

      if (target === "adults") {
        draftTourists.adults = Math.max(1, draftTourists.adults + step);
      }

      if (target === "children") {
        if (step > 0) {
          draftTourists.childrenAges.push(null);
        } else {
          draftTourists.childrenAges.pop();
          if (activeChildAgeIndex !== null && activeChildAgeIndex >= draftTourists.childrenAges.length) {
            activeChildAgeIndex = null;
          }
        }
      }

      renderTourists();
      fitPanel("tourists");
    });
  });

  document.addEventListener("click", (event) => {
    if (!activePanel) return;

    const control = controls[activePanel];
    if (control && !control.contains(event.target)) {
      closePanel(activePanel);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllPanels();
      closeReviewsModal();
    }
  });

  window.addEventListener("resize", () => {
    if (activePanel) fitPanel(activePanel);
  });

  window.addEventListener("scroll", () => {
    if (activePanel) fitPanel(activePanel);
  }, true);

  function openPanel(name) {
    closeAllPanels();

    if (name === "dates") {
      draftDates = {
        from: state.departureDates.from ? parseIsoDate(state.departureDates.from) : null,
        to: state.departureDates.to ? parseIsoDate(state.departureDates.to) : null,
      };
      renderCalendar();
    }

    if (name === "nights") {
      draftNights = { ...state.nights };
      renderNights();
    }

    if (name === "tourists") {
      draftTourists = {
        adults: state.tourists.adults,
        childrenAges: [...state.tourists.childrenAges],
      };
      activeChildAgeIndex = null;
      renderTourists();
    }

    if (name === "budget") {
      draftBudget = { ...state.budget };
      renderBudget();
    }

    showPanel(name);
    triggers[name].setAttribute("aria-expanded", "true");
    activePanel = name;
    requestAnimationFrame(() => fitPanel(name));
    requestAnimationFrame(() => requestAnimationFrame(() => fitPanel(name)));
  }

  function closePanel(name) {
    if (!panels[name] || panels[name].hidden) return;

    panels[name].classList.remove("is-open");
    panels[name].classList.add("is-closing");
    controls[name]?.classList.remove("is-popover-active");
    triggers[name].setAttribute("aria-expanded", "false");
    clearTimeout(panelTimers[name]);

    panelTimers[name] = window.setTimeout(() => {
      panels[name].hidden = true;
      panels[name].classList.remove("is-closing");
      resetPanelPosition(panels[name]);
    }, 190);

    if (activePanel === name) {
      activePanel = null;
    }
  }

  function closeAllPanels() {
    Object.keys(panels).forEach(closePanel);
  }

  function showPanel(name) {
    clearTimeout(panelTimers[name]);
    panels[name].hidden = false;
    panels[name].classList.remove("is-closing");
    controls[name]?.classList.add("is-popover-active");
    requestAnimationFrame(() => panels[name].classList.add("is-open"));
  }

  function fitPanel(name) {
    const panel = panels[name];
    const control = controls[name];
    const viewportGap = 14;
    const isSelectPanel = panel.classList.contains("tour-search-select-popover");
    const isDepartureCityPanel = panel.classList.contains("tour-search-departure-city");

    resetPanelPosition(panel);

    if (window.matchMedia("(max-width: 520px)").matches) {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const mobileMaxHeight = isSelectPanel ? Math.max(120, Math.min(220, viewportHeight - viewportGap * 2)) : isDepartureCityPanel ? Math.max(260, Math.min(520, viewportHeight - viewportGap * 2)) : Math.max(320, viewportHeight - viewportGap * 2);

      panel.style.position = "fixed";
      panel.style.top = "auto";
      panel.style.right = `${viewportGap}px`;
      panel.style.bottom = `${viewportGap}px`;
      panel.style.left = `${viewportGap}px`;
      panel.style.maxHeight = `${mobileMaxHeight}px`;
      return;
    }

    let panelRect = panel.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();

    if (panelRect.right > window.innerWidth - viewportGap) {
      panel.classList.add("is-right-aligned");
      panelRect = panel.getBoundingClientRect();
    }

    if (panelRect.left < viewportGap) {
      panel.classList.remove("is-right-aligned");
      panel.style.left = `${viewportGap - controlRect.left}px`;
      panel.style.right = "auto";
      panelRect = panel.getBoundingClientRect();
    }

    const belowSpace = window.innerHeight - controlRect.bottom - viewportGap - 12;
    const aboveSpace = controlRect.top - viewportGap - 12;
    const shouldOpenAbove = panelRect.height > belowSpace && aboveSpace > belowSpace;

    if (shouldOpenAbove) {
      panel.classList.add("is-above");
      panel.style.maxHeight = isSelectPanel ? `${Math.max(120, Math.min(220, aboveSpace))}px` : isDepartureCityPanel ? `${Math.max(220, Math.min(520, aboveSpace))}px` : `${Math.max(240, aboveSpace)}px`;
    } else {
      panel.style.maxHeight = isSelectPanel ? `${Math.max(120, Math.min(220, belowSpace))}px` : isDepartureCityPanel ? `${Math.max(220, Math.min(520, belowSpace))}px` : `${Math.max(240, belowSpace)}px`;
    }
  }

  function resetPanelPosition(panel) {
    panel.classList.remove("is-right-aligned", "is-above");
    panel.style.position = "";
    panel.style.top = "";
    panel.style.left = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.maxHeight = "";
  }

  function initSelectPopovers() {
    form.querySelectorAll(".tour-search-field select, .tour-search-select select").forEach((select, index) => {
      const control = select.closest(".tour-search-field, .tour-search-select");
      if (!control) return;

      const name = `select-${index}`;
      const label = control.querySelector("span")?.textContent?.trim() || select.options[0]?.textContent?.trim() || "";
      const selected = select.options[select.selectedIndex]?.textContent?.trim() || label;
      const trigger = document.createElement("button");
      const panel = document.createElement("div");
      const list = document.createElement("div");

      control.classList.add("tour-search-control", "tour-search-control--select");
      control.dataset.tourSearchControl = name;
      select.classList.add("tour-search-native-select");

      trigger.className = "tour-search-trigger tour-search-trigger--select";
      trigger.type = "button";
      trigger.textContent = selected;
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", `tour-search-${name}-panel`);
      trigger.dataset.tourSearchTrigger = name;

      panel.className = "tour-search-popover tour-search-select-popover";
      panel.id = `tour-search-${name}-panel`;
      panel.role = "listbox";
      panel.setAttribute("aria-label", label);
      panel.hidden = true;

      list.className = "tour-search-select-options";

      Array.from(select.options).forEach((option) => {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "tour-search-select-option";
        optionButton.textContent = option.textContent;
        optionButton.disabled = option.disabled;
        optionButton.setAttribute("role", "option");
        optionButton.setAttribute("aria-selected", String(option.selected));

        optionButton.addEventListener("click", () => {
          if (option.disabled) return;

          select.value = option.value;
          trigger.textContent = option.textContent;
          list.querySelectorAll(".tour-search-select-option").forEach((item) => {
            item.setAttribute("aria-selected", "false");
          });
          optionButton.setAttribute("aria-selected", "true");
          closePanel(name);
        });

        list.appendChild(optionButton);
      });

      panel.appendChild(list);
      select.after(trigger, panel);

      controls[name] = control;
      triggers[name] = trigger;
      panels[name] = panel;
      labels[name] = label;
    });
  }

  function initDepartureCityTabs() {
    const panel = panels["departure-city"];
    if (!panel) return;

    const content = panel.querySelector(".tour-search-departure-city__content");

    window.delMarDepartureCities = {
      render(cities, options = {}) {
        renderDepartureCities(content, cities, options);
      },
    };

    panel.querySelectorAll(".tour-search-departure-city__tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        panel.querySelectorAll(".tour-search-departure-city__tab").forEach((item) => {
          const isSelected = item === tab;
          item.classList.toggle("is-active", isSelected);
          item.setAttribute("aria-selected", String(isSelected));
        });

        if (content) {
          content.classList.remove("is-switching");
          void content.offsetWidth;
          content.classList.add("is-switching");
        }
      });
    });
  }

  function initBudget() {
    const panel = panels.budget;
    if (!panel) return;

    const minInput = panel.querySelector("[data-budget-min]");
    const maxInput = panel.querySelector("[data-budget-max]");

    [minInput, maxInput].forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "");
        draftBudget[input === minInput ? "min" : "max"] = input.value || null;
        updateBudgetValidation();
      });
    });

    panel.querySelectorAll('input[name="budget-currency"]').forEach((input) => {
      input.addEventListener("change", () => {
        draftBudget.currency = input.value;
      });
    });

    panel.querySelector("[data-budget-clear]").addEventListener("click", () => {
      draftBudget = { min: null, max: null, currency: null };
      state.budget = { ...draftBudget };
      renderBudget();
      syncBudgetTrigger();
    });
  }

  function renderBudget() {
    const panel = panels.budget;
    const minInput = panel.querySelector("[data-budget-min]");
    const maxInput = panel.querySelector("[data-budget-max]");

    minInput.value = draftBudget.min || "";
    maxInput.value = draftBudget.max || "";
    panel.querySelectorAll('input[name="budget-currency"]').forEach((input) => {
      input.checked = input.value === draftBudget.currency;
    });
    updateBudgetValidation();
  }

  function isBudgetValid() {
    const min = Number(draftBudget.min);
    const max = Number(draftBudget.max);
    return !(draftBudget.min && draftBudget.max && min > max);
  }

  function updateBudgetValidation() {
    const panel = panels.budget;
    const isValid = isBudgetValid();

    panel.classList.toggle("has-invalid-range", !isValid);
    panel.querySelector("[data-budget-min]").setAttribute("aria-invalid", String(!isValid));
    panel.querySelector("[data-budget-max]").setAttribute("aria-invalid", String(!isValid));
    panel.querySelector('[data-tour-search-apply="budget"]').disabled = !isValid;
  }

  function syncBudgetTrigger() {
    const { min, max } = state.budget;

    if (min && max) {
      triggers.budget.textContent = `${min} — ${max}`;
      return;
    }

    triggers.budget.textContent = min || max || "Бюджет";
  }

  function renderDepartureCities(container, cities, options = {}) {
    if (!container || !Array.isArray(cities)) return;

    const locale = options.locale || "ru";
    const getName = options.getName || ((city) => {
      if (typeof city === "string") return city;
      return city?.name || city?.title || city?.city || "";
    });
    const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
    const sortedCities = cities
      .map((city) => ({ city, name: String(getName(city) || "").trim() }))
      .filter(({ name }) => name)
      .sort((left, right) => collator.compare(left.name, right.name));
    const groups = [];

    sortedCities.forEach((item) => {
      const letter = Array.from(item.name)[0].toLocaleUpperCase(locale);
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.letter !== letter) {
        groups.push({ letter, cities: [item] });
        return;
      }

      lastGroup.cities.push(item);
    });

    const columnCount = options.columns || 4;
    const totalCities = sortedCities.length;
    const cityLimitPerColumn = Math.max(1, Math.ceil(totalCities / columnCount));
    const columns = [[]];
    let currentCount = 0;

    groups.forEach((group) => {
      if (columns.length < columnCount && currentCount && currentCount + group.cities.length > cityLimitPerColumn) {
        columns.push([]);
        currentCount = 0;
      }

      columns[columns.length - 1].push(group);
      currentCount += group.cities.length;
    });

    container.replaceChildren();
    columns.forEach((columnGroups) => {
      const column = document.createElement("div");
      column.className = "tour-search-departure-city__column";

      columnGroups.forEach((group) => {
        const groupElement = document.createElement("section");
        const divider = document.createElement("span");
        const cityList = document.createElement("div");

        groupElement.className = "tour-search-departure-city__group";
        divider.className = "tour-search-departure-city__divider";
        divider.textContent = group.letter;
        cityList.className = "tour-search-departure-city__items";

        group.cities.forEach(({ city, name }) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "tour-search-departure-city__item";
          item.textContent = name;
          item.dataset.cityValue = options.getValue ? String(options.getValue(city) ?? "") : name;
          cityList.appendChild(item);
        });

        groupElement.append(divider, cityList);
        column.appendChild(groupElement);
      });

      container.appendChild(column);
    });
  }

  function initHotelClassStars() {
    const stars = form.querySelector("[data-hotel-class-stars]");

    if (!stars) return;

    const buttons = stars.querySelectorAll("[data-hotel-class]");
    let fillTimer = null;

    buttons.forEach((button) => {
      const value = Number(button.dataset.hotelClass);

      button.addEventListener("mouseenter", () => {
        stars.dataset.hover = String(value);
      });

      button.addEventListener("focus", () => {
        stars.dataset.hover = String(value);
      });

      button.addEventListener("click", () => {
        state.hotelClass = value;
        stars.dataset.value = String(value);
        stars.classList.remove("is-filling");

        buttons.forEach((item) => {
          item.setAttribute("aria-pressed", String(Number(item.dataset.hotelClass) === value));
        });

        requestAnimationFrame(() => stars.classList.add("is-filling"));
        clearTimeout(fillTimer);
        fillTimer = window.setTimeout(() => stars.classList.remove("is-filling"), 320);
      });
    });

    stars.addEventListener("mouseleave", () => {
      delete stars.dataset.hover;
    });

    stars.addEventListener("focusout", (event) => {
      if (!stars.contains(event.relatedTarget)) {
        delete stars.dataset.hover;
      }
    });
  }

  function initInlineResults() {
    const submit = form.querySelector("[data-tour-search-submit]");
    const results = document.querySelector("[data-search-results]");
    const loading = document.querySelector("[data-search-results-loading]");
    const list = document.querySelector(".search-results-list");

    if (!submit) return;

    submit.addEventListener("click", (event) => {
      event.preventDefault();

      if (!results || !loading || !list) return;

      closeAllPanels();
      results.hidden = false;
      loading.hidden = false;
      loading.classList.remove("is-hiding");
      list.hidden = true;
      list.classList.remove("is-revealing");
      document.body.classList.add("is-results-loading");
      results.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        loading.classList.add("is-hiding");

        window.setTimeout(() => {
          loading.hidden = true;
          document.body.classList.remove("is-results-loading");
          list.hidden = false;
          requestAnimationFrame(() => list.classList.add("is-revealing"));
        }, 320);
      }, 1350);
    });
  }

  function initHotelDetails() {
    const card = document.querySelector(".search-result-card");
    const details = document.getElementById("search-result-hotel-details");
    const toggle = card?.querySelector(".search-result-card__actions button");
    let detailsTimer = null;

    if (!card || !details || !toggle) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", details.id);

    toggle.addEventListener("click", () => {
      const isOpen = !details.hidden;

      clearTimeout(detailsTimer);

      if (isOpen) {
        details.classList.add("is-closing");
        toggle.setAttribute("aria-expanded", "false");
        detailsTimer = window.setTimeout(() => {
          details.hidden = true;
          details.classList.remove("is-closing", "is-open");
        }, 260);
      } else {
        const roomsPanel = card.querySelector("[data-hotel-rooms]");
        const roomsToggle = card.querySelectorAll(".search-result-card__actions button")[3];
        if (roomsPanel && !roomsPanel.hidden) roomsToggle?.click();

        details.hidden = false;
        details.classList.remove("is-closing");
        toggle.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => details.classList.add("is-open"));
      }
    });
  }

  function initHotelRooms() {
    const card = document.querySelector(".search-result-card");
    const panel = card?.querySelector("[data-hotel-rooms]");
    const list = panel?.querySelector("[data-hotel-rooms-list]");
    const template = document.getElementById("search-hotel-room-template");
    const toggle = card?.querySelector("[data-hotel-rooms-toggle]");
    let roomsTimer = null;

    if (!card || !panel || !list || !template || !toggle) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", panel.id);

    toggle.addEventListener("click", () => {
      if (!list.children.length) return;

      const isOpen = !panel.hidden;
      clearTimeout(roomsTimer);

      if (isOpen) {
        panel.classList.add("is-closing");
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        roomsTimer = window.setTimeout(() => {
          panel.hidden = true;
          panel.classList.remove("is-closing", "is-open");
        }, 340);
        return;
      }

      const details = card.querySelector(".search-result-card__details");
      const detailsToggle = card.querySelector(".search-result-card__actions button");
      if (details && !details.hidden) detailsToggle?.click();

      panel.hidden = false;
      panel.classList.remove("is-closing");
      toggle.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => panel.classList.add("is-open"));
    });

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".search-hotel-room__select");
      const room = button?.closest("[data-hotel-room]");
      if (!button || !room) return;

      list.querySelectorAll("[data-hotel-room]").forEach((item) => {
        const selected = item === room;
        item.classList.toggle("is-selected", selected);
        item.querySelector(".search-hotel-room__select")?.setAttribute("aria-pressed", String(selected));
      });
    });

    const renderRooms = (rooms) => {
      const loadedRooms = Array.isArray(rooms)
        ? rooms.filter((room) => room && typeof room === "object")
        : [];
      const fragment = document.createDocumentFragment();

      loadedRooms.forEach((room, index) => {
        const row = template.content.firstElementChild.cloneNode(true);
        const media = row.querySelector(".search-hotel-room__media");
        const name = row.querySelector(".search-hotel-room__identity b");
        const details = row.querySelector(".search-hotel-room__identity span");
        const price = row.querySelector(".search-hotel-room__price b");
        const currency = row.querySelector(".search-hotel-room__price span");
        const select = row.querySelector(".search-hotel-room__select");

        row.classList.add("has-data");
        name.textContent = room.name || "";
        details.textContent = room.details || room.description || "";
        price.textContent = room.price ?? "";
        currency.textContent = room.currency || "";
        row.dataset.roomId = String(room.id ?? index);
        select.dataset.roomId = row.dataset.roomId;

        if (room.image) {
          const image = document.createElement("img");
          image.src = room.image;
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          media.replaceChildren(image);
        }

        fragment.appendChild(row);
      });

      list.replaceChildren(fragment);
      const hasRooms = loadedRooms.length > 0;

      if (!hasRooms) {
        clearTimeout(roomsTimer);
        panel.hidden = true;
        panel.classList.remove("is-open", "is-closing");
        toggle.setAttribute("aria-expanded", "false");
      }
    };

    window.delMarHotelRooms = {
      render: renderRooms,
      clear: () => renderRooms(),
    };
  }

  function initReviewsModal() {
    const card = document.querySelector(".search-result-card");
    const modal = document.querySelector("[data-reviews-modal]");
    const reviewButton = card?.querySelectorAll(".search-result-card__actions button")[1];

    if (!card || !modal || !reviewButton) return;

    reviewButton.setAttribute("aria-haspopup", "dialog");
    reviewButton.setAttribute("aria-expanded", "false");

    reviewButton.addEventListener("click", () => {
      modal.hidden = false;
      modal.classList.remove("is-closing");
      reviewButton.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-reviews-modal-open");
      modal.querySelector(".search-reviews-modal__close")?.focus();
    });

    modal.querySelectorAll("[data-reviews-close]").forEach((button) => {
      button.addEventListener("click", closeReviewsModal);
    });
  }

  function closeReviewsModal() {
    const modal = document.querySelector("[data-reviews-modal]");

    if (!modal || modal.hidden) return;

    const reviewButton = document.querySelectorAll(".search-result-card__actions button")[1];
    reviewButton?.setAttribute("aria-expanded", "false");

    modal.classList.add("is-closing");
    window.setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove("is-closing");
      document.body.classList.remove("is-reviews-modal-open");
    }, 240);
  }

  function initHotelModal() {
    const modal = document.querySelector("[data-hotel-modal]");
    const tabs = [...(modal?.querySelectorAll("[data-hotel-modal-tab]") || [])];
    const panels = [...(modal?.querySelectorAll("[data-hotel-modal-panel]") || [])];

    if (!modal) return;

    const activateTab = (name, moveFocus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.hotelModalTab === name;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && moveFocus) tab.focus();
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.hotelModalPanel !== name;
      });
    };

    const openHotelModal = (trigger) => {
      if (modal.open) return;

      hotelModalPageScroll = window.scrollY;
      hotelModalReturnFocus = trigger || document.activeElement;
      modal.classList.remove("is-closing");
      modal.showModal();
      modal.scrollTop = 0;
      activateTab("hotel");
      trigger?.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-hotel-modal-open");
      modal.querySelector(".search-hotel-modal__close")?.focus();
    };

    document.querySelectorAll("[data-hotel-modal-open]").forEach((trigger) => {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-hotel-modal-open]");
      if (trigger) openHotelModal(trigger);
    });

    modal.querySelectorAll("[data-hotel-modal-close]").forEach((button) => {
      button.addEventListener("click", closeHotelModal);
    });

    modal.addEventListener("click", (event) => {
      if (event.target !== modal) return;

      const bounds = modal.getBoundingClientRect();
      const outside = event.clientX < bounds.left
        || event.clientX > bounds.right
        || event.clientY < bounds.top
        || event.clientY > bounds.bottom;

      if (outside) closeHotelModal();
    });

    modal.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeHotelModal();
    });

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(tab.dataset.hotelModalTab);
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        activateTab(tabs[nextIndex].dataset.hotelModalTab, true);
      });
    });

    window.delMarHotelModal = {
      getPanel: (name) => panels.find((panel) => panel.dataset.hotelModalPanel === name) || null,
      showTab: (name) => {
        if (tabs.some((tab) => tab.dataset.hotelModalTab === name)) activateTab(name);
      },
      open: () => openHotelModal(document.activeElement),
      close: closeHotelModal,
    };
  }

  function closeHotelModal() {
    const modal = document.querySelector("[data-hotel-modal]");

    if (!modal || !modal.open || modal.classList.contains("is-closing")) return;

    hotelModalReturnFocus?.setAttribute?.("aria-expanded", "false");
    modal.classList.add("is-closing");

    window.setTimeout(() => {
      modal.close();
      modal.classList.remove("is-closing");
      document.body.classList.remove("is-hotel-modal-open");
      window.scrollTo({ top: hotelModalPageScroll, behavior: "auto" });
      hotelModalReturnFocus?.focus?.();
      hotelModalReturnFocus = null;
    }, 240);
  }

  function initHotelGallery() {
    const gallery = document.querySelector("[data-hotel-gallery]");
    const stage = gallery?.querySelector("[data-hotel-gallery-stage]");
    const thumbs = gallery?.querySelector("[data-hotel-gallery-thumbs]");
    const current = gallery?.querySelector("[data-hotel-gallery-current]");
    const total = gallery?.querySelector("[data-hotel-gallery-total]");
    const previous = gallery?.querySelector("[data-hotel-gallery-prev]");
    const next = gallery?.querySelector("[data-hotel-gallery-next]");
    const getTriggers = () => [...document.querySelectorAll("[data-hotel-gallery-open]")];
    let photos = [];
    let activeIndex = 0;
    let switchTimer = null;
    let closeTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let returnFocus = null;
    let pageScroll = 0;

    if (!gallery || !stage || !thumbs || !current || !total || !previous || !next) return;

    const normalizePhotos = (items) => Array.isArray(items)
      ? items.map((item) => {
        if (typeof item === "string") return { src: item, thumb: item };
        if (!item || typeof item !== "object") return null;
        const src = item.src || item.url || item.large || "";
        if (!src) return null;
        return { src, thumb: item.thumbnail || item.thumb || src };
      }).filter(Boolean)
      : [];

    const applyFrame = () => {
      const photo = photos[activeIndex];
      if (!photo) return;

      let image = stage.querySelector("img");
      if (!image) {
        image = document.createElement("img");
        image.alt = "";
        image.decoding = "async";
        stage.appendChild(image);
      }

      image.src = photo.src;
      current.textContent = String(activeIndex + 1);
      total.textContent = String(photos.length);
      previous.disabled = photos.length < 2;
      next.disabled = photos.length < 2;

      thumbs.querySelectorAll("button").forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-current", active ? "true" : "false");
        if (active && gallery.open) button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    };

    const showPhoto = (index, animate = true) => {
      if (!photos.length) return;

      activeIndex = (index + photos.length) % photos.length;
      clearTimeout(switchTimer);

      if (!animate) {
        applyFrame();
        return;
      }

      stage.classList.add("is-switching");
      switchTimer = window.setTimeout(() => {
        applyFrame();
        requestAnimationFrame(() => stage.classList.remove("is-switching"));
      }, 130);
    };

    const openGallery = (trigger) => {
      if (gallery.open) return;

      pageScroll = window.scrollY;
      returnFocus = trigger || document.activeElement;
      activeIndex = 0;
      gallery.classList.remove("is-closing");
      gallery.classList.toggle("is-empty", !photos.length);
      if (photos.length) showPhoto(activeIndex, false);
      else {
        current.textContent = "0";
        total.textContent = "0";
        previous.disabled = true;
        next.disabled = true;
      }
      gallery.showModal();
      document.body.classList.add("is-hotel-gallery-open");
      getTriggers().forEach((item) => item.setAttribute("aria-expanded", String(item === trigger)));
      gallery.querySelector("[data-hotel-gallery-close]")?.focus();
    };

    const closeGallery = () => {
      if (!gallery.open || gallery.classList.contains("is-closing")) return;

      clearTimeout(closeTimer);
      clearTimeout(switchTimer);
      gallery.classList.add("is-closing");
      closeTimer = window.setTimeout(() => {
        gallery.close();
        gallery.classList.remove("is-closing");
        document.body.classList.remove("is-hotel-gallery-open");
        getTriggers().forEach((item) => item.setAttribute("aria-expanded", "false"));
        window.scrollTo({ top: pageScroll, behavior: "auto" });
        returnFocus?.focus?.();
      }, 240);
    };

    const setPhotos = (items) => {
      photos = normalizePhotos(items);
      activeIndex = 0;
      const fragment = document.createDocumentFragment();

      photos.forEach((photo, index) => {
        const button = document.createElement("button");
        const image = document.createElement("img");
        button.type = "button";
        button.dataset.galleryIndex = String(index);
        button.setAttribute("aria-label", String(index + 1));
        button.setAttribute("aria-current", "false");
        image.src = photo.thumb;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        button.appendChild(image);
        fragment.appendChild(button);
      });

      thumbs.replaceChildren(fragment);
      stage.replaceChildren();
      current.textContent = "";
      total.textContent = "";
      gallery.classList.toggle("is-empty", !photos.length);
      previous.disabled = photos.length < 2;
      next.disabled = photos.length < 2;

      if (!photos.length) {
        current.textContent = "0";
        total.textContent = "0";
      } else if (gallery.open) {
        showPhoto(0, false);
      }
    };

    getTriggers().forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-hotel-gallery-open]");
      if (trigger) openGallery(trigger);
    });

    document.addEventListener("keydown", (event) => {
      const trigger = event.target.closest?.("[data-hotel-gallery-open]");
      if (!trigger || trigger.matches("button, a, input, select, textarea")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openGallery(trigger);
    });

    gallery.querySelector("[data-hotel-gallery-close]")?.addEventListener("click", closeGallery);
    previous.addEventListener("click", () => showPhoto(activeIndex - 1));
    next.addEventListener("click", () => showPhoto(activeIndex + 1));
    thumbs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gallery-index]");
      if (button) showPhoto(Number(button.dataset.galleryIndex));
    });

    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto(activeIndex + 1);
      }
    });

    gallery.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeGallery();
    });

    stage.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    stage.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      showPhoto(activeIndex + (deltaX < 0 ? 1 : -1));
    }, { passive: true });

    window.delMarHotelGallery = {
      setPhotos,
      clear: () => setPhotos(),
      open: () => openGallery(document.activeElement),
      close: closeGallery,
    };

    previous.disabled = true;
    next.disabled = true;
    current.textContent = "0";
    total.textContent = "0";
  }

  function renderCalendar() {
    const titles = panels.dates.querySelector(".tour-search-calendar__titles");
    const grid = panels.dates.querySelector("[data-calendar-grid]");
    const months = [calendarMonth, new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)];

    titles.innerHTML = months.map((month) => (
      `<div>${formatMonth(month)}<span>${month.getFullYear()}</span></div>`
    )).join("");

    grid.innerHTML = "";
    months.forEach((month) => grid.appendChild(createMonth(month)));

    const prevButton = panels.dates.querySelector("[data-calendar-prev]");
    prevButton.disabled = calendarMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
  }

  function createMonth(month) {
    const wrap = document.createElement("div");
    wrap.className = "tour-search-month";

    const weekdays = document.createElement("div");
    weekdays.className = "tour-search-weekdays";
    ["пн", "вт", "ср", "чт", "пт", "сб", "вс"].forEach((day) => {
      const item = document.createElement("span");
      item.textContent = day;
      weekdays.appendChild(item);
    });

    const days = document.createElement("div");
    days.className = "tour-search-days";

    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    for (let index = 0; index < offset; index += 1) {
      days.appendChild(document.createElement("span"));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tour-search-date-btn";
      button.textContent = String(day);
      button.dataset.date = toIsoDate(date);
      button.disabled = date < today;
      button.setAttribute("aria-label", formatDateLong(date));

      if (isSelectedDate(date)) button.classList.add("is-selected");
      if (isRangeEdge(date)) button.classList.add("is-range-edge");
      if (isInRange(date)) button.classList.add("is-in-range");

      button.addEventListener("click", () => selectDate(date));
      days.appendChild(button);
    }

    wrap.append(weekdays, days);
    return wrap;
  }

  function selectDate(date) {
    if (!draftDates.from || (draftDates.from && draftDates.to)) {
      draftDates = { from: date, to: null };
    } else {
      const first = draftDates.from <= date ? draftDates.from : date;
      const second = draftDates.from <= date ? date : draftDates.from;
      const maxDate = addDays(first, maxDepartureRangeDays - 1);

      draftDates = {
        from: first,
        to: second > maxDate ? maxDate : second,
      };
    }

    renderCalendar();
  }

  function renderNights() {
    const grid = panels.nights.querySelector("[data-nights-grid]");
    grid.innerHTML = "";

    for (let night = 1; night <= 28; night += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tour-search-age-btn";
      button.textContent = String(night);
      button.setAttribute("aria-pressed", String(night === draftNights.min || night === draftNights.max));

      if (night === draftNights.min || night === draftNights.max) {
        button.classList.add("is-selected");
      }

      button.addEventListener("click", () => {
        if (!draftNights.min || (draftNights.min && draftNights.max)) {
          draftNights = { min: night, max: null };
        } else {
          draftNights = {
            min: Math.min(draftNights.min, night),
            max: Math.max(draftNights.min, night),
          };
        }

        renderNights();
      });

      grid.appendChild(button);
    }
  }

  function renderTourists() {
    panels.tourists.querySelector("[data-tourists-adults]").textContent = formatAdults(draftTourists.adults);
    panels.tourists.querySelector("[data-tourists-children]").textContent = formatChildren(draftTourists.childrenAges.length);
    panels.tourists.querySelector('[data-counter="adults"][data-step="-1"]').disabled = draftTourists.adults <= 1;
    panels.tourists.querySelector('[data-counter="children"][data-step="-1"]').disabled = draftTourists.childrenAges.length <= 0;

    const holder = panels.tourists.querySelector("[data-children-ages]");
    holder.innerHTML = "";

    if (!draftTourists.childrenAges.length) {
      activeChildAgeIndex = null;
      return;
    }

    const list = document.createElement("div");
    list.className = "tour-search-child-list";

    draftTourists.childrenAges.forEach((age, index) => {
      const row = document.createElement("div");
      row.className = "tour-search-child-row";
      if (activeChildAgeIndex === index) row.classList.add("is-active");

      const label = document.createElement("span");
      label.textContent = `Ребёнок ${index + 1}`;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "tour-search-child-age-trigger";
      button.textContent = age ? formatChildAge(age) : "Не выбран";
      button.setAttribute("aria-expanded", String(activeChildAgeIndex === index));
      button.setAttribute("aria-controls", "tour-search-child-age-picker");

      button.addEventListener("click", () => {
        activeChildAgeIndex = activeChildAgeIndex === index ? null : index;
        renderTourists();
        fitPanel("tourists");
      });

      row.append(label, button);
      list.appendChild(row);
    });

    holder.appendChild(list);

    if (activeChildAgeIndex === null) return;

    const picker = document.createElement("div");
    picker.className = "tour-search-child-age-picker";
    picker.id = "tour-search-child-age-picker";

    const grid = document.createElement("div");
    grid.className = "tour-search-age-grid";

    for (let ageIndex = 0; ageIndex <= 14; ageIndex += 1) {
      const ageValue = ageIndex === 0 ? "under-2" : ageIndex + 1;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tour-search-age-btn";
      button.textContent = ageValue === "under-2" ? "до 2 лет" : formatChildAge(ageValue);
      button.setAttribute("aria-pressed", String(draftTourists.childrenAges[activeChildAgeIndex] === ageValue));
      if (draftTourists.childrenAges[activeChildAgeIndex] === ageValue) button.classList.add("is-selected");

      button.addEventListener("click", () => {
        draftTourists.childrenAges[activeChildAgeIndex] = ageValue;
        activeChildAgeIndex = null;
        renderTourists();
        fitPanel("tourists");
      });

      grid.appendChild(button);
    }

    picker.appendChild(grid);
    holder.appendChild(picker);
  }

  function syncDatesTrigger() {
    const { from, to } = state.departureDates;
    triggers.dates.textContent = from ? `${formatDateShort(parseIsoDate(from))} - ${formatDateShort(parseIsoDate(to || from))}` : labels.dates;
  }

  function syncNightsTrigger() {
    const { min, max } = state.nights;
    triggers.nights.textContent = min ? `${min} - ${max || min}` : labels.nights;
  }

  function syncTouristsTrigger() {
    const childrenCount = state.tourists.childrenAges.length;
    triggers.tourists.textContent = childrenCount
      ? `${formatAdults(state.tourists.adults)}, ${formatChildren(childrenCount)}`
      : formatAdults(state.tourists.adults);
  }

  function isSelectedDate(date) {
    return sameDay(date, draftDates.from) && !draftDates.to;
  }

  function isRangeEdge(date) {
    return sameDay(date, draftDates.from) || sameDay(date, draftDates.to);
  }

  function isInRange(date) {
    return draftDates.from && draftDates.to && date > draftDates.from && date < draftDates.to;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function sameDay(a, b) {
    return a && b && toIsoDate(a) === toIsoDate(b);
  }

  function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseIsoDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatMonth(date) {
    return new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date);
  }

  function formatDateShort(date) {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date).replace(".", "");
  }

  function formatDateLong(date) {
    return new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(date);
  }

  function formatAdults(count) {
    if (count === 1) return "1 взрослый";
    if (count >= 2 && count <= 4) return `${count} взрослых`;
    return `${count} взрослых`;
  }

  function formatChildren(count) {
    if (count === 0) return "Дети";
    if (count === 1) return "1 ребёнок";
    if (count >= 2 && count <= 4) return `${count} ребёнка`;
    return `${count} детей`;
  }

  function formatChildAge(age) {
    if (age >= 2 && age <= 4) return `${age} года`;
    return `${age} лет`;
  }
})();
