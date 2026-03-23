# MirrorWorks Visual Language — Design Reference

**What this is:** A detailed breakdown of the visual qualities we want in Smart FactoryOS, using Crextio (an HR dashboard by Nixtio) as the quality benchmark. We are not copying Crextio. We are building a manufacturing ERP that hits the same level of polish, restraint, and usability — adapted for shop floors, gloved hands, and industrial lighting.

**Reference:** [nixtio.com/cases/crextio](https://nixtio.com/cases/crextio)

---

## 1. Yellow and Dark Pairing

The foundation of the Crextio palette is a warm yellow against near-black surfaces. It works because the contrast ratio is extreme — your eye has nowhere to go but the yellow element. This is the same relationship we have with MW Yellow (#FFCF4B) and MW Mirage (#1A2732).

What makes the pairing effective:

- Yellow on dark surfaces reads as energy and confidence without feeling corporate. It avoids the blue-on-white SaaS monotony that every Jira clone defaults to.
- The dark cards are warm-black, not pure #000000. There is enough warmth in the tone (our Mirage sits at #1A2732, a blue-shifted charcoal) that the surface feels designed rather than absent. Pure black reads as a hole in the page. Warm dark reads as a deliberate surface.
- The yellow is never the background of a card. It appears as: button fills, progress bar fills, checked states, selected row highlights, badge backgrounds, chart hero series. It is always applied TO something, never used AS a surface. The moment yellow becomes a card background it loses its accent power and the page becomes noisy.
- On dark surfaces specifically, yellow text or yellow badge fills become the only thing your eye can read. This is why dark accent cards work as focal points — they force a hierarchy. You see the yellow number first, then scan outward.

**MW application:** Dark accent cards for the 1-2 most important KPIs per page (total revenue, production output, on-time delivery). MW Yellow for the primary CTA, active/checked states, and the hero series in every chart. Everything else is greyscale.

---

## 2. Restrained Colour

Crextio uses almost no colour. The entire palette across all screens is: warm yellow, near-black, and 6-7 shades of grey. Status colours (green for complete, red for overdue) appear only as small dots or short badge text — never as card fills, never as large UI surfaces.

Why this restraint matters:

- When colour is rare, it carries meaning. Every yellow element signals "this is the primary action" or "this is the key number." If you scatter colour everywhere, the user has to learn what each colour means. When there is only one accent colour, there is nothing to learn.
- Greyscale is inherently calming. Manufacturing ERP is used 8+ hours a day. Bright, multi-coloured interfaces cause fatigue. A mostly-grey interface with yellow accents is easy to stare at all day without eye strain.
- It makes the product look expensive. Multi-colour palettes read as consumer software (Trello, Notion, Asana). Restrained palettes read as professional tools (Linear, Vercel, Stripe Dashboard). Metal fabrication shop owners expect serious software, not a toy.
- Status information does not need colour to be clear. A small green dot next to "Complete" is enough. You do not need the entire row to be green. The text already says "Complete." The dot is a redundant visual cue — which is good for scannability — but it only needs to be 8px wide.

**MW application:** The 60-30-10 rule. 60% white/light grey surfaces, 30% greyscale text and structure, 10% MW Yellow accent. Status colours (#36B37E success, #DE350B error, #FACC15 warning, #0052CC info) appear only as 8px dots and badge text. Never as card backgrounds. Never as large surface fills.

---

## 3. Charts and Data Visualisation

Crextio's charts are monochromatic. The hero data series is yellow. Supporting series are greys. Projected or forecast data uses hatched/dashed patterns rather than a different colour. There are no rainbow palettes, no multi-colour pie charts, no 3D effects.

What works:

- One colour per chart means one thing to focus on. The yellow bar is "this is the number that matters." Grey bars provide context. You do not need a legend to decode it.
- Hatched patterns for projected/remaining values are a genuinely elegant solution. They communicate "this is not real yet" without needing a second colour. A diagonally-striped grey bar reads as "target" or "remaining" instantly. It differentiates actual from forecast using texture rather than hue.
- Axis labels are small (11-12px), grey (#737373-range), and use fixed-width digits so the numbers stack vertically without jittering. The chart itself does the communication — the labels are reference points, not the main event.
- Tooltips use frosted glass (semi-transparent white with backdrop blur). They float above the chart without breaking the visual flow. No harsh drop shadows, no opaque boxes that obscure the data behind them.
- Charts sit inside cards with generous padding (24-32px around the chart). The chart does not touch the card edges. This breathing room makes the data feel considered, not crammed.

**MW application:** MW Yellow (#FFCF4B) as hero series in every chart. Neutral-400 and neutral-300 for secondary series. Hatched diagonal stripes (neutral-300 on neutral-100) for projected values. Roboto 500 with `tabular-nums` for axis labels. No 3D effects. No multi-colour palettes. Frosted glass tooltips (`bg-white/90 backdrop-blur-md`).

---

## 4. Large Border Radius

Crextio uses 16-24px border radius on cards and containers. This is the M3 "large" to "extraLarge" range. Nothing has a 4px or 8px radius except tiny elements like checkboxes and toggle thumbs. The cards feel soft, almost pillowed.

Why large radii work here:

- Sharp corners (4px, 6px) read as technical and dense — good for code editors, wrong for dashboards. Large radii (16px+) read as approachable and modern. Since we are building software for shop owners who may not be technically sophisticated, approachability matters.
- Large radii at scale create a sense of spaciousness. The rounded corners push content inward from the edge, which adds visual padding even beyond the actual CSS padding.
- Buttons, inputs, and dropdowns at 12px radius (M3 "medium") sit comfortably inside 16px radius cards without visual conflict. The hierarchy is: containers are rounder than their contents.
- Badges and pills at `rounded-full` (9999px) contrast cleanly against the 16px card radius. The fully-round elements pop out as discrete, scannable units.

**MW application:** Cards, modals, dialogs: 16px (`--shape-lg`). Buttons, inputs: 12px (`--shape-md`). Badges, avatars: `rounded-full`. Bottom sheets: 24px (`--shape-xl`). Checkboxes: 4px (`--shape-xs`). This is the M3 shape scale applied consistently.

---

## 5. Monochromatic Grey Tones

Crextio builds almost everything from 6-7 grey values between white (#FFFFFF) and near-black (#0A0A0A). Each grey has a specific job — there is no ambiguity about which grey to use where.

The hierarchy:

- Near-black (#0A0A0A) for headlines and primary text. This is the darkest text on the page and your eye goes here first.
- Dark grey (#2C2C2C) for body text and secondary content. Close enough to black that it reads clearly but does not compete with headlines.
- Mid grey (#525252) for table body text and descriptions. The step down from body text signals "supporting information."
- Medium grey (#737373) for labels, captions, timestamps, inactive icons. This is the lightest grey that remains readable under normal lighting. Nothing textual should be lighter than this.
- Border grey (#E5E5E5) for card borders, dividers, table row separators. Structural only, never text.
- Subtle grey (#F5F5F5) for page backgrounds and input backgrounds. Barely visible against white cards — just enough contrast to show that the card is a distinct surface.
- White (#FFFFFF) for card surfaces.

Why the discipline matters:

- When each grey has a clear role, the hierarchy is automatic. You do not need to think about how to style a label — it is always #737373, 12px, weight 500. The system is predictable.
- Fewer colour decisions means faster development. Claude Code can look at the design system, match the grey to the role, and produce correct output without asking for clarification.
- Under industrial lighting (bright overhead fluorescents, sometimes harsh LEDs), the difference between #525252 and #737373 is the difference between readable and squinting. We need clear steps between each grey, not a continuous gradient.

**MW application:** The neutral scale from #FAFAFA to #0A0A0A with 10 stops, each mapped to a specific UI role. No text lighter than #737373. Page background #F5F5F5. Card background #FFFFFF. Grouped card background #F8F7F4 (MW Off-White) for sheet interiors.

---

## 6. Frosted Glass / Translucency

Crextio uses translucent, blurred surfaces for overlapping elements — calendar popovers, task lists, onboarding panels. The effect gives depth without hard edges. Elements feel like they float above the page rather than cut into it.

The specific treatment:

- Overlay backdrop: `bg-black/20 backdrop-blur-sm`. Light enough that the content behind is still partially visible, dark enough to focus attention on the foreground element.
- Overlay content surface: `bg-white/95 backdrop-blur-xl`. Nearly opaque but with just enough transparency to hint at what is behind. The strong blur means you cannot read the underlying text, but you can see colour and shape — enough to maintain spatial awareness.
- Tooltips and popovers: `bg-white/90 backdrop-blur-md`. Lighter and less blurred than sheets/modals, because tooltips are transient and small.
- A subtle `border border-white/30` on frosted surfaces catches light at the edge and separates the surface from the backdrop blur. Without this border, frosted glass can feel like it melts into the page.

Why it works:

- Hard-edged overlays (solid white on solid black backdrop) feel like a new page replacing the current one. Frosted glass feels like a layer — the user understands they can dismiss it and return to where they were.
- The translucency effect communicates "temporary." Solid surfaces feel permanent. Frosted surfaces feel like they can be swept away. This is the right mental model for sheets, dialogs, tooltips, and command palettes.
- It looks premium. This is the iOS effect that people associate with polished, modern software. When a shop owner sees this in a $47/month ERP, it signals quality that competes with the $150/user tools visually.

**MW application:** Frosted glass ONLY on overlay surfaces: sheets, dialogs, tooltips, command palette, toasts. Never on regular cards, sidebar, table containers, or page content. The distinction matters — if everything is frosted, nothing feels layered.

---

## 7. Photography at Scale

Crextio integrates large-scale photography — full-bleed hero images of people working, team shots that fill entire card widths. The photography is not decorative clip art. It shows real people in real contexts, cropped generously with plenty of breathing room.

What works:

- Large images (spanning 2-3 columns or the full width) create emotional weight. They break the rhythm of data cards and charts, giving the eye a resting point.
- The images are overlaid with frosted glass panels or dark gradient washes that let text sit on top without obscuring the photo entirely. The photo provides atmosphere; the data provides information.
- Circular avatar photos at consistent sizes (40px, 48px, 64px, 80px) anchor entity cards. The human face is always the leftmost element — the eye goes to faces first, then reads the name.

**MW application:** For marketing and onboarding screens, full-bleed manufacturing photography — shop floors, welding sparks, CNC machines, team shots in high-vis. Within the app, photography is limited to avatar-sized (person cards, operator profiles) and the occasional hero banner on dashboard. Product photos of manufactured parts could appear on job cards at larger sizes. No stock photography — real workshop imagery only.

---

## 8. Progress Bars

Crextio's progress bars are compact, communicative, and never decorative. Three patterns appear consistently:

**Linear fill bars** — A 6-8px tall track with a rounded fill. The fill is yellow for the primary metric, dark grey for secondary. The remaining portion is either transparent (showing the neutral track) or hatched.

**Segmented composition bars** — Multiple segments sitting side-by-side within a single track, separated by 2px gaps. Each segment represents a category (completed, in progress, remaining). The segments are: yellow (completed), dark (in progress), hatched diagonal stripes (remaining/projected). This is a bar chart compressed into a single line — it shows composition without needing a pie chart or stacked bar.

**Metric + bar combination** — A label on the left ("Schedule adherence"), a number on the right ("78%"), and a progress bar below both. The three elements together form a self-contained micro-visualisation that communicates a single metric completely. No chart needed, no tooltip needed. Scannable at a glance.

Why the hatched pattern matters:

- Using colour to distinguish "actual" from "projected" requires the user to learn what each colour means. Using a hatched texture is universally understood as "not yet" or "estimated." It is a visual convention from engineering drawings and Gantt charts — a language that manufacturing people already speak.
- The texture differentiates without adding a new hue. The palette stays monochromatic.

**MW application:** All three patterns throughout Smart FactoryOS. Linear bars for simple completion (job progress, invoice payment). Segmented bars for production workflow stages (cutting / forming / welding / finishing). Metric + bar for KPI cards and entity summaries (efficiency, on-time delivery, utilisation).

---

## 9. M3 Properties

Crextio follows Material Design 3 principles even though it does not use the Material component library. The M3 DNA shows up in:

- **Shape scale:** Consistent border radii that increase with container size. Small controls (4px), medium interactive elements (12px), large containers (16-24px).
- **State layers:** Hover states use a semi-transparent overlay of the content colour (8% opacity) rather than a different colour. This is the M3 state layer system — the surface colour shifts slightly toward the content colour on interaction.
- **Elevation:** Shadow depth increases with interactivity and importance. Content cards at 1dp, interactive cards at 3dp, popovers at 6dp, modals at 12dp. Each level is visually distinct.
- **Type scale:** Clear hierarchy from display (48-64px) through headline (24-32px), title (14-22px), body (14-16px), to label (11-12px). Weights are restricted to 400 (regular) and 500 (medium) for UI text, with 700 (bold) reserved for hero stat numbers.
- **Motion:** Transitions use deceleration curves (ease-out) for entering elements and acceleration curves (ease-in) for exiting. Duration scales with the complexity of the change: 50ms for a checkbox, 250ms for a standard transition, 350ms for a dialog opening.
- **Disabled states:** Not a blanket opacity reduction. The container becomes 12% opaque and the content (text, icon) becomes 38% opaque. This preserves the layout and structure while clearly communicating "unavailable."

**MW application:** We use the full M3 token system: 7-step shape scale, 6-level elevation, 6 easing curves, 6 duration tokens, state layer opacities, and the split disabled pattern. These are defined as CSS variables in `globals.css` and enforced through the Cursor rules file.

---

## 10. Large Touch Targets

Crextio buttons are tall — 48px minimum height, with primary actions at 56px. Table rows are 56px. Icon buttons are 48x48px. Nothing interactive is smaller than a comfortable fingertip.

Why this matters more for us than for Crextio:

- Crextio is an HR dashboard used at a desk. We are a manufacturing ERP used on tablet stands bolted to machine stations. Operators wear work gloves. The touch target minimum for gloved use is 56px, not 48px.
- Industrial lighting is often overhead fluorescents or harsh LEDs. Small, low-contrast touch targets become invisible. Large targets with clear borders remain visible in any lighting.
- Production environments are noisy and distracting. Operators glance at the screen between tasks. They need to hit the right button on the first try, without looking closely. Large targets with generous spacing between them reduce mis-taps.
- Start/stop production buttons are safety-critical. An accidental tap on a "stop" button halts a machine and loses production time. These buttons should be 80px and isolated from other interactive elements.

**MW application:** 48px minimum on desktop. 56px minimum on Make and Ship modules (shop floor). 80px for production start/stop CTAs. Table rows always 56px. Icon buttons 48x48px with visible touch area. 16px minimum gap between adjacent interactive elements to prevent mis-taps.

---

## 11. Hierarchy of Text

Crextio creates clear information architecture through size and weight contrast alone — no colour needed, no borders, no background changes. Just size and weight.

The pattern:

- **Hero numbers** (48-64px, weight 700): The first thing you read on a dark accent card. Revenue, headcount, completion rate. These are the "answer" — the number that a manager looks at before everything else.
- **Page titles** (32px, weight 400): Identifies where you are. "Dashboard", "People", "Reports." Large enough to be unmistakable, light enough weight to not compete with hero numbers.
- **Section headers** (24px, weight 400): Groups related content. "Performance", "Onboarding tasks." Same weight as page titles but smaller — clearly subordinate.
- **Card titles** (16-22px, weight 500): Names the content within a card. "Attendance report", "Job completions." Medium weight separates these from both headers (lighter) and data (heavier).
- **Body text** (14-16px, weight 400): Descriptions, explanations, table cell content. Regular weight, comfortable reading size.
- **Labels and metadata** (11-12px, weight 500): Column headers, timestamps, badge text, captions. Small but medium weight — the weight compensates for the small size, keeping them legible.

The key insight is that size and weight work inversely at the extremes. Hero numbers are large AND heavy. Labels are small AND medium-weight. Body text is medium size and light weight. This creates three distinct "channels" the eye can tune into depending on what the user needs: scan the big numbers, read the content, or check the metadata.

**MW application:** This maps directly to the M3 type scale we use. `display-large` / `headline-large` for hero stats. `headline-small` / `title-large` for section and card titles. `body-large` / `body-medium` for content. `label-medium` / `label-small` for metadata. The hierarchy works because every level is visually distinct from every other level — there is no ambiguity about what is a title and what is a label.

---

## 12. Generous Whitespace

Crextio's pages feel uncrowded despite containing significant data. This is deliberate. Whitespace is not wasted space — it is structural.

Specific measurements:

- Card internal padding: 24-32px. Content does not touch the card edges. The padding creates a visual buffer that makes the card feel like a contained unit rather than a region of the page.
- Section gaps: 32-48px between card groups. These gaps are larger than the gaps within a group (24px), which creates a two-level hierarchy: cards within a section feel related, and sections feel distinct.
- Card grid gaps: 24px between cards. Tight enough that cards feel like a group, loose enough that each card has its own identity.
- Page margins: 32px on all sides. The content does not run to the edge of the viewport. This framing effect makes the page feel composed rather than overflowing.

Why it matters for manufacturing ERP:

- Information density should be moderate, not maximum. A foreman checking the production dashboard at 7am should see the top-line numbers and the critical alerts without scrolling. They should NOT see every detail of every job. Progressive disclosure handles the detail — tap a card to see more.
- Whitespace reduces cognitive load. Manufacturing operators deal with physical complexity all day. The software they use should feel like a clear, calm surface — not another source of visual noise.
- On large monitors (common on factory floors — 27" or larger), generous whitespace prevents the interface from looking sparse. A dense interface looks good on a laptop but empty on a large screen. A spacious interface scales up gracefully.

**MW application:** Page padding `p-8` (32px). Card padding `p-6` (24px), `p-8` (32px) for feature cards. Card grid gap `gap-6` (24px). Section spacing `space-y-8` (32px). Everything on an 8px grid. No exceptions.

---

## 13. Mixed Elevation Within a View

Crextio does not put every card at the same elevation. Within a single page, some cards are flat (border only, no shadow), some have subtle shadows, and the dark accent cards pop forward with no shadow but strong colour contrast. This creates a layered reading experience.

How the eye moves:

1. **Dark accent cards first** — The near-black surface with yellow text is the highest-contrast element on the page. Your eye goes there before anything else. This is where the most important metric sits.
2. **Elevated cards second** — Cards with subtle shadows (3dp) appear to float above the flat cards. Interactive cards, summary cards, and featured content get this treatment.
3. **Flat cards last** — Cards with only a border (1dp) sit flush with the page. These contain supporting information — tables, lists, settings groups. They are there when you need them but do not demand attention.

Rules for mixing elevation:

- Maximum 3 elevation levels visible on any single page. More than 3 creates visual chaos.
- Dark accent cards do NOT use shadow. The colour contrast is enough. Shadow on a dark card looks like a design error.
- Elevation increases with interactivity. A static information card is flat. A clickable card is elevated. A modal is high elevation.
- Adjacent cards should not be at the same elevation unless they are peers in a grid. When two cards are next to each other, one should be visually subordinate to the other unless they are the same type of content.

**MW application:** Dashboard: 1 dark accent KPI (elevation by colour), 3 elevated KPI cards (shadow-sm), table card (flat, border only). This gives the page three layers and a clear reading order. The dark card screams the headline number. The elevated cards give supporting stats. The table provides detail.

---

## 14. Dark Accent Cards as Focal Points

The most distinctive pattern in Crextio. Near-black (#1A2732-range) cards with yellow accents, used for the 1-2 most important data points on a page. The contrast is so strong that the eye physically cannot ignore them.

Anatomy of a dark accent card:

- Background: Mirage (#1A2732) or similar warm dark
- Label: White at 60% opacity (small, uppercase, tracking wide) — "TOTAL REVENUE"
- Hero number: White or MW Yellow, 48-64px, weight 700 — "$284,500"
- Trend indicator: Yellow pill badge with delta — "+12.4%"
- Supporting text: White at 60% opacity — "vs last month"

Why maximum 1-2 per view:

- If every card is dark, the effect inverts — now the white cards become the focal points and the dark ones become background. The scarcity is what creates the emphasis.
- Dark cards carry heavy visual weight. More than 2 per view makes the page feel oppressive and hard to read. The lightness of the surrounding white cards provides visual relief.
- Each dark card should answer one question. "What is total revenue?" or "What is production uptime?" If a dark card tries to answer two questions, it becomes cluttered and loses its focal power.

**MW application:** One dark accent card per module dashboard for the single most critical metric. Sell: total pipeline value. Plan: schedule adherence. Make: production output. Ship: on-time delivery rate. Book: net profit. Buy: outstanding PO value.

---

## 15. Segmented Progress Bars

Multi-segment horizontal bars that show composition — what fraction of a whole belongs to each category. More compact than a pie chart, more scannable than a stacked bar.

Crextio pattern:

- Single track, 6-8px tall, `rounded-full`
- Segments separated by 2px gaps
- Yellow segment = completed/actual
- Dark segment = in progress/active
- Hatched segment (diagonal stripes, grey) = remaining/projected/target

Why hatched for "remaining":

- Colour means "real data." Texture means "not yet real." This is an established convention in engineering drawings, Gantt charts, and architectural plans. Manufacturing users read this intuitively.
- The palette stays monochromatic. No need for a third colour to represent "remaining."
- Hatching communicates uncertainty visually. Solid fills feel definite. Striped fills feel provisional. The visual metaphor matches the data semantics.

Segmented bars vs pie charts:

- Segmented bars are horizontally compact — they fit inside a card row or alongside a metric label. Pie charts require a square aspect ratio and take up significant space.
- Linear bars are easier to compare than pie wedges. Humans are better at judging lengths than angles.
- Multiple segmented bars stack vertically, allowing comparison across categories. Try stacking 5 pie charts and comparing them — it does not work.

**MW application:** Segmented bars for: job stage progress (cutting/forming/welding/finishing), schedule utilisation (booked/in-progress/available), material usage (used/committed/remaining), invoice status (paid/partial/outstanding). Yellow for completed. Mirage for in-progress. Hatched for remaining.

---

## 16. Pill-Shaped Stat Badges

Small, rounded-full indicators showing a percentage, count, or short label. These are micro-visualisations — they communicate status at a glance without requiring a chart.

Anatomy:

- Shape: `rounded-full` (pill)
- Padding: `px-2.5 py-0.5` for text badges, `px-3 py-1` for metric badges
- Text: 11-12px, weight 500
- Background: contextual — neutral-100 for default, yellow-400 for accent, mirage for dark, status colour at 20% opacity for status

Use cases:

- **Delta badges:** "+12.4%" or "-3.2%" next to KPI numbers. Yellow background for positive, neutral for flat, error colour at 20% opacity for negative.
- **Count badges:** "47" next to a section header. Shows how many items are in a category without clicking into it.
- **Status badges:** "Active", "Draft", "Overdue" with status dot + text. The dot provides colour; the text provides meaning.
- **Stat pills:** "91%" shown as a standalone scannable element. Font-medium with `tabular-nums` for consistent digit width.

Why pills and not squares:

- Rounded shapes feel finished and self-contained. Square badges feel like small cards and create visual clutter.
- Pills at small size have a clear boundary that separates them from surrounding text. Square badges at small size can be mistaken for inline text with a background highlight.
- Multiple pills in a row (e.g., "91% 78% 65%") maintain visual rhythm because the rounded edges create consistent negative space between them.

**MW application:** Pill badges everywhere status or count is shown inline: table rows, card headers, kanban column headers, timeline entries, avatar group overflow ("+4"), trend indicators next to KPI numbers.

---

## 17. Card-Within-Card Nesting

For complex views where a card contains distinct sub-sections — a filter bar above a table, or a PO header above line items.

Crextio pattern:

- Outer card: white background, 16px radius, border
- Inner sections divided by `border-b border-neutral-100`
- Filter bar section: `p-4`, lighter treatment
- Table section: no padding (table handles its own)
- Selected row: full-width yellow highlight (`bg-yellow-50`) with a left accent border (`border-l-3px border-l-yellow-400`). More pronounced than a subtle hover — makes multi-select feel intentional and deliberate.

Why nesting works:

- It groups related controls with their data. The filter bar is not floating above the table — it is physically inside the same card. This communicates "these filters affect this table" without explanation.
- The inner dividers are lighter (neutral-100) than card borders (neutral-200), creating a visual hierarchy: card boundary > section boundary > row boundary.
- Nesting avoids orphaned controls. A filter bar sitting outside a card feels disconnected. A filter bar inside the card feels integral.

**MW application:** Every data table wrapped in a card container with filter bar above. Quote line items nested inside quote card. PO line items inside PO card. Machine detail inside machine card on the production floor. The selected row pattern (yellow band + left border) for all multi-select contexts.

---

## 18. Consistent Avatar Treatment

Circular avatars with a thin ring or shadow, always at consistent sizes, always anchored to the left side of a row.

Size scale:

- 32px in table rows and compact lists
- 40px in standard list items and dropdowns
- 48px in cards and kanban items
- 64px in detail sheets and side panels
- 80px in full profile views

Treatment:

- `ring-2 ring-white shadow-sm` — the white ring separates the avatar from the background, and the subtle shadow gives it depth
- Fallback (no photo): neutral-100 background, neutral-500 initials, 14px font-medium
- Avatar groups (overlapping): `-space-x-2` overlap with `ring-2 ring-white` so each avatar sits on top of the next with a clean white border
- Overflow: "+4" count pill in the same size as the avatars

Why left-anchored:

- The human face is the fastest-processing visual element. Placing the avatar at the far left of a row means the user's eye lands on the face first, then reads the name, then scans the metadata. This reading order matches natural left-to-right scanning.
- In multi-column layouts, left-anchored avatars create a consistent visual rhythm down the left edge. The faces form a vertical column that is immediately recognisable as "list of people."

**MW application:** Operator cards in Make, customer cards in Sell, supplier cards in Buy, user lists in Control. Consistent sizing at all five tiers. White ring treatment on all avatars. No square avatars anywhere.

---

## 19. Hatched Patterns for Projected Values

Diagonal striped textures used in progress bars and charts to differentiate "actual" from "projected," "target," or "remaining" — without introducing a new colour.

Implementation:

```css
background: repeating-linear-gradient(
  135deg,
  var(--neutral-300),
  var(--neutral-300) 2px,
  var(--neutral-100) 2px,
  var(--neutral-100) 4px
);
```

Why texture instead of colour:

- A second colour (even a lighter shade of yellow) implies a second data category of equal importance. A texture implies "this is the same category but incomplete/projected."
- Engineering drawings, architectural plans, and technical blueprints use hatching for sections, materials, and projections. Manufacturing users read hatching fluently.
- Textures survive greyscale printing and colourblindness. A yellow bar and a blue bar look identical to someone with protanopia. A solid bar and a hatched bar are always distinguishable.

Where to use:

- Progress bars: hatched for remaining percentage
- Bar charts: hatched bars for forecast periods
- Gantt charts: hatched blocks for tentative scheduling
- Budget tracking: hatched for remaining budget allocation
- Production targets: hatched for gap between actual and target

**MW application:** Every progress bar and chart that shows "actual vs target" or "completed vs remaining" uses hatched grey for the non-actual portion. Solid yellow for completed. Solid mirage for in-progress. Hatched grey for everything else.

---

## 20. Responsive Card Grid

Desktop shows a 3-4 column card grid with varying card heights (some span 2 rows). Tablet collapses to 2 columns. Mobile to 1 column full-width. Same components, same hierarchy, just reflowed.

Grid rules:

- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Gap: `gap-6` (24px) at all breakpoints
- Featured cards (dark accent, large charts): `lg:col-span-2` or `lg:row-span-2`
- Cards maintain internal padding at all breakpoints — never reduce card padding below `p-4` on mobile
- Card order on mobile matches visual hierarchy: dark accent card first, then KPIs, then data table

Why varying card heights:

- A uniform grid where every card is the same height looks like a spreadsheet. Varying heights (some cards taller because they contain more content, some spanning 2 rows because they are featured) creates visual rhythm and interest.
- The dark accent card spanning 2 rows on desktop becomes the full-width hero card on mobile. Same component, same data, different layout.
- `auto-rows-min` on the grid prevents empty space below short cards. Cards size to their content, and the grid fills naturally.

**MW application:** Dashboard: 1 dark accent card (span-2), 3 KPI cards, 1 chart card (span-2), 1 activity feed card, 1 table card (span-3 or full-width). On tablet: dark accent full-width, KPIs 2x2, chart full-width, table full-width. On mobile: everything stacked full-width, dark accent first.

---

## Summary — What These Patterns Mean for MirrorWorks

This is not a UI trend exercise. These patterns solve real problems for our users:

- **Shop owners scanning dashboards at 7am** need dark accent cards with hero numbers they can read from 2 metres away.
- **Operators on the floor wearing gloves** need 56px touch targets, large checkboxes, high contrast under industrial lighting.
- **Bookkeepers reconciling invoices** need right-aligned `tabular-nums` financial data, alternating row backgrounds, and clear subtotal rows.
- **Sales staff in the office** need a kanban board with draggable cards, segmented pipeline values, and a quick-add sheet that does not navigate away from the board.

The Crextio benchmark tells us the quality bar. The MW design system tells us the specific tokens. The component patterns document tells Claude Code exactly how to assemble them. Together, they should produce production-quality screens that feel polished, restrained, and purpose-built for metal fabrication.
