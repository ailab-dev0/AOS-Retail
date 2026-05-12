---
name: ux-design-mastery
description: 10 universal design laws + interaction psychology + attention science + dashboard principles — use this skill to audit and redesign dashboards for maximum clarity, ease, and high-end feel
metadata:
  type: skill
---

# UX Design Mastery — Dashboard Edition

## The 10 Universal Laws (with Dashboard Application)

### 1. Hick's Law
Every additional choice increases decision time by ~150ms logarithmically.
**Dashboard rule**: Primary filter options ≤ 5. Navigation items ≤ 7. Table columns ≤ 8. Use progressive disclosure (More → expand) for anything beyond these limits.
**CSS pattern**: Hide secondary actions behind hover/kebab menu. Show only primary CTA prominently.

### 2. Fitts's Law
Acquisition time = a + b × log₂(2D/W). Closer + larger = faster to click.
**Dashboard rule**: Primary CTAs (Approve, Add Entry) min 44×44px. Full-width sidebar nav items. Row-level approve/reject buttons appear on hover — they're close to the cursor when the user is already over the row.
**CSS pattern**: `min-h-[44px] w-full` on all nav items. `opacity-0 group-hover:opacity-100 transition-opacity` on row actions.

### 3. Miller's Law
Working memory holds 7±2 chunks. Beyond 9 items, comprehension drops sharply.
**Dashboard rule**: 4 KPI cards (not 6). Navigation ≤ 7 items. Filter chips collapse after 3 visible. Paginate tables at 15 rows.
**CSS pattern**: `grid-cols-4` for KPIs. `hidden` + "show more" for overflow chips.

### 4. Jakob's Law
Users spend 90% of time on other products. They expect YOURS to work like those.
**Dashboard rule**: Sidebar left, topbar top — universal SaaS pattern. Status colors must match convention. Table sort by clicking column header. Escape closes modals. Breadcrumb in topbar.
**CSS pattern**: Match Linear/Notion/Salesforce sidebar patterns exactly.

### 5. Von Restorff Effect (Isolation Effect)
Among similar items, the different one is remembered. Distinctiveness = memory.
**Dashboard rule**: ONLY the primary action is blue. Pending status orange stands out against green/gray. Critical counts use larger font. Error states use red with icon, not just text.
**CSS pattern**: ONE `bg-[#2563eb]` button per section. All others `bg-white border`. Pending badge is the only colored element in sidebar.

### 6. F-Pattern / Z-Pattern Reading
Eyes scan F-shaped on dense content (top, second row, left rail). Z-pattern on sparse.
**Dashboard rule**: Most critical metric top-left KPI card. Row labels left-aligned. Summary numbers above detail. Actions at row-end (right) — still caught on F-scan's second pass.
**CSS pattern**: `grid-cols-4` KPIs with Pending first-left. Table: important columns left, actions right.

### 7. Progressive Disclosure
Show only what the current task requires. Advanced options appear on demand.
**Dashboard rule**: Collapsed sidebar = icons only. Filter bar shows 3 main filters; advanced in dropdown. Table actions appear on hover. Chart legends collapsible. Settings grouped by frequency of use.
**CSS pattern**: `group-hover:flex hidden` for advanced actions. Smooth `max-h-0 → max-h-96 transition-all` for expandable sections.

### 8. Pre-attentive Attributes (< 250ms processing)
Color, size, motion, orientation are processed before conscious thought.
**Dashboard rule**: Red badge = danger/action needed (processed instantly). Green fill = healthy. Animation draws eye ONLY when user needs to notice something (row disappears on approve). Don't animate decoratively — animate to communicate.
**CSS pattern**: `animate-pulse` ONLY on pending badge. Fade-out animation on completed rows. Size hierarchy: 32px KPI value → 14px label → 11px metadata.

### 9. Serial Position Effect
First and last items in a list are remembered best (primacy + recency).
**Dashboard rule**: Nav order: Dashboard (entry) → Approvals (action, highest priority) → Entries → Reports → Settings (last = least urgent). First KPI = Total Pending (needs action). Last table column = Actions (recency = easy to find).
**CSS pattern**: Approvals nav item has orange badge — reinforces its "needs attention" position.

### 10. Cognitive Load Theory (Sweller)
Intrinsic (task) + Extraneous (bad design) + Germane (learning) = total mental effort.
**Dashboard rule**: Reduce extraneous load: consistent 8px grid spacing, predictable hover patterns, no reflow on data changes. Use Gestalt proximity — group related data with `gap-1` inside cards, `gap-6` between cards. White space = cognitive breathing room.
**CSS pattern**: Tailwind spacing scale: p-5 cards, gap-4 grid, gap-1 within card sections. Never mix spacing scales.

---

## Interaction Psychology

### Attention Architecture
- **3-second first impression**: Page title + top 4 KPIs must orient user instantly. No loading spinners above fold.
- **8-second comprehension**: User must understand their full situation in 8s. Pending count, approval rate, recent activity = answer to "what's happening?"
- **Directed attention**: Use motion sparingly — one animation per user action. Decorative animations (parallax, continuous loops) destroy directed attention.

### Feedback Loop Science
Every action demands a response within:
- **< 100ms**: Hover state change (color, shadow) — feels instant
- **100–300ms**: Click feedback (scale, color change) — feels immediate  
- **300–1000ms**: State transition (approve row fading out) — shows the system is working
- **> 1000ms**: Show a progress indicator or skeleton

