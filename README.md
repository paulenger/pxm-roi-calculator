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

Records that name an API or system actor are counted as throughput and excluded
from hours and dollars.

That detection is only as good as the export. Helmet House's workbook labeled
0.07% of 254,064 records as automated, which almost certainly understates real
automation rather than proving the rest was manual. When record volume is large
and labeled automation is under 1%, the report says composition is unverified
instead of claiming automated volume was removed.

### Presenting the number

The report leads with observed, measured facts: action counts, active users, and
the implied full-time-equivalent workload. Dollars follow as a three-scenario
band rather than a single point, because the two record-volume assumptions are
asserted rather than measured:

| Scenario | Realized share | Seconds per record |
| --- | --- | --- |
| Conservative | 0.4x expected | 0.5x expected |
| Expected | as entered | as entered |
| Upper bound | 1.6x expected | 1.5x expected |

Multipliers apply to whatever the CSM entered, so the band moves with the
inputs. Lead a renewal conversation with the conservative floor; it is the
figure that survives scrutiny from a finance stakeholder.

The realized share can be marked **measured** once a CSM samples the raw Updates
rows and classifies them as manual UI edits, bulk imports, or channel
write-backs. The report prints which basis was used, because an assumed ratio
and a measured one do not deserve equal confidence.

Assumptions that contribute nothing to a given report are omitted from the
printed assumptions block, so the report never lists a rate it did not use.

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
