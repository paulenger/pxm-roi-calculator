export type CsActivityCategory =
  | "content"
  | "bulk"
  | "automation"
  | "asset"
  | "syndication"
  | "import"
  | "adoption"
  | "other";

export type CsActivityRow = {
  date: Date;
  user: string;
  hostname: string;
  count: number;
  action: string;
  category: CsActivityCategory;
  automated: boolean;
};

export type ActionBreakdown = {
  action: string;
  category: CsActivityCategory;
  count: number;
  events: number;
  automatedCount: number;
  humanCount: number;
};

/** Dollarized activity families with automation excluded per type. */
export type AutomationExclusionByType = {
  label: string;
  totalCount: number;
  automatedExcluded: number;
  humanCount: number;
};

export type CsActivitySummary = {
  brand: string;
  periodStart: Date;
  periodEnd: Date;
  spanDays: number;
  rows: number;
  totalActions: number;
  uniqueUsers: number;
  automatedActions: number;
  byAction: Record<string, number>;
  byCategory: Record<CsActivityCategory, number>;
  breakdown: ActionBreakdown[];
  automationByType: AutomationExclusionByType[];
};

export type ReportingPeriod = {
  start: Date;
  end: Date;
};

export type CsValueAssumptions = {
  hourlyRate: number;
  contentMinutesSaved: number;
  bulkSecondsSaved: number;
  bulkRealizationPercent: number;
  /**
   * False means the realized share is Pattern's planning assumption. True means
   * a CSM sampled the raw export and classified manual edits vs bulk imports vs
   * automated write-backs. The report says which, because an assumed ratio and
   * a measured one do not deserve the same confidence in a renewal conversation.
   */
  realizationMeasured: boolean;
  /** Required when realizationMeasured is true. */
  realizationSampleNote: string;
  hourlyRateConfirmed: boolean;
  assetMinutesSaved: number;
  syndicationMinutesSaved: number;
  annualPxmInvestment: number;
};

export type CsScenarioKey = "conservative" | "expected" | "upper";

export type CsScenario = {
  key: CsScenarioKey;
  label: string;
  realizationPercent: number;
  secondsPerRecord: number;
  assetMinutes: number;
  syndicationMinutes: number;
  totalHours: number;
  periodValue: number;
  periodRoi: number | null;
  annualizedValue: number;
  paybackMonths: number | null;
  fteEquivalent: number;
};

/**
 * The record-volume assumptions are the disputed ones, so the report shows a
 * band instead of a single point. Multipliers are applied to whatever the CSM
 * entered as the expected case, so the band moves with their inputs.
 */
const SCENARIO_SHAPE: Record<
  CsScenarioKey,
  { label: string; realization: number; minutes: number }
> = {
  conservative: { label: "Conservative", realization: 0.4, minutes: 0.5 },
  expected: { label: "Expected", realization: 1, minutes: 1 },
  upper: { label: "Upper bound", realization: 1.6, minutes: 1.5 },
};

export type CsValueResult = {
  contentHours: number;
  bulkHours: number;
  assetHours: number;
  syndicationHours: number;
  totalHours: number;
  contentValue: number;
  bulkValue: number;
  assetValue: number;
  syndicationValue: number;
  periodValue: number;
  periodCost: number;
  periodNetValue: number;
  periodRoi: number | null;
  annualizedValue: number;
  annualizedNetValue: number;
  annualizedRoi: number | null;
  paybackMonths: number | null;
  billableBulkCount: number;
  fteEquivalent: number;
  fteCeiling: number;
  overCapacity: boolean;
  scenarios: CsScenario[];
  /**
   * True when the export carries a lot of record volume but almost none of it
   * is attributable to an API or system actor. That means the export does not
   * label automation, not that automation is absent, so the report must not
   * claim automated volume was excluded.
   */
  compositionUnverified: boolean;
  automationSharePercent: number;
  /** False when the export cannot separate manual record edits from bulk/API volume. */
  recordsDollarized: boolean;
  recordMaintenanceCount: number;
};

const EMPTY_CATEGORIES: Record<CsActivityCategory, number> = {
  content: 0,
  bulk: 0,
  automation: 0,
  asset: 0,
  syndication: 0,
  import: 0,
  adoption: 0,
  other: 0,
};

