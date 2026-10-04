"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { TourvisorHotelDetails, TourvisorHotelResult, TourvisorRoomDetails, TourvisorTourResult } from "../types";
import { useHotelData } from "../use-hotel-data";

type SearchResultsProps = {
  phase: "loading" | "ready" | "error";
  progress: number;
  results: TourvisorHotelResult[];
  error: string | null;
};

export function SearchResults({ phase, progress, results, error }: SearchResultsProps) {
  return <section className="search-results-page" aria-label="Результаты поиска тура">
    <div className="search-results-panel" aria-label="Выбранные параметры поиска" />
    <div className="search-results-shell"><aside className="search-results-filters" aria-label="Фильтры результатов" /><div className="search-results-main">
      <ResultsToolbar count={results.length} />
      {phase === "loading" && <ResultsSkeleton progress={progress} />}
      {phase === "error" && <div className="search-results-state search-results-state--error" role="alert">{error}</div>}
      {phase === "ready" && results.length === 0 && <div className="search-results-state search-results-state--empty" />}
      {phase === "ready" && results.length > 0 && <div className="search-results-list is-revealing"><div className="search-results-card-stack">{results.map((hotel) => <ResultCard hotel={hotel} key={hotel.id} />)}</div></div>}
    </div></div>
  </section>;
}

function ResultsToolbar({ count }: { count: number }) { return <div className="search-results-sort" aria-label="Сортировка результатов"><div className="search-results-sort__summary" aria-label={`Найдено отелей: ${count}`} /><div className="search-results-sort__controls"><div className="search-results-sort__select" /><div className="search-results-sort__toggles"><div /><div /></div><div className="search-results-sort__map" /><div className="search-results-sort__edit" /></div></div>; }

function ResultsSkeleton({ progress }: { progress: number }) { return <div className="search-results-state search-results-state--loading" aria-label={`Загрузка результатов: ${Math.round(progress)}%`}><div className="search-results-skeleton">{[0, 1, 2].map((item) => <div className="search-results-skeleton__item" key={item}><div className="search-results-skeleton__media" /><div className="search-results-skeleton__content"><div className="search-results-skeleton__line search-results-skeleton__line--lg" /><div className="search-results-skeleton__line" /><div className="search-results-skeleton__line search-results-skeleton__line--short" /><div className="search-results-skeleton__badges"><div /><div /><div /></div></div><div className="search-results-skeleton__side"><div className="search-results-skeleton__price" /><div className="search-results-skeleton__button" /><div className="search-results-skeleton__button" /></div></div>)}</div></div>; }

