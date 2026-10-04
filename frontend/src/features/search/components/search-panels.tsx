"use client";

import { useMemo } from "react";

import { groupDepartureCities } from "../data-adapters";
import { addDays, formatChildAge, formatDateLong, formatMonth, parseIsoDate, sameDay, startOfDay, toIsoDate } from "../formatters";
import type { BudgetState, CurrencyOption, DateRange, NightsRange, SearchOption, TourSearchState } from "../types";

type Actions = { onCancel: () => void; onApply: () => void };

export function PanelActions({ onCancel, onApply }: Actions) {
  return <div className="tour-search-popover__actions"><button className="tour-search-secondary-btn" type="button" onClick={onCancel}>Отмена</button><button className="tour-search-apply-btn" type="button" onClick={onApply}>Выбрать</button></div>;
}

export function DeparturePanel({ cities, selectedId, onSelect }: { cities: SearchOption[]; selectedId: number | null; onSelect: (id: number) => void }) {
  const groups = useMemo(() => groupDepartureCities(cities), [cities]);
  return <div className="tour-search-departure-city"><div className="tour-search-departure-city__content" role="listbox" aria-label="Города вылета">{groups.map((group) => <div key={group.letter} className="tour-search-departure-city__column"><i>{group.letter}</i>{group.cities.map((city) => <button key={city.id} type="button" role="option" className={selectedId === city.id ? "is-highlighted" : undefined} aria-selected={selectedId === city.id} onClick={() => onSelect(city.id)}>{city.name}</button>)}</div>)}</div></div>;
}

export function CalendarPanel({ draft, availableDates, onChange, onCancel, onApply, month, onMonthChange }: { draft: DateRange; availableDates?: string[]; onChange: (value: DateRange) => void; onCancel: () => void; onApply: () => void; month: Date; onMonthChange: (value: Date) => void }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const available = useMemo(() => availableDates ? new Set(availableDates) : null, [availableDates]);
  const months = [month, new Date(month.getFullYear(), month.getMonth() + 1, 1)];
  const selectDate = (date: Date) => {
    if (!draft.from || draft.to) return onChange({ from: toIsoDate(date), to: null });
    const first = parseIsoDate(draft.from);
    const min = first <= date ? first : date;
    const candidate = first <= date ? date : first;
    const max = addDays(min, 20);
    onChange({ from: toIsoDate(min), to: toIsoDate(candidate > max ? max : candidate) });
  };
  return <div className="tour-search-calendar"><div className="tour-search-popover__head"><button className="tour-search-icon-btn" type="button" aria-label="Предыдущий месяц" data-calendar-prev disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} /><div className="tour-search-calendar__titles" aria-live="polite">{months.map((item) => <div key={item.toISOString()}>{formatMonth(item)}<span>{item.getFullYear()}</span></div>)}</div><button className="tour-search-icon-btn" type="button" aria-label="Следующий месяц" data-calendar-next onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} /></div><div className="tour-search-calendar__grid">{months.map((item) => <Month key={item.toISOString()} month={item} today={today} available={available} range={draft} onSelect={selectDate} />)}</div><PanelActions onCancel={onCancel} onApply={onApply} /></div>;
}

function Month({ month, today, available, range, onSelect }: { month: Date; today: Date; available: Set<string> | null; range: DateRange; onSelect: (date: Date) => void }) {
  const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const from = range.from ? parseIsoDate(range.from) : null;
  const to = range.to ? parseIsoDate(range.to) : null;
  return <div className="tour-search-month"><div className="tour-search-weekdays">{"пн вт ср чт пт сб вс".split(" ").map((day) => <span key={day}>{day}</span>)}</div><div className="tour-search-days">{Array.from({ length: offset }).map((_, index) => <span key={`space-${index}`} />)}{Array.from({ length: total }).map((_, index) => { const date = new Date(month.getFullYear(), month.getMonth(), index + 1); const selected = sameDay(date, from) && !to; const edge = sameDay(date, from) || sameDay(date, to); const inRange = Boolean(from && to && date > from && date < to); const unavailable = available !== null && !available.has(toIsoDate(date)); return <button key={index} type="button" className={`tour-search-date-btn${selected ? " is-selected" : ""}${edge ? " is-range-edge" : ""}${inRange ? " is-in-range" : ""}`} disabled={date < today || unavailable} aria-label={formatDateLong(date)} onClick={() => onSelect(date)}>{index + 1}</button>; })}</div></div>;
}

export function NightsPanel({ draft, onChange, onCancel, onApply }: { draft: NightsRange; onChange: (value: NightsRange) => void; onCancel: () => void; onApply: () => void }) {
  const choose = (night: number) => onChange(!draft.min || draft.max ? { min: night, max: null } : { min: Math.min(draft.min, night), max: Math.max(draft.min, night) });
  return <div className="tour-search-nights"><p className="tour-search-popover__title">Ночей от:</p><div className="tour-search-number-grid">{Array.from({ length: 28 }).map((_, index) => { const value = index + 1; const unavailable = draft.min !== null && draft.max === null && Math.abs(value - draft.min) > 10; return <button key={value} type="button" className={`tour-search-age-btn${value === draft.min || value === draft.max ? " is-selected" : ""}`} aria-pressed={value === draft.min || value === draft.max} disabled={unavailable} onClick={() => choose(value)}>{value}</button>; })}</div><PanelActions onCancel={onCancel} onApply={onApply} /></div>;
}

