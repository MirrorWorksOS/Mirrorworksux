Create 3 screens for the MirrorWorks Smart FactoryOS budget feature. These sit across two modules (Plan and Book) and share the same job data. Use the existing MW design system, component library, and layout patterns already established in this file. Match the sidebar, top bar, tab patterns, stat cards, and table styles from the Sell and Plan module screens.

Screen 1 of 3: Plan job detail — Budget tab
Route: /plan/jobs/{id}, Budget tab active
This is a tab within the existing job detail view (same layout as Overview, Operations, Schedule tabs). Budget is a restricted tab — only visible to Scheduler, Manager, and Admin roles. Operators and Supervisors cannot see it.
Purpose: Give the production planner a quick read on whether a job is tracking to budget, without leaving the job context. This is where they check before making decisions about overtime, material substitutions, or scope changes.
Content, top to bottom:
Budget summary — 4 stat cards in a row:

Total budget: Dollar value, with a caption linking back to the source quote (e.g., "from quote MW-Q-0042"). This is the quoted amount split into budget categories.
Total spent: Dollar value, percentage of budget used, horizontal progress bar showing utilisation. Green if under 80%, yellow 80-95%, red over 95%.
Remaining: Dollar value, with a caption showing estimated final spend based on current burn rate.
Margin: Current margin percentage. Compare against target margin (configurable in settings, default 15%). Up/down arrow indicator relative to target. Green if above target, yellow within 5% of target, red below.

Category breakdown table:
4 rows matching the plan_budgets database categories: Materials, Labour, Overhead, Subcontract (the "purchase" category in the DB displays as "Subcontract" in the UI). Columns: Category, Budget, Actual, Variance (negative = under budget = good), % Used, Status. Each row has a mini progress bar in the % Used column. Bold total row at the bottom. Variance values use green text for under-budget, red for over-budget. Status column shows a coloured dot with label: "On track", "Monitor", "Over budget".
Spend vs plan chart:
Line chart inside a card. X-axis: time (weeks since job start). Y-axis: cumulative dollars. Two lines — planned burn (dashed, muted colour) and actual spend (solid). Shaded area between them. Vertical dashed line marking today. Date range selector in the card header. This chart answers the question: "Are we spending at the rate we expected?"
AI budget insight card:
Small card in the bottom-right. Title with a sparkle icon. Contains a 2-3 sentence natural language summary from the Intelligence Hub, e.g., "Labour tracking 8% under budget. Based on 3 similar historical jobs, expect final spend between $23,200-$24,100. Material delivery for PO-0089 may increase costs by $400 if delayed past Friday." Caption showing when the insight was last updated, with a manual refresh button.

Screen 2 of 3: Book module — Budget dashboard
Route: /book/budgets
This is a standalone page within the Book module sidebar navigation. It sits between Job Costs and Stock Valuation in the nav hierarchy.
Purpose: Give the office manager or business owner a portfolio view of all budgets — across jobs, departments, and time periods. This is the screen they check weekly to see which jobs are at risk and whether departmental spending is on track.
Content, top to bottom:
Page header:
Title "Budgets". Right side: "New budget" primary CTA button, and a filter dropdown for budget type (All / Job / Department / Annual). Below the title: toggle chips for status filtering — "Active" (default selected), "Draft", "Closed". Budget statuses follow the workflow: draft > pending_approval > approved > active > closed.
4 summary stat cards:

Active budgets: Count, with a secondary callout for how many are flagged "at risk" (over 80% utilised).
Total budgeted: Dollar value for the current quarter.
Total spent: Dollar value with a utilisation percentage and progress bar.
Projected overrun: Estimated total overrun across all active budgets. Count of flagged jobs.

3 donut charts in a row (single card):

By type: Proportion of budget allocated to Job vs Department vs Annual budgets.
By category: Materials, Labour, Overhead, Subcontract breakdown across all active budgets.
Utilisation: A single donut showing the on-track / monitor / over-budget split as a percentage of all active budgets.

Budget list table:
The main content. Columns: Budget name (clickable, navigates to detail), Type (badge: Job / Department / Annual), Period, Budgeted amount, Actual amount, Variance, Utilisation (mini progress bar), Status (traffic light badge: "On track" green, "Monitor" yellow, "Over budget" red, "Draft" grey). Job budget rows show the job number as the clickable name. Department and annual budgets show their descriptive name. Sortable by any column. Pagination at the bottom.

Screen 3 of 3: Book module — Job cost detail
Route: /book/job-costs/{id}
Reached by drilling into a specific job from the budget list (screen 2) or from the job profitability list at /book/job-costs. This is the financial deep-dive on a single job.
Purpose: This is the screen the owner opens when they want to understand exactly where the money went on a job. It answers: "Did we make money? Where did costs blow out? What can we learn for next time?" This is the most valuable screen in Book for manufacturers.
Content, top to bottom:
Job header bar:
Left: Job number in a rounded chip (e.g., "MW-001"), job name, customer name as a clickable link. Right: Job status badge (uses the plan_jobs status values: backlog, planning, materials, scheduled, in_production, review_close, completed, cancelled). Export and Print outline buttons.
Cost breakdown card (primary content, takes ~60% width):
Table with columns: Cost type, Quoted, Actual, Variance, % of Total. Five rows: Materials, Labour, Overhead, Subcontract, Other. Bold total row. Data sources — Materials: Make module material consumption + PO costs. Labour: Make module time entries (hours x operator hourly rate). Overhead: machine hours x overhead rate (configured in Book settings). Subcontract: POs marked as subcontract. Negative variance = under budget = green. Positive variance = over budget = red. Below the table, a stacked horizontal bar showing the proportional split of actual costs by type.
Margin gauge (sits beside cost breakdown, ~40% width):
Circular gauge or large number showing current interim margin (quoted amount minus actual spend to date, as a percentage of quoted). Below: "Quoted margin" (the margin if costs hit budget exactly) and "Projected final margin" (estimated based on burn rate). Colour: green if projected margin > 15%, yellow 5-15%, red < 5%. This gauge is the single most important number on the screen.
Cost accumulation chart:
Stacked area chart. X-axis: weeks since job start. Y-axis: cumulative dollars. Each cost type (materials, labour, overhead, subcontract) is a stacked layer. A horizontal dashed line at the total budget amount. This shows how costs built up over the life of the job and makes it obvious if one category is dominating spend.
Recent transactions card:
Title "Recent transactions". Compact list of the last 10 cost entries against this job. Each row: date, description (e.g., "CNC machining — 4.5 hrs @ $45/hr", "3mm mild steel plate — 12 sheets"), cost type badge, amount, and a source badge showing where the data originated — "Make" (from time/material tracking), "PO" (from purchase orders), "Manual" (manually entered in Book). "View all" link at the bottom navigates to a filtered transaction list.

Key relationships between the 3 screens:

Screen 1 (Plan budget tab) and Screen 3 (Book job cost detail) show the same job's financial data from different angles. Plan focuses on "are we on track?" during production. Book focuses on "what happened?" for post-job analysis and accounting.
The budget values in Screen 1 come from the plan_budgets table (4 categories per job). The cost values in Screen 3 come from the job_costs table (actuals aggregated from Make and Purchases).
Screen 2 (Book budget dashboard) is the portfolio view that links down to Screen 3 for any individual job.
The "AI budget insight" on Screen 1 is unique to Plan — Book does not have this component.