/**
 * The Count column does not mean the same thing on every tab. On Shares and
 * Downloads it counts human tasks. On Updates it counts records and attributes
 * touched, which a single bulk edit or API push can run into the thousands.
 *
 * Trust rule: API and System Generated volume is throughput, not labor saved.
 * It is counted and shown, but never converted to dollars. Only human-driven
 * activity is dollarized, and human record volume is still priced per record
 * rather than per task.
 */
export function classifyAction(action: string, automated = false): CsActivityCategory {
  const value = action.trim().toLowerCase();

  // Machine-run and API volume is throughput. Do not convert it to labor dollars.
  if (automated || isApiAction(value)) return "automation";

  if (
    value.includes("syndicat") ||
    value.includes("publish to channel") ||
    value.includes("channel publish")
  ) {
    return "syndication";
  }
  if (
    value.includes("download") ||
    value.includes("share") ||
    value.includes("asset request")
  ) {
    return "asset";
  }
  if (value.includes("import")) return "import";
  if (value.includes("attribute") || value.includes("update")) {
    return "bulk";
  }
  if (
    value.includes("collection folder") ||
    value.includes("media added") ||
    value.includes("media removed")
  ) {
    return "content";
  }
  if (value.includes("active user") || value === "login") return "adoption";
  return "other";
}

const AUTOMATION_USERS = new Set([
  "system generated",
  "system",
  "api",
  "integration",
  "scheduler",
  "scheduled report",
  "automation",
]);

function isApiAction(value: string): boolean {
  return (
    value.includes("api update") ||
    value.includes("api created") ||
    value.includes("api pull") ||
    /\bapi\b/.test(value)
  );
}

/** Maps export action names to the families shown in the breakdown table. */
function actionFamily(action: string): string {
  const value = action.trim().toLowerCase();
  if (value.includes("attribute") || value.includes("update")) return "Updates";
  if (value.includes("file download")) return "File Downloads";
  if (value.includes("product download")) return "Product Downloads";
  if (value.includes("share")) return "Shares";
  if (value.includes("syndicat") || value.includes("publish to channel")) {
    return "Syndications";
  }
  if (value.includes("import")) return "Imports";
  if (value.includes("product created")) return "Products Created";
  if (value.includes("file uploaded") || value.includes("upload")) return "Files Uploaded";
  if (value.includes("collection") || value.includes("media")) return "Content ops";
  return "Other";
}

