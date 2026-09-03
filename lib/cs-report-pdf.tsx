import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { PeriodTrend } from "./cs-period-history";
import type {
  CsActivitySummary,
  CsValueAssumptions,
  CsValueResult,
} from "./cs-value-model";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const hours = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
    Number.isFinite(value) ? value : 0,
  );

const date = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const styles = StyleSheet.create({
  page: {
    padding: "38 44",
    color: "#f7f8fb",
    backgroundColor: "#080b12",
    fontFamily: "Helvetica",
    fontSize: 10,
    position: "relative",
  },
  draftWatermark: {
    position: "absolute",
    top: 280,
    left: 40,
    right: 40,
    transform: "rotate(-28deg)",
    fontSize: 34,
    color: "rgba(251, 191, 36, 0.18)",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  draftBanner: {
    borderWidth: 1,
    borderColor: "#fbbf24",
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  draftBannerTitle: {
    color: "#fcd34d",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 4,
  },
  draftBannerText: { color: "#e8dcc0", fontSize: 8, lineHeight: 1.45 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1e2a40",
    paddingBottom: 16,
    marginBottom: 20,
  },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: 1 },
  muted: { color: "#9aa5b8", fontSize: 8 },
  hero: { backgroundColor: "#7426ff", borderRadius: 10, padding: 20, marginBottom: 14 },
  heroConservative: {
    backgroundColor: "#121827",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  eyebrow: {
    color: "#d8c8ff",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  eyebrowGreen: {
    color: "#86efac",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  heroValue: { fontFamily: "Helvetica-Bold", fontSize: 34 },
  heroSub: { color: "#e9e0ff", fontSize: 9, marginTop: 6 },
  grid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metric: {
    flex: 1,
    backgroundColor: "#121827",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e2a40",
  },
  metricLabel: { color: "#9aa5b8", fontSize: 7, textTransform: "uppercase", marginBottom: 5 },
  metricValue: { fontFamily: "Helvetica-Bold", fontSize: 16 },
  card: {
    backgroundColor: "#121827",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e2a40",
  },
  cardTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2a40",
  },
  rowLabel: { color: "#c2cad8", flex: 1, paddingRight: 8 },
  rowValue: { fontFamily: "Helvetica-Bold" },
  note: { color: "#6f7a8d", fontSize: 7.5, lineHeight: 1.5, marginTop: 14 },
});

export function CsReportPDF({
  activity,
  assumptions,
  result,
  isDraft = false,
  periodTrend = null,
}: {
  activity: CsActivitySummary;
  assumptions: CsValueAssumptions;
  result: CsValueResult;
  isDraft?: boolean;
  periodTrend?: PeriodTrend | null;
}) {
  const conservative = result.scenarios.find((scenario) => scenario.key === "conservative");
  const expected = result.scenarios.find((scenario) => scenario.key === "expected");
  const upper = result.scenarios.find((scenario) => scenario.key === "upper");

  const levers: [string, string, number][] = [
    ...(result.recordsDollarized
      ? [
          [
            "Human record & attribute edits",
            `${activity.byCategory.bulk.toLocaleString()} human-driven records · ${assumptions.bulkRealizationPercent}% realized`,
            result.bulkValue,
          ] as [string, string, number],
        ]
      : []),
    [
      "Content operations",
      `${activity.byCategory.content.toLocaleString()} observed actions`,
      result.contentValue,
    ],
    [
      "Asset access & sharing",
      `${activity.byCategory.asset.toLocaleString()} observed actions`,
      result.assetValue,
    ],
    [
      "Syndication",
      `${activity.byCategory.syndication.toLocaleString()} observed actions`,
      result.syndicationValue,
    ],
  ];
  const values = levers.filter(([, , value]) => value > 0);

  return (
    <Document title={`${activity.brand} PXM customer value report`} author="Pattern">
      <Page size="A4" style={styles.page}>
        {isDraft ? (
          <Text style={styles.draftWatermark}>DRAFT — NOT SAMPLED</Text>
        ) : null}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>PATTERN PXM</Text>
            <Text style={styles.muted}>CUSTOMER SUCCESS VALUE REPORT</Text>
          </View>
          <View>
            <Text style={styles.muted}>{activity.brand}</Text>
            <Text style={styles.muted}>
              {date(activity.periodStart)} – {date(activity.periodEnd)} · {activity.spanDays} days
            </Text>
          </View>
        </View>

        {isDraft ? (
          <View style={styles.draftBanner}>
            <Text style={styles.draftBannerTitle}>
              DRAFT — assumptions not yet sampled against raw export
            </Text>
            <Text style={styles.draftBannerText}>
              Do not present this report to a customer finance stakeholder until the
              realized share is measured and a sample methodology note is attached.
            </Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Catalog workload run through PXM</Text>
          <Text style={styles.heroValue}>{result.fteEquivalent.toFixed(1)} FTE</Text>
          <Text style={styles.heroSub}>
            {activity.totalActions.toLocaleString()} observed actions across{" "}
            {activity.uniqueUsers} active users over {activity.spanDays} days
          </Text>
        </View>

        {conservative ? (
          <View style={styles.heroConservative}>
            <Text style={styles.eyebrowGreen}>Conservative value — lead with this</Text>
            <Text style={styles.heroValue}>{money(conservative.periodValue)}</Text>
            <Text style={styles.heroSub}>
              {conservative.periodRoi === null
                ? "—"
                : `${Math.round(conservative.periodRoi)}% period ROI`}{" "}
              · {money(conservative.annualizedValue)} annualized ·{" "}
              {conservative.paybackMonths === null
                ? "—"
                : `${conservative.paybackMonths.toFixed(1)} mo payback`}
            </Text>
          </View>
        ) : null}

        {periodTrend ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Workload trend across periods</Text>
            <Text style={styles.note}>
              Implied workload: {periodTrend.previous.fteEquivalent.toFixed(1)} FTE →{" "}
              {periodTrend.current.fteEquivalent.toFixed(1)} FTE. Observed actions:{" "}
              {periodTrend.previous.totalActions.toLocaleString()} →{" "}
              {periodTrend.current.totalActions.toLocaleString()}.
            </Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          {expected ? (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Expected value</Text>
              <Text style={styles.metricValue}>{money(expected.periodValue)}</Text>
            </View>
          ) : null}
          {upper ? (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Upper bound</Text>
              <Text style={styles.metricValue}>{money(upper.periodValue)}</Text>
            </View>
          ) : null}
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Period PXM cost</Text>
            <Text style={styles.metricValue}>{money(result.periodCost)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Active users</Text>
            <Text style={styles.metricValue}>{activity.uniqueUsers}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Estimated value range ·{" "}
            {assumptions.realizationMeasured && assumptions.realizationSampleNote.trim()
              ? "measured record share"
              : "assumed record share"}
          </Text>
          {result.scenarios.map((scenario) => (
            <View style={styles.row} key={scenario.key}>
              <Text style={styles.rowLabel}>
                {scenario.label} · {Math.round(scenario.realizationPercent)}% ·{" "}
                {hours(scenario.secondsPerRecord)}s/record ·{" "}
                {money(scenario.annualizedValue)} annualized ·{" "}
                {scenario.paybackMonths === null
                  ? "—"
                  : `${scenario.paybackMonths.toFixed(1)} mo payback`}
              </Text>
              <Text style={styles.rowValue}>
                {money(scenario.periodValue)}
                {scenario.periodRoi === null
                  ? ""
                  : `  (${Math.round(scenario.periodRoi)}% ROI)`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Automation excluded by action type</Text>
          {activity.automationByType.map((entry) => (
            <View style={styles.row} key={entry.label}>
              <Text style={styles.rowLabel}>{entry.label}</Text>
              <Text style={styles.rowValue}>
                {entry.automatedExcluded.toLocaleString()} excluded ·{" "}
                {entry.humanCount.toLocaleString()} human
              </Text>
            </View>
          ))}
        </View>

        {result.compositionUnverified ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Record volume excluded from dollars</Text>
            <Text style={styles.note}>
              Only {result.automationSharePercent.toFixed(2)}% of record volume names an
              API or system actor. {result.recordMaintenanceCount.toLocaleString()}{" "}
              record-maintenance events are shown as throughput only. Dollar values
              include human-task categories (downloads, shares, syndications) until a
              sampled audit allows record volume to be valued.
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expected case by activity type</Text>
          {values.map(([label, detail, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.rowLabel}>
                {label} · {detail}
              </Text>
              <Text style={styles.rowValue}>{money(value)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assumptions</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Loaded hourly rate</Text>
            <Text style={styles.rowValue}>
              {money(assumptions.hourlyRate)}/hr
              {assumptions.hourlyRateConfirmed ? " · confirmed" : " · Pattern default"}
            </Text>
          </View>
          {!assumptions.hourlyRateConfirmed ? (
            <Text style={styles.note}>
              Loaded hourly rate is a Pattern default, not confirmed against{" "}
              {activity.brand}&apos;s actual staffing cost.
            </Text>
          ) : null}
          {activity.byCategory.bulk > 0 ? (
            <>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Seconds saved per record</Text>
                <Text style={styles.rowValue}>{assumptions.bulkSecondsSaved} sec</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Share of record volume realized</Text>
                <Text style={styles.rowValue}>
                  {assumptions.bulkRealizationPercent}%
                </Text>
              </View>
              {assumptions.realizationMeasured && assumptions.realizationSampleNote.trim() ? (
                <Text style={styles.note}>
                  Sample methodology: {assumptions.realizationSampleNote}
                </Text>
              ) : null}
            </>
          ) : null}
          {activity.byCategory.asset > 0 ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Minutes saved per asset action</Text>
              <Text style={styles.rowValue}>{assumptions.assetMinutesSaved} min</Text>
            </View>
          ) : null}
          {activity.byCategory.syndication > 0 ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Minutes saved per syndication</Text>
              <Text style={styles.rowValue}>
                {assumptions.syndicationMinutesSaved} min
              </Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Annual PXM investment</Text>
            <Text style={styles.rowValue}>{money(assumptions.annualPxmInvestment)}</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Observed action counts and active users are measured. Dollar values are
          directional estimates based on standard time-savings assumptions. API and
          system actors are excluded from dollars on every action type where the export
          labels them. Lead renewal conversations with the conservative scenario and
          any period-over-period workload trend.
        </Text>
      </Page>
    </Document>
  );
}