export function TouristsPanel({ draft, onChange, onCancel, onApply, activeAge, onActiveAge }: { draft: TourSearchState["tourists"]; onChange: (value: TourSearchState["tourists"]) => void; onCancel: () => void; onApply: () => void; activeAge: number | null; onActiveAge: (index: number | null) => void }) {
  const updateAdults = (delta: number) => onChange({ ...draft, adults: Math.min(6, Math.max(1, draft.adults + delta)) });
  const updateChildren = (delta: number) => { const ages = [...draft.childrenAges]; if (delta > 0 && ages.length < 3) ages.push(null); else if (delta < 0) ages.pop(); if (activeAge !== null && activeAge >= ages.length) onActiveAge(null); onChange({ ...draft, childrenAges: ages }); };
  return <div className="tour-search-tourists"><p className="tour-search-popover__title">Туристы</p><Counter label={`${draft.adults} взрослый`} onMinus={() => updateAdults(-1)} onPlus={() => updateAdults(1)} minusDisabled={draft.adults <= 1} plusDisabled={draft.adults >= 6} /><Counter label={draft.childrenAges.length ? `${draft.childrenAges.length} дети` : "Дети"} onMinus={() => updateChildren(-1)} onPlus={() => updateChildren(1)} minusDisabled={!draft.childrenAges.length} plusDisabled={draft.childrenAges.length >= 3} />{draft.childrenAges.length > 0 && <div className="tour-search-children-ages"><div className="tour-search-child-list">{draft.childrenAges.map((age, index) => <div className={`tour-search-child-row${activeAge === index ? " is-active" : ""}`} key={index}><span>Ребёнок {index + 1}</span><button type="button" className="tour-search-child-age-trigger" aria-expanded={activeAge === index} onClick={() => onActiveAge(activeAge === index ? null : index)}>{age === null ? "Не выбран" : formatChildAge(age)}</button></div>)}</div>{activeAge !== null && <div className="tour-search-child-age-picker"><div className="tour-search-age-grid">{Array.from({ length: 18 }).map((_, age) => <button type="button" key={age} className={`tour-search-age-btn${draft.childrenAges[activeAge] === age ? " is-selected" : ""}`} onClick={() => { const ages = [...draft.childrenAges]; ages[activeAge] = age; onChange({ ...draft, childrenAges: ages }); onActiveAge(null); }}>{formatChildAge(age)}</button>)}</div></div>}</div>}<PanelActions onCancel={onCancel} onApply={onApply} /></div>;
}

function Counter({ label, onMinus, onPlus, minusDisabled, plusDisabled }: { label: string; onMinus: () => void; onPlus: () => void; minusDisabled: boolean; plusDisabled: boolean }) { return <div className="tour-search-counter"><button className="tour-search-stepper" type="button" aria-label={`Уменьшить: ${label}`} disabled={minusDisabled} onClick={onMinus}>−</button><span>{label}</span><button className="tour-search-stepper" type="button" aria-label={`Увеличить: ${label}`} disabled={plusDisabled} onClick={onPlus}>+</button></div>; }

export function BudgetPanel({ draft, currencies, onChange, onCancel, onApply, onClear }: { draft: BudgetState; currencies: CurrencyOption[]; onChange: (value: BudgetState) => void; onCancel: () => void; onApply: () => void; onClear: () => void }) {
  const invalid = Boolean(draft.min && draft.max && Number(draft.min) > Number(draft.max));
  const numberInput = (key: "min" | "max") => (event: React.ChangeEvent<HTMLInputElement>) => { const digits = event.target.value.replace(/\D/g, ""); onChange({ ...draft, [key]: digits ? Number(digits) : null }); };
  return <div className={`tour-search-budget${invalid ? " has-invalid-range" : ""}`}><div className="tour-search-budget__head"><p className="tour-search-popover__title">Бюджет</p><button className="tour-search-budget__clear" type="button" onClick={onClear}>Очистить</button></div><div className="tour-search-budget__range"><label className="tour-search-budget__input"><span>Минимальный бюджет</span><input value={draft.min ?? ""} inputMode="numeric" min="0" aria-invalid={invalid} onChange={numberInput("min")} /></label><label className="tour-search-budget__input"><span>Максимальный бюджет</span><input value={draft.max ?? ""} inputMode="numeric" min="0" aria-invalid={invalid} onChange={numberInput("max")} /></label></div>{currencies.length > 0 && <fieldset className="tour-search-budget__currency"><legend>Валюта</legend>{currencies.map((currency) => <label className="tour-search-budget__radio" key={currency.id}><input type="radio" name="budget-currency" checked={draft.currency === currency.id} onChange={() => onChange({ ...draft, currency: currency.id })} /><span aria-hidden="true" /><i>{currency.name}</i></label>)}</fieldset>}<div className="tour-search-popover__actions"><button className="tour-search-secondary-btn" type="button" onClick={onCancel}>Отмена</button><button className="tour-search-apply-btn tour-search-budget__apply" type="button" disabled={invalid} onClick={onApply}>Применить</button></div></div>;
}
