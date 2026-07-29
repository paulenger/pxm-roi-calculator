from pathlib import Path
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "PXM_ROI_Calculator_User_Guide.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#080B12")
PANEL = colors.HexColor("#121827")
PANEL_2 = colors.HexColor("#171F32")
CYAN = colors.HexColor("#00A7FF")
VIOLET = colors.HexColor("#7426FF")
INK = colors.HexColor("#F7F8FB")
MUTED = colors.HexColor("#9AA5B8")
LINE = colors.HexColor("#2A3245")
GREEN = colors.HexColor("#22C55E")
AMBER = colors.HexColor("#F59E0B")

regular = "/System/Library/Fonts/Supplemental/Arial.ttf"
bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
if Path(regular).exists():
    pdfmetrics.registerFont(TTFont("GuideSans", regular))
    pdfmetrics.registerFont(TTFont("GuideSans-Bold", bold))
    FONT = "GuideSans"
    FONT_BOLD = "GuideSans-Bold"
else:
    FONT = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"


class GuideDoc(BaseDocTemplate):
    pass


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(0.55 * inch, 0.48 * inch, 7.95 * inch, 0.48 * inch)
    canvas.setFont(FONT, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.55 * inch, 0.29 * inch, "Pattern PXM Value Calculator - User Guide")
    canvas.drawRightString(7.95 * inch, 0.29 * inch, f"{doc.page}")
    canvas.restoreState()


doc = GuideDoc(
    str(OUT),
    pagesize=letter,
    leftMargin=0.62 * inch,
    rightMargin=0.62 * inch,
    topMargin=0.58 * inch,
    bottomMargin=0.62 * inch,
    title="Pattern PXM Value Calculator User Guide",
    author="Pattern PXM",
    subject="First-time-user guide for the PXM ROI calculator",
)
frame = Frame(
    doc.leftMargin,
    doc.bottomMargin,
    doc.width,
    doc.height,
    id="main",
    showBoundary=0,
)
doc.addPageTemplates([PageTemplate(id="guide", frames=frame, onPage=footer)])

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverEyebrow", fontName=FONT_BOLD, fontSize=10, leading=12,
    textColor=CYAN, spaceAfter=16, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CoverTitle", fontName=FONT_BOLD, fontSize=34, leading=37,
    textColor=INK, spaceAfter=16,
))
styles.add(ParagraphStyle(
    name="CoverDeck", fontName=FONT, fontSize=15, leading=21,
    textColor=MUTED, spaceAfter=22,
))
styles.add(ParagraphStyle(
    name="H1x", fontName=FONT_BOLD, fontSize=23, leading=27,
    textColor=INK, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="H2x", fontName=FONT_BOLD, fontSize=14, leading=17,
    textColor=CYAN, spaceBefore=10, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="Bodyx", fontName=FONT, fontSize=9.5, leading=14,
    textColor=colors.HexColor("#D5DAE5"), spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="Smallx", fontName=FONT, fontSize=8, leading=11.5,
    textColor=MUTED, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="Calloutx", fontName=FONT_BOLD, fontSize=10.5, leading=15,
    textColor=INK, spaceAfter=0,
))
styles.add(ParagraphStyle(
    name="Formula", fontName="Courier", fontSize=8.5, leading=12,
    textColor=colors.HexColor("#DDE7FF"), leftIndent=8, rightIndent=8,
))
styles.add(ParagraphStyle(
    name="TableHead", fontName=FONT_BOLD, fontSize=8, leading=10,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableBody", fontName=FONT, fontSize=7.6, leading=10,
    textColor=colors.HexColor("#D5DAE5"),
))


def p(text, style="Bodyx"):
    return Paragraph(text, styles[style])


def title(kicker, heading, intro=None):
    items = [
        p(kicker.upper(), "CoverEyebrow"),
        p(heading, "H1x"),
    ]
    if intro:
        items.append(p(intro, "Bodyx"))
    items.append(Spacer(1, 5))
    return items


