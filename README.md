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
automation rather than proving the rest was manual. The default **Skeptic's
case** therefore uses a small, explicitly assumed record share; **Throughput
only** remains available when no record-dollar claim is appropriate. Assumed
reports remain DRAFT-watermarked until a documented sample audit is attached.

### Presenting the number

The report leads with observed, measured facts: action counts, record
maintenance throughput, and active users. The FTE metric is explicitly labeled
as modeled dollarized human-task workload; there is no assumption-free way to
turn heterogeneous activity counts into hours. Dollars follow as a
three-scenario band rather than a single point.

| Scenario | Realized share | Seconds per record |
| --- | --- | --- |
| Conservative | 0.4x expected | 0.5x expected |
| Expected | as entered | as entered |
| Upper bound | 1.6x expected | 1.5x expected |

Scenario multipliers apply only to the disputed record realization and
seconds-per-record assumptions. Asset, content, and syndication times remain
fixed across scenarios. When record volume is excluded, all three scenarios
therefore converge to the same dollar value instead of incorrectly multiplying
unrelated categories by 0.5x and 1.5x. A degenerate range blocks PDF export so
the user must either select Skeptic's case or review the inputs.

The realized share can be marked **measured** once a CSM samples the raw Updates
rows and classifies them as manual UI edits, bulk imports, or channel
write-backs. The report prints which basis was used, because an assumed ratio
and a measured one do not deserve equal confidence. Assumed reports carry a
non-dismissable DRAFT watermark until a sample methodology note is attached.

**Lead with the conservative scenario.** Summary tiles, annualized run-rate, and
payback are computed for all three scenarios; the conservative floor is the
primary tile. API and system actors are excluded from dollars on every action
type where the export labels them, with per-type counts shown even when zero.

When two or more periods exist for the same brand, observed action and active
user trends are normalized as actions/day and actions/active-user/day. Raw
totals are never compared across unequal windows; periods differing by more
than 10% display an explicit daily-rate note. Modeled FTE appears separately.

PDF export is also hard-blocked when Conservative ROI is negative. Inputs must
be reviewed, but should never be increased merely to manufacture a positive
renewal story.

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
