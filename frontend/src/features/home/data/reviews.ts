export interface TravelReview {
  destination: string;
  image?: string;
  name: string;
  sourceUrl: string;
  text: string;
}

const twoGisReviewsUrl = "https://2gis.kz/astana/firm/70000001082442688/tab/reviews";

export const travelReviews: TravelReview[] = [
  {
    name: "Айгерим Садвакасова",
    destination: "Турция · Вьетнам",
    text: "Отмечает постоянную связь с менеджером, оптимальные цены, удачный подбор отелей и сопровождение поездок.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Ирина А",
    destination: "Египет",
    text: "Благодарит менеджера Шухрата за профессиональный подбор тура и хорошую организацию поездки.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Rid Dik",
    destination: "Турция · Кемер · Swandor",
    text: "Высоко оценивает профессиональный подбор тура, сервис отеля, питание и пляж во время семейного отдыха.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Жанат Кушерова",
    destination: "Турция · Анталья · Ozkaymak",
    text: "Благодарит Анару за спокойный семейный отдых, помощь с бюджетом, отелем и экскурсионной программой.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Абылай Мухангали",
    destination: "Вьетнам",
    text: "Отмечает внимательную работу Асель: от первой консультации до сопровождения поездки и полезных рекомендаций.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Manatova Almira",
    destination: "Вьетнам · Нячанг · Red Sun",
    text: "Рассказывает о хорошо организованном отдыхе: удобном расположении отеля, учтённом бюджете и отсутствии неприятных сюрпризов.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Зарина Сабитова",
    destination: "Катар · Доха",
    text: "Отмечает удачный вариант по оптимальной цене и благодарит Анару за организацию отдыха.",
    sourceUrl: twoGisReviewsUrl,
  },
  {
    name: "Татьяна Лаудина",
    destination: "Турция",
    text: "Отмечает внимательный подбор отеля, понятное объяснение нюансов и сопровождение от бронирования до возвращения домой.",
    sourceUrl: twoGisReviewsUrl,
  },
];
