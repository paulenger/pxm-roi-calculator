import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageBreak,
} from "docx";
import { writeFileSync } from "fs";

// ─── Colors ────────────────────────────────────────────────────────────────
const CYAN    = "00A7FF";
const DARK    = "111827";
const MUTED   = "69758A";
const WHITE   = "FFFFFF";
const BLACK   = "0A0F1E";

// ─── Helpers ───────────────────────────────────────────────────────────────
const spacer = (pts = 120) =>
  new Paragraph({ spacing: { before: pts, after: 0 }, children: [] });

const eyebrow = (text) =>
  new Paragraph({
    spacing: { before: 240, after: 60 },
    children: [new TextRun({ text, color: CYAN, size: 16, bold: true, allCaps: true })],
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 120, after: 160 },
    children: [new TextRun({ text, size: 52, bold: true, color: BLACK })],
  });

const h2 = (text, color = BLACK) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, size: 32, bold: true, color })],
  });

const h3 = (text) =>
  new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, size: 22, bold: true, color: CYAN })],
  });

const body = (text, opts = {}) =>
  new Paragraph({
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text, size: 20, color: "1F2937", ...opts })],
  });

const bullet = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 20, color: "1F2937" })],
  });

const formula = (label, code) => [
  new Paragraph({
    spacing: { before: 120, after: 0 },
    shading: { type: ShadingType.SOLID, color: "F0F4FF" },
    border: { left: { style: BorderStyle.THICK, size: 12, color: CYAN } },
    indent: { left: 200 },
    children: [new TextRun({ text: label, size: 18, bold: true, color: BLACK })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 160 },
    shading: { type: ShadingType.SOLID, color: "F0F4FF" },
    border: { left: { style: BorderStyle.THICK, size: 12, color: CYAN } },
    indent: { left: 200 },
    children: [new TextRun({ text: code, size: 18, color: "0055AA", font: "Courier New" })],
  }),
];

const callout = (label, text) => [
  new Paragraph({
    spacing: { before: 160, after: 0 },
    shading: { type: ShadingType.SOLID, color: "FFF8E1" },
    border: { left: { style: BorderStyle.THICK, size: 12, color: "F59E0B" } },
    indent: { left: 200 },
    children: [new TextRun({ text: `${label}  `, size: 18, bold: true, color: BLACK })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 160 },
    shading: { type: ShadingType.SOLID, color: "FFF8E1" },
    border: { left: { style: BorderStyle.THICK, size: 12, color: "F59E0B" } },
    indent: { left: 200 },
    children: [new TextRun({ text, size: 18, color: "1F2937" })],
  }),
];

const divider = () =>
  new Paragraph({
    spacing: { before: 240, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" } },
    children: [],
  });

const makeTable = (headers, rows, colWidths) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            width: { size: colWidths[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: DARK },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: h, bold: true, color: WHITE, size: 18 })],
            })],
          })
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            new TableCell({
              width: { size: colWidths[ci], type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: ri % 2 === 0 ? "F9FAFB" : WHITE },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({
                children: [new TextRun({
                  text: cell,
                  size: 18,
                  color: ci === 0 ? BLACK : "374151",
                  bold: ci === 0,
                })],
              })],
            })
          ),
        })
      ),
    ],
  });

