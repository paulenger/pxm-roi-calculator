import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff", fontWeight: 700 },
  ],
});

const BG = "#0a0f1e";
const CARD = "#111827";
const CYAN = "#00a7ff";
const PURPLE = "#8b5cf6";
const TEAL = "#14b8a6";
const MUTED = "#69758a";
const LINE = "rgba(255,255,255,0.08)";
const WHITE = "#ffffff";
const AMBER = "#f59e0b";

const s = StyleSheet.create({
  page: { backgroundColor: BG, padding: 48, fontFamily: "Inter", fontSize: 9, color: WHITE },
  eyebrow: { fontSize: 7, color: CYAN, letterSpacing: 1, marginBottom: 10 },
  h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 },
  h2: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  h3: { fontSize: 11, fontWeight: 700, color: CYAN, marginBottom: 8 },
  body: { fontSize: 9, color: "#c4cdd8", lineHeight: 1.6, marginBottom: 12 },
  table: { marginBottom: 16 },
  thead: { flexDirection: "row", backgroundColor: CARD, borderRadius: 4, padding: "8 10", marginBottom: 2 },
  theadCell: { fontSize: 8, fontWeight: 700, color: WHITE, flex: 1 },
  row: { flexDirection: "row", borderBottom: `1px solid ${LINE}`, padding: "7 10" },
  cell: { fontSize: 8, color: "#c4cdd8", flex: 1, lineHeight: 1.5 },
  cellBold: { fontSize: 8, color: WHITE, fontWeight: 700, flex: 1 },
  callout: { backgroundColor: CARD, borderLeft: `3px solid ${CYAN}`, padding: 14, borderRadius: 4, marginBottom: 14 },
  calloutLabel: { fontSize: 8, fontWeight: 700, color: WHITE, marginBottom: 4 },
  calloutBody: { fontSize: 8, color: "#c4cdd8", lineHeight: 1.6 },
  formula: { backgroundColor: "#0d1424", border: `1px solid ${LINE}`, borderLeft: `3px solid ${PURPLE}`, padding: "10 14", borderRadius: 4, marginBottom: 8 },
  formulaLabel: { fontSize: 8, fontWeight: 700, color: WHITE, marginBottom: 4 },
  formulaCode: { fontSize: 8, color: CYAN, fontFamily: "Courier" },
  sectionDivider: { borderTop: `1px solid ${LINE}`, marginTop: 20, marginBottom: 20 },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: MUTED },
  tag: { backgroundColor: PURPLE, color: WHITE, fontSize: 7, padding: "2 6", borderRadius: 3, alignSelf: "flex-start", marginBottom: 8 },
  tagTeal: { backgroundColor: TEAL, color: WHITE, fontSize: 7, padding: "2 6", borderRadius: 3, alignSelf: "flex-start", marginBottom: 8 },
  tagAmber: { backgroundColor: AMBER, color: "#000", fontSize: 7, padding: "2 6", borderRadius: 3, alignSelf: "flex-start", marginBottom: 8 },
  two: { flexDirection: "row", gap: 16, marginBottom: 12 },
  twoCol: { flex: 1 },
  pill: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

