import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

const c = {
  ink: "#f7f8fb",
  muted: "#9aa5b8",
  panel: "#121827",
  panel2: "#171f32",
  cyan: "#00a7ff",
  violet: "#7426ff",
  line: "#1e2a40",
  white: "#ffffff",
  dimText: "#6f7a8d",
  green: "#22c55e",
  amber: "#f59e0b",
  sky: "#0ea5e9",
  purple: "#8b5cf6",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: "#080b12",
    color: c.ink,
    fontFamily: "Helvetica",
    padding: "40 48",
    fontSize: 10,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: c.violet,
    justifyContent: "center",
    alignItems: "center",
  },
  brandMarkText: { color: c.white, fontSize: 14, fontFamily: "Helvetica-Bold" },
  brandName: { fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1.2, color: c.white },
  headerMeta: { alignItems: "flex-end" },
  headerMetaLabel: { fontSize: 8, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8 },
  headerMetaValue: { fontSize: 9, color: c.muted, marginTop: 2 },

  // Hero result
  heroBox: {
    backgroundColor: c.violet,
    borderRadius: 12,
    padding: "22 26",
    marginBottom: 16,
  },
  heroLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,0.72)", marginBottom: 6 },
  heroValue: { fontSize: 42, fontFamily: "Helvetica-Bold", color: c.white, letterSpacing: -1 },
  heroSub: { fontSize: 9, color: "rgba(255,255,255,0.72)", marginTop: 8 },

  // Metric grid
  metricGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  metricCell: {
    flex: 1,
    backgroundColor: c.panel,
    borderRadius: 10,
    padding: "14 16",
    borderWidth: 1,
    borderColor: c.line,
  },
  metricLabel: { fontSize: 8, color: c.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  metricValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: c.white },

  // Benefit breakdown
  sectionCard: {
    backgroundColor: c.panel,
    borderRadius: 10,
    padding: "16 18",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: c.line,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: c.white },
  sectionTotal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: c.muted },

  benefitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  benefitRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  benefitDot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  benefitName: { flexDirection: "row", alignItems: "center" },
  benefitLabel: { fontSize: 10, color: "#c2cad8" },
  benefitValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: c.white },

  // Inputs summary
  inputsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  inputsCol: { flex: 1 },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  inputLabel: { fontSize: 9, color: c.muted },
  inputValue: { fontSize: 9, color: c.white, fontFamily: "Helvetica-Bold" },

  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  disclaimer: { fontSize: 7.5, color: c.dimText, lineHeight: 1.5 },
});

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

type Props = {
  inputs: {
    currentAnnualCreativeSpend: number;
    asinCount: number;
    conceptCount: number;
    aiImagesPerAsin: number;
    annualProjects: number;
    creativeTier: string;
    products: number;
    updates: number;
    updateMinutes: number;
    automation: number;
    assetRequests: number;
    assetMinutesSaved: number;
    hourlyRate: number;
    syndicationSkus: number;
    syndicationChannels: number;
    syndicationUpdatesPerYear: number;
    syndicationMinutesPerPush: number;
    syndicationAutomation: number;
    eligibleRevenue: number;
    revenueLift: number;
    grossMargin: number;
    attribution: number;
    annualPXM: number;
    implementation: number;
  };
  result: {
    imageProduction: number;
    contentOps: number;
    assetOps: number;
    syndicationSavings: number;
    revenue: number;
    gross: number;
    net: number;
    roi: number;
    payback: number;
    threeYear: number;
    yearOneCost: number;
    hours: number;
  };
  scenario: string;
  generatedAt: string;
};

const benefits = (result: Props["result"]) => [
  { label: "Creative production", value: result.imageProduction, color: c.purple },
  { label: "Content operations", value: result.contentOps, color: c.sky },
  { label: "Asset operations", value: result.assetOps, color: c.green },
  { label: "Syndication savings", value: result.syndicationSavings, color: "#ec4899" },
  { label: "Growth contribution", value: result.revenue, color: c.amber },
];