export function isAutomatedActor(user: string, action = ""): boolean {
  const actor = user.trim().toLowerCase();
  if (!actor) return isApiAction(action.toLowerCase());
  if (AUTOMATION_USERS.has(actor)) return true;
  if (actor.includes("system generated") || actor.startsWith("system ")) return true;
  return isApiAction(action.toLowerCase());
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function headerIndex(headers: string[], names: string[]): number {
  for (const name of names) {
    const index = headers.indexOf(name);
    if (index >= 0) return index;
  }
  return -1;
}

function cellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function cellDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel serial date
    const parsed = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const text = cellString(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function cellCount(value: unknown): number {
  if (value === null || value === undefined || value === "") return 1;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(cellString(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 1;
}

// "Active Users" rolls up the other tabs, so counting it would double the totals.
const SKIP_SHEETS = new Set(["active users"]);

// A rejected or failed push is not labor saved, so it stays context-only.
const FAILED_STATUSES = new Set(["rejected", "api failure", "failed", "error"]);

export function parseActivityTable(
  headers: string[],
  records: unknown[][],
  fallbackAction = "",
): CsActivityRow[] {
  const normalized = headers.map((header) => normalizeHeader(String(header ?? "")));
  const dateIndex = headerIndex(normalized, ["date", "timestamp", "activity date"]);
  const userIndex = headerIndex(normalized, [
    "user",
    "user name",
    "sender",
    "user email",
  ]);
  const hostIndex = headerIndex(normalized, ["hostname", "host", "domain", "brand"]);
  const countIndex = headerIndex(normalized, ["count", "processed count"]);
  const actionIndex = headerIndex(normalized, [
    "action",
    "update action",
    "share type",
    "syndication type",
    "status",
  ]);
  const statusIndex = headerIndex(normalized, ["status"]);

  const parsed: CsActivityRow[] = [];
  for (const record of records) {
    if (!Array.isArray(record)) continue;
    const date =
      dateIndex >= 0 ? cellDate(record[dateIndex]) : cellDate(record[0]);
    const action = (
      (actionIndex >= 0 ? cellString(record[actionIndex]) : "") || fallbackAction
    ).trim();
    if (!date || !action) continue;
    const count = countIndex >= 0 ? cellCount(record[countIndex]) : 1;
    if (!Number.isFinite(count) || count < 0) continue;
    const failed =
      statusIndex >= 0 &&
      FAILED_STATUSES.has(cellString(record[statusIndex]).toLowerCase());
    const user =
      userIndex >= 0 ? cellString(record[userIndex]).replace(/\s+/g, " ") : "";
    const combined = `${fallbackAction} ${action}`.trim();
    const automated = isAutomatedActor(user, combined);
    parsed.push({
      date,
      user,
      hostname: hostIndex >= 0 ? cellString(record[hostIndex]) : "",
      count,
      action,
      category: failed ? "other" : classifyAction(combined, automated),
      automated,
    });
  }
  return parsed;
}

function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) records.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) records.push(row);
  return records;
}

export function parseActivityCsv(text: string): CsActivityRow[] {
  const records = parseCsvRecords(text);
  if (records.length < 2) throw new Error("The CSV has no activity rows.");
  const parsed = parseActivityTable(records[0], records.slice(1));
  if (!parsed.length) {
    throw new Error("No valid activity rows were found. Check the date, count, and action values.");
  }
  return parsed;
}

export function parseActivitySheets(
  sheets: { name: string; rows: unknown[][] }[],
): CsActivityRow[] {
  const parsed = sheets.flatMap(({ name, rows }) => {
    if (!rows.length) return [];
    if (SKIP_SHEETS.has(name.trim().toLowerCase())) return [];
    const header = (rows[0] ?? []).map((value) => String(value ?? ""));
    const body = rows.slice(1).filter((row) =>
      row.some((value) => value !== null && value !== undefined && value !== ""),
    );
    return parseActivityTable(header, body, name);
  });
  if (!parsed.length) {
    throw new Error(
      "No recognizable activity sheets were found. Expected tabs such as Updates, Shares, File Downloads, or Syndications.",
    );
  }
  return parsed;
}

/**
 * Active Users is excluded from value because it rolls up the other tabs, but it
 * is the authoritative roster of people who actually used PXM in the period.
 */
export function extractRosterUsers(
  sheets: { name: string; rows: unknown[][] }[],
): string[] {
  const names: string[] = [];
  for (const { name, rows } of sheets) {
    if (!SKIP_SHEETS.has(name.trim().toLowerCase()) || !rows.length) continue;
    const headers = (rows[0] ?? []).map((value) =>
      normalizeHeader(String(value ?? "")),
    );
    const nameIndex = headerIndex(headers, ["user name", "user", "name"]);
    if (nameIndex < 0) continue;
    for (const row of rows.slice(1)) {
      const value = cellString(row?.[nameIndex]).replace(/\s+/g, " ");
      if (value) names.push(value);
    }
  }
  return names;
}

export function reportingPeriodFromFilenames(names: string[]): ReportingPeriod | null {
  const periods = names.flatMap((name) => {
    const match = name.match(/(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})/i);
    if (!match) return [];
    const start = new Date(`${match[1]}T00:00:00`);
    // Activity exports use an exclusive upper bound in their filename:
    // 2026-07-04-to-2026-09-01 displays as Jul 4–Aug 31 (59 days).
    const endExclusive = new Date(`${match[2]}T00:00:00`);
    const end = new Date(endExclusive.getTime() - 86_400_000);
    return Number.isNaN(start.getTime()) || Number.isNaN(endExclusive.getTime())
      ? []
      : [{ start, end }];
  });
  if (!periods.length) return null;
  return {
    start: new Date(Math.min(...periods.map((period) => period.start.getTime()))),
    end: new Date(Math.max(...periods.map((period) => period.end.getTime()))),
  };
}

