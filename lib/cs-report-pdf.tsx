import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
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
  },
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
  eyebrow: {
    color: "#d8c8ff",
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
  rowLabel: { color: "#c2cad8" },
  rowValue: { fontFamily: "Helvetica-Bold" },
  note: { color: "#6f7a8d", fontSize: 7.5, lineHeight: 1.5, marginTop: 14 },
});

export function CsReportPDF({
  activity,
  assumptions,
  result,
}: {
  activity: CsActivitySummary;
  assumptions: CsValueAssumptions;
  result: CsValueResult;
}) {
  const levers: [string, string, number][] = [
    [
      "Record & attribute maintenance",
      `${activity.byCategory.bulk.toLocaleString()} records touched · ${assumptions.bulkRealizationPercent}% realized`,
      result.bulkValue,
    ],
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

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Value supported by observed activity</Text>
          <Text style={styles.heroValue}>{money(result.periodValue)}</Text>
          <Text style={styles.heroSub}>
            {hours(result.totalHours)} estimated hours returned during this reporting period
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Period ROI</Text>
            <Text style={styles.metricValue}>
              {result.periodRoi === null ? "—" : `${Math.round(result.periodRoi)}%`}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Period PXM cost</Text>
            <Text style={styles.metricValue}>{money(result.periodCost)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Annualized run-rate</Text>
            <Text style={styles.metricValue}>{money(result.annualizedValue)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Active users</Text>
            <Text style={styles.metricValue}>{activity.uniqueUsers}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Observed activity and estimated value</Text>
          {values.map(([label, detail, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.rowLabel}>
                {label} · {detail}
              </Text>
              <Text style={styles.rowValue}>{money(value)}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Implied workload across {activity.uniqueUsers} active users
            </Text>
            <Text style={styles.rowValue}>
              {result.fteEquivalent.toFixed(1)} FTE
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Value assumptions</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Loaded hourly rate</Text>
            <Text style={styles.rowValue}>{money(assumptions.hourlyRate)}/hr</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Seconds saved per record touched</Text>
            <Text style={styles.rowValue}>{assumptions.bulkSecondsSaved} sec</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Share of record volume realized</Text>
            <Text style={styles.rowValue}>{assumptions.bulkRealizationPercent}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Minutes saved per content action</Text>
            <Text style={styles.rowValue}>{assumptions.contentMinutesSaved} min</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Minutes saved per asset action</Text>
            <Text style={styles.rowValue}>{assumptions.assetMinutesSaved} min</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Minutes saved per syndication action</Text>
            <Text style={styles.rowValue}>{assumptions.syndicationMinutesSaved} min</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Annual PXM investment</Text>
            <Text style={styles.rowValue}>{money(assumptions.annualPxmInvestment)}</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Observed counts come from the uploaded PXM activity export. Update activity is counted
          in records and attributes touched rather than in tasks, so it is valued per record and
          discounted to the share a team would realistically have maintained by hand. Dollar
          values are directional estimates based on the assumptions shown above. Period cost is
          the annual PXM investment prorated to {activity.spanDays} reporting days. Annualized
          run-rate is a projection and not a guarantee of future activity or savings.
        </Text>
      </Page>
    </Document>
  );
}