export function ReportPDF({ inputs, result, scenario, generatedAt }: Props) {
  const rows = benefits(result);
  return (
    <Document title="PXM Value Report" author="Pattern">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Text style={s.brandMarkText}>P</Text>
            </View>
            <View>
              <Text style={s.brandName}>PATTERN PXM</Text>
              <Text style={{ fontSize: 8, color: c.muted, marginTop: 2 }}>Value Model · V1</Text>
            </View>
          </View>
          <View style={s.headerMeta}>
            <Text style={s.headerMetaLabel}>Scenario: {scenario}</Text>
            <Text style={s.headerMetaValue}>Generated {generatedAt}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={s.heroBox}>
          <Text style={s.heroLabel}>Estimated year-one net value</Text>
          <Text style={s.heroValue}>{money(result.net)}</Text>
          <Text style={s.heroSub}>
            {money(result.gross)} gross benefit · {Math.round(result.hours).toLocaleString()} hours returned
          </Text>
        </View>

        {/* Key metrics */}
        <View style={s.metricGrid}>
          <View style={s.metricCell}>
            <Text style={s.metricLabel}>Year-one ROI</Text>
            <Text style={s.metricValue}>{Math.round(result.roi)}%</Text>
          </View>
          <View style={s.metricCell}>
            <Text style={s.metricLabel}>Payback</Text>
            <Text style={s.metricValue}>{result.payback.toFixed(1)} mo</Text>
          </View>
          <View style={s.metricCell}>
            <Text style={s.metricLabel}>3-year net value</Text>
            <Text style={s.metricValue}>{money(result.threeYear)}</Text>
          </View>
          <View style={s.metricCell}>
            <Text style={s.metricLabel}>Year-one investment</Text>
            <Text style={s.metricValue}>{money(result.yearOneCost)}</Text>
          </View>
        </View>

        {/* Benefit breakdown */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Annual benefit by lever</Text>
            <Text style={s.sectionTotal}>{money(result.gross)}</Text>
          </View>
          {rows.map((row, i) => (
            <View key={row.label} style={i < rows.length - 1 ? s.benefitRow : s.benefitRowLast}>
              <View style={s.benefitName}>
                <View style={[s.benefitDot, { backgroundColor: row.color }]} />
                <Text style={s.benefitLabel}>{row.label}</Text>
              </View>
              <Text style={s.benefitValue}>{money(row.value)}</Text>
            </View>
          ))}
        </View>

        {/* Inputs summary */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Assumptions used</Text>
          </View>
          <View style={s.inputsGrid}>
            {/* Left column */}
            <View style={s.inputsCol}>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Current annual creative spend</Text>
                <Text style={s.inputValue}>{money(inputs.currentAnnualCreativeSpend)}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>ASINs / project</Text>
                <Text style={s.inputValue}>{inputs.asinCount}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Concepts / project</Text>
                <Text style={s.inputValue}>{inputs.conceptCount}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>AI images / ASIN</Text>
                <Text style={s.inputValue}>{inputs.aiImagesPerAsin}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Projects / year</Text>
                <Text style={s.inputValue}>{inputs.annualProjects}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Delivery tier</Text>
                <Text style={s.inputValue}>{inputs.creativeTier === "pm" ? "Creative + PM" : "Creative only"}</Text>
              </View>
            </View>
            {/* Right column */}
            <View style={s.inputsCol}>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Products in scope</Text>
                <Text style={s.inputValue}>{inputs.products.toLocaleString()}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Updates / product / year</Text>
                <Text style={s.inputValue}>{inputs.updates}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Minutes / manual update</Text>
                <Text style={s.inputValue}>{inputs.updateMinutes} min</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Workflow time reduction</Text>
                <Text style={s.inputValue}>{inputs.automation}%</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Asset requests / year</Text>
                <Text style={s.inputValue}>{inputs.assetRequests.toLocaleString()}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>SKUs syndicated</Text>
                <Text style={s.inputValue}>{inputs.syndicationSkus.toLocaleString()}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Channels · updates/yr · min/push</Text>
                <Text style={s.inputValue}>{inputs.syndicationChannels} · {inputs.syndicationUpdatesPerYear} · {inputs.syndicationMinutesPerPush} min</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Syndication automation</Text>
                <Text style={s.inputValue}>{inputs.syndicationAutomation}%</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Revenue in scope</Text>
                <Text style={s.inputValue}>{money(inputs.eligibleRevenue)}</Text>
              </View>
              <View style={s.inputRow}>
                <Text style={s.inputLabel}>Revenue lift / GM / attribution</Text>
                <Text style={s.inputValue}>{inputs.revenueLift}% · {inputs.grossMargin}% · {inputs.attribution}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.disclaimer}>
            Directional planning model — not a guarantee of results. Customer inputs and supporting evidence should be validated before use in a final business case. All benefits are adjusted by the selected realization scenario ({scenario}).
          </Text>
        </View>

      </Page>
    </Document>
  );
}
