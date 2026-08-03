"use client";

import { useMemo, useState } from "react";
import {
  calculateCreativeProduction,
  type CreativeTier,
} from "@/lib/creative-cost-model";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/lib/report-pdf";

type Inputs = {
  currentAnnualCreativeSpend: number;
  asinCount: number;
  conceptCount: number;
  aiImagesPerAsin: number;
  annualProjects: number;
  creativeTier: CreativeTier;
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

const initial: Inputs = {
  currentAnnualCreativeSpend: 0,
  asinCount: 1,
  conceptCount: 1,
  aiImagesPerAsin: 15,
  annualProjects: 1,
  creativeTier: "creative",
  products: 5000,
  updates: 2,
  updateMinutes: 30,
  automation: 60,
  assetRequests: 1000,
  assetMinutesSaved: 20,
  hourlyRate: 50,
  syndicationSkus: 500,
  syndicationChannels: 5,
  syndicationUpdatesPerYear: 4,
  syndicationMinutesPerPush: 15,
  syndicationAutomation: 80,
  eligibleRevenue: 5000000,
  revenueLift: 2,
  grossMargin: 40,
  attribution: 50,
  annualPXM: 75000,
  implementation: 15000,
};

const scenarios = {
  conservative: { label: "Conservative", factor: 0.7, description: "Assumes 70% of projected benefits are realized — slower adoption, partial rollout." },
  expected: { label: "Expected", factor: 1, description: "Full modeled value — typical outcome with standard adoption." },
  upside: { label: "Upside", factor: 1.3, description: "130% of modeled value — favorable conditions, faster adoption, broader scope." },
} as const;

type Scenario = keyof typeof scenarios;

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

const moneyExact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(n) ? n : 0);

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  help,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  help?: string;
  min?: number;
  step?: number;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-shell">
        {prefix && <span>{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix && <span>{suffix}</span>}
      </span>
      {help && <span className="field-help">{help}</span>}
    </label>
  );
}

