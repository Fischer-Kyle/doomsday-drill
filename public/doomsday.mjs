export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function weekdayIndex(year, month, day) {
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = month < 3 ? year - 1 : year;
  return (
    adjustedYear +
    Math.floor(adjustedYear / 4) -
    Math.floor(adjustedYear / 100) +
    Math.floor(adjustedYear / 400) +
    offsets[month - 1] +
    day
  ) % 7;
}

export function doomsdayCalculation(year, month, day) {
  const century = Math.floor(year / 100);
  const centuryAnchor = (5 * (century % 4) + 2) % 7;
  const shortYear = year % 100;
  const dozens = Math.floor(shortYear / 12);
  const remainder = shortYear % 12;
  const fours = Math.floor(remainder / 4);
  const yearSum = dozens + remainder + fours;
  const doomsday = (centuryAnchor + yearSum) % 7;

  const referenceDays = [
    isLeapYear(year) ? 4 : 3,
    isLeapYear(year) ? 29 : 28,
    14,
    4,
    9,
    6,
    11,
    8,
    5,
    10,
    7,
    12,
  ];
  const referenceDay = referenceDays[month - 1];
  const offset = day - referenceDay;
  const normalizedOffset = ((offset % 7) + 7) % 7;
  const answer = (doomsday + normalizedOffset) % 7;

  return {
    year,
    month,
    day,
    century,
    centuryAnchor,
    shortYear,
    dozens,
    remainder,
    fours,
    yearSum,
    doomsday,
    referenceDay,
    offset,
    normalizedOffset,
    answer,
  };
}

export function randomDate(minYear = 1900, maxYear = 2099, previousDate = null) {
  const start = Date.UTC(minYear, 0, 1);
  const end = Date.UTC(maxYear + 1, 0, 1);
  const totalDays = Math.round((end - start) / 86_400_000);
  let candidate;
  let attempts = 0;

  do {
    const offset = Math.floor(Math.random() * totalDays);
    const date = new Date(start + offset * 86_400_000);
    candidate = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    };
    attempts += 1;
  } while (
    previousDate &&
    attempts < 8 &&
    candidate.year === previousDate.year &&
    candidate.month === previousDate.month &&
    candidate.day === previousDate.day
  );

  return candidate;
}

export function formatDate({ year, month, day }) {
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function explanationSteps(date) {
  const result = doomsdayCalculation(date.year, date.month, date.day);
  const era = `${result.century}00s`;
  const offsetText = result.offset >= 0 ? `+${result.offset}` : `${result.offset}`;
  const normalizedText = result.normalizedOffset === 0 ? "0" : `+${result.normalizedOffset}`;

  return [
    `<strong>Century anchor:</strong> ${era} → ${WEEKDAYS[result.centuryAnchor]}.`,
    `<strong>Year sum:</strong> ⌊${result.shortYear} ÷ 12⌋ = ${result.dozens}; remainder ${result.remainder}; ⌊${result.remainder} ÷ 4⌋ = ${result.fours}. Total = ${result.yearSum}.`,
    `<strong>${result.year} Doomsday:</strong> ${WEEKDAYS[result.centuryAnchor]} + ${result.yearSum} ≡ ${WEEKDAYS[result.doomsday]}.`,
    `<strong>Monthly anchor:</strong> ${MONTHS[result.month - 1]} ${result.referenceDay} is a ${WEEKDAYS[result.doomsday]}.`,
    `<strong>Date offset:</strong> ${result.day} − ${result.referenceDay} = ${offsetText} days ≡ ${normalizedText} mod 7 → <strong>${WEEKDAYS[result.answer]}</strong>.`,
  ];
}
