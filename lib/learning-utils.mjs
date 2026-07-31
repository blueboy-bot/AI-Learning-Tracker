export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDatesInCurrentMonth(date = new Date()) {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from(
    { length: daysInMonth },
    (_, index) => getLocalDateString(new Date(date.getFullYear(), date.getMonth(), index + 1)),
  );
}

export function calculateStreak(entries, referenceDate = new Date()) {
  const days = new Set(entries.map((entry) => entry.date));
  const cursor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  let streak = 0;

  while (days.has(getLocalDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getElapsedSeconds(savedSeconds, startedAt, now = Date.now()) {
  if (!startedAt) return savedSeconds;
  return savedSeconds + Math.max(0, Math.floor((now - startedAt) / 1000));
}

export function parseStoredJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
