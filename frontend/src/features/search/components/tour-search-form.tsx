"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { toTourvisorSearchRequest, type SearchRequestIssue } from "../data-adapters";
import { formatDates, formatNights, formatTourists, startOfDay } from "../formatters";
import { initialSearchState, type BudgetState, type HotelRating, type SearchOption, type SearchPanel, type TourSearchDataSource, type TourSearchState, type TourvisorSearchRequest } from "../types";
import { useTourvisorData } from "../use-tourvisor-data";
import { BudgetPanel, CalendarPanel, DeparturePanel, NightsPanel, TouristsPanel } from "./search-panels";

type TourSearchFormProps = {
  onSearch: (request: TourvisorSearchRequest, state: TourSearchState) => void | Promise<void>;
  progressive?: boolean;
  dataSource?: TourSearchDataSource;
};

const RATING_OPTIONS: Array<{ id: HotelRating; name: string }> = [
  { id: 0, name: "Любой рейтинг" },
  { id: 2, name: "От 3.0" },
  { id: 3, name: "От 3.5" },
  { id: 4, name: "От 4.0" },
  { id: 5, name: "От 4.5" },
];

export function TourSearchForm({ onSearch, progressive = false, dataSource = {} }: TourSearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<TourSearchState>(() => ({
    ...initialSearchState,
    budget: { ...initialSearchState.budget, currency: dataSource.defaultCurrency ?? null },
  }));
  const [activePanel, setActivePanel] = useState<SearchPanel>(null);
  const [draftDates, setDraftDates] = useState(state.departureDates);
  const [draftNights, setDraftNights] = useState(state.nights);
  const [draftTourists, setDraftTourists] = useState(state.tourists);
  const [draftBudget, setDraftBudget] = useState<BudgetState>(state.budget);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfDay(new Date()));
  const [activeChildAge, setActiveChildAge] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(!progressive);
  const [hotelQuery, setHotelQuery] = useState("");
  const [issues, setIssues] = useState<SearchRequestIssue[]>([]);
  const { data: apiData, status: apiStatus } = useTourvisorData(state);
  const source = { ...apiData, ...dataSource };

  const departureCities = source.departureCities ?? [];
  const countries = source.countries ?? [];
  const regions = source.regions?.filter((region) => state.countryId === null || region.countryId === state.countryId) ?? [];
  const subregions = source.subregions?.filter((subregion) => !state.regionIds.length || state.regionIds.includes(subregion.regionId)) ?? [];
  const hotels = source.hotels ?? [];
  const visibleHotels = hotels.filter((hotel) => hotel.name.toLocaleLowerCase("ru").includes(hotelQuery.trim().toLocaleLowerCase("ru")));

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => { if (formRef.current && !formRef.current.contains(event.target as Node)) setActivePanel(null); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setActivePanel(null); };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  useLayoutEffect(() => {
    if (!activePanel) return;
    let frame = 0;
    let budgetScrollAdjusted = false;
    const positionPopover = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const popover = formRef.current?.querySelector<HTMLElement>(".tour-search-popover.is-open");
        const control = popover?.closest<HTMLElement>(".tour-search-control");
        if (!popover || !control) return;
        popover.classList.remove("is-above", "is-right-aligned");
        popover.style.removeProperty("max-height");
        if (window.innerWidth <= 520) return;
        const margin = 16;
        const gap = 12;
        const controlRect = control.getBoundingClientRect();
        const openAbove = activePanel === "budget";
        if (openAbove && !budgetScrollAdjusted) {
          const naturalHeight = Math.min(popover.scrollHeight, window.innerHeight - margin * 2);
          const missingSpace = naturalHeight + gap + margin - controlRect.top;
          if (missingSpace > 0 && window.scrollY > 0) {
            window.scrollBy({ top: -Math.min(missingSpace, window.scrollY), behavior: "auto" });
            budgetScrollAdjusted = true;
            positionPopover();
            return;
          }
          budgetScrollAdjusted = true;
        }
        popover.classList.toggle("is-above", openAbove);
        popover.classList.toggle("is-right-aligned", controlRect.left + popover.offsetWidth > window.innerWidth - margin);
        popover.style.maxHeight = `${Math.max(260, openAbove ? Math.min(popover.scrollHeight, window.innerHeight - margin * 2) : window.innerHeight - margin * 2)}px`;
      });
    };
    positionPopover();
    window.addEventListener("resize", positionPopover);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("resize", positionPopover); };
  }, [activePanel]);

  const openPanel = (panel: Exclude<SearchPanel, null>) => {
    if (activePanel === panel) return setActivePanel(null);
    if (panel === "dates") setDraftDates(state.departureDates);
    if (panel === "nights") setDraftNights(state.nights);
    if (panel === "tourists") { setDraftTourists(state.tourists); setActiveChildAge(null); }
    if (panel === "budget") setDraftBudget(state.budget.currency ? state.budget : { ...state.budget, currency: source.defaultCurrency ?? null });
    setIssues([]);
    setActivePanel(panel);
  };
  const close = () => setActivePanel(null);
  const apply = (panel: SearchPanel) => {
    if (panel === "dates") setState((current) => ({ ...current, departureDates: { from: draftDates.from, to: draftDates.to ?? draftDates.from } }));
    if (panel === "nights") setState((current) => ({ ...current, nights: { min: draftNights.min, max: draftNights.max ?? draftNights.min } }));
    if (panel === "tourists") setState((current) => ({ ...current, tourists: draftTourists }));
    if (panel === "budget") setState((current) => ({ ...current, budget: draftBudget }));
    close();
  };
  const panelProps = { activePanel, openPanel, close };
  const optionName = (options: SearchOption[], id: number | null, fallback: string) => options.find((option) => option.id === id)?.name ?? fallback;
  const budgetLabel = useMemo(() => {
    const values = [state.budget.min, state.budget.max].filter((value) => value !== null).join(" – ");
    return values ? `${values}${state.budget.currency ? ` ${state.budget.currency}` : ""}` : "Бюджет";
  }, [state.budget]);
  const toggleId = (key: "hotelTypeIds" | "hotelServiceIds" | "regionIds" | "subregionIds" | "hotelIds", id: number, limit = Number.POSITIVE_INFINITY) => setState((current) => {
    const values = current[key];
    const next = values.includes(id) ? values.filter((value) => value !== id) : values.length < limit ? [...values, id] : values;
    return { ...current, [key]: next };
  });

  const hasIssue = (...names: SearchRequestIssue[]) => names.some((name) => issues.includes(name));
  const submit = () => {
    close();
    const normalizedState = state.budget.currency || !source.defaultCurrency ? state : { ...state, budget: { ...state.budget, currency: source.defaultCurrency } };
    const result = toTourvisorSearchRequest(normalizedState);
    if (!result.ok) return setIssues(result.issues);
    setIssues([]);
    void onSearch(result.request, normalizedState);
  };

  return <form ref={formRef} className={`tour-search-form${progressive ? " is-progressive" : ""}${expanded ? " is-expanded" : ""}`} aria-label="Параметры поиска тура" onSubmit={(event) => { event.preventDefault(); submit(); }}>
    <fieldset className="tour-search-mode"><legend className="tour-search-visually-hidden">Тип поиска</legend><ModeOption checked={state.searchType === "flight"} onChange={() => setState((current) => ({ ...current, searchType: "flight" }))}>Туры с перелётом</ModeOption><ModeOption checked={state.searchType === "hotel"} onChange={() => setState((current) => ({ ...current, searchType: "hotel" }))}>Отели</ModeOption></fieldset>
    {hasIssue("unsupportedHotelOnlyMode") && <p className="tour-search-form-error" role="alert">Поиск только отелей потребует отдельного сервиса Tourvisor.</p>}
    <div className="tour-search-primary">
      <PopoverField invalid={hasIssue("departureId")} error="Выберите город" label="Город вылета" trigger={optionName(departureCities, state.departureId, "Город вылета")} panel="departure-city" {...panelProps}><DeparturePanel cities={departureCities} selectedId={state.departureId} onSelect={(departureId) => { setState((current) => ({ ...current, departureId, countryId: null, arrivalId: null, regionIds: [], subregionIds: [], hotelIds: [] })); close(); }} /></PopoverField>
      <PopoverField invalid={hasIssue("countryId")} error="Выберите страну" label="Страна" trigger={optionName(countries, state.countryId, "Страна")} panel="destination" {...panelProps}><SingleOptionPanel options={countries} value={state.countryId} onSelect={(countryId) => { setState((current) => ({ ...current, countryId, arrivalId: null, regionIds: [], subregionIds: [], hotelIds: [] })); close(); }} /></PopoverField>
      <PopoverField invalid={hasIssue("dates", "dateRange")} error="Выберите даты" label="Даты вылета" trigger={formatDates(state.departureDates)} panel="dates" {...panelProps}><CalendarPanel draft={draftDates} availableDates={source.availableDepartureDates} onChange={setDraftDates} month={calendarMonth} onMonthChange={setCalendarMonth} onCancel={close} onApply={() => apply("dates")} /></PopoverField>
      <PopoverField invalid={hasIssue("nights", "nightsRange")} error="Выберите ночи" label="Ночей" trigger={formatNights(state.nights)} panel="nights" {...panelProps}><NightsPanel draft={draftNights} onChange={setDraftNights} onCancel={close} onApply={() => apply("nights")} /></PopoverField>
      <PopoverField invalid={hasIssue("adults", "childrenCount", "childrenAges")} error="Укажите возраст детей" label="Туристы" trigger={formatTourists(state.tourists)} panel="tourists" {...panelProps}><TouristsPanel draft={draftTourists} onChange={setDraftTourists} activeAge={activeChildAge} onActiveAge={setActiveChildAge} onCancel={close} onApply={() => apply("tourists")} /></PopoverField>
    </div>
    {progressive && <button className="tour-search-progressive-toggle" type="button" aria-expanded={expanded} aria-controls="home-search-advanced" onClick={() => { close(); setExpanded((value) => !value); }}><span>{expanded ? "Скрыть параметры" : "Все параметры"}</span><i aria-hidden="true" /></button>}
    <div className="tour-search-filters" id={progressive ? "home-search-advanced" : undefined}>
      <StarField value={state.hotelCategory} onChange={(hotelCategory) => setState((current) => ({ ...current, hotelCategory }))} />
      <SelectField label="Тип отеля" valueLabel={selectionLabel(source.hotelTypes ?? [], state.hotelTypeIds, "Тип отеля")} panel="hotel-type" {...panelProps}><MultiOptionPanel options={source.hotelTypes ?? []} values={state.hotelTypeIds} onToggle={(id) => toggleId("hotelTypeIds", id)} /></SelectField>
      <SelectField label="Питание" valueLabel={optionName(source.meals ?? [], state.mealId, "Питание")} panel="meal" {...panelProps}><SingleOptionPanel options={source.meals ?? []} value={state.mealId} onSelect={(mealId) => { setState((current) => ({ ...current, mealId })); close(); }} /></SelectField>
      <SelectField label="Рейтинг" valueLabel={RATING_OPTIONS.find((option) => option.id === state.hotelRating)?.name ?? "Рейтинг"} panel="rating" {...panelProps}><SingleOptionPanel options={RATING_OPTIONS} value={state.hotelRating} onSelect={(hotelRating) => { setState((current) => ({ ...current, hotelRating: hotelRating as HotelRating })); close(); }} /></SelectField>
      <SelectField label="Расширенные фильтры" valueLabel={state.hotelServiceIds.length || state.arrivalId !== null || state.onlyDirect ? "Выбрано" : "Расширенные фильтры"} panel="advanced" {...panelProps}><div className="tour-search-select-options"><SingleOptionPanel options={source.arrivals ?? []} value={state.arrivalId} onSelect={(arrivalId) => setState((current) => ({ ...current, arrivalId }))} /><MultiOptionPanel options={source.hotelServices ?? []} values={state.hotelServiceIds} onToggle={(id) => toggleId("hotelServiceIds", id)} /><CheckField checked={state.onlyDirect} onChange={(onlyDirect) => setState((current) => ({ ...current, onlyDirect }))}>Только прямой перелёт</CheckField></div></SelectField>
    </div>
    <div className="tour-search-content"><fieldset className="tour-search-list"><legend>Курорты</legend><div className="tour-search-list__items">{regions.map((region) => <label key={`region-${region.id}`}><input type="checkbox" checked={state.regionIds.includes(region.id)} onChange={() => toggleId("regionIds", region.id)} /><span>{region.name}</span></label>)}{subregions.map((subregion) => <label key={`subregion-${subregion.id}`}><input type="checkbox" checked={state.subregionIds.includes(subregion.id)} onChange={() => toggleId("subregionIds", subregion.id)} /><span>{subregion.name}</span></label>)}</div></fieldset><section className="tour-search-hotels" aria-labelledby="tour-search-hotels-title"><h2 id="tour-search-hotels-title" className="tour-search-visually-hidden">Отели</h2><label className="tour-search-hotel-search"><span className="tour-search-visually-hidden">Отели</span><input type="search" value={hotelQuery} onChange={(event) => setHotelQuery(event.target.value)} placeholder="Отели" /></label><div className="tour-search-hotel-list">{visibleHotels.map((hotel) => <label key={hotel.id}><input type="checkbox" checked={state.hotelIds.includes(hotel.id)} disabled={!state.hotelIds.includes(hotel.id) && state.hotelIds.length >= 30} onChange={() => toggleId("hotelIds", hotel.id, 30)} /><span>{hotel.name}</span></label>)}</div></section></div>
    <div className="tour-search-bottom">
      <PopoverField invalid={hasIssue("currency", "budgetRange")} error="Выберите валюту" label="Бюджет" trigger={budgetLabel} panel="budget" selectStyle {...panelProps}><BudgetPanel draft={draftBudget} currencies={source.currencies ?? []} onChange={setDraftBudget} onCancel={close} onApply={() => apply("budget")} onClear={() => { const cleared = { min: null, max: null, currency: source.defaultCurrency ?? null }; setDraftBudget(cleared); setState((current) => ({ ...current, budget: cleared })); }} /></PopoverField>
      <CheckField checked={state.onlyCharter} onChange={(onlyCharter) => setState((current) => ({ ...current, onlyCharter }))}>Только чартер</CheckField>
      <CheckField checked={state.hotelGuarantee} onChange={(hotelGuarantee) => setState((current) => ({ ...current, hotelGuarantee }))}>Гарантия мест в отеле</CheckField>
      <button className="tour-search-submit" type="submit">Найти туры</button>
    </div>
    <div className="tour-search-api-status" aria-live="polite">{apiStatus === "not-configured" ? "Для запуска поиска требуется серверный ключ Tourvisor." : apiStatus === "error" ? "Не удалось загрузить параметры поиска." : ""}</div>
  </form>;
}