Pattern for approve/reject:
1. Button click → immediate button state change (100ms)
2. Row opacity transition to 0 + translateX(20px) (300ms ease-out)
3. Counter decrements with CSS transition
4. Toast notification slides in from bottom-right (200ms)

### Micro-animation Rules
- **Duration**: 150ms hover, 250ms state change, 400ms enter/exit (max)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material ease) for most transitions. `ease-out` for enter, `ease-in` for exit.
- **Purpose test**: If removing the animation doesn't confuse the user, remove it. Animation must communicate, not decorate.
- **Reduce motion**: Respect `prefers-reduced-motion` — wrap animations in `@media (prefers-reduced-motion: no-preference)`.

---

## Info Visibility & Processing

### Visual Hierarchy — The 4 Levels
1. **Level 1 (instant)**: KPI values, status badges, alert counts — max size, max contrast
2. **Level 2 (fast)**: Card titles, table headers, nav labels — medium size, secondary color
3. **Level 3 (scan)**: Table cell data, chart labels — small, tertiary color
4. **Level 4 (detail)**: Metadata, IDs, timestamps — smallest, muted

### Typography Scale for Dashboards
- KPI value: `text-3xl font-bold text-[#0f172a]` — Level 1
- Card title: `text-xs font-semibold uppercase tracking-wider text-[#94a3b8]` — Level 2
- Table header: `text-xs font-semibold uppercase tracking-wide text-[#94a3b8]` — Level 2
- Body / cell: `text-sm text-[#0f172a]` or `text-[#64748b]` — Level 3
- ID / timestamp: `text-xs font-mono text-[#94a3b8]` — Level 4

### Pre-attentive Color Semantics (NON-NEGOTIABLE)
- `#ef4444` (red): Error, rejected, danger
- `#f97316` (orange): Pending, warning, needs action
- `#10b981` (green): Approved, success, healthy
- `#2563eb` (blue): Primary action, selected, active nav
- `#8b5cf6` (purple): Neutral metric, rate, percentage
- `#94a3b8` (gray): Disabled, inactive, secondary

### Data-Ink Ratio (Tufte)
Remove all chart elements that don't carry information:
- No chart border boxes
- CartesianGrid: `stroke="#f1f5f9"` (barely visible)
- Axis lines: `axisLine={false}`
- Tick lines: `tickLine={false}`
- Only show what the user needs to compare

---

## Dashboard Design Principles

### The 5-Second Orientation Test
Open dashboard → user must know in 5 seconds:
1. How many items need action (pending count — bold, orange)
2. Overall system health (approval rate — gauge)
3. Where to go next (highlighted nav item with badge)

### Above-the-Fold Imperative
Target viewport: 1366×768. Content above fold must include:
- 4 KPI cards (complete status picture)
- At least one chart (trend context)

### The 3-Click Rule
Any task must be completable in ≤ 3 clicks:
- Approve an entry: Dashboard → Approvals (1 click nav) → Approve button (2nd click)
- Find a specific entry: Entries (1 click) → Search/filter (2nd click) → Found
- View reports: Reports (1 click) → chart visible immediately

### Contextual Action Proximity
Actions must appear where the user's attention already is:
- Approve/Reject: IN the table row, not in a separate panel
- Filter: AT the top of the list it filters, not in a sidebar
- Entry details: Expandable row or slide-over panel, not navigation away

### Skeleton Loading over Spinners
Skeleton screens reduce perceived wait time by 15–20%.
Pattern: `animate-pulse bg-gradient-to-r from-[#f1f5f9] via-white to-[#f1f5f9] bg-[length:400%_100%]`

---

## CSS Interaction Patterns Library

### Card Hover Lift
```css
.card-interactive {
  transition: box-shadow 150ms ease, transform 150ms ease;
}
.card-interactive:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}
```
Tailwind: `transition-all duration-150 hover:shadow-lg hover:-translate-y-px`

### Button Press Feel
```css
button:active { transform: scale(0.97); }
```
Tailwind: `active:scale-[0.97] transition-transform duration-75`

### Row Fade-Out (Approve/Reject)
```css
.row-exit {
  transition: opacity 300ms ease-out, transform 300ms ease-out, max-height 400ms ease-out;
  opacity: 0;
  transform: translateX(16px);
  max-height: 0;
}
```

### Sidebar Active Indicator
```css
.nav-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px; bottom: 4px;
  width: 3px;
  background: #2563eb;
  border-radius: 0 3px 3px 0;
}
```
Tailwind: `relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-[#2563eb] before:rounded-r`

### Animated Counter (React)
```tsx
useEffect(() => {
  const start = 0, end = value, duration = 800;
  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    setDisplayValue(Math.round(start + (end - start) * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  let startTime: number;
  requestAnimationFrame(step);
}, [value]);
```

### Focus Ring (Accessible)
```css
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## Application Audit Checklist

Before submitting any component redesign:
- [ ] Every interactive element has visible hover state (< 200ms transition)
- [ ] Primary action is visually dominant (one per section, blue)
- [ ] Status conveyed by color AND text/icon (not color alone)
- [ ] Tab navigation works on all interactive elements
- [ ] Empty states are designed (icon + message + action)
- [ ] Numbers use animated counter on first mount
- [ ] Loading states use skeleton, not spinner
- [ ] Text contrast ≥ 4.5:1 against background (WCAG AA)
- [ ] No more than 4 items in primary action tier visible at once
- [ ] All transitions respect prefers-reduced-motion
