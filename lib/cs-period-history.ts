export type StoredPeriodSnapshot = {
  brand: string;
  periodStart: string;
  periodEnd: string;
  spanDays: number;
  fteEquivalent: number;
  totalActions: number;
  uniqueUsers: number;
  conservativeValue: number;
  expectedValue: number;
  savedAt: string;
};

const STORAGE_KEY = "pxm-cs-period-snapshots";

function normalizeBrand(brand: string): string {
  return brand.trim().toLowerCase();
}

function periodKey(brand: string, periodStart: string, periodEnd: string): string {
  return `${normalizeBrand(brand)}::${periodStart}::${periodEnd}`;
}

export function readPeriodHistory(): StoredPeriodSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPeriodSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePeriodSnapshot(snapshot: StoredPeriodSnapshot): StoredPeriodSnapshot[] {
  if (typeof window === "undefined") return [];
  const history = readPeriodHistory().filter(
    (entry) =>
      periodKey(entry.brand, entry.periodStart, entry.periodEnd) !==
      periodKey(snapshot.brand, snapshot.periodStart, snapshot.periodEnd),
  );
  history.push(snapshot);
  history.sort(
    (a, b) => new Date(a.periodEnd).getTime() - new Date(b.periodEnd).getTime(),
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}

export function periodsForBrand(brand: string): StoredPeriodSnapshot[] {
  const key = normalizeBrand(brand);
  return readPeriodHistory()
    .filter((entry) => normalizeBrand(entry.brand) === key)
    .sort((a, b) => new Date(a.periodEnd).getTime() - new Date(b.periodEnd).getTime());
}

export type PeriodTrend = {
  previous: StoredPeriodSnapshot;
  current: StoredPeriodSnapshot;
  previousActionsPerDay: number;
  currentActionsPerDay: number;
  actionsPerDayChangePercent: number | null;
  previousActionsPerUserPerDay: number;
  currentActionsPerUserPerDay: number;
  actionsPerUserPerDayChangePercent: number | null;
  periodsDifferMaterially: boolean;
};

function percentChange(previous: number, current: number): number | null {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

export function buildPeriodTrend(
  previous: StoredPeriodSnapshot,
  current: StoredPeriodSnapshot,
): PeriodTrend {
  const previousActionsPerDay = previous.totalActions / previous.spanDays;
  const currentActionsPerDay = current.totalActions / current.spanDays;
  const previousActionsPerUserPerDay =
    previous.uniqueUsers > 0
      ? previousActionsPerDay / previous.uniqueUsers
      : 0;
  const currentActionsPerUserPerDay =
    current.uniqueUsers > 0 ? currentActionsPerDay / current.uniqueUsers : 0;

  return {
    previous,
    current,
    previousActionsPerDay,
    currentActionsPerDay,
    actionsPerDayChangePercent: percentChange(
      previousActionsPerDay,
      currentActionsPerDay,
    ),
    previousActionsPerUserPerDay,
    currentActionsPerUserPerDay,
    actionsPerUserPerDayChangePercent: percentChange(
      previousActionsPerUserPerDay,
      currentActionsPerUserPerDay,
    ),
    periodsDifferMaterially:
      Math.abs(current.spanDays - previous.spanDays) / previous.spanDays > 0.1,
  };
}

export function trendForPeriod(
  brand: string,
  periodStart: Date,
  periodEnd: Date,
): PeriodTrend | null {
  const periods = periodsForBrand(brand);
  const currentKey = periodKey(brand, periodStart.toISOString(), periodEnd.toISOString());
  const currentIndex = periods.findIndex(
    (entry) =>
      periodKey(entry.brand, entry.periodStart, entry.periodEnd) === currentKey,
  );
  const current =
    currentIndex >= 0 ? periods[currentIndex] : periods[periods.length - 1] ?? null;
  const previous =
    currentIndex > 0
      ? periods[currentIndex - 1]
      : periods.length >= 2
        ? periods[periods.length - 2]
        : null;

  if (!current || !previous || previous === current) return null;

  return buildPeriodTrend(previous, current);
}