function Footer({ page }: { page: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Pattern PXM Value Calculator — User Guide</Text>
      <Text style={s.footerText}>{page}</Text>
    </View>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <View style={s.table}>
      <View style={s.thead}>
        {headers.map((h) => <Text key={h} style={s.theadCell}>{h}</Text>)}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={s.row}>
          {row.map((cell, j) => (
            <Text key={j} style={j === 0 ? s.cellBold : s.cell}>{cell}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Callout({ label, body }: { label: string; body: string }) {
  return (
    <View style={s.callout}>
      <Text style={s.calloutLabel}>{label}</Text>
      <Text style={s.calloutBody}>{body}</Text>
    </View>
  );
}

function Formula({ label, code }: { label: string; code: string }) {
  return (
    <View style={s.formula}>
      <Text style={s.formulaLabel}>{label}</Text>
      <Text style={s.formulaCode}>{code}</Text>
    </View>
  );
}

export function UserGuidePDF() {
  return (
    <Document title="PXM ROI Calculator — User Guide" author="Pattern PXM">

      {/* PAGE 1 — COVER */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>PATTERN PXM / VALUE MODEL V1</Text>
        <Text style={s.h1}>PXM ROI Calculator{"\n"}User Guide</Text>
        <Text style={s.body}>
          A practical guide for sales conversations — understanding every section, the math behind it, and how to present results credibly without overclaiming.
        </Text>

        <Callout
          label="Start here"
          body="Open the calculator at pxm-roi-calculator.vercel.app. Use this guide before and during discovery, scoping, and value-review conversations."
        />

        <Text style={s.h3}>What this guide covers</Text>
        <Table
          headers={["Section", "What PXM delivers", "What the calculator produces"]}
          rows={[
            ["01 — Pattern Creative Services", "AI content creation + image production", "Savings vs. current agency or vendor spend"],
            ["02 — Content & asset operations", "PIM + DAM — centralized data and assets", "Hours returned and loaded-labor value"],
            ["03 — Syndication savings", "One update pushed to all retail channels", "Manual push labor eliminated"],
            ["04 — Tool consolidation", "Replaces separate PIM, DAM, syndication tools", "Direct cost displacement — no estimates needed"],
            ["05 — Growth & investment", "Better content → better listing performance", "Customer-owned revenue hypothesis + ROI"],
          ]}
        />

        <Text style={s.h3}>What the calculator does and does not do</Text>
        <Table
          headers={["It does", "It does not"]}
          rows={[
            ["Build a directional financial model", "Guarantee conversion or revenue improvement"],
            ["Use Pattern's actual role rates and task times", "Replace finance, legal, or customer approval"],
            ["Separate value into five distinct levers", "Prove that PXM usage caused a specific ROI"],
            ["Apply scenario realization factors (70/100/130%)", "Validate inputs — those come from the customer"],
            ["Show a direct cost displacement for tool swap", "Fabricate benchmarks — growth is the customer's estimate"],
          ]}
        />

        <Text style={[s.body, { color: MUTED, fontSize: 8 }]}>
          Important: this is a directional planning model, not a guarantee of results. Customer inputs and supporting evidence should be validated before the result is used in a final business case.
        </Text>
        <Footer page="1" />
      </Page>

      {/* PAGE 2 — QUICK START */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>01 — QUICK START</Text>
        <Text style={s.h2}>Use the calculator in five steps</Text>
        <Text style={s.body}>The best experience starts with hard operational inputs and adds growth assumptions only after the baseline is credible.</Text>

        <Table
          headers={["Step", "Action", "Why it matters"]}
          rows={[
            ["1", "Choose Conservative, Expected, or Upside scenario.", "Sets the realization factor (70/100/130%) applied to all labor-based benefits."],
            ["2", "Enter Pattern Creative Services inputs (if applicable).", "Only relevant if Pattern is doing creative for the brand. Leave at $0 if not."],
            ["3", "Enter content and asset operations volumes.", "Converts the brand's daily manual work into annual hours and labor value."],
            ["4", "Enter syndication scope — products, channels, update cadence.", "Models the manual push labor that PXM auto-syndication eliminates."],
            ["5", "Enter current tool costs for PIM, DAM, and syndication.", "Direct cost displacement — the only lever that needs no assumptions."],
            ["6", "Enter growth inputs at a conservative level.", "Customer-owned estimate only. Lead with Sections 02–04 first."],
          ]}
        />

        <Text style={s.h3}>Recommended meeting sequence</Text>
        <Text style={s.body}>
          Start with operational value (Sections 02–04). Set revenue lift to 0% and build the case entirely from content operations, syndication savings, and tool displacement. Once that baseline is credible, introduce Section 05 as a separately attributable upside — and make clear the number is the customer's hypothesis, not Pattern's promise.
        </Text>

        <Callout
          label="Lead with tool consolidation"
          body="Section 04 is your strongest opener for budget conversations. It requires no estimates — just an invoice. If they pay $40K/year for Salsify, that number becomes the floor of their PXM value before you've modeled a single hour of savings."
        />

        <Text style={s.h3}>Scenario factors</Text>
        <Table
          headers={["Scenario", "Factor", "When to use"]}
          rows={[
            ["Conservative", "70%", "Budget review, limited adoption, or uncertain inputs. Good for procurement conversations."],
            ["Expected", "100%", "Most likely case with agreed inputs. Use as the primary view."],
            ["Upside", "130%", "Expansion or high-adoption opportunity. Never present alone — always anchor to Expected first."],
          ]}
        />

        <Text style={[s.body, { color: MUTED, fontSize: 8, marginTop: 8 }]}>
          Note: the scenario factor applies to all labor-based benefits (Sections 01–03 and 05). Tool consolidation (Section 04) is not scenario-adjusted — it is a direct cost, not an estimate.
        </Text>
        <Footer page="2" />
      </Page>

      {/* PAGE 3 — SECTIONS 01 & 02 */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>02 — SECTION REFERENCE</Text>
        <Text style={s.h2}>Sections 01 & 02 in depth</Text>

        <View style={s.tag}><Text style={{ fontSize: 7, color: WHITE }}>01 — PATTERN CREATIVE SERVICES</Text></View>
        <Text style={s.h3}>What it is</Text>
        <Text style={s.body}>
          Pattern's creative team produces Amazon content — image stacks, A+ pages, brand store, AI-generated images. This is Pattern's services layer, not the PXM platform itself. It is optional and should be included only if Pattern is delivering creative for this brand.
        </Text>

        <Table
          headers={["Field", "What to enter"]}
          rows={[
            ["Current annual creative spend", "What the brand currently pays for Amazon content creation — agency fees, freelancers, or an estimate of in-house design hours × hourly rate. Leave at $0 if not applicable."],
            ["Products per project", "How many individual products are included in one creative engagement."],
            ["Design concepts per project", "How many distinct visual directions are developed. Typically 1 for a refresh, 2–3 for a new brand launch."],
            ["AI images per product", "Number of AI-generated images produced per listing. Default is 15."],
            ["Projects per year", "How many creative projects the brand runs in a typical year."],
            ["Delivery tier", "Creative only = standard rate. Include project management adds 20% to the modeled cost."],
          ]}
        />

        <Formula
          label="Creative savings"
          code="max(0, current annual spend − Pattern annual cost) × scenario factor"
        />
        <Text style={[s.body, { color: MUTED, fontSize: 8 }]}>
          Value only appears when the brand's current spend exceeds Pattern's modeled cost. If the brand does creative in-house, this lever shows $0 — which is correct and honest.
        </Text>

        <View style={s.sectionDivider} />

        <View style={s.tag}><Text style={{ fontSize: 7, color: WHITE }}>02 — CONTENT & ASSET OPERATIONS</Text></View>
        <Text style={s.h3}>What it is</Text>
        <Text style={s.body}>
          The PIM and DAM value of PXM. Every manual content update and every minute spent searching for assets is labor the platform eliminates. This is the most universally resonant section — every brand with 100+ SKUs has this problem, whether they've measured it or not.
        </Text>

        <Table
          headers={["Field", "What to enter"]}
          rows={[
            ["Products in scope", "Total active SKUs the team manages content for."],
            ["Updates / product / year", "How many times per year product content changes — seasonal refreshes, pricing, copy, new images. Typically 2–4×."],
            ["Minutes / manual update", "How long one content update takes today — logging into a retailer portal, reformatting, submitting. Typically 20–45 min."],
            ["Time saved per content update", "What portion of that manual time disappears when content is managed centrally. 50–70% is a reasonable starting point."],
            ["Internal asset requests per year", "How many times per year someone on the team searches for, requests, or re-sends a product image, logo, or file."],
            ["Minutes saved per request", "Time saved when assets live in a searchable library vs. email threads and shared drives. Typically 15–25 min."],
            ["Team hourly rate", "Fully-loaded cost per hour — salary + benefits + overhead. Typical range: $45–$65/hr."],
          ]}
        />

        <View style={s.two}>
          <View style={s.twoCol}>
            <Formula label="Content ops value" code="products × updates × minutes × time-saved% ÷ 60 × hourly rate × scenario" />
          </View>
          <View style={s.twoCol}>
            <Formula label="Asset ops value" code="requests × minutes-saved ÷ 60 × hourly rate × scenario" />
          </View>
        </View>

        <Footer page="3" />
      </Page>

      {/* PAGE 4 — SECTIONS 03 & 04 */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>02 — SECTION REFERENCE (CONTINUED)</Text>
        <Text style={s.h2}>Sections 03 & 04 in depth</Text>

        <View style={s.tag}><Text style={{ fontSize: 7, color: WHITE }}>03 — SYNDICATION SAVINGS</Text></View>
        <Text style={s.h3}>What it is</Text>
        <Text style={s.body}>
          The syndication value of PXM. One update to PXM automatically distributes content to every connected retailer and marketplace. This section models the manual push labor that disappears. Pattern's platform currently syndicates to 13 distinct channels — 5 is conservative for a mid-market brand.
        </Text>

        <Table
          headers={["Field", "What to enter"]}
          rows={[
            ["Products being syndicated", "How many products are distributed across retailer and marketplace channels."],
            ["Number of retail channels", "Distinct destinations receiving content — Amazon, Walmart, Target, DTC site, etc. Pattern syndicates to 13+ channels across its portfolio."],
            ["Content updates per product per year", "How many times per year content changes — seasonal, pricing, copy, new images. Typically 2–6×."],
            ["Minutes to manually update one product at one retailer", "Time to copy, reformat, and submit content to a single retailer today. Typically 10–20 min for a routine update."],
            ["How much of that work does PXM eliminate", "PXM auto-syndicates from one update to all channels. Most brands see 70–90% of manual push work eliminated."],
          ]}
        />

        <Formula
          label="Syndication savings"
          code="products × channels × updates/yr × minutes/push × automation% ÷ 60 × hourly rate × scenario"
        />

        <Callout
          label="Discovery tip"
          body="Ask: 'When you change a product image or update your seasonal copy, how do you get that change live on Amazon, Walmart, and Target?' The answer reveals exactly how much manual work exists. Most teams have never added it up."
        />

        <View style={s.sectionDivider} />

        <View style={s.tagTeal}><Text style={{ fontSize: 7, color: WHITE }}>04 — TOOL CONSOLIDATION</Text></View>
        <Text style={s.h3}>What it is</Text>
        <Text style={s.body}>
          PXM is PIM + DAM + Syndication in one platform. This section captures the direct cost of tools the brand currently pays for separately that PXM replaces. This is the most defensible lever in the calculator — it requires no estimates, no scenario adjustment, and no benchmarks. It is a direct invoice swap.
        </Text>

        <Table
          headers={["Field", "Examples of tools being replaced"]}
          rows={[
            ["Current PIM tool cost", "Salsify, Akeneo, inRiver, Plytix, Catalist"],
            ["Current DAM tool cost", "Bynder, Widen (Acquia DAM), Brandfolder, Canto, Extensis"],
            ["Current syndication tool cost", "Syndigo, Feedonomics, ChannelAdvisor, Productsup, DataFeedWatch"],
          ]}
        />

        <Formula
          label="Tool consolidation savings"
          code="current PIM cost + current DAM cost + current syndication tool cost"
        />

        <Text style={[s.body, { color: MUTED, fontSize: 8 }]}>
          No scenario factor is applied to tool consolidation. If the brand cancels a $40,000/year Salsify contract when they onboard to PXM, they save $40,000 — there is no partial realization. This makes tool consolidation the floor of PXM's value before any labor savings are modeled.
        </Text>

        <Callout
          label="How to surface this in discovery"
          body="Ask: 'What tools are you currently using for product data, digital asset management, and content distribution to retailers? What do you pay for each?' If they don't know, ask them to check with their tech or finance team. This number is worth waiting for — it's your strongest, most defensible input."
        />

        <Footer page="4" />
      </Page>

      {/* PAGE 5 — SECTION 05 + RESULTS */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>02 — SECTION REFERENCE (CONTINUED)</Text>
        <Text style={s.h2}>Section 05 & reading the results</Text>

        <View style={s.tagAmber}><Text style={{ fontSize: 7, color: "#000" }}>05 — GROWTH & INVESTMENT</Text></View>
        <Text style={s.h3}>What it is</Text>
        <Text style={s.body}>
          An optional, customer-owned estimate of revenue impact from better content. Pattern-managed brands average an 81.56% content match score across their catalogs — better content visibility correlates with search ranking and conversion. The number in this section is the prospect's hypothesis, not Pattern's promise.
        </Text>

        <Table
          headers={["Field", "What to enter"]}
          rows={[
            ["Annual revenue in scope", "The revenue base that better-performing content could impact — typically the brand's Amazon or total ecommerce revenue."],
            ["Your expected revenue lift", "Customer's estimate of the % improvement from better content. Default is 1% — conservative. Adjust based on how far the current catalog is from optimized."],
            ["Gross margin", "The margin on that revenue — determines the profit value of the lift."],
            ["How much of that lift would you credit to better content?", "Content is one driver of revenue, not the only one. 40–60% is a reasonable attribution when content is a known gap. Customer decides."],
            ["Annual PXM investment", "The annual platform fee from the commercial proposal."],
            ["One-time implementation", "One-time onboarding and setup cost."],
          ]}
        />

        <Formula
          label="Growth contribution"
          code="revenue × lift% × gross margin% × attribution% × scenario factor"
        />

        <Callout
          label="How to present this section"
          body="Lead with Sections 02–04 to build the operational case. Only introduce growth once the baseline is credible. Say: 'This number is your estimate — we've left it conservative at 1%. If you think that's too low or too high for your business, adjust it. The model is yours.' This framing protects Pattern and builds trust."
        />

        <View style={s.sectionDivider} />

        <Text style={s.h3}>Reading the results panel</Text>
        <Table
          headers={["Output", "What it means"]}
          rows={[
            ["Estimated year-one net value", "Gross benefit minus year-one investment (platform fee + implementation)."],
            ["Year-one ROI", "Net value ÷ year-one investment × 100. Reflects the selected scenario."],
            ["Payback", "Year-one investment ÷ annual gross benefit × 12. Months to break even."],
            ["3-year net value", "(Annual gross benefit × 3) − (annual PXM fee × 3) − one-time implementation."],
            ["Hours returned", "Total labor hours eliminated across content ops, asset ops, and syndication."],
            ["Annual benefit by lever", "Breakdown of gross benefit across all five value drivers."],
          ]}
        />

        <Text style={s.h3}>Pattern at scale — proof card</Text>
        <Text style={s.body}>
          The proof card at the bottom of the results panel shows six stats sourced from Pattern's managed brand portfolio: #1 Amazon seller globally, 700+ brands managed, 2.3M products in PXM, 7,000+ AI content briefs run, 15,000+ AI images generated, 1,000+ marketplaces receiving content. These are Pattern operational figures, not third-party benchmarks.
        </Text>

        <Text style={[s.body, { color: MUTED, fontSize: 8, marginTop: 8 }]}>
          Directional planning model — not a guarantee of results. Customer inputs and supporting evidence should be validated before use in a final business case. All labor-based benefits are adjusted by the selected realization scenario. Tool consolidation savings are not scenario-adjusted.
        </Text>

        <Footer page="5" />
      </Page>

    </Document>
  );
}
