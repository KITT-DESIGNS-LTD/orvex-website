# Lessons

## 2026-07-28 — Confirm the render medium before replacing text with a rasterised surface

**What happened:** Implemented the ASCII bulge spec's shader approach (rasterise text to a
WebGL texture, distort in a fragment shader). Technically correct per the spec, fully
verified — but the user rejected it because the visible portrait became an image. They
wanted the ASCII to stay real, selectable DOM text, and chose the spec's per-character
alternative instead.

**Rule:** When a spec or plan replaces live DOM text with a canvas/texture/image
representation, surface that trade-off to the user as an explicit question during planning
("the visible text becomes a rendered image; the real text stays underneath for
selection/AT — is that acceptable?"), even when the spec itself has already made the
choice. "Text stays text" is a product requirement users feel immediately, not an
implementation detail.

**Also:** Check for a `tests/` directory at session start — this repo has source-regex
tests under `tests/*.test.mjs` run via `node --test` with **no npm script**, so
typecheck/build pass while tests silently break.
