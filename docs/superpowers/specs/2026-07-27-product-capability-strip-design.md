# Product capability strip

## Goal

Replace the hero's generic business metrics with product-specific capabilities that explain what JOHN CRM does at a glance.

## Content

The hero strip will show five markers:

1. `< 0 min` — `Avg Response`
2. `WhatsApp` — `Support`
3. `Custom API` — `Endpoints`
4. `Automate` — `Meetings`
5. `Embed Anywhere` — `Website & platform ready`

## Presentation

The strip remains below the hero content, retains its grid, top divider, reveal animation, and monochrome visual language. On wide screens it uses five evenly sized columns; on smaller screens it wraps into the existing compact grid.

Each primary capability remains visually dominant, but scales responsively so `Embed Anywhere` fits naturally in its column. Supporting labels use 12px type on smaller screens and 14px on wide screens, with less letter spacing and a darker neutral tone than the current 9px labels so they remain readable without competing with the primary line.

## Scope and verification

Only the hero capability strip changes. Its existing count-up behavior remains for the response-time metric; the remaining capability names render as static text. A source-level regression test will cover the five approved labels and the readable label styling. The production build and the rendered hero will be checked after implementation.