function ResultCard({ hotel }: { hotel: TourvisorHotelResult }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [modalTab, setModalTab] = useState<HotelTab>("hotel");
  const modalRef = useRef<HTMLDialogElement>(null);
  const hotelData = useHotelData(hotel.id);
  const bestTour = hotel.tours[0] ?? null;
  const price = bestTour?.price || hotel.price;
  const currency = bestTour?.currency || hotel.currency;
  const roomIds = useMemo(() => hotel.tours.flatMap((tour) => tour.roomId ? [tour.roomId] : []), [hotel.tours]);
  const images = useMemo(() => Array.from(new Set([...(hotelData.details?.images ?? []), ...(hotel.pictureUrl ? [hotel.pictureUrl] : [])])), [hotel.pictureUrl, hotelData.details?.images]);

  const toggleDetails = () => {
    const next = !detailsOpen;
    setDetailsOpen(next);
    if (next && hotel.hasDescription) void hotelData.loadDetails();
  };
  const toggleOffers = () => {
    if (!hotel.tours.length) return;
    setOffersOpen((value) => !value);
    if (roomIds.length) void hotelData.loadRooms(roomIds);
  };
  const openModal = (tab: HotelTab) => {
    setModalTab(tab);
    modalRef.current?.showModal();
    document.body.classList.add("is-hotel-modal-open");
    if (tab === "hotel" || tab === "photo") void hotelData.loadDetails();
  };
  const openGallery = async () => {
    const loaded = hotel.hasPictures ? await hotelData.loadDetails() : null;
    if ((loaded?.images.length ?? 0) > 0 || hotel.pictureUrl) setGalleryOpen(true);
  };

  return <article className="search-result-card">
    <button className="search-result-card__media" type="button" disabled={!hotel.pictureUrl && !hotel.hasPictures} data-hotel-gallery-open={hotel.pictureUrl || hotel.hasPictures ? "" : undefined} aria-label={hotel.pictureUrl || hotel.hasPictures ? `Фотографии ${hotel.name}` : "Фотографии отеля недоступны"} style={hotel.pictureUrl ? { backgroundImage: `url("${cssUrl(hotel.pictureUrl)}")` } : undefined} onClick={() => void openGallery()} />
    <div className="search-result-card__content"><div className="search-result-card__identity"><div className="search-result-card__identity-main"><div className="search-result-card__stars" aria-label={`${hotel.category} звёзд`}>{hotel.category > 0 ? "★".repeat(Math.min(5, hotel.category)) : ""}</div><h2 className="search-result-card__title">{hotel.name}</h2><div className="search-result-card__location">{[hotel.subregion?.name, hotel.region?.name].filter(Boolean).join(", ")}</div></div>{hotel.rating > 0 && <div className="search-result-card__rating">{hotel.rating}</div>}</div>
      {hotel.description && <p className="search-result-card__description">{hotel.description}</p>}
      <div className="search-result-card__actions"><button type="button" disabled={!hotel.description && !hotel.hasDescription} aria-expanded={detailsOpen} onClick={toggleDetails}>Об отеле</button><button type="button" disabled title="Tourvisor API не предоставляет отзывы">Отзывы</button><button type="button" disabled={hotel.latitude === null || hotel.longitude === null} onClick={() => openModal("map")}>Карта</button><button type="button" disabled={!hotel.tours.length} aria-expanded={offersOpen} onClick={toggleOffers}>Номера</button></div>
    </div>
    {detailsOpen && <HotelInlineDetails hotel={hotel} details={hotelData.details} loading={hotelData.detailsState === "loading"} onMore={() => openModal("hotel")} onGallery={() => void openGallery()} />}
    <div className="search-result-card__booking">{bestTour && <TourSummary tour={bestTour} />}{price > 0 && <div className="search-result-card__price">{formatPrice(price, currency)}</div>}<button className="search-result-card__offer-button" type="button" disabled={!hotel.tours.length} aria-expanded={offersOpen} aria-label="Показать предложения" onClick={toggleOffers} /></div>
    {offersOpen && hotel.tours.length > 0 && <HotelOffers tours={hotel.tours} rooms={hotelData.rooms} selectedId={selectedTourId} onSelect={setSelectedTourId} />}
    <HotelModal hotel={hotel} details={hotelData.details} loading={hotelData.detailsState === "loading"} images={images} modalRef={modalRef} tab={modalTab} onTab={(tab) => { setModalTab(tab); if (tab === "hotel" || tab === "photo") void hotelData.loadDetails(); }} onGallery={() => void openGallery()} />
    <HotelGallery images={images} open={galleryOpen} onClose={() => setGalleryOpen(false)} />
  </article>;
}

function HotelInlineDetails({ hotel, details, loading, onMore, onGallery }: { hotel: TourvisorHotelResult; details: TourvisorHotelDetails | null; loading: boolean; onMore: () => void; onGallery: () => void }) {
  const rows = details ? detailRows(details) : hotel.description ? [["Описание", hotel.description] as const] : [];
  return <div className="search-result-card__details is-open" aria-busy={loading}>{loading && <div className="search-result-card__details-loading" />}{rows.length > 0 && <div className="search-result-card__details-grid">{rows.map(([label, value]) => <div key={label}><span>{label}</span><p>{value}</p></div>)}</div>}<div className="search-result-card__details-actions"><button type="button" onClick={onMore}>Подробнее</button><button type="button" disabled={!hotel.hasPictures && !details?.images.length && !hotel.pictureUrl} onClick={onGallery}>Больше фото</button></div></div>;
}

