"use client";

import { useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { CsReportPDF } from "@/lib/cs-report-pdf";
import {
  calculateCsValue,
  reportingPeriodFromFilenames,
  summarizeActivity,
  type CsActivityRow,
  type CsValueAssumptions,
} from "@/lib/cs-value-model";
import { readActivityFile } from "@/lib/read-activity-file";

const DEFAULT_ASSUMPTIONS: CsValueAssumptions = {
  hourlyRate: 50,
  contentMinutesSaved: 9,
  bulkSecondsSaved: 30,
  bulkRealizationPercent: 25,
  assetMinutesSaved: 5,
  syndicationMinutesSaved: 7.5,
  annualPxmInvestment: 31_000,
};

const CATEGORY_LABELS: Record<string, string> = {
  content: "Content ops",
  bulk: "Record & attribute volume",
  asset: "Asset access",
  syndication: "Syndication",
  import: "Context only",
  adoption: "Context only",
  other: "Context only",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);

const date = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function brandFromFiles(files: File[], fallback: string): string {
  const fileBrand = files[0]?.name.split(/_activity-metrics/i)[0];
  const raw = fileBrand || fallback;
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();
}

function AssumptionField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  help,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  help: string;
  step?: number;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-shell">
        {prefix && <span>{prefix}</span>}
        <input
          type="number"
          min="0"
          step={step}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
        />
        {suffix && <span>{suffix}</span>}
      </span>
      <span className="field-help">{help}</span>
    </label>
  );
}

