---
id: pj-2026-07-08-7d96
aliases:
- pj-2026-07-08-7d96
title: Prompt templates for GAS + Claude
created: '2026-07-08'
---
# Prompt templates for GAS + Claude

These mirror `doc/ops/claude-api-gas-design.md`.
In Apps Script they are currently inlined in `handlers.js` for clasp simplicity.
When prompts grow, move each endpoint into a Drive HTML file or Script Property and load by name.

## Endpoints

- `generate-seed`
- `enrich-item`
- `generate-examples`
- `generate-insight`
- `validate-cefr`

## Phase 1 note

`/review-writing` is intentionally deferred to Phase 2 (Mode C).
