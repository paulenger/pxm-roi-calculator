import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

async function loadCsModel() {
  const source = await readFile(
    new URL("../lib/cs-value-model.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const commonJsModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: commonJsModule,
    exports: commonJsModule.exports,
    Date,
    Math,
    Number,
    Error,
    Set,
    Array,
    String,
  });
  return commonJsModule.exports;
}

test("parses counts and uses the export filename reporting window", async () => {
  const model = await loadCsModel();
  const csv = [
    "Date,User,Hostname,Count,Action",
    '"7/6/2026, 6:00:00 PM",Sarah  Gaines,helmethouse,2,Share',
    '"8/30/2026, 6:00:00 PM",Grant Wheeler,helmethouse,3,Share',
  ].join("\n");
  const rows = model.parseActivityCsv(csv);
  const period = model.reportingPeriodFromFilenames([
    "helmet-house_activity-metrics_2026-07-04-to-2026-09-01.csv",
  ]);
  const summary = model.summarizeActivity(rows, period);

  assert.equal(summary.totalActions, 5);
  assert.equal(summary.uniqueUsers, 2);
  assert.equal(summary.byCategory.asset, 5);
  assert.equal(summary.spanDays, 59);
  assert.equal(summary.periodStart.toISOString().slice(0, 10), "2026-07-04");
  assert.equal(summary.periodEnd.toISOString().slice(0, 10), "2026-08-31");
});

test("reads every workbook tab and skips Active Users rollups", async () => {
  const model = await loadCsModel();
  const rows = model.parseActivitySheets([
    {
      name: "Updates",
      rows: [
        ["Date", "User", "Update Action"],
        [new Date("2026-07-10T00:00:00"), "Peter Jakl", "API Update"],
        [new Date("2026-07-11T00:00:00"), "Sarah Gaines", "Attribute(s) Added"],
      ],
    },
    {
      name: "Shares",
      rows: [
        ["Date", "User", "Hostname", "Count", "Action"],
        ["7/6/2026, 6:00:00 PM", "Grant Wheeler", "helmethouse", 2, "Share"],
      ],
    },
    {
      name: "Syndications",
      rows: [
        ["Date", "User", "Status"],
        [new Date("2026-08-01T00:00:00"), "Jordan Hale", "ACCEPTED"],
      ],
    },
    {
      name: "Active Users",
      rows: [
        ["User Name", "Action", "Count"],
        ["Grant Wheeler", "Share", 99],
      ],
    },
  ]);
  const summary = model.summarizeActivity(rows);

  assert.equal(summary.byCategory.content, 2);
  assert.equal(summary.byCategory.asset, 2);
  assert.equal(summary.byCategory.syndication, 1);
  assert.equal(summary.totalActions, 5);
  assert.equal(summary.byAction.Share ?? 0, 2);
});

test("counts the Active Users roster without dollarizing it", async () => {
  const model = await loadCsModel();
  const sheets = [
    {
      name: "Shares",
      rows: [
        ["Date", "User", "Hostname", "Count", "Action"],
        ["7/6/2026", "Grant Wheeler", "helmethouse", 2, "Share"],
      ],
    },
    {
      name: "Active Users",
      rows: [
        ["User Name", "Action", "Count"],
        ["Grant Wheeler", "Share", 99],
        ["Drew Klann", "Download", 425],
        ["Cole Lombardi", "Download", 408],
        ["System Generated", "Update", 21],
      ],
    },
  ];
  const rows = model.parseActivitySheets(sheets);
  const roster = model.extractRosterUsers(sheets);
  const summary = model.summarizeActivity(rows, null, roster);

  // Roster rows must not add actions, only people.
  assert.equal(summary.totalActions, 2);
  assert.equal(summary.uniqueUsers, 3);
});

test("does not credit rejected syndications as savings", async () => {
  const model = await loadCsModel();
  const rows = model.parseActivitySheets([
    {
      name: "Syndications",
      rows: [
        ["Date", "User", "Count", "Syndication Type", "Status"],
        ["8/1/2026", "Jordan Hale", 1, "Amazon", "ACCEPTED"],
        ["8/2/2026", "Jordan Hale", 1, "Walmart", "REJECTED"],
        ["8/3/2026", "Jordan Hale", 1, "Target+", "API FAILURE"],
      ],
    },
  ]);
  const summary = model.summarizeActivity(rows);

  assert.equal(summary.byCategory.syndication, 1);
  assert.equal(summary.byCategory.other, 2);
  assert.equal(summary.totalActions, 3);
});

test("prorates value and annual investment to the same period", async () => {
  const model = await loadCsModel();
  const summary = {
    brand: "helmethouse",
    periodStart: new Date("2026-07-04T00:00:00"),
    periodEnd: new Date("2026-08-31T00:00:00"),
    spanDays: 59,
    rows: 1,
    totalActions: 65,
    uniqueUsers: 10,
    byAction: { Share: 65 },
    byCategory: {
      content: 0,
      asset: 65,
      syndication: 0,
      import: 0,
      adoption: 0,
      other: 0,
    },
  };
  const result = model.calculateCsValue(summary, {
    hourlyRate: 50,
    contentMinutesSaved: 9,
    assetMinutesSaved: 5,
    syndicationMinutesSaved: 7.5,
    annualPxmInvestment: 31_000,
  });

  assert.equal(Math.round(result.periodValue), 271);
  assert.equal(Math.round(result.periodCost), 5_011);
  assert.equal(Math.round(result.annualizedValue), 1_675);
  assert.equal(Math.round(result.periodRoi), -95);
});

test("keeps Sales as the default and preserves its annual formulas", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /useState<"sales" \| "customer-success">\("sales"\)/);
  assert.match(
    page,
    /const yearOneCost = inputs\.annualPXM \+ inputs\.implementation/,
  );
  assert.match(
    page,
    /const threeYear =\s*[\r\n]+\s*gross \* 3 - inputs\.annualPXM \* 3 - inputs\.implementation/,
  );
  assert.match(page, /workspace === "customer-success"/);
});
