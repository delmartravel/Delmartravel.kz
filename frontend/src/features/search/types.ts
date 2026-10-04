export type SearchPanel =
  | "departure-city"
  | "destination"
  | "dates"
  | "nights"
  | "tourists"
  | "hotel-type"
  | "meal"
  | "rating"
  | "advanced"
  | "budget"
  | null;

export type DateRange = { from: string | null; to: string | null };
export type NightsRange = { min: number | null; max: number | null };
export type BudgetState = { min: number | null; max: number | null; currency: string | null };
export type HotelRating = 0 | 2 | 3 | 4 | 5;

export type TourSearchState = {
  searchType: "flight" | "hotel" | null;
  departureId: number | null;
  countryId: number | null;
  departureDates: DateRange;
  nights: NightsRange;
  tourists: { adults: number; childrenAges: Array<number | null> };
  mealId: number | null;
  hotelCategory: number | null;
  hotelTypeIds: number[];
  hotelIds: number[];
  hotelServiceIds: number[];
  hotelRating: HotelRating | null;
  arrivalId: number | null;
  regionIds: number[];
  subregionIds: number[];
  budget: BudgetState;
  onlyCharter: boolean;
  onlyDirect: boolean;
  hotelGuarantee: boolean;
};

export const initialSearchState: TourSearchState = {
  searchType: "flight",
  departureId: null,
  countryId: null,
  departureDates: { from: null, to: null },
  nights: { min: null, max: null },
  tourists: { adults: 1, childrenAges: [] },
  mealId: null,
  hotelCategory: null,
  hotelTypeIds: [],
  hotelIds: [],
  hotelServiceIds: [],
  hotelRating: null,
  arrivalId: null,
  regionIds: [],
  subregionIds: [],
  budget: { min: null, max: null, currency: null },
  onlyCharter: false,
  onlyDirect: false,
  hotelGuarantee: false,
};

export type SearchOption = { id: number; name: string };
export type CurrencyOption = { id: string; name: string };
export type RegionOption = SearchOption & { countryId: number };
export type SubregionOption = SearchOption & { regionId: number };
export type HotelOption = SearchOption & { regionId?: number };

/** Dictionaries are supplied by Tourvisor later; this interface contains no local catalogue data. */
export type TourSearchDataSource = {
  defaultCurrency?: string;
  availableDepartureDates?: string[];
  departureCities?: SearchOption[];
  countries?: SearchOption[];
  arrivals?: SearchOption[];
  regions?: RegionOption[];
  subregions?: SubregionOption[];
  hotels?: HotelOption[];
  hotelTypes?: SearchOption[];
  meals?: SearchOption[];
  hotelServices?: SearchOption[];
  currencies?: CurrencyOption[];
};

export type TourvisorSearchRequest = {
  departureId: number;
  countryId: number;
  dateFrom: string;
  dateTo: string;
  nightsFrom: number;
  nightsTo: number;
  adults: number;
  childs?: number[];
  meal?: number;
  hotelCategory?: number;
  hotelTypes?: number[];
  hotelIds?: number[];
  hotelServices?: number[];
  hotelRating?: HotelRating;
  arrivalId?: number;
  regionIds?: number[];
  subregionIds?: number[];
  priceFrom?: number;
  priceTo?: number;
  currency: string;
  onlyCharter: boolean;
  onlyDirect?: boolean;
};

export type TourvisorTourResult = {
  id: string;
  name: string;
  date: string;
  nights: number;
  adults: number;
  childrenCount: number;
  price: number;
  currency: string;
  roomType: string;
  roomId: number | null;
  placement: string;
  meal: { id: number; name: string; russianName?: string } | null;
  hotelPlace: number | null;
  flightNights: number;
  flightPlace: number | null;
  fuelCharge: number;
  isCharter: boolean;
  isPromo: boolean;
};

export type TourvisorHotelResult = {
  id: number;
  name: string;
  category: number;
  rating: number;
  price: number;
  currency: string;
  pictureUrl: string | null;
  description: string | null;
  hasDescription: boolean;
  hasPictures: boolean;
  latitude: number | null;
  longitude: number | null;
  seaDistance: number | null;
  country: { id: number; name: string } | null;
  region: { id: number; name: string } | null;
  subregion: { id: number; name: string } | null;
  tours: TourvisorTourResult[];
};

export type TourvisorHotelDetails = {
  id: number | null;
  name: string;
  category: number | null;
  rating: number | null;
  country: { id: number; name: string } | null;
  region: { id: number; name: string } | null;
  subRegion: { id: number; name: string } | null;
  images: string[];
  common: {
    address: string;
    build: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    place: string;
    repair: string;
    square: string;
  };
  infrastructure: { beach: string; territory: string };
  meals: { description: string; list: string };
  roomTypes: string;
  services: { animation: string; available: string; child: string; free: string; inRoom: string; servicesPay: string };
};

export type TourvisorRoomDetails = {
  id: number;
  name: string;
  area: number | null;
  bedroomCount: number | null;
  roomCount: number | null;
  comment: string;
  description: string;
  location: string;
  services: string;
  sleepingPlaces: string;
  viewDescription: string;
  hasBalcony: boolean;
  hasKitchen: boolean;
  images: string[];
};
