# Plan → Activities

A new page at `/plan/activities` for logging activity on jobs and running timers in real time.

## What it does

The Activities page is where you record time and progress against work that's in flight. It pairs with the job detail page, so anything you log here shows up under that job's Activities tab and feeds into the job's actuals.

## Where to find it

Sidebar → Plan → **Activities**.

There is also a global timer pill that follows you across the app once a timer is running, so you can keep working in other pages without losing track of the clock.

## How to use it

### Start a timer

1. Open Activities.
2. Click **Start timer** on a job activity card.
3. Pick an activity type (from the templates configured in Plan → Settings → Activity types) and add an optional note.
4. The timer runs in the page and pins itself to the global timer pill in the header. You can switch pages and it keeps counting.
5. Click **Stop** to commit the entry. The time and any notes are saved against the job.

### Log time after the fact

1. Click **Log activity** on a job card.
2. Pick the activity type, set the start and end (or the duration), and add notes.
3. Save. The entry shows up immediately on the job's Activities tab.

### View what's been logged

The card on each job shows the most recent entries and a summary (total hours by activity type). Open the job to see the full timeline on the job detail page's **Activities** tab, with a time summary card on the side.

### Edit or correct an entry

Click an entry in the activities list to reopen the dialog. Adjust the times or notes and save. Edits are tracked.

## Configuring activity types

Plan → **Settings** → **Activity types** lets module leads and admins curate the list that operators see when they start a timer or log time. Common starting set: Setup, Run, Inspection, Rework, Maintenance, Idle.

## Roles

- **Team** members can start, stop, and log their own time.
- **Leads** can edit their team's entries and curate activity types.
- **Admins** can do both, plus reassign entries between team members.