def callout(heading, body, color=CYAN):
    table = Table(
        [[p(heading, "Calloutx"), p(body, "Smallx")]],
        colWidths=[1.55 * inch, 5.45 * inch],
        hAlign="LEFT",
    )
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL_2),
        ("BOX", (0, 0), (-1, -1), 0.7, color),
        ("LINEBEFORE", (0, 0), (0, 0), 4, color),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return table


def table(rows, widths, header=True):
    data = []
    for r, row in enumerate(rows):
        data.append([
            cell if hasattr(cell, "wrap") else p(str(cell), "TableHead" if r == 0 and header else "TableBody")
            for cell in row
        ])
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), PANEL_2 if header else PANEL),
        ("BACKGROUND", (0, 1 if header else 0), (-1, -1), PANEL),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    t.setStyle(TableStyle(commands))
    return t


story = []

# Cover
story += [
    Spacer(1, 0.65 * inch),
    p("PATTERN PXM  /  VALUE MODEL V1", "CoverEyebrow"),
    p("PXM ROI Calculator<br/>User Guide", "CoverTitle"),
    p(
        "A practical, first-time-user guide to preparing inputs, understanding every calculation, "
        "reading the results, and presenting a responsible customer business case.",
        "CoverDeck",
    ),
    Spacer(1, 0.2 * inch),
    callout(
        "Start here",
        "Open the calculator at <link href='https://pxm-roi-calculator.vercel.app/' "
        "color='#00A7FF'>pxm-roi-calculator.vercel.app</link>. Use this guide beside it during "
        "discovery, scoping, and value-review conversations.",
        VIOLET,
    ),
    Spacer(1, 0.38 * inch),
    table(
        [
            ["What this guide covers", "What the calculator produces"],
            ["Creative production", "Modeled cost, savings, and original HTML task logic"],
            ["Content and asset operations", "Hours returned and loaded-labor value"],
            ["Growth and investment", "Contribution, year-one ROI, payback, and 3-year value"],
            ["Evidence and governance", "How to label assumptions and avoid overclaiming"],
        ],
        [3.35 * inch, 3.65 * inch],
    ),
    Spacer(1, 0.32 * inch),
    p(
        "Important: this is a directional planning model, not a guarantee of results. Customer inputs "
        "and supporting evidence should be validated before the result is used in a final business case.",
        "Smallx",
    ),
    PageBreak(),
]

# Page 2
story += title(
    "01 - Quick start",
    "Use the calculator in six steps",
    "The best experience begins with hard operational inputs, then adds growth assumptions only after the baseline case is credible.",
)
story += [
    table(
        [
            ["Step", "Action", "Why it matters"],
            ["1", "Choose Conservative, Expected, or Upside.", "Sets the realization factor applied to modeled benefits."],
            ["2", "Enter the brand's current annual creative spend.", "Creates the baseline for creative-production savings."],
            ["3", "Describe a typical creative project.", "Drives the exact overhead calculation inherited from the supplied HTML."],
            ["4", "Enter content and asset workflow volumes.", "Translates repetitive work into annual hours and labor value."],
            ["5", "Add growth and PXM investment inputs.", "Calculates contribution, net value, ROI, and payback."],
            ["6", "Open Show calculation logic.", "Audits the formulas using the current values on screen."],
        ],
        [0.45 * inch, 2.65 * inch, 3.9 * inch],
    ),
    Spacer(1, 12),
    p("Recommended meeting sequence", "H2x"),
    p(
        "<b>Start with operational value.</b> Set expected revenue lift to 0% and establish the case from "
        "creative spend, content operations, and asset operations. Then introduce growth contribution as "
        "a separately attributable upside.",
    ),
    callout(
        "Do not skip the baseline",
        "Record the brand's source, owner, time period, and confidence level for every input. Without a baseline, future ROI remains an estimate.",
        AMBER,
    ),
    Spacer(1, 10),
    p("What the calculator does not do", "H2x"),
    table(
        [
            ["It does", "It does not"],
            ["Build a directional financial model", "Guarantee conversion or revenue improvement"],
            ["Use exact supplied creative task math", "Validate the underlying internal role rates"],
            ["Separate levers into a benefit breakdown", "Replace finance, legal, or customer approval"],
            ["Apply scenario realization factors", "Prove that aggregate PXM usage caused a customer's ROI"],
        ],
        [3.5 * inch, 3.5 * inch],
    ),
    PageBreak(),
]

