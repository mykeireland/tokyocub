# TOKYO CUB — tokyocub

The official site of **Toni Lozanovski / Tokyo Cub**, a Naarm/Melbourne producer.

It's a static site with no build step: just `index.html`, `css/`, `js/` and `assets/`.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Audio needs a real server; it won't play from `file://`.

## How it works

- **Audio first.** A single `<audio>` element is routed through a Web Audio analyser. Every frame, `js/main.js` writes the music's energy into CSS variables (`--bass`, `--treble`, `--e`, `--beat`). The whole site moves with the track: the hero ensō, the shockwaves, the embers, the waveform line, the seal, the section stamps and the vinyl.
- **The catalogue** lives in `js/tracks.js`. Add a release by adding an object to it.
  - `full` is the full-length master. These currently point to the public triple j Unearthed web files.
  - `preview` is a 30-second Spotify preview. It is used when there's no full master, or as a fallback if the full one fails to load.
  - Audio sources must allow CORS (`Access-Control-Allow-Origin`). Without it, the visualiser can't "hear" the track.
- **Videos** and the **SoundCloud** embed load only when someone clicks them, and they pause the site player.

## Before launch: needs Toni

1. **Own masters.** Put Toni's own MP3/M4A masters in `assets/audio/` and point `full:` at them. That covers every track and doesn't depend on Unearthed's file URLs.
2. **Teaching details** (`#sensei`): subjects, campus, years teaching. The three tenets (Kihon / Keiko / Zanshin) are framing copy for him to approve or rewrite.
3. **Drive** (`#lineage`): years active, releases, shows.
4. **Contact**: a booking or management email. The site currently points to Instagram DMs.
5. **Copy sign-off**: the bio and the martial-arts / samurai paragraph.

Look for `TODO (Toni)` comments in `index.html`.

## Deploy

Any static host works: GitHub Pages, Netlify, Vercel or Cloudflare Pages. For GitHub Pages, go to *Settings → Pages* and deploy from this branch's root.
