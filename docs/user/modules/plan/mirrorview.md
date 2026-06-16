# MirrorView (Plan job)

The MirrorView tab on a Plan job is where the team looks at the part before it goes anywhere — 3D model, derived 2D drawing, current revision, what changed, and the saved viewpoints operators will see on the floor.

## Where to find it

Open any Plan job (`/plan/jobs/:id`) and select the **MirrorView** tab. The tab also appears on Sell, Buy, Make, and Control product detail pages — the wiring is the same, only the owner changes.

## What's on the page

- A 3D viewer that handles native CAD files directly (STEP, DWG, RVT, IFC, IGES, JT, Catia, NX, and around 80 other formats — no manual export to GLB).
- A revision chip in the top-left of the viewer showing the current revision label (e.g. **Rev C**).
- A **Step views** dropdown above the viewer — labelled shortcuts that jump straight to a named camera angle and isolation.
- A part-tabs strip across the top of the card (one tab per visual part on the assembly).
- A **Fullscreen** button on each viewer card.
- An empty-state drop affordance when no model has been uploaded yet.

## Uploading a CAD file

Drag a CAD file from your desktop and drop it anywhere on the viewer card. The viewer opens an **Upload to MirrorView** dialog that asks for:

- **Revision** — pre-filled with the next label (Rev A → Rev B → … → Rev AA). Override it if your customer numbers revisions differently.
- **What changed** — optional one-line note. Operators see this exact line when the floor flags a drift, so write it for them ("Hole spacing 75 → 80 mm; added countersink", not "fix").

Click **Upload as Rev X** to confirm. Upload progress is reactive — once the file finishes translating, the viewer flips to the new model with no refresh.

New revisions land as **draft**. The floor doesn't see them until they're released (see below).

## Saved step views

Step views let engineers pin a named camera angle once and have every operator jump to it with one tap, instead of orbiting around the model on a touchscreen mid-shift.

To capture:

1. Orbit / pan / zoom to the angle you want operators to see.
2. Click parts to isolate them if the operator should focus on a subset.
3. Click **Save current view** beside the Step views dropdown.
4. Give it a short label ("Bend sequence", "Weld this seam", "Finish inspection") and press Enter.

To consume — on this tab or on the shop floor — open the **Step views** dropdown and pick a label. The camera and isolation snap back to the captured state.

Capturing is gated to admin and lead. Operators on the floor can jump between views but can't create or delete them.

## Releasing a revision

Uploads land as draft. They show up here for review but don't trigger any change on the floor.

When engineering is ready for the floor to switch over, open the product detail page for the part (`/sell/products/:id` or `/plan/products/:id` — same screen, different module) and use **Release Rev X** in the MirrorView section. The release stamps the revision with your name and the time.

From that moment, any operator whose work order is pinned to an older revision sees a yellow banner explaining what changed.

Release is gated to admin and lead.

## Markup and 3D comments

Pin anchored comments on the model — they remember the exact camera angle and the parts you had isolated when you placed them.

On the Make MO detail page (where the markup panel is most-used), click the **Markup** affordance, position your view, and add a comment. Replies thread under the root. Click any pin to jump back to the exact viewpoint the commenter saw.

The status pill on each root (Open / Resolved) is clickable for admin and lead.

## Notes

- Drop-to-upload is enabled on Plan job MirrorView, Plan CAD Import, Make MO detail, and the Sell/Plan/Make/Buy product detail screens. Shop-floor surfaces are intentionally read-only.
- The drift banner only fires when the latest revision is **released**. Draft uploads sit quietly until you release them.
- If you upload a new revision, any step views you'd captured against the previous revision don't carry over — geometry can move between revisions, so the camera anchors are deliberately reset. Re-capture the ones the floor still needs.
