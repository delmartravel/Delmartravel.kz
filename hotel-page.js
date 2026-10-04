(function () {
  const hotelData = window.DELMAR_HOTEL_DATA;
  const params = new URLSearchParams(window.location.search);
  const rawSlug = params.get("hotel") || "";
  const slug = hotelData?.normalizeSlug ? hotelData.normalizeSlug(rawSlug) : String(rawSlug).trim().toLowerCase();
  const page = document.getElementById("hotelPage");
  const error = document.getElementById("hotelPageError");

  function getStoredContext() {
    try {
      const raw = sessionStorage.getItem("delmarSelectedHotel");
      if (!raw) return {};
      const context = JSON.parse(raw);
      const contextSlug = hotelData?.normalizeSlug ? hotelData.normalizeSlug(context?.slug) : context?.slug;
      return contextSlug === slug ? context : {};
    } catch (err) {
      return {};
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
  }

  function formatUserText(value) {
    return String(value ?? "")
      .replaceAll("North MalГ© Atoll", "РЎРµРІРµСЂРЅС‹Р№ РњР°Р»Рµ РђС‚РѕР»Р»")
      .replaceAll("South Ari Atoll", "РђС‚РѕР»Р» Р®Р¶РЅС‹Р№ РђСЂРё")
      .replaceAll("Baa Atoll", "РђС‚РѕР»Р» Р‘Р°Р°")
      .replace(/\bultra all inclusive\b/gi, "Ultra All Inclusive (СѓР»СЊС‚СЂР° РІСЃС‘ РІРєР»СЋС‡РµРЅРѕ)")
      .replace(/\ball inclusive\b/gi, "All Inclusive (РІСЃС‘ РІРєР»СЋС‡РµРЅРѕ)")
      .replace(/\bresort\b/gi, "РєСѓСЂРѕСЂС‚")
      .replace(/\bluxury\b/gi, "РїСЂРµРјРёР°Р»СЊРЅС‹Р№ С„РѕСЂРјР°С‚")
      .replace(/\bhoneymoon\b/gi, "СЂРѕРјР°РЅС‚РёС‡РµСЃРєР°СЏ РїРѕРµР·РґРєР°")
      .replace(/\bfamily\b/gi, "СЃРµРјРµР№РЅС‹Р№ РѕС‚РґС‹С…")
      .replace(/\bkids\b/gi, "РґРµС‚СЃРєРёР№ РѕС‚РґС‹С…");
  }

  function renderList(id, items) {
    const element = document.getElementById(id);
    if (!element) return;
    const safeItems = hotelData.ensureList(items);
    element.innerHTML = safeItems.map(item => `<li>${escapeHTML(item)}</li>`).join("");
  }

  function uniqueList(items) {
    const seen = new Set();
    return hotelData.ensureList(items).filter(item => {
      const key = String(item).trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildRecommendationText(hotel) {
    return hotel.delMarRecommendation || hotel.expertSummary || hotel.shortDescription || "";
  }

  function getHotelImages(hotel) {
    return hotelData.ensureList(hotel.galleryImages, [hotel.heroImage])
      .filter(Boolean);
  }

  function setImageFallback(img, hotel) {
    img.addEventListener("error", () => {
      const fallback = hotel.fallbackImages?.[0] || "./assets/images/premium.jpg";
      if (!img.src.endsWith(fallback.replace("./", ""))) img.src = fallback;
    }, { once: true });
  }

  function createTextBlock(title, value) {
    const items = hotelData.ensureList(value);
    if (!items.length) return "";
    return `
      <section class="hotel-info-text-block">
        <h3>${escapeHTML(title)}</h3>
        ${items.map(item => `<p>${escapeHTML(formatUserText(item))}</p>`).join("")}
      </section>
    `;
  }



  function withBullet(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    return text.startsWith("вЂў") ? text : `вЂў ${text}`;
  }

  function cleanList(value) {
    return uniqueList(hotelData.ensureList(value).map(item => String(item ?? "").trim()).filter(Boolean));
  }

  function getDetailedFacts(key) {
    return null;
  }

  function buildGeneralInfoItems(hotel) {
    const detailed = getDetailedFacts("general");
    if (detailed) return cleanList(detailed);

    const bestFor = cleanList(hotel.bestFor);
    const nuances = cleanList(hotel.nuances);
    const highlights = cleanList(hotel.highlights);

    return cleanList([
      hotel.shortDescription ? `РћРїРёСЃР°РЅРёРµ: ${hotel.shortDescription}` : "",
      hotel.expertSummary ? `Р¤РѕСЂРјР°С‚ РѕС‚РµР»СЏ: ${hotel.expertSummary}` : "",
      hotel.country || hotel.region ? `Р Р°СЃРїРѕР»РѕР¶РµРЅРёРµ: ${[hotel.country, hotel.region].filter(Boolean).map(formatUserText).join(", ")}.` : "",
      hotel.transfer ? `РўСЂР°РЅСЃС„РµСЂ: ${formatUserText(hotel.transfer)}.` : "",
      hotel.beach ? `РџР»СЏР¶: ${formatUserText(hotel.beach)}.` : "",
      highlights.length ? `РўРµСЂСЂРёС‚РѕСЂРёСЏ Рё РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР°: ${highlights.map(formatUserText).join(" вЂў ")}.` : "",
      bestFor.length ? `РћСЃРЅРѕРІРЅС‹Рµ СЃС†РµРЅР°СЂРёРё РѕС‚РґС‹С…Р°: ${bestFor.map(formatUserText).join(" вЂў ")}.` : "",
      nuances[0] ? `РћСЃРѕР±РµРЅРЅРѕСЃС‚СЊ РІС‹Р±РѕСЂР°: ${formatUserText(nuances[0])}.` : "",
      hotel.delMarRecommendation ? `РљРѕРјРјРµРЅС‚Р°СЂРёР№ Del Mar Travel: ${hotel.delMarRecommendation}` : ""
    ]).slice(0, 9);
  }

  function buildBeachSectionItems(hotel) {
    const detailed = getDetailedFacts("beach");
    if (detailed) return cleanList(detailed).map(withBullet);

    return cleanList([
      hotel.beach ? withBullet(formatUserText(hotel.beach)) : "",
      withBullet("РўРёРї РїР»СЏР¶Р°, РґР»РёРЅР°, С€РёСЂРёРЅР°, РїРёСЂСЃ, РїРѕРЅС‚РѕРЅ, РїР°РІРёР»СЊРѕРЅС‹ Рё РІС…РѕРґ РІ РјРѕСЂРµ РЅРµ РґРµС‚Р°Р»РёР·РёСЂРѕРІР°РЅС‹ РІ С‚РµРєСѓС‰РµР№ РєР°СЂС‚РѕС‡РєРµ РѕС‚РµР»СЏ."),
      withBullet("РЁРµР·Р»РѕРЅРіРё, Р·РѕРЅС‚С‹ Рё РїРѕР»РѕС‚РµРЅС†Р° РѕС‚РјРµС‡Р°СЋС‚СЃСЏ РєР°Рє РІРєР»СЋС‡С‘РЅРЅС‹Рµ С‚РѕР»СЊРєРѕ РїСЂРё РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹С… РґР°РЅРЅС‹С… РїРѕ С‚Р°СЂРёС„Сѓ."),
      withBullet("Р”Р»СЏ С‚РѕС‡РЅРѕР№ РєР°СЂС‚РѕС‡РєРё РѕС‚РµР»СЏ РЅСѓР¶РµРЅ СЃР»РµРґСѓСЋС‰РёР№ СЌС‚Р°Рї СЃРІРµСЂРєРё РїР»СЏР¶РЅС‹С… С…Р°СЂР°РєС‚РµСЂРёСЃС‚РёРє РїРѕ РѕС„РёС†РёР°Р»СЊРЅРѕРјСѓ РѕРїРёСЃР°РЅРёСЋ.")
    ]);
  }

  function buildTerritorySectionItems(hotel) {
    const detailed = getDetailedFacts("territory");
    if (detailed) return cleanList(detailed).map(withBullet);

    const highlights = cleanList(hotel.highlights).map(item => withBullet(formatUserText(item)));
    return cleanList([
      ...highlights,
      withBullet("Р‘Р°СЃСЃРµР№РЅС‹, Р°РєРІР°РїР°СЂРє, СЂРµСЃС‚РѕСЂР°РЅС‹, Р±Р°СЂС‹, РјР°РіР°Р·РёРЅС‹, РєРѕРЅС„РµСЂРµРЅС†-Р·Р°Р»С‹ Рё СЃРїРѕСЂС‚РёРІРЅС‹Рµ РїР»РѕС‰Р°РґРєРё РЅРµ РїРµСЂРµС‡РёСЃР»СЏСЋС‚СЃСЏ Р±РµР· РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹С… РґР°РЅРЅС‹С…."),
      withBullet("Р”Р»СЏ С‚РѕС‡РЅРѕР№ РєР°СЂС‚РѕС‡РєРё С‚СЂРµР±СѓРµС‚СЃСЏ СЃРІРµСЂРєР° РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂС‹ РїРѕ РѕС„РёС†РёР°Р»СЊРЅРѕРјСѓ РѕРїРёСЃР°РЅРёСЋ РѕС‚РµР»СЏ.")
    ]);
  }

  function buildLocationItems(hotel) {
    const country = formatUserText(hotel.country);
    const region = formatUserText(hotel.region);

    return cleanList([
      hotel.country ? withBullet(`РЎС‚СЂР°РЅР°: ${hotel.country}.`) : "",
      hotel.region ? withBullet(`Р РµРіРёРѕРЅ: ${hotel.region}.`) : "",
      hotel.transfer ? withBullet(hotel.transfer) : "",
      country === "РњР°Р»СЊРґРёРІС‹" ? withBullet("Р”Р»СЏ РњР°Р»СЊРґРёРІ РІР°Р¶РЅРѕ Р·Р°СЂР°РЅРµРµ РїРѕРґС‚РІРµСЂРґРёС‚СЊ С‚РёРї С‚СЂР°РЅСЃС„РµСЂР°: РіРёРґСЂРѕСЃР°РјРѕР»С‘С‚, РІРЅСѓС‚СЂРµРЅРЅРёР№ РїРµСЂРµР»С‘С‚ РёР»Рё СЃРєРѕСЂРѕСЃС‚РЅРѕР№ РєР°С‚РµСЂ.") : "",
      country === "РўСѓСЂС†РёСЏ" ? withBullet(`РљСѓСЂРѕСЂС‚ ${region || "РїРѕР±РµСЂРµР¶СЊСЏ"} СѓРґРѕР±РµРЅ РґР»СЏ РїР»СЏР¶РЅРѕРіРѕ РѕС‚РґС‹С…Р°, СЃРµРјРµР№РЅС‹С… РїРѕРµР·РґРѕРє Рё РѕС‚РґС‹С…Р° РІ С„РѕСЂРјР°С‚Рµ РѕС‚РµР»СЏ СЃ СЂР°Р·РІРёС‚РѕР№ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂРѕР№.`) : "",
      country === "РўР°РёР»Р°РЅРґ" ? withBullet("РџСЂРё РІС‹Р±РѕСЂРµ СЂР°Р№РѕРЅР° РІР°Р¶РЅРѕ СѓС‡РёС‚С‹РІР°С‚СЊ СЃРµР·РѕРЅРЅРѕСЃС‚СЊ РјРѕСЂСЏ, С‚СЂР°С„РёРє Рё СѓРґР°Р»С‘РЅРЅРѕСЃС‚СЊ РѕС‚ Р°РєС‚РёРІРЅС‹С… Р·РѕРЅ РѕСЃС‚СЂРѕРІР°.") : "",
      country === "Р’СЊРµС‚РЅР°Рј" ? withBullet("Р”Р»СЏ Р’СЊРµС‚РЅР°РјР° РІР°Р¶РЅРѕ СѓС‡РёС‚С‹РІР°С‚СЊ СЃРµР·РѕРЅРЅРѕСЃС‚СЊ РїРѕР±РµСЂРµР¶СЊСЏ Рё Р·Р°СЂР°РЅРµРµ СЃРІРµСЂСЏС‚СЊ СѓРґРѕР±СЃС‚РІРѕ РїРµСЂРµР»С‘С‚Р° РїРѕРґ РґР°С‚С‹ РїРѕРµР·РґРєРё.") : "",
      country === "РћРђР­" ? withBullet("Р’ РћРђР­ СЂР°СЃРїРѕР»РѕР¶РµРЅРёРµ РІР»РёСЏРµС‚ РЅР° СЃС†РµРЅР°СЂРёР№ РѕС‚РґС‹С…Р°: РїР»СЏР¶, РіРѕСЂРѕРґСЃРєР°СЏ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР°, С‚РѕСЂРіРѕРІС‹Рµ С†РµРЅС‚СЂС‹ Рё РІСЂРµРјСЏ РІ РґРѕСЂРѕРіРµ РјРѕРіСѓС‚ Р·Р°РјРµС‚РЅРѕ РѕС‚Р»РёС‡Р°С‚СЊСЃСЏ.") : "",
      country === "РљР°С‚Р°СЂ" ? withBullet("Р’ РљР°С‚Р°СЂРµ СЃС‚РѕРёС‚ СѓС‡РёС‚С‹РІР°С‚СЊ СЃРµР·РѕРЅ, С‚РµРјРїРµСЂР°С‚СѓСЂСѓ РІРѕР·РґСѓС…Р° Рё СЃРѕС‡РµС‚Р°РЅРёРµ РїР»СЏР¶РЅРѕРіРѕ РѕС‚РґС‹С…Р° СЃ РіРѕСЂРѕРґСЃРєРѕР№ РїСЂРѕРіСЂР°РјРјРѕР№ РІ Р”РѕС…Рµ.") : ""
    ]);
  }

  function buildMealItems(hotel) {
    const detailed = getDetailedFacts("meal");
    if (detailed) return cleanList(detailed).map(withBullet);

    return cleanList([
      hotel.mealConcept ? withBullet(`РўРёРї РїРёС‚Р°РЅРёСЏ: ${formatUserText(hotel.mealConcept)}.`) : "",
      withBullet("Р РµСЃС‚РѕСЂР°РЅС‹ Рё Р±Р°СЂС‹: РІ С‚РµРєСѓС‰РёС… РґР°РЅРЅС‹С… РїСЂРѕРµРєС‚Р° СѓРєР°Р·Р°РЅ РѕР±С‰РёР№ С„РѕСЂРјР°С‚ РїРёС‚Р°РЅРёСЏ; РЅР°Р·РІР°РЅРёСЏ СЂРµСЃС‚РѕСЂР°РЅРѕРІ РЅРµ РґРѕР±Р°РІР»СЏСЋС‚СЃСЏ Р±РµР· РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅРѕРіРѕ РёСЃС‚РѕС‡РЅРёРєР°."),
      withBullet("Р РµСЃС‚РѕСЂР°РЅС‹ РїРѕ РјРµРЅСЋ: РѕС‚РѕР±СЂР°Р¶Р°СЋС‚СЃСЏ С‚РѕР»СЊРєРѕ РїСЂРё РЅР°Р»РёС‡РёРё РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹С… РЅР°Р·РІР°РЅРёР№ РІ РєР°СЂС‚РѕС‡РєРµ РѕС‚РµР»СЏ."),
      withBullet("Р”РµС‚СЃРєРѕРµ, РґРёРµС‚РёС‡РµСЃРєРѕРµ Рё РІРµРіРµС‚Р°СЂРёР°РЅСЃРєРѕРµ РїРёС‚Р°РЅРёРµ: РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ РїРѕ Р°РєС‚СѓР°Р»СЊРЅРѕРјСѓ РѕРїРёСЃР°РЅРёСЋ С‚Р°СЂРёС„Р°, РµСЃР»Рё СЌС‚Рё РѕРїС†РёРё РєСЂРёС‚РёС‡РЅС‹ РґР»СЏ РїРѕРµР·РґРєРё."),
      withBullet("РќР°РїРёС‚РєРё Рё РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РіР°СЃС‚СЂРѕРЅРѕРјРёС‡РµСЃРєРёРµ СѓСЃР»СѓРіРё Р·Р°РІРёСЃСЏС‚ РѕС‚ РІС‹Р±СЂР°РЅРЅРѕР№ РєРѕРЅС†РµРїС†РёРё Рё С‚Р°СЂРёС„Р°.")
    ]);
  }

  function buildChildrenItems(hotel) {
    const detailed = getDetailedFacts("kids");
    if (detailed) return cleanList(detailed).map(withBullet);

    const bestFor = cleanList(hotel.bestFor);
    const joined = bestFor.join(" ").toLowerCase();
    const hasFamilySignal = /СЃРµРј|РґРµС‚|family|kids|СЂРµР±/.test(joined);

    if (hasFamilySignal) {
      return cleanList([
        withBullet("РћС‚РµР»СЊ РјРѕР¶РЅРѕ СЂР°СЃСЃРјР°С‚СЂРёРІР°С‚СЊ РґР»СЏ СЃРµРјРµР№РЅРѕРіРѕ РѕС‚РґС‹С…Р°."),
        bestFor.length ? withBullet(`РџРѕРґС…РѕРґСЏС‰РёРµ СЃС†РµРЅР°СЂРёРё: ${bestFor.map(formatUserText).join(" вЂў ")}.`) : "",
        withBullet("РЈСЃР»РѕРІРёСЏ СЂР°Р·РјРµС‰РµРЅРёСЏ РґРµС‚РµР№, РІРѕР·СЂР°СЃС‚РЅС‹Рµ РіСЂСѓРїРїС‹ РєР»СѓР±Р° Рё СЂР°СЃРїРёСЃР°РЅРёРµ РїСЂРѕРіСЂР°РјРј Р»СѓС‡С€Рµ РїРѕРґС‚РІРµСЂР¶РґР°С‚СЊ РїРѕРґ РґР°С‚С‹ РїРѕРµР·РґРєРё."),
        withBullet("РџСЂРё РїРѕРґР±РѕСЂРµ РЅРѕРјРµСЂР° РІР°Р¶РЅРѕ СѓС‡РёС‚С‹РІР°С‚СЊ СЃРѕСЃС‚Р°РІ СЃРµРјСЊРё, РІРѕР·СЂР°СЃС‚ РґРµС‚РµР№ Рё СѓРґРѕР±СЃС‚РІРѕ СЃРїР°Р»СЊРЅС‹С… РјРµСЃС‚."),
        withBullet("Р•СЃР»Рё РґР»СЏ РїРѕРµР·РґРєРё РєСЂРёС‚РёС‡РЅС‹ РґРµС‚СЃРєРёР№ РєР»СѓР±, Р±Р°СЃСЃРµР№РЅ, РїРёС‚Р°РЅРёРµ РёР»Рё СЃРїРѕРєРѕР№РЅРѕРµ СЂР°СЃРїРѕР»РѕР¶РµРЅРёРµ РЅРѕРјРµСЂР°, СЌС‚Рё РїР°СЂР°РјРµС‚СЂС‹ СЃС‚РѕРёС‚ СѓС‚РѕС‡РЅРёС‚СЊ Р·Р°СЂР°РЅРµРµ.")
      ]);
    }

    return cleanList([
      withBullet("РћСЃРЅРѕРІРЅРѕР№ СЃС†РµРЅР°СЂРёР№ РѕС‚РµР»СЏ: " + (bestFor.length ? bestFor.join(" вЂў ") : "СЃРїРѕРєРѕР№РЅС‹Р№ РєСѓСЂРѕСЂС‚РЅС‹Р№ РѕС‚РґС‹С…") + "."),
      withBullet("Р•СЃР»Рё РїРѕРµР·РґРєР° РїР»Р°РЅРёСЂСѓРµС‚СЃСЏ СЃ РґРµС‚СЊРјРё, РґРµС‚СЃРєСѓСЋ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂСѓ Рё РїСЂР°РІРёР»Р° СЂР°Р·РјРµС‰РµРЅРёСЏ РЅСѓР¶РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ РѕС‚РґРµР»СЊРЅРѕ РїРѕРґ РґР°С‚С‹."),
      withBullet("Р”Р»СЏ СЃРїРѕРєРѕР№РЅРѕРіРѕ РѕС‚РґС‹С…Р° СЃ СЂРµР±С‘РЅРєРѕРј РѕСЃРѕР±РµРЅРЅРѕ РІР°Р¶РЅРѕ Р·Р°СЂР°РЅРµРµ СѓС‚РѕС‡РЅРёС‚СЊ СЂР°СЃРїРѕР»РѕР¶РµРЅРёРµ РЅРѕРјРµСЂР°, РїРёС‚Р°РЅРёРµ Рё СЃРµР·РѕРЅРЅСѓСЋ Р°РєС‚РёРІРЅРѕСЃС‚СЊ РѕС‚РµР»СЏ.")
    ]);
  }

  function buildRoomItems(hotel) {
    const detailed = getDetailedFacts("rooms");
    if (detailed) return cleanList(detailed).map(withBullet);

    const roomItems = cleanList([
      ...hotelData.ensureList(hotel.important),
      ...hotelData.ensureList(hotel.nuances)
    ]).filter(item => /РЅРѕРјРµСЂ|РєР°С‚РµРіРѕСЂ|СЂР°Р·РјРµС‰|РІРёР»Р»|room|suite|РІРёРґ|РєРѕСЂРїСѓСЃ/i.test(item));

    if (roomItems.length) {
      return cleanList([
        ...roomItems.slice(0, 4).map(withBullet),
        withBullet("РљР°С‚РµРіРѕСЂРёРё РЅРѕРјРµСЂРѕРІ: С‚РѕС‡РЅС‹Рµ РЅР°Р·РІР°РЅРёСЏ, РїР»РѕС‰Р°РґСЊ, РІРјРµСЃС‚РёРјРѕСЃС‚СЊ, РІРёРґ Рё РЅР°Р»РёС‡РёРµ Р±Р°Р»РєРѕРЅР° РІС‹РІРѕРґСЏС‚СЃСЏ С‚РѕР»СЊРєРѕ РїСЂРё РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹С… РґР°РЅРЅС‹С…."),
        withBullet("РџСЂРё СЃСЂР°РІРЅРµРЅРёРё РєР°С‚РµРіРѕСЂРёР№ СѓС‡РёС‚С‹РІР°СЋС‚СЃСЏ РїР»РѕС‰Р°РґСЊ, РІРёРґ, СЂР°СЃРїРѕР»РѕР¶РµРЅРёРµ РєРѕСЂРїСѓСЃР° Рё СѓРґРѕР±СЃС‚РІРѕ СЃРїР°Р»СЊРЅС‹С… РјРµСЃС‚.")
      ]).slice(0, 5);
    }

    return cleanList([
      withBullet("РџРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹Рµ РєР°С‚РµРіРѕСЂРёРё РЅРѕРјРµСЂРѕРІ РІ С‚РµРєСѓС‰РµР№ РєР°СЂС‚РѕС‡РєРµ РЅРµ РґРµС‚Р°Р»РёР·РёСЂРѕРІР°РЅС‹."),
      withBullet("РџСЂРё РІС‹Р±РѕСЂРµ РєР°С‚РµРіРѕСЂРёРё СѓС‡РёС‚С‹РІР°СЋС‚СЃСЏ РїР»РѕС‰Р°РґСЊ, РІРёРґ, СЂР°СЃРїРѕР»РѕР¶РµРЅРёРµ, Р±Р°Р»РєРѕРЅ РёР»Рё С‚РµСЂСЂР°СЃР° Рё СѓРґРѕР±СЃС‚РІРѕ СЂР°Р·РјРµС‰РµРЅРёСЏ."),
      withBullet("Р”Р»СЏ СЃРµРјРµР№РЅС‹С… РїРѕРµР·РґРѕРє РѕС‚РґРµР»СЊРЅРѕ СЃРѕРїРѕСЃС‚Р°РІР»СЏСЋС‚СЃСЏ РІРјРµСЃС‚РёРјРѕСЃС‚СЊ РЅРѕРјРµСЂР° Рё РєРѕР»РёС‡РµСЃС‚РІРѕ СЃРїР°Р»СЊРЅС‹С… РјРµСЃС‚.")
    ]);
  }

  function buildSportItems(hotel) {
    const detailed = getDetailedFacts("sport");
    if (detailed) return cleanList(detailed).map(withBullet);

    const source = cleanList([
      ...hotelData.ensureList(hotel.highlights),
      ...hotelData.ensureList(hotel.bestFor)
    ]).filter(item => /СЃРїРѕСЂС‚|РіРѕР»СЊС„|Р°РєС‚РёРІ|СЂР°Р·РІР»РµС‡|Р°РєРІР°|С‚РµРЅРЅРёСЃ|С„РёС‚РЅРµСЃ|РїР°СЂРє|РґР°Р№РІ|РІРѕРґ|spa|СЃРїР°|wellness|Р№РѕРіР°/i.test(item));

    if (source.length) {
      return cleanList([
        ...source.slice(0, 4).map(withBullet),
        withBullet("Р”РЅРµРІРЅР°СЏ Рё РІРµС‡РµСЂРЅСЏСЏ РїСЂРѕРіСЂР°РјРјР° СѓС‡РёС‚С‹РІР°РµС‚СЃСЏ РїСЂРё РїРѕРґР±РѕСЂРµ С‚РѕР»СЊРєРѕ РїРѕ Р°РєС‚СѓР°Р»СЊРЅРѕРјСѓ РѕРїРёСЃР°РЅРёСЋ РѕС‚РµР»СЏ."),
        withBullet("Р’РѕРґРЅС‹Рµ РІРёРґС‹ СЃРїРѕСЂС‚Р°, РєР»СѓР±С‹ Рё СЃРїРѕСЂС‚РёРІРЅС‹Рµ РїР»РѕС‰Р°РґРєРё РЅРµ РґРѕР±Р°РІР»СЏСЋС‚СЃСЏ РІ РєР°СЂС‚РѕС‡РєСѓ Р±РµР· РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹С… РґР°РЅРЅС‹С….")
      ]).slice(0, 5);
    }

    return cleanList([
      withBullet("РџРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹Р№ РїРµСЂРµС‡РµРЅСЊ СЂР°Р·РІР»РµС‡РµРЅРёР№ Рё СЃРїРѕСЂС‚РёРІРЅС‹С… РѕР±СЉРµРєС‚РѕРІ РІ С‚РµРєСѓС‰РµР№ РєР°СЂС‚РѕС‡РєРµ РЅРµ РґРµС‚Р°Р»РёР·РёСЂРѕРІР°РЅ."),
      withBullet("РџСЂРё РїРѕРґР±РѕСЂРµ РѕС‚РґРµР»СЊРЅРѕ РїСЂРѕРІРµСЂСЏСЋС‚СЃСЏ РґРЅРµРІРЅР°СЏ Р°РЅРёРјР°С†РёСЏ, РІРµС‡РµСЂРЅСЏСЏ РїСЂРѕРіСЂР°РјРјР°, С„РёС‚РЅРµСЃ, РІРѕРґРЅС‹Рµ РІРёРґС‹ СЃРїРѕСЂС‚Р° Рё СЃРїРѕСЂС‚РёРІРЅС‹Рµ РїР»РѕС‰Р°РґРєРё."),
      withBullet("Р•СЃР»Рё РЅСѓР¶РµРЅ СЃРїРѕРєРѕР№РЅС‹Р№ С„РѕСЂРјР°С‚, Р°РєС‚РёРІРЅС‹Р№ РґРѕСЃСѓРі РёР»Рё РІРµС‡РµСЂРЅСЏСЏ РїСЂРѕРіСЂР°РјРјР°, СЌС‚РѕС‚ СЃС†РµРЅР°СЂРёР№ С„РёРєСЃРёСЂСѓРµС‚СЃСЏ РґРѕ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ.")
    ]);
  }

  function buildSpaItems(hotel) {
    const detailed = getDetailedFacts("spa");
    if (detailed) return cleanList(detailed).map(withBullet);

    const source = cleanList([
      ...hotelData.ensureList(hotel.highlights),
      ...hotelData.ensureList(hotel.nuances),
      ...hotelData.ensureList(hotel.important)
    ]).filter(item => /spa|СЃРїР°|wellness|С„РёС‚РЅРµСЃ|РјР°СЃСЃР°Р¶|СЃР°СѓРЅ|С…Р°РјРјР°Рј|РїР°СЂРЅ|РєРѕСЃРјРµС‚|РєСЂР°СЃРѕС‚|Р±Р°СЃСЃРµР№РЅ/i.test(item));

    return cleanList([
      ...source.slice(0, 4).map(withBullet),
      source.length ? "" : withBullet("РџРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹Р№ РїРµСЂРµС‡РµРЅСЊ SPA Рё wellness-СѓСЃР»СѓРі РІ С‚РµРєСѓС‰РµР№ РєР°СЂС‚РѕС‡РєРµ РЅРµ РґРµС‚Р°Р»РёР·РёСЂРѕРІР°РЅ."),
      withBullet("Р’ СЌС‚РѕС‚ СЂР°Р·РґРµР» РѕС‚РЅРѕСЃСЏС‚СЃСЏ СЃРїР°-С†РµРЅС‚СЂ, С…Р°РјРјР°Рј, СЃР°СѓРЅР°, РјР°СЃСЃР°Р¶, РєРѕСЃРјРµС‚РёС‡РµСЃРєРёРµ РїСЂРѕС†РµРґСѓСЂС‹, СЃР°Р»РѕРЅ РєСЂР°СЃРѕС‚С‹, С„РёС‚РЅРµСЃ-Р·Р°Р» Рё РєСЂС‹С‚С‹Р№ Р±Р°СЃСЃРµР№РЅ, РµСЃР»Рё РѕРЅРё РїРѕРґС‚РІРµСЂР¶РґРµРЅС‹ РїРѕ РѕС‚РµР»СЋ."),
      withBullet("РџР»Р°С‚РЅРѕСЃС‚СЊ РїСЂРѕС†РµРґСѓСЂ Рё РґРѕСЃС‚СѓРї РїРѕ РІРѕР·СЂР°СЃС‚Сѓ С„РёРєСЃРёСЂСѓСЋС‚СЃСЏ РїРѕ Р°РєС‚СѓР°Р»СЊРЅРѕРјСѓ С‚Р°СЂРёС„Сѓ.")
    ]);
  }

  function buildFreeServicesItems(hotel) {
    const detailed = getDetailedFacts("free");
    if (detailed) return cleanList(detailed).map(withBullet);

    const freeSignals = cleanList([
      ...hotelData.ensureList(hotel.highlights),
      hotel.beach,
      hotel.mealConcept
    ]).filter(item => /wi-?fi|РїР»СЏР¶|С„РёС‚РЅРµСЃ|РєР»СѓР±|Р°РЅРёРјР°С†|all inclusive|РІСЃС‘ РІРєР»СЋС‡РµРЅРѕ|РІСЃРµ РІРєР»СЋС‡РµРЅРѕ|Р±Р°СЃСЃРµР№РЅ/i.test(item));

    return cleanList([
      ...freeSignals.slice(0, 4).map(withBullet),
      withBullet("Р’ Р±РµСЃРїР»Р°С‚РЅС‹Рµ СѓСЃР»СѓРіРё РѕР±С‹С‡РЅРѕ РїРѕРїР°РґР°РµС‚ С‚РѕР»СЊРєРѕ С‚Рѕ, С‡С‚Рѕ РІРєР»СЋС‡РµРЅРѕ РІ РІС‹Р±СЂР°РЅРЅС‹Р№ С‚Р°СЂРёС„."),
      withBullet("РџР»СЏР¶РЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ, С„РёС‚РЅРµСЃ-Р·Р°Р», РґРµС‚СЃРєРёР№ РєР»СѓР±, Wi-Fi, РїР°СЂРєРѕРІРєР° Рё Р°РЅРёРјР°С†РёСЏ РЅРµ РїРѕРјРµС‡Р°СЋС‚СЃСЏ РєР°Рє Р±РµСЃРїР»Р°С‚РЅС‹Рµ Р±РµР· РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РїРѕ РєРѕРЅРєСЂРµС‚РЅРѕРјСѓ РѕС‚РµР»СЋ."),
      withBullet("РЎРѕСЃС‚Р°РІ РІРєР»СЋС‡С‘РЅРЅС‹С… СѓСЃР»СѓРі РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ РїРѕ С‚Р°СЂРёС„Сѓ РїРµСЂРµРґ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµРј.")
    ]);
  }

  function buildPaidServicesItems(hotel) {
    const detailed = getDetailedFacts("paid");
    if (detailed) return cleanList(detailed).map(withBullet);

    const paidSignals = cleanList([
      ...hotelData.ensureList(hotel.nuances),
      ...hotelData.ensureList(hotel.important)
    ]).filter(item => /spa|СЃРїР°|РјР°СЃСЃР°Р¶|РЅСЏРЅ|С‚СЂР°РЅСЃС„РµСЂ|РІСЂР°С‡|РїСЂР°С‡|Р°СЂРµРЅРґ|РІРѕРґРЅ|РєРѕРЅС„РµСЂРµРЅС†|РїР°РІРёР»СЊРѕРЅ|РґРµРїРѕР·РёС‚|РїР»Р°С‚/i.test(item));

    return cleanList([
      ...paidSignals.slice(0, 4).map(withBullet),
      withBullet("Рљ РїР»Р°С‚РЅС‹Рј СѓСЃР»СѓРіР°Рј РјРѕРіСѓС‚ РѕС‚РЅРѕСЃРёС‚СЊСЃСЏ SPA-РїСЂРѕС†РµРґСѓСЂС‹, РјР°СЃСЃР°Р¶, СѓСЃР»СѓРіРё РЅСЏРЅРё, РїСЂР°С‡РµС‡РЅР°СЏ, РІСЂР°С‡, РёРЅРґРёРІРёРґСѓР°Р»СЊРЅС‹Р№ С‚СЂР°РЅСЃС„РµСЂ, Р°СЂРµРЅРґР° Р°РІС‚РѕРјРѕР±РёР»СЏ Рё РІРѕРґРЅС‹Рµ РІРёРґС‹ СЃРїРѕСЂС‚Р°."),
      withBullet("РўР°РєРёРµ СѓСЃР»СѓРіРё РІС‹РІРѕРґСЏС‚СЃСЏ РєР°Рє РїР»Р°С‚РЅС‹Рµ С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ СЃРІРµСЂРєРё СЃ Р°РєС‚СѓР°Р»СЊРЅС‹РјРё СѓСЃР»РѕРІРёСЏРјРё РѕС‚РµР»СЏ."),
      withBullet("Р•СЃР»Рё СѓСЃР»СѓРіР° РєСЂРёС‚РёС‡РЅР° РґР»СЏ РїРѕРµР·РґРєРё, РµС‘ СЃС‚РѕРёРјРѕСЃС‚СЊ Рё РґРѕСЃС‚СѓРїРЅРѕСЃС‚СЊ С„РёРєСЃРёСЂСѓСЋС‚СЃСЏ РґРѕ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ.")
    ]);
  }

  function buildAdditionalInfoItems(hotel) {
    return cleanList([
      withBullet(`РЎС‚СЂР°РЅР° Рё СЂРµРіРёРѕРЅ: ${[hotel.country, hotel.region].filter(Boolean).map(formatUserText).join(", ")}.`),
      hotel.transfer ? withBullet(`Р›РѕРіРёСЃС‚РёРєР°: ${formatUserText(hotel.transfer)}.`) : "",
      withBullet("Р—Р°РµР·Рґ, РІС‹РµР·Рґ, РґРµРїРѕР·РёС‚, СЂР°Р·РјРµС‰РµРЅРёРµ СЃ Р¶РёРІРѕС‚РЅС‹РјРё, РїСЂР°РІРёР»Р° РєСѓСЂРµРЅРёСЏ, СЏР·С‹РєРё РїРµСЂСЃРѕРЅР°Р»Р° Рё СЃРїРѕСЃРѕР±С‹ РѕРїР»Р°С‚С‹ СѓРєР°Р·С‹РІР°СЋС‚СЃСЏ С‚РѕР»СЊРєРѕ РїСЂРё РЅР°Р»РёС‡РёРё РїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹С… РґР°РЅРЅС‹С…."),
      withBullet("РЎРµР·РѕРЅРЅС‹Рµ РѕСЃРѕР±РµРЅРЅРѕСЃС‚Рё, РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РѕС‚РґРµР»СЊРЅС‹С… СѓСЃР»СѓРі Рё РёР·РјРµРЅРµРЅРёСЏ РІ РєРѕРЅС†РµРїС†РёРё С„РёРєСЃРёСЂСѓСЋС‚СЃСЏ РїРѕ Р°РєС‚СѓР°Р»СЊРЅРѕРјСѓ РѕРїРёСЃР°РЅРёСЋ РѕС‚РµР»СЏ."),
      withBullet("Р’ РєР°СЂС‚РѕС‡РєРµ РЅРµ РёСЃРїРѕР»СЊР·СѓСЋС‚СЃСЏ РЅРµРїРѕРґС‚РІРµСЂР¶РґС‘РЅРЅС‹Рµ СЂР°СЃСЃС‚РѕСЏРЅРёСЏ, РЅР°Р·РІР°РЅРёСЏ СЂРµСЃС‚РѕСЂР°РЅРѕРІ, РєР°С‚РµРіРѕСЂРёРё РЅРѕРјРµСЂРѕРІ РёР»Рё СЃРїРёСЃРєРё СѓСЃР»СѓРі.")
    ]);
  }

  function normalizeHotelInfoList(value) {
    return hotelData.ensureList(value)
      .map(item => formatHotelInfoItem(item))
      .filter(Boolean);
  }

  function formatHotelInfoItem(item) {
    if (item == null) return "";
    if (typeof item !== "object") return withBullet(item);

    const name = String(item.name || "").trim();
    const ruName = String(item.ruName || "").trim();
    const details = [
      item.area,
      item.capacity,
      item.view ? `РІРёРґ: ${item.view}` : "",
      item.cuisine,
      item.description,
      ...hotelData.ensureList(item.features)
    ].map(value => String(value || "").trim()).filter(Boolean);

    if (!name && !ruName && !details.length) return "";

    const title = [name, ruName ? `(${ruName})` : ""].filter(Boolean).join(" ");
    return withBullet([title, details.join(", ")].filter(Boolean).join(" вЂ” "));
  }

  function buildStructuredGeneralItems(info) {
    const general = info.general || {};
    return cleanList([
      ...normalizeHotelInfoList(general.description),
      ...normalizeHotelInfoList(general.facts),
      ...normalizeHotelInfoList(info.location).map(item => item.replace("вЂў ", "вЂў Р Р°СЃРїРѕР»РѕР¶РµРЅРёРµ: ")),
      ...normalizeHotelInfoList(info.beach).map(item => item.replace("вЂў ", "вЂў РџР»СЏР¶: ")),
      ...normalizeHotelInfoList(info.territory).map(item => item.replace("вЂў ", "вЂў РўРµСЂСЂРёС‚РѕСЂРёСЏ: "))
    ]);
  }

  function buildStructuredDiningItems(info) {
    const dining = info.dining || {};
    return cleanList([
      dining.concept ? withBullet(`РљРѕРЅС†РµРїС†РёСЏ: ${dining.concept}`) : "",
      ...normalizeHotelInfoList(dining.mainRestaurants).map(item => item.replace("вЂў ", "вЂў РћСЃРЅРѕРІРЅРѕР№ СЂРµСЃС‚РѕСЂР°РЅ: ")),
      ...normalizeHotelInfoList(dining.alaCarteRestaurants).map(item => item.replace("вЂў ", "вЂў Р РµСЃС‚РѕСЂР°РЅ РїРѕ РјРµРЅСЋ: ")),
      ...normalizeHotelInfoList(dining.bars).map(item => item.replace("вЂў ", "вЂў Р‘Р°СЂ: ")),
      ...normalizeHotelInfoList(dining.cafes).map(item => item.replace("вЂў ", "вЂў РљР°С„Рµ: "))
    ]);
  }

  function buildStructuredHotelSections(hotel) {
    const info = hotel?.hotelInfo;
    if (!info || typeof info !== "object") return [];

    return [
      { title: "РћР±С‰Р°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ", items: buildStructuredGeneralItems(info) },
      { title: "РќРѕРјРµСЂР°", items: normalizeHotelInfoList(info.rooms) },
      { title: "РљРѕРЅС†РµРїС†РёСЏ РїРёС‚Р°РЅРёСЏ", items: buildStructuredDiningItems(info) },
      { title: "Р”Р»СЏ РґРµС‚РµР№", items: normalizeHotelInfoList(info.children) },
      { title: "Р Р°Р·РІР»РµС‡РµРЅРёСЏ Рё СЃРїРѕСЂС‚", items: normalizeHotelInfoList(info.sportEntertainment) },
      { title: "SPA Рё Wellness", items: normalizeHotelInfoList(info.spaWellness) },
      { title: "Р‘РµСЃРїР»Р°С‚РЅС‹Рµ СѓСЃР»СѓРіРё", items: normalizeHotelInfoList(info.freeServices) },
      { title: "РџР»Р°С‚РЅС‹Рµ СѓСЃР»СѓРіРё", items: normalizeHotelInfoList(info.paidServices) },
      { title: "Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ", items: normalizeHotelInfoList(info.additionalInfo) }
    ].filter(section => cleanList(section.items).length);
  }

  function buildStandardHotelSections(hotel) {
    const structuredSections = buildStructuredHotelSections(hotel);
    if (structuredSections.length) return structuredSections;

    return [
      { title: "РћР±С‰Р°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ", items: buildGeneralInfoItems(hotel) },
      { title: "РџР»СЏР¶", items: buildBeachSectionItems(hotel) },
      { title: "РўРµСЂСЂРёС‚РѕСЂРёСЏ", items: buildTerritorySectionItems(hotel) },
      { title: "РќРѕРјРµСЂР°", items: buildRoomItems(hotel) },
      { title: "РљРѕРЅС†РµРїС†РёСЏ РїРёС‚Р°РЅРёСЏ", items: buildMealItems(hotel) },
      { title: "Р”Р»СЏ РґРµС‚РµР№", items: buildChildrenItems(hotel) },
      { title: "Р Р°Р·РІР»РµС‡РµРЅРёСЏ Рё СЃРїРѕСЂС‚", items: buildSportItems(hotel) },
      { title: "SPA Рё Wellness", items: buildSpaItems(hotel) },
      { title: "Р‘РµСЃРїР»Р°С‚РЅС‹Рµ СѓСЃР»СѓРіРё", items: buildFreeServicesItems(hotel) },
      { title: "РџР»Р°С‚РЅС‹Рµ СѓСЃР»СѓРіРё", items: buildPaidServicesItems(hotel) }
    ];
  }

  function buildWhatsAppLink(hotel) {
    return `https://wa.me/77077186653?text=${encodeURIComponent(hotel.searchMessage)}`;
  }

  function updateSeo(hotel) {
    document.title = hotel.seoTitle || `${hotel.title} | Del Mar Travel`;
    const description = document.querySelector("meta[name='description']");
    if (description) {
      description.setAttribute("content", hotel.seoDescription || hotel.shortDescription || "");
    }
  }

  function renderThumbnails(hotel) {
    const thumbnails = document.getElementById("hotelThumbnails");
    if (!thumbnails) return;

    const images = getHotelImages(hotel).slice(1, 7);
    thumbnails.className = `hotel-profile__side-photos hotel-profile__side-photos--count-${images.length}`;
    thumbnails.innerHTML = images.map((src, index) => `
      <button class="hotel-profile__side-photo hotel-photo-trigger" type="button" data-photo-index="${index + 1}" aria-label="РћС‚РєСЂС‹С‚СЊ С„РѕС‚РѕРіСЂР°С„РёСЋ ${index + 2}">
        <img src="${escapeHTML(src)}" alt="${escapeHTML(hotel.title)} С„РѕС‚Рѕ ${index + 2}" loading="lazy">
        ${index === images.length - 1 ? `<span>РЎРјРѕС‚СЂРµС‚СЊ РІСЃРµ С„РѕС‚Рѕ</span>` : ""}
      </button>
    `).join("");

    thumbnails.querySelectorAll("img").forEach(img => setImageFallback(img, hotel));
  }

  function renderCompactFacts(hotel) {
    const facts = document.getElementById("hotelQuickFacts");
    if (!facts) return;

    const rows = [
      { label: "РљРѕРЅС†РµРїС†РёСЏ", value: hotel.mealConcept },
      { label: "РџР»СЏР¶", value: hotel.beach },
      { label: "РўСЂР°РЅСЃС„РµСЂ", value: hotel.transfer },
      { label: "Р¤РѕСЂРјР°С‚", value: hotel.format || hotelData.ensureList(hotel.bestFor).slice(0, 3).join(" вЂў ") }
    ].filter(item => item.value);

    facts.innerHTML = rows.map(item => `
      <div class="hotel-key-fact">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(formatUserText(item.value))}</strong>
      </div>
    `).join("");
  }

  function renderTags(hotel) {
    const tags = document.getElementById("hotelTags");
    if (!tags) return;

    const items = uniqueList([hotel.stars, ...hotelData.ensureList(hotel.bestFor)]).slice(0, 5);
    tags.innerHTML = items.map(item => `<span>${escapeHTML(formatUserText(item))}</span>`).join("");
  }

  function renderInfoArticle(hotel) {
    const article = document.getElementById("hotelInfoArticle");
    if (!article) return;

    article.innerHTML = buildStandardHotelSections(hotel)
      .map(section => createTextBlock(section.title, section.items))
      .filter(Boolean)
      .join("");
  }

  function buildTabItems(hotel) {
    return [
      {
        id: "description",
        title: "РћРїРёСЃР°РЅРёРµ",
        items: hotelData.ensureList([hotel.shortDescription, buildRecommendationText(hotel)])
      },
      {
        id: "rooms",
        title: "РќРѕРјРµСЂР°",
        items: hotelData.ensureList(hotel.important).filter(item => /РЅРѕРјРµСЂ|РєР°С‚РµРіРѕСЂ|СЂР°Р·РјРµС‰/i.test(item))
      },
      {
        id: "infrastructure",
        title: "РРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР°",
        items: hotelData.ensureList(hotel.highlights)
      },
      {
        id: "meal",
        title: "РџРёС‚Р°РЅРёРµ",
        items: hotelData.ensureList(hotel.mealConcept)
      },
    ].filter(tab => tab.items.length);
  }

  function renderTabs(hotel) {
    const nav = document.getElementById("hotelTabsNav");
    const panel = document.getElementById("hotelTabsPanel");
    if (!nav || !panel) return;

    const tabs = buildTabItems(hotel);
    let activeIndex = 0;

    function renderActiveTab() {
      const active = tabs[activeIndex];
      nav.innerHTML = tabs.map((tab, index) => `
        <button class="hotel-tabs__button ${index === activeIndex ? "is-active" : ""}" type="button" role="tab" aria-selected="${index === activeIndex}" data-tab-index="${index}">
          ${escapeHTML(tab.title)}
        </button>
      `).join("");
      panel.innerHTML = `
        <div class="hotel-tabs__content">
          <h3>${escapeHTML(active.title)}</h3>
          ${active.items.map(item => `<p>${escapeHTML(formatUserText(item))}</p>`).join("")}
        </div>
      `;
      nav.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
          activeIndex = Number(button.dataset.tabIndex);
          renderActiveTab();
        });
      });
    }

    renderActiveTab();
  }

  function initDetailsToggle() {
    const toggle = document.getElementById("hotelDetailsToggle");
    const details = document.getElementById("hotelDetailsArea");
    if (!toggle || !details) return;

    toggle.addEventListener("click", () => {
      const isOpen = details.classList.contains("is-open");

      if (!isOpen) {
        details.hidden = false;
        details.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "РЎРєСЂС‹С‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ";
        window.requestAnimationFrame(() => {
          details.classList.add("is-open");
          window.setTimeout(() => {
            details.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        });
      } else {
        details.classList.remove("is-open");
        details.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "РџРѕРґСЂРѕР±РЅРµРµ РѕР± РѕС‚РµР»Рµ";
        window.setTimeout(() => {
          if (!details.classList.contains("is-open")) details.hidden = true;
        }, 360);
      }
    });
  }

  function initPhotoViewer(hotel) {
    const images = getHotelImages(hotel);
    const viewer = document.getElementById("hotelPhotoViewer");
    const viewerImage = document.getElementById("hotelPhotoViewerImage");
    const counter = document.getElementById("hotelPhotoCounter");
    const close = document.getElementById("hotelPhotoClose");
    const prev = document.getElementById("hotelPhotoPrev");
    const next = document.getElementById("hotelPhotoNext");
    if (!images.length || !viewer || !viewerImage || !counter || !close || !prev || !next) return;

    let activeIndex = 0;
    let touchStartX = 0;

    function renderPhoto() {
      viewerImage.classList.remove("is-ready");
      viewerImage.src = images[activeIndex];
      viewerImage.alt = `${hotel.title} вЂ” С„РѕС‚Рѕ ${activeIndex + 1}`;
      counter.textContent = `${activeIndex + 1} РёР· ${images.length}`;
      window.setTimeout(() => viewerImage.classList.add("is-ready"), 30);
    }

    function openPhoto(index) {
      activeIndex = Number(index) || 0;
      viewer.hidden = false;
      viewer.setAttribute("aria-hidden", "false");
      document.body.classList.add("hotel-photo-lock");
      renderPhoto();
      close.focus();
    }

    function closePhoto() {
      viewer.hidden = true;
      viewer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hotel-photo-lock");
    }

    function movePhoto(step) {
      activeIndex = (activeIndex + step + images.length) % images.length;
      renderPhoto();
    }

    document.querySelectorAll(".hotel-photo-trigger").forEach(trigger => {
      trigger.addEventListener("click", () => openPhoto(trigger.dataset.photoIndex));
    });
    close.addEventListener("click", closePhoto);
    prev.addEventListener("click", () => movePhoto(-1));
    next.addEventListener("click", () => movePhoto(1));
    viewer.addEventListener("click", event => {
      if (event.target === viewer) closePhoto();
    });
    viewer.addEventListener("touchstart", event => {
      touchStartX = event.touches?.[0]?.clientX || 0;
    }, { passive: true });
    viewer.addEventListener("touchend", event => {
      const touchEndX = event.changedTouches?.[0]?.clientX || 0;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > 44) movePhoto(delta > 0 ? -1 : 1);
    }, { passive: true });
    document.addEventListener("keydown", event => {
      if (viewer.hidden) return;
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
    });
    viewerImage.addEventListener("error", () => {
      viewerImage.src = hotel.fallbackImages?.[0] || "./assets/images/premium.jpg";
    });
  }

  function renderHotel(hotel) {
    updateSeo(hotel);
    page.dataset.state = "ready";
    page.classList.add("hotel-page--standard");
    document.body.classList.add("hotel-body--standard");
    error.hidden = true;

    const heroImage = document.getElementById("hotelHeroImage");
    if (heroImage) {
      heroImage.src = getHotelImages(hotel)[0] || hotel.fallbackImages?.[0] || "./assets/images/premium.jpg";
      heroImage.alt = `${hotel.title} вЂ” С„РѕС‚Рѕ РѕС‚РµР»СЏ`;
      setImageFallback(heroImage, hotel);
    }

    setText("hotelBreadcrumbTitle", hotel.title);
    setText("hotelBreadcrumbCountry", formatUserText(hotel.country));
    setText("hotelBreadcrumbRegion", formatUserText(hotel.region));
    setText("hotelEyebrow", `${formatUserText(hotel.country)} / ${formatUserText(hotel.region)}`);
    setText("hotelTitle", hotel.title);
    setText("hotelShortDescription", formatUserText(hotel.shortDescription));

    const meta = document.getElementById("hotelMeta");
    if (meta) {
      meta.innerHTML = [hotel.country, hotel.region, hotel.stars].filter(Boolean)
        .map(item => `<span>${escapeHTML(formatUserText(item))}</span>`)
        .join("");
    }

    renderTags(hotel);
    renderCompactFacts(hotel);
    renderThumbnails(hotel);
    renderInfoArticle(hotel);
    const details = document.getElementById("hotelDetailsArea");
    const tabsNav = document.getElementById("hotelTabsNav");
    const tabsPanel = document.getElementById("hotelTabsPanel");
    if (details) {
      details.hidden = false;
      details.classList.add("is-open");
      details.setAttribute("aria-hidden", "false");
    }
    if (tabsNav) tabsNav.innerHTML = "";
    if (tabsPanel) tabsPanel.innerHTML = "";
    initPhotoViewer(hotel);

    const whatsappHref = buildWhatsAppLink(hotel);
    document.querySelectorAll(".hotel-whatsapp-link").forEach(link => {
      link.href = whatsappHref;
    });
  }

  function renderUnknownHotel() {
    page.hidden = true;
    error.hidden = false;
    document.title = "РћС‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ | Del Mar Travel";
  }

  if (!hotelData || !slug) {
    renderUnknownHotel();
    return;
  }

  const context = getStoredContext();
  const hasDirectDetails = Boolean(hotelData.HOTEL_DETAILS?.[slug]);

  if (!hasDirectDetails && !context.name) {
    renderUnknownHotel();
    return;
  }

  renderHotel(hotelData.normalizeHotelDetails(slug, context));
})();