# Page 3
story += title(
    "02 - Prepare the inputs",
    "Collect evidence before entering numbers",
    "Use the strongest available source for each field. Customer-system data is preferable to interviews; interviews are preferable to generic assumptions.",
)
story += [
    table(
        [
            ["Input group", "Ask the brand", "Preferred source"],
            ["Creative", "Annual spend, ASINs/project, concepts/project, projects/year", "Budget, agency invoices, creative operations"],
            ["Content operations", "Products, updates/year, minutes/update, time reduction", "PIM exports, time study, workflow interviews"],
            ["Asset operations", "Requests/year, minutes saved/request", "Ticketing, email volume, DAM analytics, time study"],
            ["Labor", "Fully loaded hourly rate", "Finance or HR; include benefits and overhead if approved"],
            ["Growth", "Revenue in scope, lift, margin, attribution", "Commerce analytics and finance"],
            ["Investment", "Annual subscription and one-time implementation", "Final commercial proposal"],
        ],
        [1.3 * inch, 3.1 * inch, 2.6 * inch],
    ),
    Spacer(1, 12),
    p("Confidence labels", "H2x"),
    table(
        [
            ["Label", "Use when", "Presentation language"],
            ["Customer actual", "Directly exported or finance-approved", "Measured"],
            ["Customer estimate", "Provided by a process owner", "Customer-estimated"],
            ["Pattern benchmark", "Supported by a documented sample and method", "Benchmark"],
            ["Case-study report", "Presented in approved sales collateral", "Reported"],
            ["Illustrative assumption", "Used only to demonstrate the model", "Illustrative - replace before approval"],
        ],
        [1.45 * inch, 2.85 * inch, 2.7 * inch],
    ),
    Spacer(1, 12),
    callout(
        "Current evidence note",
        "The 2,080-hour, $650K Skullcandy, and 'hours to minutes' statements come from the PXM Master Slide Library. The provided slides do not contain the underlying calculation workbooks, so the calculator labels them as reported or estimated outcomes.",
        VIOLET,
    ),
    Spacer(1, 10),
    p("Scenario factors", "H2x"),
    table(
        [
            ["Scenario", "Factor", "Use"],
            ["Conservative", "70%", "Budget review, limited adoption, or uncertain assumptions"],
            ["Expected", "100%", "Most likely case using agreed inputs"],
            ["Upside", "130%", "Expansion or high-adoption opportunity; never present alone"],
        ],
        [1.45 * inch, 0.8 * inch, 4.75 * inch],
    ),
    PageBreak(),
]

# Page 4
story += title(
    "03 - Creative production",
    "How the original HTML calculation works",
    "This section replaces invented per-image assumptions with the exact task, rate, and scaling engine from Creative_Team_Overhead_Calculator_Client.html.",
)
story += [
    table(
        [
            ["Field", "Meaning"],
            ["Current annual creative spend", "Brand-provided baseline. It starts at zero and is not supplied by Pattern."],
            ["ASIN count/project", "Number of Amazon product identifiers handled in one modeled project."],
            ["Concept count/project", "Number of creative concepts. Concept tasks scale by this value."],
            ["AI images/ASIN", "AI-generated images per ASIN. The original calculator defaults to 15."],
            ["Projects/year", "Annualizes the modeled cost."],
            ["Seller type", "Selects the original 1P or 3P role-rate table."],
            ["Delivery tier", "Creative only uses 1.0x. + PM multiplies modeled cost by 1.2x."],
        ],
        [2.1 * inch, 4.9 * inch],
    ),
    Spacer(1, 12),
    p("Scaling rules", "H2x"),
    table(
        [
            ["Rule", "Calculation", "Examples"],
            ["Fixed", "Task minutes x role rate", "Onboarding, audits, Brand Story, Brand Store"],
            ["Concept", "Concept count x task minutes x role rate", "Strategy, concept copy, concept design, prep"],
            ["ASIN", "ASIN count x unit factor x task minutes x role rate", "Image stacks, A+ production, uploads"],
        ],
        [1.0 * inch, 3.35 * inch, 2.65 * inch],
    ),
    Spacer(1, 12),
    p("Key image formulas", "H2x"),
    callout(
        "AI ImageGen",
        "<font name='Courier'>ASINs x AI images/ASIN x 1 minute x $0.14/minute x tier multiplier</font>",
        VIOLET,
    ),
    Spacer(1, 7),
    callout(
        "Image stacks",
        "<font name='Courier'>ASINs x 9 units x original copy/design/QA/review task-rate mix x tier multiplier</font>",
        CYAN,
    ),
    Spacer(1, 7),
    callout(
        "A+ production",
        "<font name='Courier'>ASINs x 7 units x original copy/design/QA/review task-rate mix x tier multiplier</font>",
        GREEN,
    ),
    PageBreak(),
]