export default function CustomerSuccessWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsActivityRow[]>([]);
  const [rosterUsers, setRosterUsers] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [brandName, setBrandName] = useState("");
  const [assumptions, setAssumptions] =
    useState<CsValueAssumptions>(DEFAULT_ASSUMPTIONS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  const activity = useMemo(
    () =>
      rows.length
        ? summarizeActivity(
            rows,
            reportingPeriodFromFilenames(fileNames),
            rosterUsers,
          )
        : null,
    [rows, fileNames, rosterUsers],
  );
  const result = useMemo(
    () => (activity ? calculateCsValue(activity, assumptions) : null),
    [activity, assumptions],
  );
  const reportActivity = useMemo(
    () => (activity ? { ...activity, brand: brandName || activity.brand } : null),
    [activity, brandName],
  );

  const setAssumption = <K extends keyof CsValueAssumptions>(
    key: K,
    value: CsValueAssumptions[K],
  ) => setAssumptions((current) => ({ ...current, [key]: value }));

  const importFiles = async (files: File[]) => {
    setBusy(true);
    setError(null);
    try {
      const activityFiles = files.filter((file) =>
        /\.(csv|xlsx|xls)$/i.test(file.name),
      );
      if (!activityFiles.length) {
        throw new Error("Choose an activity-metrics workbook (.xlsx) or one or more CSV tabs.");
      }
      const contents = await Promise.all(
        activityFiles.map((file) => readActivityFile(file)),
      );
      const parsed = contents.flatMap((entry) => entry.rows);
      setRows(parsed);
      setRosterUsers(contents.flatMap((entry) => entry.rosterUsers));
      setFileNames(activityFiles.map((file) => file.name));
      setBrandName(
        brandFromFiles(
          activityFiles,
          parsed.find((row) => row.hostname)?.hostname || "",
        ),
      );
    } catch (caught) {
      setRows([]);
      setRosterUsers([]);
      setFileNames([]);
      setBrandName("");
      setError(caught instanceof Error ? caught.message : "Could not read these files.");
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportActivity || !result) return;
    setBusy(true);
    try {
      const blob = await pdf(
        <CsReportPDF
          activity={reportActivity}
          assumptions={assumptions}
          result={result}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportActivity.brand || "brand"}-pxm-customer-value-${reportActivity.periodEnd
        .toISOString()
        .slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const valueRows = activity && result
    ? [
        {
          name: "Record & attribute maintenance",
          count: activity.byCategory.bulk,
          minutes: assumptions.bulkSecondsSaved / 60,
          hours: result.bulkHours,
          value: result.bulkValue,
          color: "#7426ff",
          detail: `${activity.byCategory.bulk.toLocaleString()} records touched × ${assumptions.bulkRealizationPercent}% realized × ${assumptions.bulkSecondsSaved}s = ${number(result.bulkHours)} hours`,
        },
        {
          name: "Content operations",
          count: activity.byCategory.content,
          minutes: assumptions.contentMinutesSaved,
          hours: result.contentHours,
          value: result.contentValue,
          color: "#0ea5e9",
        },
        {
          name: "Asset access & sharing",
          count: activity.byCategory.asset,
          minutes: assumptions.assetMinutesSaved,
          hours: result.assetHours,
          value: result.assetValue,
          color: "#22c55e",
        },
        {
          name: "Syndication",
          count: activity.byCategory.syndication,
          minutes: assumptions.syndicationMinutesSaved,
          hours: result.syndicationHours,
          value: result.syndicationValue,
          color: "#ec4899",
        },
      ].filter((item) => item.count > 0)
    : [];

  return (
    <>
      <section className="hero cs-hero">
        <div>
          <p className="eyebrow">Prove realized customer value</p>
          <h1>What did PXM help this brand accomplish?</h1>
          <p className="hero-copy">
            Import observed brand activity, apply transparent time-saving
            assumptions, and compare value with PXM investment over the same period.
          </p>
        </div>
        <div className="cs-method-note">
          <strong>Observed activity first</strong>
          <span>
            Counts come from the export. Only minutes and cost assumptions are editable.
          </span>
        </div>
      </section>

      <section className="workspace cs-workspace">
        <div className="inputs-column">
          <section className="input-card">
            <div className="card-heading">
              <span className="step">01</span>
              <div>
                <h2>Import PXM activity</h2>
                <p>
                  Drop the full activity-metrics workbook. Every tab is read
                  (Updates, Shares, Downloads, Syndications, and the rest). You can
                  also drop one or more CSV tabs if that is how you exported it.
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`cs-dropzone ${rows.length ? "has-data" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void importFiles(Array.from(event.dataTransfer.files));
              }}
            >
              <strong>{busy ? "Reading activity…" : rows.length ? "Activity loaded" : "Drop the .xlsx workbook here"}</strong>
              <span>
                {fileNames.length
                  ? `${fileNames.length} file${fileNames.length === 1 ? "" : "s"} · ${rows.length.toLocaleString()} rows`
                  : "or click to choose .xlsx / .csv"}
              </span>
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              multiple
              onChange={(event) => {
                if (event.target.files?.length) {
                  void importFiles(Array.from(event.target.files));
                }
                event.target.value = "";
              }}
            />
            {error && <div className="cs-error">{error}</div>}

            {activity && (
              <div className="cs-observed">
                <div>
                  <span>Brand</span>
                  <input
                    className="cs-brand-input"
                    aria-label="Brand display name"
                    value={brandName}
                    placeholder={activity.brand || "Brand name"}
                    onChange={(event) => setBrandName(event.target.value)}
                  />
                </div>
                <div>
                  <span>Reporting period</span>
                  <strong>
                    {date(activity.periodStart)} – {date(activity.periodEnd)}
                  </strong>
                </div>
                <div>
                  <span>Period length</span>
                  <strong>{activity.spanDays} days</strong>
                </div>
                <div>
                  <span>Observed actions</span>
                  <strong>{activity.totalActions.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Automated</span>
                  <strong>{activity.automatedActions.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Active people</span>
                  <strong>{activity.uniqueUsers}</strong>
                </div>
              </div>
            )}
          </section>

          {activity && (
            <>
              <section className="input-card">
                <div className="card-heading">
                  <span className="step">02</span>
                  <div>
                    <h2>Value assumptions</h2>
                    <p>
                      Keep these conservative. Imported counts stay fixed; these
                      assumptions translate activity into estimated time and dollars.
                    </p>
                  </div>
                </div>
                <div className="field-grid">
                  <AssumptionField
                    label="Team hourly rate"
                    value={assumptions.hourlyRate}
                    onChange={(value) => setAssumption("hourlyRate", value)}
                    prefix="$"
                    suffix="/hr"
                    help="Fully loaded hourly cost. The Sales default is $50/hr."
                  />
                  <AssumptionField
                    label="Seconds saved per record touched"
                    value={assumptions.bulkSecondsSaved}
                    onChange={(value) => setAssumption("bulkSecondsSaved", value)}
                    suffix="sec"
                    step={5}
                    help="Updates counts records and attributes, not tasks. Price them per record."
                  />
                  <AssumptionField
                    label="Share of record volume realized"
                    value={assumptions.bulkRealizationPercent}
                    onChange={(value) =>
                      setAssumption("bulkRealizationPercent", value)
                    }
                    suffix="%"
                    step={5}
                    help="No team would hand-maintain every record a bulk edit touched. 25% is conservative."
                  />
                  <AssumptionField
                    label="Minutes saved per content action"
                    value={assumptions.contentMinutesSaved}
                    onChange={(value) =>
                      setAssumption("contentMinutesSaved", value)
                    }
                    suffix="min"
                    step={0.5}
                    help="Media and collection work, at 15 manual minutes × 60% saved."
                  />
                  <AssumptionField
                    label="Minutes saved per asset action"
                    value={assumptions.assetMinutesSaved}
                    onChange={(value) => setAssumption("assetMinutesSaved", value)}
                    suffix="min"
                    step={0.5}
                    help="A conservative estimate for each observed download or share."
                  />
                  <AssumptionField
                    label="Minutes saved per syndication"
                    value={assumptions.syndicationMinutesSaved}
                    onChange={(value) =>
                      setAssumption("syndicationMinutesSaved", value)
                    }
                    suffix="min"
                    step={0.5}
                    help="Defaults to 7.5 minutes: 15 manual minutes × 50% saved."
                  />
                </div>
              </section>

              <section className="input-card">
                <div className="card-heading">
                  <span className="step">03</span>
                  <div>
                    <h2>Investment for renewal</h2>
                    <p>
                      Enter the annual PXM contract value. The calculator automatically
                      prorates it to the exact reporting period.
                    </p>
                  </div>
                </div>
                <div className="field-grid">
                  <AssumptionField
                    label="Annual PXM investment"
                    value={assumptions.annualPxmInvestment}
                    onChange={(value) =>
                      setAssumption("annualPxmInvestment", value)
                    }
                    prefix="$"
                    help="Helmet House is currently modeled at $31,000 annually."
                  />
                </div>
              </section>
            </>
          )}
        </div>

        <aside className="results">
          {!activity || !result ? (
            <div className="cs-empty-result">
              <span>Customer value report</span>
              <strong>Import activity to begin</strong>
              <p>
                The tool will detect the brand and period, summarize observed activity,
                and calculate value against the matching portion of the annual fee.
              </p>
            </div>
          ) : (
            <>
              <div className="result-hero">
                <p>Value supported by this period</p>
                <strong>{money(result.periodValue)}</strong>
                <span>
                  {number(result.totalHours)} estimated hours returned ·{" "}
                  {activity.spanDays} days observed
                </span>
              </div>
              <button
                className="download-btn"
                onClick={() => void downloadPdf()}
                disabled={busy}
              >
                {busy ? "Preparing report…" : "Download CS value report (PDF)"}
              </button>
              <div className="metric-grid">
                <div>
                  <span>Period ROI</span>
                  <strong>
                    {result.periodRoi === null
                      ? "—"
                      : `${Math.round(result.periodRoi)}%`}
                  </strong>
                  <small>
                    Period value minus period cost, divided by period cost.
                  </small>
                </div>
                <div>
                  <span>Period PXM cost</span>
                  <strong>{money(result.periodCost)}</strong>
                  <small>
                    {money(assumptions.annualPxmInvestment)} × {activity.spanDays}/365.
                  </small>
                </div>
                <div>
                  <span>Annualized value run-rate</span>
                  <strong>{money(result.annualizedValue)}</strong>
                  <small>
                    A projection if this period&apos;s activity continued for a year.
                  </small>
                </div>
                <div>
                  <span>Estimated payback</span>
                  <strong>
                    {result.paybackMonths === null
                      ? "—"
                      : `${result.paybackMonths.toFixed(1)} mo`}
                  </strong>
                  <small>Based on the annualized observed-activity run-rate.</small>
                </div>
              </div>

              <div className={`cs-capacity ${result.overCapacity ? "is-warning" : ""}`}>
                <div>
                  <span>Implied workload</span>
                  <strong>{result.fteEquivalent.toFixed(1)} FTE</strong>
                  <small>
                    {number(result.totalHours)} hours ÷ {activity.spanDays} days of
                    full-time capacity
                  </small>
                </div>
                <p>
                  {result.overCapacity
                    ? `This claims more avoided work than ${activity.uniqueUsers} active people could perform. Lower the per-record seconds or the realized share before sharing it.`
                    : `Defensible against ${activity.uniqueUsers} active users. A QBR audience will check this number first.`}
                </p>
              </div>

              <div className="benefit-card">
                <div className="section-title">
                  <h3>Observed value by lever</h3>
                  <span>{money(result.periodValue)}</span>
                </div>
                <div className="benefit-list">
                  {valueRows.map((item) => (
                    <div className="benefit-item" key={item.name}>
                      <div className="benefit-item-row">
                        <span>
                          <i style={{ background: item.color }} />
                          {item.name}
                        </span>
                        <strong>{money(item.value)}</strong>
                      </div>
                      <p className="benefit-desc">
                        {"detail" in item && item.detail
                          ? item.detail
                          : `${item.count.toLocaleString()} actions × ${item.minutes} min = ${number(item.hours)} hours`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="benefit-card">
                <div className="section-title">
                  <h3>What the export actually contains</h3>
                  <span>{activity.totalActions.toLocaleString()} counted</span>
                </div>
                <table className="cs-breakdown">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Treated as</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.breakdown.slice(0, 12).map((entry) => (
                      <tr key={`${entry.action}-${entry.category}`}>
                        <td>{entry.action}</td>
                        <td>
                          {CATEGORY_LABELS[entry.category] ?? entry.category}
                          {entry.automatedCount > 0 && (
                            <em>
                              {" "}
                              · {entry.automatedCount.toLocaleString()} automated
                            </em>
                          )}
                        </td>
                        <td>{entry.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="assumption-toggle"
                onClick={() => setShowLogic((current) => !current)}
              >
                {showLogic ? "Hide" : "Show"} calculation logic
                <span>{showLogic ? "−" : "+"}</span>
              </button>
              {showLogic && (
                <div className="logic">
                  {valueRows.map((item) => (
                    <div className="logic-section" key={item.name}>
                      <b>{item.name}</b>
                      <div className="formula-row">
                        <span>Observed value</span>
                        <code>
                          {number(item.hours)} hours × {money(assumptions.hourlyRate)}/hr
                        </code>
                        <strong>{money(item.value)}</strong>
                      </div>
                    </div>
                  ))}
                  <div className="logic-section">
                    <b>Period investment</b>
                    <div className="formula-row">
                      <span>Prorated PXM cost</span>
                      <code>
                        {money(assumptions.annualPxmInvestment)} × {activity.spanDays}
                        /365
                      </code>
                      <strong>{money(result.periodCost)}</strong>
                    </div>
                  </div>
                  <p>
                    Imported action counts are never multiplied by a sales scenario.
                    Annualized value is shown separately as a run-rate projection.
                  </p>
                </div>
              )}

              {activity.byCategory.import > 0 ||
              activity.byCategory.other > 0 ? (
                <div className="cs-context-note">
                  <strong>Activity shown as context, not dollarized</strong>
                  <span>
                    {activity.byCategory.import.toLocaleString()} import actions ·{" "}
                    {activity.byCategory.other.toLocaleString()} other actions. These
                    are excluded from value to reduce double-counting.
                  </span>
                </div>
              ) : null}
            </>
          )}
        </aside>
      </section>
    </>
  );
}