// ─── Document ──────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 20 },
        paragraph: { spacing: { line: 276 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
      },
    },
    children: [

      // ── COVER ────────────────────────────────────────────────────────────
      eyebrow("PATTERN PXM / VALUE MODEL V1"),
      h1("PXM ROI Calculator\nSection-by-Section Brief"),
      body("A practical reference for sales conversations — covering all five value sections, the math behind each, and how to speak to conservative, expected, and upside scenarios without overclaiming.", { color: "4B5563" }),
      spacer(120),

      // Scenario overview table
      h3("Scenario Overview — Applies to Sections 01–03 and 05"),
      makeTable(
        ["Scenario", "Factor", "What It Means", "When to Use"],
        [
          ["Conservative", "× 0.7  (70%)", "Assumes real-world adoption is never perfect — slower rollout, partial migration, cautious teams.", "Budget reviews, procurement conversations, uncertain inputs."],
          ["Expected", "× 1.0  (100%)", "Full modeled value. Takes inputs at face value. The primary view.", "Standard presentation when inputs are agreed and grounded."],
          ["Upside", "× 1.3  (130%)", "Models faster adoption, broader scope, or conservative inputs. Shows ceiling potential.", "Expansion conversations. Never present alone — anchor to Expected first."],
        ],
        [15, 12, 40, 33]
      ),
      spacer(120),
      ...callout(
        "Important:",
        "The scenario factor applies to ALL labor-based benefits (Sections 01–03 and 05). Section 04 — Tool Consolidation — is never scenario-adjusted. It is a direct cost displacement, not an estimate."
      ),

      // ── PAGE BREAK ───────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 01 ───────────────────────────────────────────────────────
      eyebrow("Section 01"),
      h2("Pattern Creative Services", CYAN),
      body("Optional. Only relevant if Pattern is delivering creative production for this brand.", { color: MUTED }),

      h3("What It Is"),
      body("Pattern's creative team produces Amazon content — image stacks, A+ pages, brand store, AI-generated images. This is Pattern's services layer, not the PXM platform itself. It should be included only when Pattern is doing the creative work."),

      h3("Why You Bring It In"),
      body("If the brand currently pays an agency, uses freelancers, or has an in-house design team for Amazon content, Pattern can do the same work at a known, transparent rate. The calculator shows exactly what Pattern charges, built from actual task times and role rates — not estimates."),

      h3("Fields & What to Ask"),
      makeTable(
        ["Field", "Plain-English Question to Ask", "Typical Answer"],
        [
          ["Current annual creative spend", "What do you pay annually for Amazon content — agency fees, freelancers, or in-house design time?", "$0 if in-house; $20K–$200K+ if agency"],
          ["Products per project", "How many products are in one creative engagement?", "1–50 depending on scope"],
          ["Design concepts per project", "How many distinct visual directions are you developing?", "1 for a refresh; 2–3 for a new launch"],
          ["AI images per product", "How many AI-generated images do you want per listing?", "Default is 15"],
          ["Projects per year", "How many creative projects does your brand run in a year?", "1–12 depending on brand size"],
          ["Delivery tier", "Do you need project management included?", "Creative only = standard; +PM adds 20%"],
        ],
        [22, 44, 34]
      ),
      spacer(80),

      h3("The Math"),
      ...formula("Pattern's project cost", "Sum of all task minutes × role rate × scaling rule × tier multiplier"),
      ...formula("Annual modeled cost", "Project cost × projects per year"),
      ...formula("Creative savings (scenario-adjusted)", "max(0,  current annual spend − annual modeled cost)  ×  scenario factor"),

      h3("How to Talk About It"),
      bullet("\"This is the only section in the tool where you can see exactly what Pattern charges, broken down by task. Most agencies can't show you this.\""),
      bullet("If they do creative in-house: \"This lever will show $0 for you — which is correct. The value of PXM for your team is in Sections 02 through 04.\""),
      bullet("If they have agency spend: \"Enter what you pay your agency today. If Pattern's cost is lower, the difference is a real year-one saving.\""),

      ...callout("Scenario example", "Brand pays $80,000/year to an agency. Pattern's modeled cost for the same scope is $45,000. Conservative (0.7×): $24,500 savings. Expected (1.0×): $35,000. Upside (1.3×): $45,500."),

      divider(),

      // ── SECTION 02 ───────────────────────────────────────────────────────
      eyebrow("Section 02"),
      h2("Content & Asset Operations", CYAN),
      body("The PIM + DAM value of PXM. Universally applicable — every brand with 100+ SKUs has this problem."),

      h3("What It Is"),
      body("Every time someone on the team manually updates a product listing, reformats content for a new retailer, or spends 20 minutes hunting for the right product image — that's labor the platform eliminates. This is invisible cost: buried in salary hours, never showing up on a budget line."),

      h3("Why You Bring It In"),
      body("This is the most universally resonant section. Most brands have never added up how many manual content updates they do per year or how long each one takes. Walking through the fields together IS the discovery conversation — their answers reveal a cost they didn't know they had."),

      h3("Fields & What to Ask"),
      makeTable(
        ["Field", "Plain-English Question to Ask", "Typical Starting Point"],
        [
          ["Products in scope", "How many active SKUs does your team manage content for?", "100–10,000 depending on brand"],
          ["Updates / product / year", "How often does product content change — seasonally, pricing, copy, new images?", "2–4× per year"],
          ["Minutes / manual update", "How long does one content update take today — logging in, reformatting, submitting?", "20–45 minutes"],
          ["Time saved per update", "What portion of that manual work disappears when content is managed in one place?", "50–70% is a reasonable start"],
          ["Asset requests / year", "How many times a year does someone on your team search for, request, or re-send a product image or file?", "200–2,000 depending on team size"],
          ["Minutes saved / request", "How long does it take to track down an asset today vs. finding it in a searchable library?", "15–25 minutes"],
          ["Team hourly rate", "What is your fully-loaded cost per hour — salary, benefits, and overhead?", "$45–$65/hr is typical"],
        ],
        [22, 44, 34]
      ),
      spacer(80),

      h3("The Math"),
      ...formula("Content operations value", "products × updates/yr × minutes/update × time-saved%  ÷ 60  × hourly rate  × scenario factor"),
      ...formula("Asset operations value", "asset requests/yr × minutes-saved/request  ÷ 60  × hourly rate  × scenario factor"),
      ...formula("Combined ops value", "content operations value  +  asset operations value"),

      h3("How to Talk About It"),
      bullet("\"Your team is spending X hours a year on work that shouldn't exist. PXM's single source of truth makes most of it disappear.\""),
      bullet("\"We're not estimating this — these are your numbers. The tool just converts them into hours and dollars.\""),
      bullet("Lead with products and updates first. Once those are in, the hours number usually surprises people."),

      ...callout("Scenario example", "500 products, 3 updates/year, 30 min/update, 60% time saved, $50/hr. Content ops: 500 × 3 × 30 × 0.60 ÷ 60 × $50 = $22,500. Conservative (0.7×): $15,750. Expected (1.0×): $22,500. Upside (1.3×): $29,250."),

      // ── PAGE BREAK ───────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 03 ───────────────────────────────────────────────────────
      eyebrow("Section 03"),
      h2("Syndication Savings", CYAN),
      body("The syndication value of PXM. Any brand on more than two retail channels will feel this immediately."),

      h3("What It Is"),
      body("One update to PXM automatically pushes content to every connected retailer and marketplace. This section models the manual push labor that disappears when you're no longer reformatting and resubmitting the same content to every destination, every time something changes. Pattern's platform currently syndicates to 13 distinct channels."),

      h3("Why You Bring It In"),
      body("Amazon has different image specs than Walmart. Target has different copy length requirements than a DTC site. Without PXM, someone is manually reformatting and resubmitting for every channel, every time. Most teams have never added this up — the discovery conversation does it with them in real time."),

      h3("Fields & What to Ask"),
      makeTable(
        ["Field", "Plain-English Question to Ask", "Typical Starting Point"],
        [
          ["Products being syndicated", "How many products are you distributing across retail channels?", "50–5,000"],
          ["Number of retail channels", "How many distinct destinations receive your content — Amazon, Walmart, Target, your site, etc.?", "2–13 channels; Pattern syndicates to 13+"],
          ["Content updates / product / year", "When content changes — seasonally, pricing, copy — how many times a year per product?", "2–6×"],
          ["Minutes to update one product at one retailer", "How long does it take to copy, reformat, and submit to one retailer today?", "10–20 min routine; 30–45 min first-time"],
          ["How much does PXM eliminate", "Once PXM auto-syndicates, what % of that manual push work goes away?", "70–90% is typical"],
        ],
        [22, 44, 34]
      ),
      spacer(80),

      h3("The Math"),
      ...formula("Manual pushes per year", "products  ×  channels  ×  updates/year"),
      ...formula("Hours eliminated", "manual pushes  ×  minutes/push  ×  automation%  ÷  60"),
      ...formula("Syndication savings (scenario-adjusted)", "hours eliminated  ×  hourly rate  ×  scenario factor"),

      h3("How to Talk About It"),
      bullet("\"One update in PXM goes everywhere. The math here is: how many manual pushes per year, times how long each one takes.\""),
      bullet("\"When you change a product image or update seasonal copy, how do you get that live on Amazon, Walmart, and Target today?\" — The answer reveals the scale of the problem.\""),
      bullet("Most customers adjust the automation % down themselves once they think about it — which actually builds more trust than inflating it."),

      ...callout("Scenario example", "250 products, 5 channels, 4 updates/year, 15 min/push, 80% automated, $50/hr. Pushes: 5,000/yr. Hours eliminated: 5,000 × 15 × 0.80 ÷ 60 = 1,000 hrs. Conservative (0.7×): $35,000. Expected (1.0×): $50,000. Upside (1.3×): $65,000."),

      divider(),

      // ── SECTION 04 ───────────────────────────────────────────────────────
      eyebrow("Section 04"),
      h2("Tool Consolidation", CYAN),
      body("Direct cost displacement. The most defensible lever in the entire calculator."),

      h3("What It Is"),
      body("PXM is PIM + DAM + Syndication in a single platform. This section captures what the brand currently pays for those capabilities separately. Unlike every other section, this requires no estimates, no benchmarks, and no scenario adjustment. It is a direct invoice swap."),

      h3("Why You Bring It In"),
      body("If a brand is paying $40K/year for Salsify and they switch to PXM, they save $40K — regardless of adoption speed or team behavior. This is the floor of PXM's value before a single hour of savings is modeled. In a budget conversation, this is the number that gets the CFO's attention."),

      h3("Fields & What to Ask"),
      makeTable(
        ["Field", "Tools Being Replaced", "Typical Annual Cost"],
        [
          ["Current PIM tool cost", "Salsify, Akeneo, inRiver, Plytix", "$15,000–$100,000+"],
          ["Current DAM tool cost", "Bynder, Widen (Acquia DAM), Brandfolder, Canto, Extensis", "$10,000–$75,000+"],
          ["Current syndication tool cost", "Syndigo, Feedonomics, ChannelAdvisor, Productsup", "$10,000–$80,000+"],
        ],
        [28, 42, 30]
      ),
      spacer(80),

      h3("The Math"),
      ...formula("Tool consolidation savings", "current PIM cost  +  current DAM cost  +  current syndication tool cost"),
      body("No scenario factor applied. This is not an estimate — it is a known, confirmed cost that disappears on day one of PXM."),

      h3("How to Talk About It"),
      bullet("\"This is the one number in the tool that doesn't need any assumptions. If you're paying for a separate PIM, DAM, or syndication tool, that cost is your floor — before we've modeled a single hour of savings.\""),
      bullet("\"What tools are you currently using for product data, digital assets, and content distribution? What do you pay for each?\""),
      bullet("If they don't know: \"It's worth checking with your tech or finance team before our next call. This number will be your strongest input.\""),

      ...callout("Scenario example", "Brand pays $35,000/year for Salsify (PIM) + $20,000/year for Bynder (DAM) + $18,000/year for Feedonomics (syndication). Tool consolidation savings = $73,000 — applied at 100% regardless of scenario selection. This appears in every scenario view at the same value."),

      // ── PAGE BREAK ───────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 05 ───────────────────────────────────────────────────────
      eyebrow("Section 05"),
      h2("Growth & Investment", CYAN),
      body("Customer-owned revenue hypothesis. Present last, after the operational case is credible."),

      h3("What It Is"),
      body("An optional estimate of revenue impact from better-performing content. Pattern-managed brands average an 81.56% content match score across their catalogs — better content visibility correlates with search ranking and conversion rate. The number in this section belongs to the prospect, not to Pattern."),

      h3("Why You Bring It In"),
      body("Carefully. Lead with Sections 02–04 to establish the operational case first. Only introduce growth once the baseline stands on its own. Make explicit that this is the customer's hypothesis — Pattern is not making the promise."),

      h3("Fields & What to Ask"),
      makeTable(
        ["Field", "Plain-English Question to Ask", "Guidance"],
        [
          ["Annual revenue in scope", "What is the annual revenue base that better-performing content could impact?", "Typically Amazon or total ecommerce revenue"],
          ["Your expected revenue lift", "If your listings performed meaningfully better, what % improvement would you expect?", "Default 1%. Pattern brands avg 81.56% match score — use as context, not a claim."],
          ["Gross margin", "What is your margin on that revenue?", "Determines the profit value of the lift"],
          ["Credit to better content?", "Of that revenue lift, how much would you attribute to content quality specifically?", "40–60% when content is a known gap. Customer decides."],
          ["Annual PXM investment", "This is the platform fee from the commercial proposal.", "Enter the actual proposed figure"],
          ["One-time implementation", "One-time onboarding and setup cost.", "Enter from proposal"],
        ],
        [24, 42, 34]
      ),
      spacer(80),

      h3("The Math"),
      ...formula("Growth contribution (scenario-adjusted)", "annual revenue  ×  lift%  ×  gross margin%  ×  attribution%  ×  scenario factor"),
      ...formula("Year-one net value", "gross benefit  −  (annual PXM fee  +  implementation cost)"),
      ...formula("Year-one ROI", "(net value  ÷  year-one investment)  ×  100"),
      ...formula("Payback (months)", "(year-one investment  ÷  annual gross benefit)  ×  12"),
      ...formula("3-year net value", "(annual gross benefit × 3)  −  (annual PXM fee × 3)  −  implementation"),

      h3("How to Talk About It"),
      bullet("\"This number is your estimate, not ours. We've left it conservative at 1%. If you think that's too low or too high for your business, adjust it — the model is yours.\""),
      bullet("\"Pattern-managed brands average an 81.56% content match score. If your catalog is currently below that, there's a real opportunity here — but we want you to decide what that's worth, not us.\""),
      bullet("Lead with the operational case ($0 in this field). Then say: 'If we add even a conservative growth assumption, here's what changes.'"),

      ...callout("Scenario example", "$10M revenue, 1% lift, 40% gross margin, 50% credited to content. Growth contribution = $10M × 0.01 × 0.40 × 0.50 = $20,000. Conservative (0.7×): $14,000. Expected (1.0×): $20,000. Upside (1.3×): $26,000. Tip: the operational case (Sections 02–04) typically produces 5–10× more value than the growth section at conservative inputs."),

      divider(),

      // ── RESULTS SUMMARY ──────────────────────────────────────────────────
      eyebrow("Results Reference"),
      h2("Reading the Output Panel"),

      makeTable(
        ["Output", "Formula", "What to Say"],
        [
          ["Estimated year-one net value", "Gross benefit − (annual PXM fee + implementation)", "\"This is the net value in year one after fully paying for Pattern.\""],
          ["Year-one ROI", "(Net value ÷ year-one investment) × 100", "\"For every dollar invested in PXM, you get back $X.\""],
          ["Payback", "(Year-one cost ÷ annual gross benefit) × 12", "\"You recover the full investment in X months.\""],
          ["3-year net value", "(Gross benefit × 3) − (annual fee × 3) − implementation", "\"Over three years, after all platform costs, the net value is X.\""],
          ["Hours returned", "Content hours + asset hours + syndication hours", "\"Your team gets back X hours per year — time that currently goes to manual work.\""],
          ["Benefit by lever", "Each section's scenario-adjusted value", "\"Here's where the value comes from — and you can see the math behind every number.\""],
        ],
        [22, 36, 42]
      ),

      spacer(200),
      new Paragraph({
        spacing: { before: 240 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: "Directional planning model — not a guarantee of results. All inputs should be validated with the customer before use in a final business case.",
          size: 16, color: MUTED, italics: true,
        })],
      }),
    ],
  }],
});

// ─── Write ─────────────────────────────────────────────────────────────────
const buffer = await Packer.toBuffer(doc);
writeFileSync("public/PXM_Section_Brief.docx", buffer);
console.log("✓ Written to public/PXM_Section_Brief.docx");
