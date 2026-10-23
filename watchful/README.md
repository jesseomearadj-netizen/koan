# Watchful · A Human Connection

Jesse O'Meara's personal page: a place to find him, talk through ideas, and a side link to [Koan](https://koan-beta.vercel.app).

It's one static file, `index.html`, with no build step. It lives here for now and has nothing to do with the Koan app's build.

## Fill in before sharing

At the bottom of `index.html`, in the `CONTACT` block:

- `email`: a practical contact address, shown as a small link in the footer
- `booking`: a scheduling link (Calendly, cal.com, etc.) for "Book a time"
- `social` and `socialHandle`: the profile link and handle for "Follow"
- `PRICES` (just below): the session and four-session prices in "Ways to work together"

Also worth personalising: the "Meet Jesse" bio and the "Photo coming" portrait placeholder.

## Putting it online (Vercel)

1. In Vercel, **Add New → Project** and import `jesseomearadj-netizen/koan` again.
2. Name it `watchful`, set **Root Directory** to `watchful`, and **Framework Preset** to *Other*.
3. Deploy. The Koan project is unaffected.

To give it its own repository later, copy this folder into the new repo's root.

## Adding writing and films

Add entries to the `WORKS` list near the bottom of `index.html`, newest first. Each needs a `kind` (Writing, Film or Experiment), `title`, `blurb` and `url` (a YouTube link, a Substack post, etc.); `date` and `image` are optional. While the list is empty, the section shows three "coming soon" cards.