# Page 5
story += title(
    "04 - From creative cost to savings",
    "Understand the roll-up before discussing ROI",
    "The modeled project includes more than AI image generation. It also includes onboarding, audits, concepts, production, uploads, Brand Story, and Brand Store.",
)
story += [
    p("Complete project cost", "H2x"),
    p(
        "Sum the original task costs across Onboarding, Audits, Image Stacks, A+ Content, Brand Story, "
        "Brand Store, and AI ImageGen. Apply 1.2x only when the + PM delivery tier is selected.",
        "Bodyx",
    ),
    callout(
        "Project cost",
        "<font name='Courier'>sum(all task minutes x task scaling x role rate) x tier multiplier</font>",
        CYAN,
    ),
    Spacer(1, 9),
    callout(
        "Annual modeled cost",
        "<font name='Courier'>modeled project cost x projects per year</font>",
        VIOLET,
    ),
    Spacer(1, 9),
    callout(
        "Creative savings",
        "<font name='Courier'>max(0, current annual creative spend - annual modeled cost) x scenario factor</font>",
        GREEN,
    ),
    Spacer(1, 14),
    p("What appears on screen", "H2x"),
    table(
        [
            ["Output", "Interpretation"],
            ["Modeled cost/project", "The original HTML overhead calculation for the current project inputs."],
            ["Modeled time/project", "Total task minutes divided by 60. PM changes cost but not modeled task time."],
            ["Modeled annual cost", "Project cost multiplied by projects/year."],
            ["Creative-production benefit", "Only positive savings versus customer-entered current spend."],
        ],
        [2.0 * inch, 5.0 * inch],
    ),
    Spacer(1, 12),
    callout(
        "Avoid a common mistake",
        "Do not describe the full project cost as the cost of AI images. AI ImageGen is one phase inside a broader creative-delivery model. Open Show calculation logic to isolate the AI, image-stack, A+, project, annual, and savings figures.",
        AMBER,
    ),
    Spacer(1, 11),
    p("About the original rates", "H2x"),
    p(
        "The HTML stores rates per minute: Art Director $0.93 (1P) or $0.87 (3P), Designer $0.14, "
        "Copywriter $0.12, QA $0.10, and Asset Manager $0.10. The guide documents the supplied model; "
        "it does not independently validate whether those rates should be shown externally.",
    ),
    PageBreak(),
]

