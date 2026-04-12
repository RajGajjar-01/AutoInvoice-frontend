# Data Table Template Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ad hoc template array with a proper catalog, add ten total templates, and centralize safe row defaults for template-backed tables.

**Architecture:** Template metadata and helper logic live in a dedicated feature module. UI consumers read from that catalog, while the table detail route uses shared row-default logic so template-required columns never break row creation.

**Tech Stack:** React, TypeScript, TanStack Router, Playwright, Biome

---

### Task 1: Add red tests

**Files:**
- Modify: `frontend/tests/data-tables.spec.ts`

- [ ] Add a test that opens the templates tab and asserts all ten template names render.
- [ ] Run the focused Playwright file and confirm the new catalog test fails on the current four-template implementation.
- [ ] Keep the existing row-add regression in the same file.

### Task 2: Build catalog module

**Files:**
- Create: `frontend/src/features/data-tables/templates.ts`

- [ ] Define template metadata types and helpers.
- [ ] Recreate the four existing templates with cleaned-up column sets.
- [ ] Add the six new templates and export catalog lookup helpers.
- [ ] Export a shared row-default helper keyed by column type.

### Task 3: Rewire consumers

**Files:**
- Modify: `frontend/src/components/DataTables/CreateTablePage/index.tsx`
- Modify: `frontend/src/components/DataTables/TemplateSelector.tsx`
- Modify: `frontend/src/routes/_layout/data-tables.$tableId.tsx`

- [ ] Replace direct `PREDEFINED_TEMPLATES` imports with catalog helpers.
- [ ] Update template card rendering to show the new metadata cleanly.
- [ ] Replace route-local row-default logic with the shared helper.

### Task 4: Verify

**Files:**
- Modify: `frontend/tests/data-tables.spec.ts`

- [ ] Run `npx biome check` on touched files.
- [ ] Run focused Playwright tests and confirm both the template-catalog and row-add regressions pass.
