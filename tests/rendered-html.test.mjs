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

  assert.equal(summary.byCategory.automation, 1);
  assert.equal(summary.byCategory.bulk, 1);
  assert.equal(summary.byCategory.asset, 2);
  assert.equal(summary.byCategory.syndication, 1);
  assert.equal(summary.totalActions, 5);
  assert.equal(summary.byAction.Share ?? 0, 2);
});

test("counts update volume as records, not as human tasks", async () => {
  const model = await loadCsModel();
  const rows = model.parseActivitySheets([
    {
      name: "Updates",
      rows: [
        ["Date", "User", "Hostname", "Count", "Action"],
        ["7/10/2026", "Peter Jakl", "helmethouse", 120_000, "Attribute(s) Updated"],
        ["7/11/2026", "System Generated", "helmethouse", 134_064, "API Update"],
      ],
    },
  ]);
  const summary = model.summarizeActivity(rows, {
    start: new Date("2026-07-04T00:00:00"),
    end: new Date("2026-08-31T00:00:00"),
  });
  const result = model.calculateCsValue(summary, {
    hourlyRate: 50,
    contentMinutesSaved: 9,
    bulkSecondsSaved: 30,
    bulkRealizationPercent: 25,
    assetMinutesSaved: 5,
    syndicationMinutesSaved: 7.5,
    annualPxmInvestment: 31_000,
  });

  assert.equal(summary.byCategory.bulk, 120_000);
  assert.equal(summary.byCategory.automation, 134_064);
  assert.equal(summary.byCategory.content, 0);
  assert.equal(summary.automatedActions, 134_064);

  // API volume must not enter the dollar total. Only the 120,000 human records do.
  assert.equal(Math.round(result.periodValue), 12_500);
  assert.ok(result.bulkHours < 300, `bulk hours were ${result.bulkHours}`);
});

test("does not convert API or System Generated volume into dollars", async () => {
  const model = await loadCsModel();
  const rows = model.parseActivitySheets([
    {
      name: "Updates",
      rows: [
        ["Date", "User", "Hostname", "Count", "Action"],
        ["7/10/2026", "Peter Jakl", "helmethouse", 80, "Attribute(s) Updated"],
        ["7/11/2026", "Peter Jakl", "helmethouse", 50_000, "API Update"],
        ["7/12/2026", "System Generated", "helmethouse", 90_000, "Attribute(s) Updated"],
      ],
    },
    {
      name: "Shares",
      rows: [
        ["Date", "User", "Hostname", "Count", "Action"],
        ["7/6/2026", "Grant Wheeler", "helmethouse", 10, "Share"],
      ],
    },
  ]);
  const summary = model.summarizeActivity(rows, {
    start: new Date("2026-07-04T00:00:00"),
    end: new Date("2026-08-31T00:00:00"),
  });
  const result = model.calculateCsValue(summary, {
    hourlyRate: 50,
    contentMinutesSaved: 9,
    bulkSecondsSaved: 30,
    bulkRealizationPercent: 25,
    assetMinutesSaved: 5,
    syndicationMinutesSaved: 7.5,
    annualPxmInvestment: 31_000,
  });

  assert.equal(summary.byCategory.bulk, 80);
  assert.equal(summary.byCategory.automation, 140_000);
  assert.equal(summary.byCategory.asset, 10);

  const humanRecordValue = 80 * 0.25 * (30 / 3600) * 50;
  const assetValue = 10 * (5 / 60) * 50;
  assert.equal(Math.round(result.periodValue), Math.round(humanRecordValue + assetValue));
  assert.ok(result.periodValue < 100);
});

test("reports a scenario band and flags unverified record composition", async () => {
  const model = await loadCsModel();
  const rows = model.parseActivitySheets([
    {
      name: "Updates",
      rows: [
        ["Date", "User", "Hostname", "Count", "Action"],
        ["7/10/2026", "Peter Jakl", "helmethouse", 254_064, "Attribute(s) Updated"],
      ],
    },
  ]);
  const summary = model.summarizeActivity(rows, {
    start: new Date("2026-07-04T00:00:00"),
    end: new Date("2026-08-31T00:00:00"),
  });
  const result = model.calculateCsValue(summary, {
    hourlyRate: 50,
    contentMinutesSaved: 9,
    bulkSecondsSaved: 30,
    bulkRealizationPercent: 25,
    realizationMeasured: false,
    assetMinutesSaved: 5,
    syndicationMinutesSaved: 7.5,
    annualPxmInvestment: 31_000,
  });

  // An export that labels almost no automation cannot support a claim that
  // automated volume was removed.
  assert.equal(result.compositionUnverified, true);

  const [conservative, expected, upper] = result.scenarios;
  assert.equal(conservative.label, "Conservative");
  assert.equal(expected.label, "Expected");
  assert.equal(upper.label, "Upper bound");

  // Pi's audit band: 10% / 15s at the floor, 40% / 45s at the ceiling.
  assert.equal(Math.round(conservative.realizationPercent), 10);
  assert.equal(conservative.secondsPerRecord, 15);
  assert.equal(Math.round(upper.realizationPercent), 40);
  assert.equal(upper.secondsPerRecord, 45);

  assert.ok(conservative.periodValue < expected.periodValue);
  assert.ok(expected.periodValue < upper.periodValue);
  assert.equal(Math.round(expected.periodValue), Math.round(result.periodValue));
});

test("flags value that exceeds what the observed team could perform", async () => {
  const model = await loadCsModel();
  const assumptions = {
    hourlyRate: 50,
    contentMinutesSaved: 9,
    bulkSecondsSaved: 30,
    bulkRealizationPercent: 25,
    assetMinutesSaved: 5,
    syndicationMinutesSaved: 7.5,
    annualPxmInvestment: 31_000,
  };
  const base = {
    brand: "helmethouse",
    periodStart: new Date("2026-07-04T00:00:00"),
    periodEnd: new Date("2026-08-31T00:00:00"),
    spanDays: 59,
    rows: 1,
    totalActions: 254_064,
    uniqueUsers: 48,
    automatedActions: 0,
    byAction: {},
    breakdown: [],
    byCategory: {
      content: 0,
      bulk: 254_064,
      automation: 0,
      asset: 0,
      syndication: 0,
      import: 0,
      adoption: 0,
      other: 0,
    },
  };

  const sane = model.calculateCsValue(base, assumptions);
  assert.equal(sane.overCapacity, false);
  assert.ok(sane.fteEquivalent < 48);

  // The old behavior: every record priced as a 9-minute human task.
  const inflated = model.calculateCsValue(
    { ...base, byCategory: { ...base.byCategory, bulk: 0, content: 254_064 } },
    assumptions,
  );
  assert.equal(inflated.overCapacity, true);
  assert.ok(inflated.fteEquivalent > 100);
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
    automatedActions: 0,
    byAction: { Share: 65 },
    breakdown: [],
    byCategory: {
      content: 0,
      bulk: 0,
      automation: 0,
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
    bulkSecondsSaved: 30,
    bulkRealizationPercent: 25,
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