# Page 6
story += title(
    "05 - Content and asset operations",
    "Translate repetitive work into annual labor value",
    "These formulas are ROI-model assumptions created for this calculator. They were not present in the supplied creative overhead HTML.",
)
story += [
    table(
        [
            ["Field", "Meaning", "How to validate"],
            ["Products in scope", "Products affected by PXM", "Catalog or implementation scope"],
            ["Updates/product/year", "Average annual update frequency", "Sample change logs"],
            ["Minutes/manual update", "Current hands-on time per product update", "Time study"],
            ["Workflow time reduction", "Share of manual effort removed", "Pilot or conservative estimate"],
            ["Asset requests/year", "Search, resize, or share requests", "Tickets, email, DAM usage"],
            ["Minutes saved/request", "Expected time reduction", "Before/after time study"],
            ["Loaded hourly rate", "Labor cost including approved overhead", "Finance/HR"],
        ],
        [1.65 * inch, 2.65 * inch, 2.7 * inch],
    ),
    Spacer(1, 12),
    p("Formulas", "H2x"),
    callout(
        "Content hours",
        "<font name='Courier'>products x updates/year x minutes/update x time reduction x scenario factor / 60</font>",
        CYAN,
    ),
    Spacer(1, 7),
    callout(
        "Content value",
        "<font name='Courier'>content hours x loaded hourly rate</font>",
        GREEN,
    ),
    Spacer(1, 7),
    callout(
        "Asset value",
        "<font name='Courier'>asset requests/year x minutes saved/request x scenario factor / 60 x loaded hourly rate</font>",
        VIOLET,
    ),
    Spacer(1, 13),
    p("Interpretation rules", "H2x"),
    p(
        "<b>Hours returned are not automatically headcount reduction.</b> Describe the value as capacity "
        "returned, avoided future hiring, faster throughput, or redeployment to higher-value work unless "
        "finance has approved a direct cost reduction.",
    ),
    p(
        "<b>Avoid overlap.</b> If a creative-spend baseline already includes the same internal labor counted "
        "in content or asset operations, separate the teams or remove the duplicate benefit.",
    ),
    PageBreak(),
]

# Page 7
story += title(
    "06 - Growth and investment",
    "Keep commercial upside separate from hard savings",
    "The growth calculation converts an attributed revenue lift into contribution using gross margin. It should usually be introduced after operational value is established.",
)
story += [
    table(
        [
            ["Field", "Meaning", "Caution"],
            ["Annual revenue in scope", "Revenue from products/channels influenced by PXM", "Do not use total company revenue by default"],
            ["Expected revenue lift", "Relative improvement attributed to better content", "Use a test, benchmark, or conservative estimate"],
            ["Gross margin", "Contribution retained after direct product cost", "Use finance-approved margin"],
            ["PXM attribution", "Share of modeled lift credited to PXM", "Controls over-attribution"],
            ["Annual PXM investment", "Recurring subscription and approved recurring cost", "Use final proposal"],
            ["One-time implementation", "Migration, onboarding, and launch cost", "Include known internal/external costs"],
        ],
        [1.55 * inch, 2.85 * inch, 2.6 * inch],
    ),
    Spacer(1, 12),
    callout(
        "Growth contribution",
        "<font name='Courier'>revenue in scope x revenue lift x gross margin x PXM attribution x scenario factor</font>",
        AMBER,
    ),
    Spacer(1, 12),
    p("Why attribution matters", "H2x"),
    p(
        "Conversion and revenue change for many reasons, including price, media, assortment, availability, "
        "seasonality, and promotions. PXM attribution limits the share credited to content and workflow improvements.",
    ),
    p("A defensible progression", "H2x"),
    table(
        [
            ["Level", "Recommended treatment"],
            ["Hard-savings case", "Set revenue lift to 0%. Use only agreed creative and operating savings."],
            ["Expected case", "Add a conservative lift and partial attribution supported by evidence."],
            ["Upside case", "Show separately; never substitute it for the hard-savings case."],
        ],
        [1.5 * inch, 5.5 * inch],
    ),
    PageBreak(),
]