export default function Home() {
  const [inputs, setInputs] = useState(initial);
  const [scenario, setScenario] = useState<Scenario>("expected");
  const [showAssumptions, setShowAssumptions] = useState(false);
  const factor = scenarios[scenario].factor;

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const creativeModel = calculateCreativeProduction({
      asinCount: inputs.asinCount,
      conceptCount: inputs.conceptCount,
      aiImagesPerAsin: inputs.aiImagesPerAsin,
      tier: inputs.creativeTier,
    });
    const annualCreativeCost =
      creativeModel.projectCost * Math.max(1, inputs.annualProjects);
    const imageProduction =
      Math.max(0, inputs.currentAnnualCreativeSpend - annualCreativeCost) *
      factor;
    const contentHours =
      (inputs.products *
        inputs.updates *
        inputs.updateMinutes *
        (inputs.automation / 100) *
        factor) /
      60;
    const contentOps = contentHours * inputs.hourlyRate;
    const assetHours =
      (inputs.assetRequests * inputs.assetMinutesSaved * factor) / 60;
    const assetOps = assetHours * inputs.hourlyRate;
    const syndicationHours =
      (inputs.syndicationSkus *
        inputs.syndicationChannels *
        inputs.syndicationUpdatesPerYear *
        inputs.syndicationMinutesPerPush *
        (inputs.syndicationAutomation / 100) *
        factor) /
      60;
    const syndicationSavings = syndicationHours * inputs.hourlyRate;
    const revenue =
      inputs.eligibleRevenue *
      (inputs.revenueLift / 100) *
      (inputs.grossMargin / 100) *
      (inputs.attribution / 100) *
      factor;
    const gross = imageProduction + contentOps + assetOps + syndicationSavings + revenue;
    const yearOneCost = inputs.annualPXM + inputs.implementation;
    const net = gross - yearOneCost;
    const roi = yearOneCost > 0 ? (net / yearOneCost) * 100 : 0;
    const payback = gross > 0 ? (yearOneCost / gross) * 12 : 0;
    const hours = contentHours + assetHours + syndicationHours;
    const threeYear =
      gross * 3 - inputs.annualPXM * 3 - inputs.implementation;

    return {
      imageProduction,
      creativeProjectCost: creativeModel.projectCost,
      creativeProjectHours: creativeModel.projectHours,
      aiImageGenerationCost: creativeModel.aiImageGenerationCost,
      imageStackProductionCost: creativeModel.imageStackProductionCost,
      aPlusProductionCost: creativeModel.aPlusProductionCost,
      designerRatePerMinute: creativeModel.designerRatePerMinute,
      tierMultiplier: creativeModel.tierMultiplier,
      annualCreativeCost,
      contentOps,
      assetOps,
      syndicationSavings,
      syndicationHours,
      revenue,
      gross,
      yearOneCost,
      net,
      roi,
      payback,
      hours,
      threeYear,
    };
  }, [inputs, factor]);

  const benefits = [
    {
      name: "Creative production",
      value: result.imageProduction,
      color: "#8b5cf6",
    },
    { name: "Content operations", value: result.contentOps, color: "#0ea5e9" },
    { name: "Asset operations", value: result.assetOps, color: "#22c55e" },
    { name: "Syndication savings", value: result.syndicationSavings, color: "#ec4899" },
    { name: "Growth contribution", value: result.revenue, color: "#f59e0b" },
  ];

  const handleDownloadPDF = async () => {
    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const blob = await pdf(
      <ReportPDF
        inputs={inputs}
        result={result}
        scenario={scenarios[scenario].label}
        generatedAt={now}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pxm-value-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="mark">P</span>
          <span>PATTERN PXM</span>
        </div>
        <div className="top-actions">
          <a
            href="/PXM_ROI_Calculator_User_Guide.pdf"
            target="_blank"
            rel="noreferrer"
          >
            User guide (PDF)
          </a>
          <span className="prototype">VALUE MODEL · V1</span>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Build the business case</p>
          <h1>What could PXM be worth to your business?</h1>
          <p className="hero-copy">
            Estimate the annual value of faster image production, automated
            content workflows, easier asset access, and better-performing
            ecommerce content.
          </p>
        </div>
        <div className="scenario-wrap" aria-label="Scenario">
          <span>Scenario</span>
          <div className="scenario-tabs">
            {(Object.keys(scenarios) as Scenario[]).map((key) => (
              <button
                key={key}
                className={scenario === key ? "active" : ""}
                onClick={() => setScenario(key)}
              >
                {scenarios[key].label}
              </button>
            ))}
          </div>
          <small>{scenarios[scenario].description}</small>
        </div>
      </section>

      <section className="workspace">
        <div className="inputs-column">
          <section className="input-card image-card">
            <div className="card-heading">
              <span className="step">01</span>
              <div>
                <h2>Creative production</h2>
                <p>
                  See what Pattern charges to produce your content — based on
                  actual role rates and task times, not estimates.
                </p>
              </div>
            </div>
            <div className="field-grid">
              <Field
                label="Current annual creative spend"
                value={inputs.currentAnnualCreativeSpend}
                onChange={(v) => set("currentAnnualCreativeSpend", v)}
                prefix="$"
                help="What you currently pay annually for Amazon content creation"
              />
              <Field
                label="Products per project"
                value={inputs.asinCount}
                onChange={(v) => set("asinCount", v)}
                min={1}
                help="How many individual products are included in one creative project"
              />
              <Field
                label="Design concepts per project"
                value={inputs.conceptCount}
                onChange={(v) => set("conceptCount", v)}
                min={1}
                help="How many distinct visual directions are developed — typically 1 for a refresh, 2–3 for a new brand launch"
              />
              <Field
                label="AI images per product"
                value={inputs.aiImagesPerAsin}
                onChange={(v) => set("aiImagesPerAsin", v)}
                min={1}
                help="Number of AI-generated images produced per product listing"
              />
              <Field
                label="Projects per year"
                value={inputs.annualProjects}
                onChange={(v) => set("annualProjects", v)}
                min={1}
                help="How many creative projects does your brand run in a typical year"
              />
            </div>
            <div className="model-options">
              <div>
                <span className="field-label">Delivery tier</span>
                <div className="mini-tabs">
                  <button
                    className={
                      inputs.creativeTier === "creative" ? "active" : ""
                    }
                    onClick={() => set("creativeTier", "creative")}
                  >
                    Creative only
                  </button>
                  <button
                    className={inputs.creativeTier === "pm" ? "active" : ""}
                    onClick={() => set("creativeTier", "pm")}
                  >
                    Include project management (+20%)
                  </button>
                </div>
              </div>
            </div>
            <div className="model-output">
              <span>
                <small>Pattern's cost / project</small>
                <strong>{money(result.creativeProjectCost)}</strong>
              </span>
              <span>
                <small>Est. time / project</small>
                <strong>{result.creativeProjectHours.toFixed(1)} hrs</strong>
              </span>
              <span>
                <small>Pattern's annual cost</small>
                <strong>{money(result.annualCreativeCost)}</strong>
              </span>
              <span className="model-output-savings">
                <small>Savings vs. your current spend</small>
                {inputs.currentAnnualCreativeSpend === 0 ? (
                  <span className="model-output-prompt">Enter current spend above to calculate</span>
                ) : (
                  <strong>{money(Math.max(0, inputs.currentAnnualCreativeSpend - result.annualCreativeCost))}</strong>
                )}
              </span>
            </div>
          </section>

          <section className="input-card">
            <div className="card-heading">
              <span className="step">02</span>
              <div>
                <h2>Content & asset operations</h2>
                <p>Estimate the hours your team spends on manual content updates and asset retrieval today — and what goes away with PXM.</p>
              </div>
            </div>
            <div className="field-grid">
              <Field
                label="Products in scope"
                value={inputs.products}
                onChange={(v) => set("products", v)}
              />
              <Field
                label="Updates / product / year"
                value={inputs.updates}
                onChange={(v) => set("updates", v)}
              />
              <Field
                label="Minutes / manual update"
                value={inputs.updateMinutes}
                onChange={(v) => set("updateMinutes", v)}
                suffix="min"
              />
              <Field
                label="Time saved per content update"
                value={inputs.automation}
                onChange={(v) => set("automation", v)}
                suffix="%"
                help="What portion of manual update time disappears when content is managed in one place. A reasonable starting point is 50–70%."
              />
              <Field
                label="Internal asset requests per year"
                value={inputs.assetRequests}
                onChange={(v) => set("assetRequests", v)}
                help="How many times per year does your team search for, request, or re-send a product image, logo, or file"
              />
              <Field
                label="Minutes saved per request"
                value={inputs.assetMinutesSaved}
                onChange={(v) => set("assetMinutesSaved", v)}
                suffix="min"
                help="Time saved when assets are in a single searchable library vs. tracked down across email, Dropbox, or shared drives"
              />
              <Field
                label="Team hourly rate"
                value={inputs.hourlyRate}
                onChange={(v) => set("hourlyRate", v)}
                prefix="$"
                help="Fully-loaded cost per hour including salary, benefits, and overhead. Typical range: $45–$65/hr"
              />
            </div>
          </section>

          <section className="input-card">
            <div className="card-heading">
              <span className="step">03</span>
              <div>
                <h2>Syndication savings</h2>
                <p>
                  One update in PXM, automatically pushed to every retailer.
                  Model the manual labor that disappears.
                </p>
              </div>
            </div>
            <div className="field-grid">
              <Field
                label="Products being syndicated"
                value={inputs.syndicationSkus}
                onChange={(v) => set("syndicationSkus", v)}
                min={1}
                help="How many products are you distributing across retailers and marketplaces"
              />
              <Field
                label="Number of retail channels"
                value={inputs.syndicationChannels}
                onChange={(v) => set("syndicationChannels", v)}
                min={1}
                help="How many distinct destinations receive your content — Amazon, Walmart, Target, your website, etc."
              />
              <Field
                label="Content updates per product per year"
                value={inputs.syndicationUpdatesPerYear}
                onChange={(v) => set("syndicationUpdatesPerYear", v)}
                min={1}
                help="How many times a year does product content change — seasonal refreshes, pricing, copy updates, new images"
              />
              <Field
                label="Minutes to manually update one product at one retailer"
                value={inputs.syndicationMinutesPerPush}
                onChange={(v) => set("syndicationMinutesPerPush", v)}
                suffix="min"
                help="How long does it take to copy, format, and submit updated content to a single retailer today"
              />
              <Field
                label="How much of that work does PXM eliminate"
                value={inputs.syndicationAutomation}
                onChange={(v) => set("syndicationAutomation", v)}
                suffix="%"
                help="PXM auto-syndicates content to all connected channels from one update. Most brands see 70–90% of manual push work eliminated."
              />
            </div>
          </section>

          <section className="input-card">
            <div className="card-heading">
              <span className="step">04</span>
              <div>
                <h2>Growth & investment</h2>
                <p>If your content performs better, what's the business impact? Enter your own estimate — adjust to reflect your confidence level.</p>
              </div>
            </div>
            <div className="field-grid">
              <Field
                label="Annual revenue in scope"
                value={inputs.eligibleRevenue}
                onChange={(v) => set("eligibleRevenue", v)}
                prefix="$"
              />
              <Field
                label="Your expected revenue lift"
                value={inputs.revenueLift}
                onChange={(v) => set("revenueLift", v)}
                suffix="%"
                step={0.1}
                help="This is your estimate, not Pattern's claim. Pattern-managed brands average an 81.56% content match score — better content visibility correlates with higher conversion. Most brands start conservatively at 1–2% and adjust based on their catalog's current content quality."
              />
              <Field
                label="Gross margin"
                value={inputs.grossMargin}
                onChange={(v) => set("grossMargin", v)}
                suffix="%"
              />
              <Field
                label="How much of that lift would you credit to better content?"
                value={inputs.attribution}
                onChange={(v) => set("attribution", v)}
                suffix="%"
                help="Content quality is one driver of revenue lift — not the only one. 40–60% is a reasonable attribution for brands where content is a known gap."
              />
            </div>
            <div className="field-section-divider">
              <span>Investment</span>
            </div>
            <div className="field-grid">
              <Field
                label="Annual PXM investment"
                value={inputs.annualPXM}
                onChange={(v) => set("annualPXM", v)}
                prefix="$"
              />
              <Field
                label="One-time implementation"
                value={inputs.implementation}
                onChange={(v) => set("implementation", v)}
                prefix="$"
              />
            </div>
          </section>
        </div>

        <aside className="results">
          <div className="result-hero">
            <p>Estimated year-one net value</p>
            <strong>{money(result.net)}</strong>
            <span>
              {money(result.gross)} gross benefit · {compact(result.hours)} hours
              returned
            </span>
          </div>
          <button className="download-btn" onClick={handleDownloadPDF}>
            Download report (PDF)
          </button>
          <div className="metric-grid">
            <div>
              <span>Year-one ROI</span>
              <strong>{Math.round(result.roi)}%</strong>
            </div>
            <div>
              <span>Payback</span>
              <strong>{result.payback.toFixed(1)} mo</strong>
            </div>
            <div>
              <span>3-year net value</span>
              <strong>{money(result.threeYear)}</strong>
            </div>
            <div>
              <span>Year-one investment</span>
              <strong>{money(result.yearOneCost)}</strong>
            </div>
          </div>

          <div className="benefit-card">
            <div className="section-title">
              <h3>Annual benefit by lever</h3>
              <span>{money(result.gross)}</span>
            </div>
            <div className="stacked-bar">
              {benefits.map((item) => (
                <span
                  key={item.name}
                  style={{
                    width: `${result.gross ? (item.value / result.gross) * 100 : 0}%`,
                    background: item.color,
                  }}
                />
              ))}
            </div>
            <div className="benefit-list">
              {benefits.map((item) => (
                <div key={item.name}>
                  <span>
                    <i style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <strong>{money(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>

          <button
            className="assumption-toggle"
            onClick={() => setShowAssumptions((value) => !value)}
          >
            {showAssumptions ? "Hide" : "Show"} calculation logic
            <span>{showAssumptions ? "−" : "+"}</span>
          </button>
          {showAssumptions && (
            <div className="logic">
              <div className="logic-section">
                <b>Creative production — current inputs</b>
                <div className="formula-row">
                  <span>AI image generation</span>
                  <code>
                    {inputs.asinCount} ASIN{inputs.asinCount !== 1 ? "s" : ""} ×{" "}
                    {inputs.aiImagesPerAsin} images × 1 min ×{" "}
                    {moneyExact(result.designerRatePerMinute)}/min
                    {result.tierMultiplier !== 1
                      ? ` × ${result.tierMultiplier}`
                      : ""}
                  </code>
                  <strong>{moneyExact(result.aiImageGenerationCost)}</strong>
                </div>
                <div className="formula-row">
                  <span>Image-stack production</span>
                  <code>
                    {inputs.asinCount} ASIN{inputs.asinCount !== 1 ? "s" : ""} ×
                    9 units × original task/role rate mix
                    {result.tierMultiplier !== 1
                      ? ` × ${result.tierMultiplier}`
                      : ""}
                  </code>
                  <strong>{moneyExact(result.imageStackProductionCost)}</strong>
                </div>
                <div className="formula-row">
                  <span>A+ production</span>
                  <code>
                    {inputs.asinCount} ASIN{inputs.asinCount !== 1 ? "s" : ""} ×
                    7 units × original task/role rate mix
                    {result.tierMultiplier !== 1
                      ? ` × ${result.tierMultiplier}`
                      : ""}
                  </code>
                  <strong>{moneyExact(result.aPlusProductionCost)}</strong>
                </div>
                <div className="formula-row total">
                  <span>Complete project</span>
                  <code>
                    onboarding + audits + concepts + production + uploads +
                    brand content + AI images
                  </code>
                  <strong>{moneyExact(result.creativeProjectCost)}</strong>
                </div>
                <div className="formula-row">
                  <span>Annual modeled cost</span>
                  <code>
                    {moneyExact(result.creativeProjectCost)} ×{" "}
                    {inputs.annualProjects} project
                    {inputs.annualProjects !== 1 ? "s" : ""}
                  </code>
                  <strong>{moneyExact(result.annualCreativeCost)}</strong>
                </div>
                <div className="formula-row total">
                  <span>Scenario-adjusted savings</span>
                  <code>
                    max(0, {moneyExact(inputs.currentAnnualCreativeSpend)} −{" "}
                    {moneyExact(result.annualCreativeCost)}) ×{" "}
                    {factor.toFixed(1)}
                  </code>
                  <strong>{moneyExact(result.imageProduction)}</strong>
                </div>
              </div>
              <p>
                <b>Operations:</b> annual task volume × minutes saved × loaded
                hourly rate.
              </p>
              <div className="logic-section">
                <b>Syndication savings — current inputs</b>
                <div className="formula-row">
                  <span>Manual pushes / year</span>
                  <code>
                    {inputs.syndicationSkus.toLocaleString()} SKUs ×{" "}
                    {inputs.syndicationChannels} channels ×{" "}
                    {inputs.syndicationUpdatesPerYear} updates
                  </code>
                  <strong>
                    {(inputs.syndicationSkus * inputs.syndicationChannels * inputs.syndicationUpdatesPerYear).toLocaleString()}
                  </strong>
                </div>
                <div className="formula-row">
                  <span>Minutes eliminated</span>
                  <code>
                    {(inputs.syndicationSkus * inputs.syndicationChannels * inputs.syndicationUpdatesPerYear).toLocaleString()} pushes ×{" "}
                    {inputs.syndicationMinutesPerPush} min × {inputs.syndicationAutomation}% automated
                  </code>
                  <strong>
                    {Math.round(inputs.syndicationSkus * inputs.syndicationChannels * inputs.syndicationUpdatesPerYear * inputs.syndicationMinutesPerPush * (inputs.syndicationAutomation / 100)).toLocaleString()} min
                  </strong>
                </div>
                <div className="formula-row total">
                  <span>Scenario-adjusted value</span>
                  <code>
                    {result.syndicationHours.toFixed(0)} hrs × ${inputs.hourlyRate}/hr × {factor.toFixed(1)}
                  </code>
                  <strong>{moneyExact(result.syndicationSavings)}</strong>
                </div>
              </div>
              <p>
                <b>Growth:</b> eligible revenue × lift × gross margin × PXM
                attribution.
              </p>
              <p>
                All benefits are adjusted by the selected realization scenario.
              </p>
            </div>
          )}

          <div className="proof-card">
            <p className="eyebrow">Pattern at scale</p>
            <div className="proof-grid">
              <div><strong>#1</strong><span>Amazon seller globally</span></div>
              <div><strong>700+</strong><span>brands managed</span></div>
              <div><strong>2.3M</strong><span>products in PXM</span></div>
              <div><strong>7,000+</strong><span>AI content briefs run</span></div>
              <div><strong>15,000+</strong><span>AI images generated</span></div>
              <div><strong>1,000+</strong><span>marketplaces receiving content</span></div>
            </div>
            <small>
              Based on Pattern's managed brand portfolio of 700+ brands across
              1,000+ marketplaces. Customer ROI is calculated from the editable
              assumptions above.
            </small>
          </div>
        </aside>
      </section>

      <section className="evidence">
        <div>
          <p className="eyebrow">Customer outcomes</p>
          <h2>What brands achieve with Pattern PXM</h2>
        </div>
        <div className="evidence-items">
          <article>
            <strong>Skullcandy</strong>
            <span>
              Eliminated redundant content re-entry across retailers — content
              created once, distributed everywhere automatically
            </span>
          </article>
          <article>
            <strong>KÜHL</strong>
            <span>
              Accelerated time-to-market for new seasonal launches by centralizing
              product data and media in a single PXM workflow
            </span>
          </article>
          <article>
            <strong>TRŪ Fragrance</strong>
            <span>
              Scaled to new retail channels without adding headcount — PXM
              syndication handled retailer-specific formatting automatically
            </span>
          </article>
          <article>
            <strong>Martin &amp; Co.</strong>
            <span>
              Consolidated product content management across a large catalog,
              reducing manual asset operations and improving listing consistency
            </span>
          </article>
        </div>
        <p className="disclaimer">
          Directional planning model—not a guarantee of results. Customer inputs
          and supporting evidence should be validated before use in a final
          business case.
        </p>
      </section>
    </main>
  );
}
