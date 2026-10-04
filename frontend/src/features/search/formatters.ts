import type { DateRange, NightsRange, TourSearchState } from "./types";

export const toIsoDate = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
export const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
export const sameDay = (a: Date | null, b: Date | null) => Boolean(a && b && toIsoDate(a) === toIsoDate(b));
export const formatMonth = (date: Date) => new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date);
export const formatDateShort = (date: Date) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date).replace(".", "");
export const formatDateLong = (date: Date) => new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(date);
export const formatAdults = (count: number) => count === 1 ? "1 взрослый" : `${count} взрослых`;
export const formatChildren = (count: number) => count === 0 ? "Дети" : count === 1 ? "1 ребёнок" : count <= 4 ? `${count} ребёнка` : `${count} детей`;
export const formatChildAge = (age: number) => age === 0 ? "до 1 года" : age === 1 ? "1 год" : age >= 2 && age <= 4 ? `${age} года` : `${age} лет`;
export const formatDates = ({ from, to }: DateRange) => from ? `${formatDateShort(parseIsoDate(from))} - ${formatDateShort(parseIsoDate(to ?? from))}` : "Даты вылета";
export const formatNights = ({ min, max }: NightsRange) => min ? `${min} - ${max ?? min}` : "Ночей";
export const formatTourists = (tourists: TourSearchState["tourists"]) => tourists.childrenAges.length ? `${formatAdults(tourists.adults)}, ${formatChildren(tourists.childrenAges.length)}` : formatAdults(tourists.adults);
