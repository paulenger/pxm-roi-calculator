"use client";

import { useMemo, useState } from "react";

type Inputs = {
  images: number;
  traditionalImageCost: number;
  pxmImageCost: number;
  includeImageLabor: boolean;
  imageMinutesSaved: number;
  products: number;
  updates: number;
  updateMinutes: number;
  automation: number;
  assetRequests: number;
  assetMinutesSaved: number;
  hourlyRate: number;
  eligibleRevenue: number;
  revenueLift: number;
  grossMargin: number;
  attribution: number;
  annualPXM: number;
  implementation: number;
};

const initial: Inputs = {
  images: 1200,
  traditionalImageCost: 150,
  pxmImageCost: 35,
  includeImageLabor: false,
  imageMinutesSaved: 45,
  products: 5000,
  updates: 2,
  updateMinutes: 30,
  automation: 60,
  assetRequests: 1000,
  assetMinutesSaved: 20,
  hourlyRate: 50,
  eligibleRevenue: 5000000,
  revenueLift: 2,
  grossMargin: 40,
  attribution: 50,
  annualPXM: 75000,
  implementation: 15000,
};

const scenarios = {
  conservative: { label: "Conservative", factor: 0.7 },
  expected: { label: "Expected", factor: 1 },
  upside: { label: "Upside", factor: 1.3 },
} as const;

type Scenario = keyof typeof scenarios;

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
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
    const imageProduction =
      inputs.images *
      Math.max(0, inputs.traditionalImageCost - inputs.pxmImageCost) *
      factor;
    const imageHours = inputs.includeImageLabor
      ? (inputs.images * inputs.imageMinutesSaved * factor) / 60
      : 0;
    const imageLabor = imageHours * inputs.hourlyRate;
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
    const revenue =
      inputs.eligibleRevenue *
      (inputs.revenueLift / 100) *
      (inputs.grossMargin / 100) *
      (inputs.attribution / 100) *
      factor;
    const gross = imageProduction + imageLabor + contentOps + assetOps + revenue;
    const yearOneCost = inputs.annualPXM + inputs.implementation;
    const net = gross - yearOneCost;
    const roi = yearOneCost > 0 ? (net / yearOneCost) * 100 : 0;
    const payback = gross > 0 ? (yearOneCost / gross) * 12 : 0;
    const hours = imageHours + contentHours + assetHours;
    const threeYear =
      gross * 3 - inputs.annualPXM * 3 - inputs.implementation;

    return {
      imageProduction,
      imageLabor,
      contentOps,
      assetOps,
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
      name: "Image production",
      value: result.imageProduction + result.imageLabor,
      color: "#8b5cf6",
    },
    { name: "Content operations", value: result.contentOps, color: "#0ea5e9" },
    { name: "Asset operations", value: result.assetOps, color: "#22c55e" },
    { name: "Growth contribution", value: result.revenue, color: "#f59e0b" },
  ];

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="mark">P</span>
          <span>PATTERN PXM</span>
        </div>
        <span className="prototype">VALUE MODEL · V1</span>
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
          <small>
            Applies a {Math.round(factor * 100)}% realization factor to modeled
            benefits.
          </small>
        </div>
      </section>

      <section className="workspace">
        <div className="inputs-column">
          <section className="input-card image-card">
            <div className="card-heading">
              <span className="step">01</span>
              <div>
                <h2>Image production</h2>
                <p>Value created by producing and adapting images with PXM.</p>
              </div>
            </div>
            <div className="field-grid">
              <Field
                label="Images produced annually"
                value={inputs.images}
                onChange={(v) => set("images", v)}
                help="New, resized, localized, or adapted"
              />
              <Field
                label="Traditional cost / image"
                value={inputs.traditionalImageCost}
                onChange={(v) => set("traditionalImageCost", v)}
                prefix="$"
              />
              <Field
                label="PXM-assisted cost / image"
                value={inputs.pxmImageCost}
                onChange={(v) => set("pxmImageCost", v)}
                prefix="$"
              />
              <Field
                label="Minutes saved / image"
                value={inputs.imageMinutesSaved}
                onChange={(v) => set("imageMinutesSaved", v)}
                suffix="min"
              />
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={inputs.includeImageLabor}
                onChange={(event) =>
                  set("includeImageLabor", event.target.checked)
                }
              />
              <span>
                Add internal labor savings
                <small>
                  Leave off when traditional image cost already includes labor.
                </small>
              </span>
            </label>
          </section>

          <section className="input-card">
            <div className="card-heading">
              <span className="step">02</span>
              <div>
                <h2>Content & asset operations</h2>
                <p>Time returned through automation and a single source of truth.</p>
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
                label="Workflow time reduction"
                value={inputs.automation}
                onChange={(v) => set("automation", v)}
                suffix="%"
              />
              <Field
                label="Asset requests / year"
                value={inputs.assetRequests}
                onChange={(v) => set("assetRequests", v)}
              />
              <Field
                label="Minutes saved / request"
                value={inputs.assetMinutesSaved}
                onChange={(v) => set("assetMinutesSaved", v)}
                suffix="min"
              />
              <Field
                label="Loaded hourly rate"
                value={inputs.hourlyRate}
                onChange={(v) => set("hourlyRate", v)}
                prefix="$"
              />
            </div>
          </section>

          <section className="input-card">
            <div className="card-heading">
              <span className="step">03</span>
              <div>
                <h2>Growth & investment</h2>
                <p>Conservatively attribute incremental contribution to PXM.</p>
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
                label="Expected revenue lift"
                value={inputs.revenueLift}
                onChange={(v) => set("revenueLift", v)}
                suffix="%"
                step={0.1}
              />
              <Field
                label="Gross margin"
                value={inputs.grossMargin}
                onChange={(v) => set("grossMargin", v)}
                suffix="%"
              />
              <Field
                label="PXM attribution"
                value={inputs.attribution}
                onChange={(v) => set("attribution", v)}
                suffix="%"
                help="Share of modeled lift credited to PXM"
              />
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
              <p>
                <b>Images:</b> annual images × (traditional cost − PXM cost),
                plus optional labor savings.
              </p>
              <p>
                <b>Operations:</b> annual task volume × minutes saved × loaded
                hourly rate.
              </p>
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
            <p className="eyebrow">PXM scale signals · W28</p>
            <div className="proof-grid">
              <div><strong>509k</strong><span>media stacks</span></div>
              <div><strong>292k</strong><span>products with stacks</span></div>
              <div><strong>819k</strong><span>syndicated products</span></div>
              <div><strong>33</strong><span>active channels</span></div>
            </div>
            <small>
              Contextual proof points only. Customer ROI is calculated from the
              editable assumptions above.
            </small>
          </div>
        </aside>
      </section>

      <section className="evidence">
        <div>
          <p className="eyebrow">Why these levers</p>
          <h2>Reported PXM customer outcomes</h2>
        </div>
        <div className="evidence-items">
          <article>
            <strong>2,080+</strong>
            <span>
              estimated yearly hours saved by one customer through automation
            </span>
          </article>
          <article>
            <strong>$650k</strong>
            <span>
              estimated ROI reported in the Skullcandy case study
            </span>
          </article>
          <article>
            <strong>Hours → minutes</strong>
            <span>reported reduction in asset-search time at 100 Percent</span>
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