function HotelOffers({ tours, rooms, selectedId, onSelect }: { tours: TourvisorTourResult[]; rooms: TourvisorRoomDetails[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  return <section className="search-result-card__rooms is-open" aria-label="Доступные предложения"><div className="search-hotel-rooms__list">{tours.map((tour) => { const room = tour.roomId ? roomById.get(tour.roomId) : undefined; const image = room?.images[0]; const details = [tour.placement, tour.meal?.russianName || tour.meal?.name, tour.date, tour.nights ? `${tour.nights} ночей` : ""].filter(Boolean).join(" · "); return <article className={`search-hotel-room has-data${selectedId === tour.id ? " is-selected" : ""}`} key={tour.id}><div className="search-hotel-room__media" style={image ? { backgroundImage: `url("${cssUrl(image)}")` } : undefined}>{!image && <i />}</div><div className="search-hotel-room__identity"><b>{room?.name || tour.roomType}</b><span>{details}</span></div><div className="search-hotel-room__price"><b>{tour.price > 0 ? formatNumber(tour.price) : ""}</b><span>{tour.currency}</span></div><button className="search-hotel-room__select" type="button" aria-label="Выбрать предложение" aria-pressed={selectedId === tour.id} onClick={() => onSelect(tour.id)} /></article>; })}</div></section>;
}

function TourSummary({ tour }: { tour: TourvisorTourResult }) { return <div className="search-result-card__offer-summary"><span>{tour.date}</span><span>{tour.nights ? `${tour.nights} ночей` : ""}</span><span>{tour.roomType}</span><span>{tour.meal?.russianName || tour.meal?.name || ""}</span></div>; }
function formatPrice(value: number, currency: string) { try { return new Intl.NumberFormat("ru-KZ", { style: "currency", currency: currency || "KZT", maximumFractionDigits: 0 }).format(value); } catch { return `${formatNumber(value)} ${currency}`.trim(); } }
function formatNumber(value: number) { return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value); }
function cssUrl(value: string) { return value.replace(/["\\\n\r]/g, ""); }

type HotelTab = "hotel" | "photo" | "reviews" | "map";

function HotelModal({ hotel, details, loading, images, modalRef, tab, onTab, onGallery }: { hotel: TourvisorHotelResult; details: TourvisorHotelDetails | null; loading: boolean; images: string[]; modalRef: React.RefObject<HTMLDialogElement | null>; tab: HotelTab; onTab: (tab: HotelTab) => void; onGallery: () => void }) {
  const close = () => { modalRef.current?.close(); document.body.classList.remove("is-hotel-modal-open"); };
  const coordinates = { latitude: details?.common.latitude ?? hotel.latitude, longitude: details?.common.longitude ?? hotel.longitude };
  return <dialog ref={modalRef} className="search-hotel-modal" aria-label={`Информация об отеле ${hotel.name}`} onClose={() => { document.body.classList.remove("is-hotel-modal-open"); onTab("hotel"); }} onCancel={() => document.body.classList.remove("is-hotel-modal-open")} onClick={(event) => { if (event.target === event.currentTarget) close(); }}><section className="search-hotel-modal__dialog"><div className="search-hotel-modal__topbar"><div className="search-hotel-modal__utilities" aria-hidden="true" /><div className="search-hotel-modal__brand-mark" /><button className="search-hotel-modal__close" type="button" aria-label="Закрыть" onClick={close} /></div><header className="search-hotel-modal__header"><div className="search-hotel-modal__identity"><div className="search-hotel-modal__stars">{hotel.category > 0 ? "★".repeat(Math.min(5, hotel.category)) : ""}</div><h2 className="search-hotel-modal__hotel-name">{hotel.name}</h2><div className="search-hotel-modal__hotel-location">{[hotel.subregion?.name, hotel.region?.name].filter(Boolean).join(", ")}</div></div></header><nav className="search-hotel-modal__tabs" role="tablist" aria-label="Разделы информации об отеле">{([['hotel', 'Отель'], ['photo', 'Фото'], ['reviews', 'Отзывы'], ['map', 'На карте']] as Array<[HotelTab, string]>).map(([id, label]) => <button type="button" role="tab" key={id} className={tab === id ? "is-active" : undefined} aria-selected={tab === id} disabled={(id === "photo" && !hotel.hasPictures && !images.length) || id === "reviews" || (id === "map" && (coordinates.latitude === null || coordinates.longitude === null))} onClick={() => onTab(id)}>{label}</button>)}</nav><div className="search-hotel-modal__viewport" aria-busy={loading}>{loading && <section className="search-hotel-modal__api-panel is-loading" />}{!loading && tab === "hotel" && <HotelInformation hotel={hotel} details={details} />}{!loading && tab === "photo" && images.length > 0 && <PhotoPanel images={images} onGallery={onGallery} />}{tab === "map" && coordinates.latitude !== null && coordinates.longitude !== null && <MapPanel latitude={coordinates.latitude} longitude={coordinates.longitude} />}</div></section></dialog>;
}

function HotelInformation({ hotel, details }: { hotel: TourvisorHotelResult; details: TourvisorHotelDetails | null }) {
  const rows = details ? detailRows(details) : hotel.description ? [["Описание", hotel.description] as const] : [];
  return <div className="search-hotel-modal__content">{rows.map(([label, value]) => <div className="search-hotel-modal__info-row" key={label}><strong>{label}</strong><p>{value}</p></div>)}</div>;
}

function PhotoPanel({ images, onGallery }: { images: string[]; onGallery: () => void }) {
  return <div className="search-hotel-modal__content"><div className="search-hotel-modal__gallery-shell"><button className="search-hotel-modal__main-media has-image" type="button" aria-label="Открыть галерею" style={{ backgroundImage: `url("${cssUrl(images[0])}")` }} onClick={onGallery} /><div className="search-hotel-modal__gallery-side"><div className="search-hotel-modal__thumbs">{images.slice(0, 9).map((image, index) => <button type="button" key={image} aria-label={`Открыть фото ${index + 1}`} style={{ backgroundImage: `url("${cssUrl(image)}")` }} onClick={onGallery} />)}</div><button className="search-hotel-modal__gallery-action" type="button" onClick={onGallery}>Больше фото</button></div></div></div>;
}

function MapPanel({ latitude, longitude }: { latitude: number; longitude: number }) {
  return <section className="search-hotel-modal__content"><div className="search-hotel-map" role="img" aria-label={`Координаты отеля: ${latitude}, ${longitude}`}><i aria-hidden="true" /><span>{latitude.toFixed(5)}, {longitude.toFixed(5)}</span></div></section>;
}

function HotelGallery({ images, open, onClose }: { images: string[]; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && images.length && !dialog.open) { setActive(0); dialog.showModal(); document.body.classList.add("is-hotel-gallery-open"); }
    if ((!open || !images.length) && dialog.open) dialog.close();
  }, [images.length, open]);
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setActive((value) => (value - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActive((value) => (value + 1) % images.length);
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [images.length, open]);
  const close = () => { ref.current?.close(); document.body.classList.remove("is-hotel-gallery-open"); onClose(); };
  if (!images.length) return null;
  return <dialog ref={ref} className="search-hotel-gallery" aria-label="Фотографии отеля" onClose={() => { document.body.classList.remove("is-hotel-gallery-open"); onClose(); }} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}><div className="search-hotel-gallery__shell" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(distance) > 45) setActive((value) => distance > 0 ? (value - 1 + images.length) % images.length : (value + 1) % images.length); touchStart.current = null; }}><button className="search-hotel-gallery__close" type="button" aria-label="Закрыть галерею" onClick={close} /><button className="search-hotel-gallery__arrow search-hotel-gallery__arrow--prev" type="button" hidden={images.length < 2} aria-label="Предыдущее фото" onClick={() => setActive((value) => (value - 1 + images.length) % images.length)} /><div className="search-hotel-gallery__stage" style={{ backgroundImage: `url("${cssUrl(images[active])}")` }} role="img" aria-label={`Фото ${active + 1} из ${images.length}`} /><button className="search-hotel-gallery__arrow search-hotel-gallery__arrow--next" type="button" hidden={images.length < 2} aria-label="Следующее фото" onClick={() => setActive((value) => (value + 1) % images.length)} /><div className="search-hotel-gallery__counter"><span>{active + 1}</span><i>/</i><span>{images.length}</span></div><div className="search-hotel-gallery__thumbs">{images.map((image, index) => <button className={active === index ? "is-active" : undefined} type="button" key={`${image}-${index}`} aria-label={`Фото ${index + 1}`} style={{ backgroundImage: `url("${cssUrl(image)}")` }} onClick={() => setActive(index)} />)}</div></div></dialog>;
}

function detailRows(details: TourvisorHotelDetails): Array<readonly [string, string]> {
  return [
    ["Описание", details.common.description], ["Построен", details.common.build], ["Реновация", details.common.repair], ["Расположен", details.common.place], ["Площадь", details.common.square], ["Адрес", details.common.address], ["Пляж", details.infrastructure.beach], ["Территория", details.infrastructure.territory], ["Номера", details.roomTypes], ["Питание", details.meals.description || details.meals.list], ["Для детей", details.services.child], ["В номере", details.services.inRoom], ["Услуги", details.services.available || details.services.free],
  ].filter((row): row is [string, string] => Boolean(row[1]));
}
