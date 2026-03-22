PRODUCT CONTEXT
MirrorWorks is an AI-native manufacturing ERP for metal fabrication SMEs (10-100 employees). The CRM sits inside the "Sell" module. Users are shop owners, sales reps, and office managers in fabrication workshops -- they need fast, scannable contact records with manufacturing-relevant data. This is not a generic SaaS CRM. Think Odoo meets folk.app, purpose-built for metal fab.
Follow the existing MirrorWorks design system, colour tokens, typography, and component patterns established in the Figma file. All screens should be visually consistent with the existing Job detail page and Sell module screens.

SCREEN 1: CONTACT RECORD (FULL DETAIL VIEW)
Design a full-width contact detail page that opens when you click a contact from a list or card view. Use a two-column layout on desktop (65/35 split) similar to folk.app's clean single-card approach -- all relevant info on one screen, no sprawling tabs.
Top section (full width):

Contact avatar/company logo (48px circle, initials fallback)
Company name (title weight, large)
Contact type badge(s): Customer, Vendor, Subcontractor, Customer & Vendor (multi-select, pill badges, colour-coded)
Status badge: Active, Inactive, Prospect, On Hold
Three-dot overflow menu (top right): Edit, Archive, Merge, Delete
"New quote" primary CTA button

Left column (65%) -- Contact details in grouped sections:
Section 1 -- Company info:

Company name (text)
ABN / Tax ID (text)
Industry (select: Automotive, Aerospace, Construction, Mining, Energy, Defence, General Fabrication, Other)
Website (URL, clickable)
Annual revenue (currency, AUD)
Employee count (number)
Account owner / Sales rep (user avatar + name)

Section 2 -- Primary contact:

Contact name (first + last)
Job title / Role
Email (clickable mailto)
Phone (clickable tel, Australian format)
Mobile (clickable tel)
Preferred contact method (icon indicator: email, phone, SMS)

Section 3 -- Address:

Street address
City / Suburb
State
Postcode
Country (default: Australia)
Map pin icon that opens Google Maps

Section 4 -- Additional contacts (collapsible):

List of secondary contacts at this company
Each row: Name, role, email, phone
"+ Add contact" link

Section 5 -- Financial summary:

Total lifetime revenue (large number, bold)
Outstanding balance
Average payment terms (e.g. "Net 30")
Credit limit
Payment rating (icon: green/amber/red)
Link to accounting/Book module

Section 6 -- Tags & notes:

Tags (multi-select pills, colour-coded, user-configurable)
Internal notes (rich text area, timestamps on each note)
Source (how the lead was acquired: Referral, Website, Trade Show, Cold Call, Existing Network)

Right column (35%) -- Activity & relationships:
Panel 1 -- Activity timeline:

Chronological feed of interactions: emails sent/received, phone calls logged, quotes sent, orders placed, invoices issued
Each entry: icon + description + timestamp + user avatar
Filter by type (all, emails, calls, quotes, orders)
"+ Log activity" button

Panel 2 -- Active opportunities:

Compact cards showing open opportunities linked to this customer
Each: opportunity name, stage badge, value, expected close date
"+ New opportunity" link

Panel 3 -- Recent quotes & orders:

Mini list of last 5 quotes and orders
Each: reference number, date, value, status badge (Draft, Sent, Accepted, Declined)
"View all" link to filtered quotes/orders list

Panel 4 -- Documents:

Uploaded files (purchase orders, drawings, specs, certificates)
Drag-and-drop upload zone
File type icons


SCREEN 2: NEW CONTACT FORM (MODAL OR DRAWER)
A right-side drawer (480px width) or centred modal for creating a new contact. Progressive disclosure -- start simple, expand for detail.
Required fields (always visible):

Contact type (segmented control: Customer, Vendor, Subcontractor, Customer & Vendor)
Company name
Primary contact name
Email OR phone (at least one required)

Optional fields (collapsible "More details" section):

Job title
Mobile
ABN / Tax ID
Website
Industry (select)
Street address, City, State, Postcode, Country
Account owner / Sales rep (dropdown of team members)
Source (select: Referral, Website, Trade Show, Cold Call, Existing Network)
Tags
Notes

Footer:

"Cancel" (ghost button)
"Save & close" (primary CTA button)
"Save & add another" (secondary outline button)


SCREEN 3: CONTACT CARD (COMPACT -- FOR LIST/GRID VIEWS)
A compact card (384px wide, ~160px tall) for the CRM card grid view. Scannable at a glance.

Company logo / avatar (40px, top-left)
Company name (semibold, primary text)
Primary contact name (regular, secondary text)
Contact type badge (small pill: Customer, Vendor, etc.)
Status badge (small pill: Active, Prospect, etc.)
Key metrics row: Total revenue | Open opportunities count | Outstanding balance
Last activity date (caption text, bottom)
Hover state: subtle elevation, show quick-action icons (email, phone, new quote)


SCREEN 4: TOP NAVIGATION BAR (CONTACT DETAIL PAGE)
Design a horizontal tab navigation bar that sits below the page header (company name + badges) and above the content area. This should be a consistent pattern used across the app -- the same structure as the Job detail page in the Plan module (see attached screenshot for reference).
The navbar uses a horizontal tab/pill pattern with active state indicator and bottom border, matching the existing app-wide tab pattern.
Tab structure for the Contact detail page:
Tab 1 -- Overview (default):

The two-column layout described above
Summary of everything at a glance

Tab 2 -- Sales:

Sub-sections or further tabs for:

Active quotes (table: quote #, date, value, status, expiry)
Historical quotes (same table, filtered to closed/expired)
Sales orders (table: SO #, date, value, status, delivery date)
"New quote" CTA button prominent at top right



Tab 3 -- Accounting:

Invoices list (table: invoice #, date, amount, status [Draft, Sent, Overdue, Paid], due date)
Credit notes
Payment history (table: date, amount, method, reference)
Accounts receivable summary (outstanding, overdue, credit limit)
Reports section: aging report, revenue by period

Tab 4 -- Contacts:

All people at this company
Table: name, role/title, email, phone, mobile, primary contact flag
"+ Add contact" button
Click any row to expand/edit inline

Tab 5 -- Documents:

All uploaded files related to this customer
Categories: Purchase orders, Drawings/CAD files, Specifications, Certificates, Contracts, Other
Upload button, drag-and-drop zone
Table: filename, category, uploaded by, date, file size

Tab 6 -- Activity:

Full activity log (expanded version of the timeline in Overview)
Filters: All, Emails, Calls, Meetings, Notes, System events
"+ Log activity" button
Each entry: type icon, description, timestamp, user avatar, related entity link


GENERAL UX NOTES

Follow the existing design system patterns for cards, backgrounds, spacing, and elevation
Breadcrumb at top: Sell > CRM > [Company Name]
Keep information density high but clean -- manufacturing users deal with lots of data, don't hide it behind unnecessary clicks
folk.app inspiration: single-card contact view, clean left/right split, no tab overload on the overview page
Odoo inspiration: comprehensive field set, contact type flexibility (customer + vendor dual role), financial summary integrated into the contact record
All monetary values in AUD with $ prefix, two decimal places
Date format: DD MMM YYYY (e.g. 21 Mar 2026)
Responsive: design for 1440px desktop primary, with consideration for tablet (1024px)
Sentence case throughout, no all-caps labels
56px minimum touch targets for primary actions (shop floor use)