function selectionLabel(options: SearchOption[], values: number[], fallback: string) { if (!values.length) return fallback; if (values.length === 1) return options.find((option) => option.id === values[0])?.name ?? fallback; return `Выбрано: ${values.length}`; }
function ModeOption({ children, checked, onChange }: { children: React.ReactNode; checked: boolean; onChange: () => void }) { return <label className="tour-search-mode__option"><input type="radio" name="search-type" checked={checked} onChange={onChange} /><span>{children}</span></label>; }
function CheckField({ children, checked, onChange }: { children: React.ReactNode; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="tour-search-check"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{children}</span></label>; }

type PanelProps = { activePanel: SearchPanel; openPanel: (panel: Exclude<SearchPanel, null>) => void; close: () => void; panel: Exclude<SearchPanel, null>; children: React.ReactNode };
function PopoverField({ label, trigger, activePanel, openPanel, panel, children, selectStyle = false, invalid = false, error }: PanelProps & { label: string; trigger: string; selectStyle?: boolean; invalid?: boolean; error?: string }) { const isOpen = activePanel === panel; const errorId = `tour-search-${panel}-error`; return <div className={`tour-search-field tour-search-control${selectStyle ? " tour-search-select tour-search-select--budget" : ""}${isOpen ? " is-popover-active" : ""}${invalid ? " has-error" : ""}`}><span>{label}</span><button className={`tour-search-trigger${selectStyle ? " tour-search-trigger--select" : ""}`} type="button" aria-haspopup="dialog" aria-expanded={isOpen} aria-describedby={invalid ? errorId : undefined} onClick={() => openPanel(panel)}>{trigger}</button>{invalid && error && <small className="tour-search-field-error" id={errorId}>{error}</small>}{isOpen && <div className={`tour-search-popover is-open tour-search-${panel}`} role="dialog" aria-label={label}>{children}</div>}</div>; }
function SelectField({ label, valueLabel, activePanel, openPanel, panel, children }: PanelProps & { label: string; valueLabel: string }) { const isOpen = activePanel === panel; return <div className={`tour-search-select tour-search-control${isOpen ? " is-popover-active" : ""}`}><span>{label}</span><button className="tour-search-trigger tour-search-trigger--select" type="button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => openPanel(panel)}>{valueLabel}</button>{isOpen && <div className="tour-search-popover tour-search-select-popover is-open" role="listbox" aria-label={label}>{children}</div>}</div>; }
function SingleOptionPanel({ options, value, onSelect }: { options: SearchOption[]; value: number | null; onSelect: (id: number) => void }) { return <div className="tour-search-select-options">{options.map((option) => <button className={`tour-search-select-option${value === option.id ? " is-selected" : ""}`} type="button" role="option" aria-selected={value === option.id} key={option.id} onClick={() => onSelect(option.id)}>{option.name}</button>)}</div>; }
function MultiOptionPanel({ options, values, onToggle }: { options: SearchOption[]; values: number[]; onToggle: (id: number) => void }) { return <div className="tour-search-select-options">{options.map((option) => <button className={`tour-search-select-option${values.includes(option.id) ? " is-selected" : ""}`} type="button" role="option" aria-selected={values.includes(option.id)} key={option.id} onClick={() => onToggle(option.id)}>{option.name}</button>)}</div>; }
function StarField({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) { const [hover, setHover] = useState<number | null>(null); return <div className="tour-search-select tour-search-star-field" role="group" aria-label="Класс отеля"><span>Класс отеля</span><div className={`tour-search-stars${value ? " is-filling" : ""}`} data-value={value ?? undefined} data-hover={hover ?? undefined} onMouseLeave={() => setHover(null)}>{[1, 2, 3, 4, 5].map((star) => <button className="tour-search-star" key={star} type="button" aria-label={`${star} звезда`} aria-pressed={value === star} onMouseEnter={() => setHover(star)} onFocus={() => setHover(star)} onBlur={() => setHover(null)} onClick={() => onChange(value === star ? null : star)}><span aria-hidden="true">★</span></button>)}</div></div>; }
