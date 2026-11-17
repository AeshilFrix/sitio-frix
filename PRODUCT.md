# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Frix himself: the site is his personal space.
- A few friends he gives access to (he shares the link and the trick to get past the entry screen). Anyone else who manages to get in should also enjoy it.

## Product Purpose

A personal site where visitors get to know Frix (blog, what he watches and reads, gallery) and explore and play (rooms and minigames based on the gambles of the manga Usogui). His own writing (stories published by chapter) also lives here. Success: Frix enjoys keeping it up, and the few people who get in want to wander through it.

## Positioning

A handmade personal site whose rooms are the gambles of Usogui, filled with content Frix writes in his own panel.

## Operating Context

- Seen mostly on a computer. The phone can get a simpler version.
- Entry goes through a fake access screen; the real way in is clicking the bottom-right corner.
- Frix writes content in a local panel (`panel/panel.html`) that publishes to GitHub; GitHub Actions deploy `public/` to Neocities (aeshilfrix.neocities.org) and GitHub Pages.
- Stories come from `.tintero` files made in Tintero, his own writing app.

## Capabilities and Constraints

- Static site: plain HTML, CSS and JavaScript, no build step. Neocities free plan (no mp3 uploads; songs are served from the GitHub Pages mirror).
- Sections: Inicio, Blog, Escritos (stories with chapters), Obras (a list like MyAnimeList), Galería, and a hidden Diario (opened with 5 clicks on the cube).
- Bilingual Spanish and English; everything but the stories is translated automatically.
- Live panels: visit counter (Abacus); Discord activity through Lanyard is pending on Frix's side.
- Random music player.
- three.js r128 is already loaded for the corner Rubik's cube.
- Undecided: whether a 3D world replaces the current pages or wraps them.

## Brand Commitments

- Usogui references: card suits, chess, the Rubik's cube, and the gambles of the manga. Usogui's art is never reproduced; the design is only inspired by it.
- Frix rejected (do not bring back): a custom cursor, the card-dealing menu, the compass, a separate rules page, green card-table felt.
- Frix half liked: changing pages with the arrow keys and the soft page change.
- Frix wants: a 3D environment the visitor can move in, rooms where each one is a game, and an animated transition into the room when changing tabs.

## Evidence on Hand

- Real content in `public/datos.js`: 3 blog posts, 2 diary entries, 1 story ("El hombre al que todo olvidan.") with 1 chapter, 1 entry in Obras (Usogui, 10/10), example gallery images, links and a site log.
- Research of the 23 Usogui gambles, with chapters and fit as tabs or minigames: https://claude.ai/artifact/Fzj1jVfVSGSvE3BHqVKC1c
- No photos of Frix or custom art yet; the avatar is a letter "F".

## Product Principles

1. Personal first: made for Frix and a few friends, not for strangers or search engines.
2. Exploring is part of the content: each room is worth visiting on its own.
3. Writing stays easy (the panel) and reading stays comfortable.
4. Every room is a gamble from Usogui with a job to do, never decoration.