# Page 8
story += title(
    "07 - Read the results",
    "Turn the outputs into an executive business case",
    "The right-hand panel summarizes value, timing, and the source of benefit. Read the outputs together, not in isolation.",
)
story += [
    table(
        [
            ["Output", "Formula", "What to say"],
            ["Gross annual benefit", "Creative + content + asset + growth", "Total modeled annual value before PXM cost"],
            ["Year-one investment", "Annual PXM + implementation", "Cash investment included in year one"],
            ["Year-one net value", "Gross benefit - year-one investment", "Value remaining after year-one cost"],
            ["Year-one ROI", "Net value / year-one investment", "Return relative to year-one investment"],
            ["Payback", "Year-one investment / gross benefit x 12", "Approximate months to recover the investment"],
            ["3-year net value", "3 x gross - 3 x annual PXM - implementation", "Simple 3-year value without discounting or ramp"],
            ["Hours returned", "Content hours + asset hours", "Operational capacity; creative project time is not counted as saved time"],
        ],
        [1.35 * inch, 2.45 * inch, 3.2 * inch],
    ),
    Spacer(1, 12),
    p("Annual benefit by lever", "H2x"),
    p(
        "The stacked bar shows which levers create the result: Creative Production, Content Operations, "
        "Asset Operations, and Growth Contribution. A financially credible case should not depend entirely "
        "on a high growth assumption.",
    ),
    p("PXM scale signals", "H2x"),
    p(
        "The W28 figures - 509K media stacks, 292K products with stacks, 819K syndicated products, and "
        "33 active channels - are contextual platform proof points. They do not enter a brand's ROI math.",
    ),
    p("Reported customer outcomes", "H2x"),
    table(
        [
            ["Statement", "Approved interpretation"],
            ["2,080+ hours", "Estimated yearly hours reported for one customer through automation"],
            ["$650K Skullcandy", "Estimated ROI reported in the Skullcandy case study"],
            ["Hours to minutes", "Reported reduction in asset-search time at 100 Percent"],
        ],
        [2.1 * inch, 4.9 * inch],
    ),
    PageBreak(),
]

# Page 9
story += title(
    "08 - Example and operating cadence",
    "Run the meeting, then measure the result",
    "The example below is illustrative. Replace every value with customer-approved inputs before presenting a final result.",
)
story += [
    table(
        [
            ["Meeting moment", "Presenter action"],
            ["Discovery", "Collect current creative spend, workflow volumes, rates, revenue scope, and investment."],
            ["First calculation", "Use Conservative or Expected; set revenue lift to 0%."],
            ["Audit", "Open Show calculation logic and walk through the image and labor formulas."],
            ["Upside", "Add an evidenced growth assumption and partial PXM attribution."],
            ["Agreement", "Record input owners, sources, confidence labels, and open questions."],
            ["Follow-up", "Export or summarize the agreed scenario; do not circulate unvalidated defaults."],
        ],
        [1.4 * inch, 5.6 * inch],
    ),
    Spacer(1, 12),
    p("Recommended cadence", "H2x"),
    table(
        [
            ["When", "Purpose"],
            ["Pre-sale", "Directional business case using customer inputs"],
            ["Kickoff", "Lock the baseline and measurement owners"],
            ["30/60/90 days", "Track adoption and annualize early value carefully"],
            ["Quarterly", "Replace assumptions with actual workflow and usage data"],
            ["Annually", "Produce the customer-validated ROI and case-study candidate"],
        ],
        [1.45 * inch, 5.55 * inch],
    ),
    Spacer(1, 12),
    p("Frequently asked questions", "H2x"),
    table(
        [
            ["Question", "Answer"],
            ["Are the creative calculations exact?", "They match the supplied HTML task engine. The validity of the underlying rates is a separate business question."],
            ["Are the other defaults Pattern benchmarks?", "No. Treat unvalidated defaults as illustrative and replace them with brand inputs."],
            ["Why can creative savings be zero?", "Savings never go below zero; current spend must exceed modeled annual cost."],
            ["Should growth be included?", "Only with a defined revenue scope, margin, lift basis, and attribution factor."],
            ["Can this be called realized ROI?", "Only after the customer baseline and post-launch actuals have been validated."],
        ],
        [2.15 * inch, 4.85 * inch],
    ),
    Spacer(1, 12),
    callout(
        "Final review question",
        "Could a finance leader reproduce every important number from the documented source, formula, and time period? If not, label the result as directional and record the missing evidence.",
        VIOLET,
    ),
]

doc.build(story)
shutil.copyfile(OUT, ROOT / "public" / "PXM_ROI_Calculator_User_Guide.pdf")
print(OUT)