export function summarizeActivity(
  rows: CsActivityRow[],
  reportingPeriod?: ReportingPeriod | null,
  rosterUsers?: string[],
): CsActivitySummary {
  if (!rows.length) throw new Error("No activity rows to summarize.");
  const dates = rows.map((row) => row.date.getTime());
  const periodStart = reportingPeriod?.start ?? new Date(Math.min(...dates));
  const periodEnd = reportingPeriod?.end ?? new Date(Math.max(...dates));
  const spanDays =
    Math.max(0, Math.round((periodEnd.getTime() - periodStart.getTime()) / 86_400_000)) + 1;
  const byAction: Record<string, number> = {};
  const byCategory = { ...EMPTY_CATEGORIES };
  const breakdownByAction = new Map<string, ActionBreakdown>();
  const automationByFamily = new Map<string, AutomationExclusionByType>();

  for (const row of rows) {
    byAction[row.action] = (byAction[row.action] || 0) + row.count;
    byCategory[row.category] += row.count;
    const key = `${row.action}::${row.category}`;
    const entry =
      breakdownByAction.get(key) ??
      {
        action: row.action,
        category: row.category,
        count: 0,
        events: 0,
        automatedCount: 0,
        humanCount: 0,
      };
    entry.count += row.count;
    entry.events += 1;
    if (row.automated) {
      entry.automatedCount += row.count;
    } else {
      entry.humanCount += row.count;
    }
    breakdownByAction.set(key, entry);

    const family = actionFamily(row.action);
    const familyEntry =
      automationByFamily.get(family) ??
      { label: family, totalCount: 0, automatedExcluded: 0, humanCount: 0 };
    familyEntry.totalCount += row.count;
    if (row.automated) {
      familyEntry.automatedExcluded += row.count;
    } else {
      familyEntry.humanCount += row.count;
    }
    automationByFamily.set(family, familyEntry);
  }

  const hostnames = [...new Set(rows.map((row) => row.hostname).filter(Boolean))];
  const people = new Set(
    [...rows.map((row) => row.user), ...(rosterUsers ?? [])]
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name && !isAutomatedActor(name)),
  );
  return {
    brand: hostnames.length === 1 ? hostnames[0] : hostnames.join(", "),
    periodStart,
    periodEnd,
    spanDays,
    rows: rows.length,
    totalActions: rows.reduce((sum, row) => sum + row.count, 0),
    uniqueUsers: people.size,
    automatedActions: rows
      .filter((row) => row.automated)
      .reduce((sum, row) => sum + row.count, 0),
    byAction,
    byCategory,
    breakdown: [...breakdownByAction.values()].sort((a, b) => b.count - a.count),
    automationByType: [...automationByFamily.values()].sort(
      (a, b) => b.totalCount - a.totalCount,
    ),
  };
}

// One full-time equivalent, used only to sanity-check the implied labor.
const FTE_HOURS_PER_YEAR = 2080;

