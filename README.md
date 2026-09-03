# Pattern PXM Value Calculator

One calculator with two workspaces:

- **Sales** builds a prospective annual business case from editable assumptions.
- **Customer Success** imports observed PXM activity and estimates value over the
  same reporting period for QBR and renewal conversations.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Customer Success activity import

Drop the full **activity-metrics `.xlsx`**. Every tab is read (Updates, Shares,
File Downloads, Product Downloads, Syndications, Imports, and the rest).
`Active Users` is skipped because it is a rollup of the other tabs and would
double-count.

CSV tabs still work if you export sheets one at a time. Columns can vary by
tab; the importer looks for Date, User / Sender, Hostname, Count, and Action
when they exist, and uses the tab name as the action when they do not.

`Count` is summed rather than treating every row as one action.

When an export filename contains a range such as
`2026-07-04-to-2026-09-01`, the upper date is treated as exclusive, matching
the PXM export convention. That example is reported as July 4–August 31,
or 59 days.

Observed actions are grouped into:

- Human record and attribute edits: named-user attribute updates
- Automated throughput: API updates and System Generated activity (not dollarized)
- Content operations: collection folders and media edits
- Asset access and sharing: downloads and shares
- Syndication: human-driven publish-to-channel events
- Context only: imports, adoption, and unrecognized actions

API and System Generated volume is counted as throughput and excluded from
hours and dollars. A QBR audience will not trust labor savings claimed against
work no person would have performed by hand.

Human record volume that remains is valued per record and multiplied by a
realization share — the portion a team would plausibly have maintained by
hand. Defaults are 30 seconds per record at 25% realization.

The report also shows the implied full-time-equivalent workload next to the
active user count. If the estimate claims more avoided work than the observed
team could physically perform, the card turns red. Check that number before
sending a report to a customer.
The annual PXM investment is prorated to the exact report window before period
ROI is calculated. Annualized value is displayed separately as a run-rate
projection.

## Commands

```bash
npm run lint
npm test
npm run build
```

`npm test` verifies the production build, CSV count aggregation, exclusive
filename date ranges, period cost proration, and that Sales remains the default
workspace with its annual formulas intact.

## Important interpretation

The CS report combines observed action counts with editable assumptions for
minutes saved and loaded hourly cost. It is a directional value model, not a
guarantee of financial outcomes. The generated PDF includes the assumptions
used so customers can review the calculation.