export function calculateCsValue(
  activity: CsActivitySummary,
  assumptions: CsValueAssumptions,
): CsValueResult {
  const recordVolume = activity.byCategory.bulk + activity.byCategory.automation;
  const automationSharePercent =
    recordVolume > 0 ? (activity.byCategory.automation / recordVolume) * 100 : 0;
  const compositionUnverified = recordVolume >= 10_000 && automationSharePercent < 1;
  // When the export labels almost no automation, record volume is throughput
  // evidence only — not labor dollars — until a sampled audit proves composition.
  const recordsDollarized = !compositionUnverified;

  const contentHours =
    (activity.byCategory.content * assumptions.contentMinutesSaved) / 60;

  const realization = Math.min(Math.max(assumptions.bulkRealizationPercent, 0), 100) / 100;
  const billableBulkCount = recordsDollarized
    ? activity.byCategory.bulk * realization
    : 0;
  const bulkHours = recordsDollarized
    ? (billableBulkCount * assumptions.bulkSecondsSaved) / 3600
    : 0;

  const assetHours = (activity.byCategory.asset * assumptions.assetMinutesSaved) / 60;
  const syndicationHours =
    (activity.byCategory.syndication * assumptions.syndicationMinutesSaved) / 60;
  const totalHours = contentHours + bulkHours + assetHours + syndicationHours;
  const contentValue = contentHours * assumptions.hourlyRate;
  const bulkValue = bulkHours * assumptions.hourlyRate;
  const assetValue = assetHours * assumptions.hourlyRate;
  const syndicationValue = syndicationHours * assumptions.hourlyRate;
  const periodValue = contentValue + bulkValue + assetValue + syndicationValue;
  const periodCost = assumptions.annualPxmInvestment * (activity.spanDays / 365);
  const periodNetValue = periodValue - periodCost;
  const periodRoi = periodCost > 0 ? (periodNetValue / periodCost) * 100 : null;
  const annualizedValue = periodValue * (365 / activity.spanDays);
  const annualizedNetValue = annualizedValue - assumptions.annualPxmInvestment;
  const annualizedRoi =
    assumptions.annualPxmInvestment > 0
      ? (annualizedNetValue / assumptions.annualPxmInvestment) * 100
      : null;
  const paybackMonths =
    annualizedValue > 0 ? (assumptions.annualPxmInvestment / annualizedValue) * 12 : null;

  const periodCapacity = FTE_HOURS_PER_YEAR * (activity.spanDays / 365);
  const fteEquivalent = periodCapacity > 0 ? totalHours / periodCapacity : 0;
  const fteCeiling = activity.uniqueUsers;

  const scenarios = (Object.keys(SCENARIO_SHAPE) as CsScenarioKey[]).map((key) => {
    const shape = SCENARIO_SHAPE[key];
    const scenarioRealization = Math.min(realization * shape.realization, 1);
    const scenarioSeconds = assumptions.bulkSecondsSaved * shape.minutes;
    const scenarioAssetMinutes = assumptions.assetMinutesSaved * shape.minutes;
    const scenarioSyndicationMinutes =
      assumptions.syndicationMinutesSaved * shape.minutes;
    const scenarioContentMinutes = assumptions.contentMinutesSaved * shape.minutes;

    const bulkHoursForScenario = recordsDollarized
      ? (activity.byCategory.bulk * scenarioRealization * scenarioSeconds) / 3600
      : 0;

    const scenarioHours =
      bulkHoursForScenario +
      (activity.byCategory.content * scenarioContentMinutes) / 60 +
      (activity.byCategory.asset * scenarioAssetMinutes) / 60 +
      (activity.byCategory.syndication * scenarioSyndicationMinutes) / 60;
    const scenarioValue = scenarioHours * assumptions.hourlyRate;
    const scenarioAnnualized = scenarioValue * (365 / activity.spanDays);

    return {
      key,
      label: shape.label,
      realizationPercent: scenarioRealization * 100,
      secondsPerRecord: scenarioSeconds,
      assetMinutes: scenarioAssetMinutes,
      syndicationMinutes: scenarioSyndicationMinutes,
      totalHours: scenarioHours,
      periodValue: scenarioValue,
      periodRoi: periodCost > 0 ? ((scenarioValue - periodCost) / periodCost) * 100 : null,
      annualizedValue: scenarioAnnualized,
      paybackMonths:
        scenarioAnnualized > 0
          ? (assumptions.annualPxmInvestment / scenarioAnnualized) * 12
          : null,
      fteEquivalent: periodCapacity > 0 ? scenarioHours / periodCapacity : 0,
    };
  });

  return {
    contentHours,
    bulkHours,
    assetHours,
    syndicationHours,
    totalHours,
    contentValue,
    bulkValue,
    assetValue,
    syndicationValue,
    periodValue,
    periodCost,
    periodNetValue,
    periodRoi,
    annualizedValue,
    annualizedNetValue,
    annualizedRoi,
    paybackMonths,
    billableBulkCount,
    fteEquivalent,
    fteCeiling,
    overCapacity: fteCeiling > 0 && fteEquivalent > fteCeiling,
    scenarios,
    compositionUnverified,
    automationSharePercent,
    recordsDollarized,
    recordMaintenanceCount: activity.byCategory.bulk,
  };
}
