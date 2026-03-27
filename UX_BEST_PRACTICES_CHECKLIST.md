# UX Best Practices & Evaluation Checklist

A comprehensive set of checkpoints for evaluating interfaces against industry-standard UX patterns, accessibility guidelines (WCAG 2.2), and WAI-ARIA specifications.

---

## 1. Tree Navigation / Sidebar Navigation

### 1.1 Structure & ARIA Roles

- [ ] **Container uses `role="tree"`** with `aria-label` or `aria-labelledby` to provide an accessible name.
- [ ] **Each node uses `role="treeitem"`** and is contained within the tree or a `role="group"` container.
- [ ] **Child node containers use `role="group"`** to denote parent-child relationships.
- [ ] **Parent (expandable) nodes have `aria-expanded`** set to `true` (open) or `false` (closed).
- [ ] **Selected nodes have `aria-selected="true"`**; unselected nodes have `aria-selected="false"`.
- [ ] **If multi-select, `aria-multiselectable="true"`** is set on the tree container.
- [ ] **If nodes are loaded dynamically**, `aria-level`, `aria-setsize`, and `aria-posinset` are provided on each treeitem (since the full DOM tree is not present).
- [ ] **Focus and selection are treated as distinct states** -- the focused node (`document.activeElement`) and the selected node (`aria-selected="true"`) may differ.

### 1.2 Keyboard Navigation (WAI-ARIA APG Treeview Pattern)

- [ ] **Down Arrow**: Moves focus to the next visible treeitem (does not expand/collapse).
- [ ] **Up Arrow**: Moves focus to the previous visible treeitem (does not expand/collapse).
- [ ] **Right Arrow**: On a closed parent node, opens the node. On an open parent node, moves focus to the first child. On an end node, does nothing.
- [ ] **Left Arrow**: On an open parent node, closes the node. On a child node (closed or end), moves focus to the parent. On a closed root node, does nothing.
- [ ] **Home**: Moves focus to the first visible node in the tree.
- [ ] **End**: Moves focus to the last visible node in the tree.
- [ ] **Enter**: Activates the focused node (performs its default action, e.g., navigation).
- [ ] **Type-ahead / character search**: Typing a character moves focus to the next node whose label starts with that character.
- [ ] **Asterisk (*)** (optional): Expands all sibling nodes at the current level.
- [ ] **Only one treeitem is in the Tab order** at a time (`tabindex="0"` on the focused item, `tabindex="-1"` on all others).
- [ ] **Tab** moves focus into the tree (to the previously focused item) and then out of the tree to the next page element.

### 1.3 Multi-Select Keyboard (if applicable)

- [ ] **Space**: Toggles selection of the focused node.
- [ ] **Shift + Down/Up Arrow**: Moves focus and toggles selection state.
- [ ] **Shift + Space**: Selects contiguous nodes from the most recently selected node to the current.
- [ ] **Ctrl + A** (optional): Selects all nodes.
- [ ] **Ctrl + Down/Up Arrow** (alternative model): Moves focus without changing selection.
- [ ] **Ctrl + Space** (alternative model): Toggles selection of focused node.

### 1.4 Visual Design

- [ ] **Indentation clearly represents hierarchy** -- child nodes are indented from parents (typical: 16-24px per level).
- [ ] **Expand/collapse chevrons** point right (collapsed) and down (expanded); they are visually aligned across nesting levels.
- [ ] **Icons are used consistently** -- either all items have icons or none do. Common pattern: folder icons for parents, document icons for leaves.
- [ ] **Do not double-indicate expandability** -- use either a folder icon or a chevron, not both serving the same purpose.
- [ ] **Active/selected state** is clearly distinguishable with background color, font weight, or left border accent (not color alone -- WCAG 1.4.1).
- [ ] **Hover state** provides visual feedback on interactive items.
- [ ] **Nesting guide lines** (optional): Subtle vertical lines connecting child items to their parent, especially useful for deep hierarchies. Appear on hover or always depending on context.
- [ ] **When a child node is active, all ancestor nodes are expanded** so the active node is always visible.

### 1.5 Focus Indicators (WCAG 2.4.7, 2.4.11, 2.4.13)

- [ ] **Focus indicator is always visible** during keyboard navigation (WCAG 2.4.7 Level AA).
- [ ] **Focus indicator is not obscured** by other content (WCAG 2.4.11 Level AA -- Focus Not Obscured Minimum).
- [ ] **Focus indicator meets minimum area and contrast** -- at least 2px perimeter, 3:1 contrast ratio between focused and unfocused states (WCAG 2.4.13 Level AAA target).

### 1.6 Common Pitfalls

- [ ] **Do not use `role="tree"` for simple site navigation** -- the disclosure navigation pattern (`<details>/<summary>` or buttons with `aria-expanded`) is more appropriate for expandable nav menus. Reserve `role="tree"` for true hierarchical data exploration.
- [ ] **Avoid deeply nested trees (>4-5 levels)** without filtering or search; they become unwieldy.
- [ ] **Do not use `role="menu"` for site navigation** -- menus are for application-style actions, not navigation links.
- [ ] **Test with screen readers** (NVDA, VoiceOver, JAWS) -- ARIA tree support varies across AT combinations.

---

## 2. Table / List Interfaces

### 2.1 Semantic Structure & ARIA

- [ ] **Use native HTML `<table>`, `<thead>`, `<th>`, `<tbody>`, `<tr>`, `<td>`** whenever possible. ARIA roles (`role="table"`, `role="grid"`) are only needed for non-native table elements.
- [ ] **Table has an accessible name** via `<caption>`, `aria-label`, or `aria-labelledby`.
- [ ] **Column headers use `<th scope="col">`** and row headers use `<th scope="row">`.
- [ ] **If the table is interactive** (cell-level editing, cell-level navigation), use `role="grid"` instead of `role="table"`.
- [ ] **Sortable columns use `aria-sort`** on the `<th>`: values `ascending`, `descending`, or `none`.
- [ ] **Sort state changes are announced** via `aria-live` region or by managing focus to the sorted column header.
- [ ] **For dynamic/virtual tables**, `aria-rowcount`, `aria-colcount`, `aria-rowindex`, `aria-colindex` are provided.

### 2.2 Sorting

- [ ] **Default sort order is meaningful** for the data type (e.g., most recent first for time-based data, most relevant first for search results).
- [ ] **Sort controls are discoverable** -- column headers look clickable/tappable with a sort icon (chevron/arrow).
- [ ] **Current sort column and direction are visually indicated** (arrow icon + potentially different header background or text weight).
- [ ] **Clicking a sorted column again toggles direction** (ascending <-> descending). Optionally a third click removes the sort.
- [ ] **Multi-column sort** (optional): Supported via Shift+click or explicit secondary sort UI.

### 2.3 Filtering

- [ ] **Filters are placed near the data they control** -- above the table or inline with column headers.
- [ ] **Active filters are clearly visible** -- chips, badges, or highlighted controls showing what is filtered.
- [ ] **Users can clear individual filters and clear all filters** in one action.
- [ ] **Filter results update promptly** (ideally in real-time for small datasets, or with a clear "Apply" action for complex filters).
- [ ] **Filtered result count is displayed** (e.g., "Showing 12 of 156 items").
- [ ] **Search/filter input is prominent** -- users should locate it within 2 seconds.

### 2.4 Pagination vs. Infinite Scroll

- [ ] **Pagination**: Default to 25-50 rows per page. Provide options (10, 25, 50, 100). Show "Page X of Y" and total item count.
- [ ] **Pagination provides spatial orientation** -- users know where they are in the dataset and can navigate to specific pages.
- [ ] **Infinite scroll**: Only use when chronological browsing is the primary use case (feeds, activity logs). Provide a "scroll to top" affordance.
- [ ] **Infinite scroll must preserve position** on back navigation -- returning from a detail view should restore the user's scroll position.
- [ ] **If using infinite scroll, provide a fallback** -- "Load More" button for users who can't trigger scroll events (accessibility).
- [ ] **Pagination controls are keyboard accessible** and have appropriate ARIA labels (e.g., `aria-label="Go to page 3"`).

### 2.5 Column Design & Data Density

- [ ] **Right-align numeric data** for easy scanning and comparison.
- [ ] **Left-align text data**.
- [ ] **Column widths reflect content** -- avoid excessive whitespace or truncation.
- [ ] **Truncated content** has a tooltip or expandable row to reveal the full value.
- [ ] **Consistent data formatting** within a column (dates, currencies, numbers).
- [ ] **Row height accommodates content** -- at least 40-48px for touch targets (WCAG 2.5.8 Target Size).
- [ ] **Zebra striping or row dividers** improve scanability (use subtle alternating backgrounds, not bold).
- [ ] **Hover highlighting on rows** provides contextual feedback.
- [ ] **Sticky/fixed headers** keep column labels visible when scrolling vertically.

### 2.6 Selection Patterns

- [ ] **Single-select rows**: Clicking a row selects it and navigates to detail (or highlights it). `aria-selected="true"` on the selected row.
- [ ] **Multi-select rows**: Checkbox in the first column. A header checkbox enables "select all" (on current page, not all pages -- clarify scope).
- [ ] **Selected count is displayed** and announced to assistive tech (`role="status"` on the count element).
- [ ] **Batch actions appear** when one or more rows are selected (contextual toolbar above the table).
- [ ] **Shift+click** selects a range of rows.
- [ ] **Selection persists across pagination/sorting** -- or the UI clearly communicates that it does not.

### 2.7 Responsive Behavior

- [ ] **Horizontal scroll with fixed first column**: Keep the identifier/name column locked while other columns scroll.
- [ ] **Column priority pattern**: Hide lower-priority columns on smaller viewports; provide a column toggle or "More" menu.
- [ ] **Card layout transformation**: On mobile, transform table rows into stacked cards for vertical scanning.
- [ ] **Always indicate if horizontal scroll is available** (shadow, fade, scroll indicator).
- [ ] **Touch targets meet minimum size** (44x44 CSS pixels recommended -- WCAG 2.5.5 Level AAA, 24x24 minimum -- WCAG 2.5.8 Level AA).

### 2.8 Empty, Loading, and Error States

#### Empty States
- [ ] **Never show a blank/empty screen** -- always communicate what could be here.
- [ ] **Headline explaining the state** (e.g., "No results found" or "No items yet").
- [ ] **Secondary explanation** with guidance (e.g., "Try adjusting your filters" or "Create your first item").
- [ ] **Clear call-to-action** (CTA button) to resolve the state.
- [ ] **Differentiate between "no data exists" vs. "no results match filters"** -- messaging and CTAs differ.
- [ ] **First-use empty states** guide onboarding with illustrations and instructions.

#### Loading States
- [ ] **Skeleton screens** (preferred) or spinners indicate content is loading.
- [ ] **For operations >1 second**, show a progress indicator (WCAG 2.2.1 -- user must be informed of time-dependent content).
- [ ] **For operations >10 seconds**, show a progress bar with estimated time.
- [ ] **Loading indicator is accessible** -- announced to screen readers via `aria-live="polite"` or `role="status"`.
- [ ] **Avoid layout shift** -- skeleton should match the expected content dimensions.

#### Error States
- [ ] **Error messages are clear and actionable** (what went wrong + how to fix it).
- [ ] **Retry action is provided** for transient errors (network failures).
- [ ] **Error messages are announced** to assistive tech (`role="alert"` or `aria-live="assertive"`).
- [ ] **Partial failures preserve existing data** -- don't wipe the table on a refresh failure.

### 2.9 Table Keyboard Navigation

- [ ] **For static (read-only) tables**: Tab navigates to interactive elements within the table (links, buttons). The table itself does not trap focus.
- [ ] **For interactive grids (`role="grid"`)**: Arrow keys navigate between cells. Enter/F2 enters edit mode in a cell. Escape exits edit mode.
- [ ] **Ctrl+Home / Ctrl+End**: Navigate to first/last cell in the grid.
- [ ] **Page Up / Page Down**: Scroll through multiple rows.
- [ ] **Space**: Selects/deselects the current row (when selection is supported).

---

## 3. Master-Detail / Item Detail Views

### 3.1 Navigation Between List and Detail

- [ ] **Clicking/activating a list item navigates to the detail view** with a clear visual transition.
- [ ] **The URL updates** to reflect the detail view (enabling deep linking, bookmarking, and sharing).
- [ ] **Back navigation** (browser back button, back link/button in UI) returns to the list view.
- [ ] **List scroll position is preserved** when returning from detail view (critical for long lists and infinite scroll).
- [ ] **Filter/sort state is preserved** when returning from detail view.
- [ ] **On wide viewports, consider a split-pane layout** (list on left, detail on right) to avoid full-page transitions.

### 3.2 Breadcrumb Navigation (WAI-ARIA Breadcrumb Pattern)

- [ ] **Breadcrumb container uses `<nav aria-label="Breadcrumb">`** with an `<ol>` for the trail.
- [ ] **Current page/item is indicated** with `aria-current="page"` on the last breadcrumb item.
- [ ] **Separator characters** (e.g., `/` or `>`) are applied via CSS (`::before` or `::after`), not as text, or are wrapped in `aria-hidden="true"`.
- [ ] **Breadcrumbs reflect the information architecture**, not the user's browsing history (location-based, not path-based).
- [ ] **Breadcrumbs are visible without scrolling** -- placed above the main heading, below global navigation.
- [ ] **All breadcrumb items except the current page are links**.
- [ ] **On mobile, show abbreviated breadcrumbs** -- e.g., just the parent level with a back arrow, or the last 1-2 levels with "..." for earlier levels.
- [ ] **Breadcrumbs are consistent across all pages** in the application.

### 3.3 Back Navigation & State Preservation

- [ ] **Browser back button works correctly** -- pressing Back returns to the previous view, not the app's homepage.
- [ ] **Explicit back/up navigation** is provided in the UI (back arrow, "Back to [List]" link) for discoverability.
- [ ] **Back navigation restores scroll position** in the list view.
- [ ] **Back navigation restores filter, sort, and search state** in the list view.
- [ ] **If the user arrived via deep link** (no list view in history), back/up navigation goes to the logical parent view.
- [ ] **Unsaved changes are warned about** before navigating away (if applicable).

### 3.4 Information Hierarchy in Detail Views

- [ ] **Primary identifier** (name, title, ID) is the most prominent element (large heading, top of view).
- [ ] **Status/state** is immediately visible near the heading (badge, chip, or colored indicator).
- [ ] **Content is organized into logical sections** using headings (`<h2>`, `<h3>`, etc.) for scanability and screen reader navigation.
- [ ] **Most important information is above the fold** -- users should not need to scroll to see key details.
- [ ] **Secondary/metadata information** (created date, IDs, audit info) is de-emphasized but accessible.
- [ ] **Actions** (edit, delete, share) are consistently placed (top-right or in a toolbar) and clearly labeled.
- [ ] **Related items** (linked records, sub-items) are in a dedicated section, not mixed with primary details.
- [ ] **Long content sections use progressive disclosure** -- expandable sections, tabs, or "Show more" patterns.

---

## 4. Overall Navigation & Information Architecture

### 4.1 Navigation Model

- [ ] **Navigation structure matches the user's mental model**, not the system's data model.
- [ ] **Primary navigation is persistent and consistent** across all views (sidebar, top bar).
- [ ] **Current location is always indicated** in the navigation (active state on the relevant nav item).
- [ ] **Navigation items are ordered by usage frequency or logical workflow** (most-used items first or grouped by task).
- [ ] **Navigation depth is minimized** -- aim for 3 levels or fewer. If deeper, provide search/filtering.
- [ ] **Hub-and-spoke**: Use when tasks are independent -- a central dashboard links to separate task flows. Appropriate for admin panels, settings.
- [ ] **Hierarchical**: Use when content is nested -- parent > child navigation. Appropriate for file browsers, documentation.
- [ ] **Flat**: Use when items are peers -- tab bar or segmented control. Appropriate for few top-level sections.

### 4.2 URL / Routing (SPA Best Practices)

- [ ] **Every distinct view has a unique URL** -- enables bookmarking, sharing, and browser history.
- [ ] **URLs are human-readable and predictable** (e.g., `/projects/123/tasks` not `/view?id=abc&type=2`).
- [ ] **URL reflects the full navigation state** -- the current entity, view, and optionally filters/sort.
- [ ] **Filter/search state is encoded in URL query parameters** when it should be shareable (e.g., `?status=active&sort=date`).
- [ ] **Browser forward/back buttons work correctly** at all times.
- [ ] **`history.pushState`** is used for navigation (not `replaceState`) so that back button works.
- [ ] **404 / not-found routes are handled** with a helpful error page offering navigation back to known areas.
- [ ] **Route changes trigger focus management** -- focus moves to the main content heading or a skip link target after navigation (critical for screen readers in SPAs).

### 4.3 Focus Management During Navigation (WCAG 2.4.3)

- [ ] **After a route change, focus moves to the main content area** (the `<h1>` or `<main>` element) or to a skip-link target.
- [ ] **Document title (`<title>`) updates on every route change** to reflect the current view (WCAG 2.4.2).
- [ ] **An `aria-live` region or screen reader announcement** communicates the page change (e.g., "Navigated to Project Details").
- [ ] **Focus is not lost** when content is dynamically inserted or removed -- if the focused element is removed, focus is programmatically moved to a logical location.
- [ ] **Skip links** ("Skip to main content") are provided and functional.

### 4.4 Consistent Navigation (WCAG 3.2.3, 3.2.4)

- [ ] **Navigation components appear in the same relative order** on every page (WCAG 3.2.3 Level AA -- Consistent Navigation).
- [ ] **Components with the same functionality are identified consistently** (same labels, same icons) across the application (WCAG 3.2.4 Level AA -- Consistent Identification).
- [ ] **Navigation does not change unexpectedly** -- no auto-navigation on focus or on input without user initiation (WCAG 3.2.1, 3.2.2).

### 4.5 Tab-Based Interfaces

#### Structure & ARIA
- [ ] **Tab container uses `role="tablist"`** with `aria-label` or `aria-labelledby`.
- [ ] **Each tab uses `role="tab"`** with `aria-selected="true"` (active) or `"false"` (inactive).
- [ ] **Each panel uses `role="tabpanel"`** with `aria-labelledby` referencing its associated tab.
- [ ] **Each tab has `aria-controls`** referencing its associated tabpanel.
- [ ] **If tabs are vertically oriented**, `aria-orientation="vertical"` is set on the tablist.
- [ ] **Only the active tab is in the Tab order** (`tabindex="0"`); inactive tabs have `tabindex="-1"`.
- [ ] **If the tabpanel has no focusable content**, the tabpanel itself has `tabindex="0"`.

#### Keyboard Interaction
- [ ] **Left/Right Arrow** (horizontal) or **Up/Down Arrow** (vertical): Move focus between tabs; wrapping from last to first and vice versa.
- [ ] **Space or Enter**: Activates the tab (if not using automatic activation).
- [ ] **Home** (optional): Moves focus to the first tab.
- [ ] **End** (optional): Moves focus to the last tab.
- [ ] **Tab key**: Pressing Tab from within the tablist moves focus into the active tabpanel (not to the next tab).
- [ ] **Automatic activation** (recommended when panel content loads quickly): Tab activates on focus. **Manual activation** (for expensive content): Tab activates on Space/Enter.

#### Design Best Practices
- [ ] **Active tab is clearly distinguishable** -- underline, background color, bold text (not color alone).
- [ ] **Tab labels are short and descriptive** (1-2 words ideally).
- [ ] **Limit to 5-7 tabs** -- if more are needed, consider a different pattern (dropdown, sidebar nav).
- [ ] **Tab order is purposeful** -- most frequently used or logical workflow order.
- [ ] **Avoid nested tabs beyond 2 levels** -- use accordions or other patterns for deeper structure.
- [ ] **Tab content should not force full page reload** -- only the panel content changes.
- [ ] **Horizontal overflow** for many tabs: Provide scroll arrows or a "More" dropdown; do not wrap tabs to a second line.

---

## 5. Session / State Management UX

### 5.1 Filter & Sort State Persistence

- [ ] **Within a session**: Filter/sort state persists when navigating to a detail view and back to the list.
- [ ] **URL query parameters** encode filter/sort state so it can be shared and bookmarked.
- [ ] **"Reset" / "Clear All"** affordance is always visible when filters are active.
- [ ] **Active filter summary** is visible at all times (chips, badge counts, or inline text).
- [ ] **Default state is clearly defined** and restorable -- users can return to "no filters applied."

### 5.2 Tab State Management

- [ ] **Selected tab persists** when navigating away and returning (via URL hash, query param, or session state).
- [ ] **Tab content state is preserved** when switching between tabs (e.g., scroll position, form input within a tab).
- [ ] **Decide on a clear policy**: "unmount on tab switch" vs. "keep alive." If unmounting, clearly set expectations (e.g., clear draft warnings).
- [ ] **URL reflects the active tab** when tab selection is semantically meaningful (e.g., `/project/123#settings`).

### 5.3 Scroll Position Preservation

- [ ] **Scroll position is restored** when using browser back button to return to a list/feed.
- [ ] **For infinite scroll**, previously loaded items are still available (or quickly re-fetched) when returning.
- [ ] **For paginated views**, the same page is shown when returning.

### 5.4 Form & Input State

- [ ] **Unsaved form data is preserved** when navigating away accidentally (browser beforeunload warning, or auto-draft saving).
- [ ] **Search input retains its value** when navigating back to the search view.
- [ ] **In-progress edits are not silently discarded** -- warn users or auto-save.

### 5.5 Session Persistence Across Reloads

- [ ] **Critical user preferences** (theme, language, layout density) are persisted to `localStorage` or server-side.
- [ ] **Transient UI state** (which accordion is open, which panel is expanded) -- decide whether to persist. Generally, do not persist unless it meaningfully improves the experience.
- [ ] **Avoid persisting sensitive data** (tokens, passwords) in `localStorage` -- use `httpOnly` cookies or session storage.
- [ ] **Provide clear "sign out"** that clears session data.
- [ ] **Session expiration is communicated** before the user loses work -- show a warning before timeout, offer session extension.

### 5.6 Multi-Tab Browser Behavior

- [ ] **Multiple browser tabs viewing the same app do not conflict** -- state changes in one tab should not corrupt the other.
- [ ] **If real-time sync is supported**, changes are reflected across tabs (via `BroadcastChannel`, `storage` events, or server push).
- [ ] **Session expiration in one tab** is reflected in all tabs.

---

## Cross-Cutting Accessibility Checklist (WCAG 2.2 Summary)

### Perceivable
- [ ] **1.1.1 Non-text Content (A)**: All non-text content (icons, images) has text alternatives.
- [ ] **1.3.1 Info and Relationships (A)**: Structure and relationships are programmatically determinable (semantic HTML, ARIA roles).
- [ ] **1.3.2 Meaningful Sequence (A)**: DOM order matches visual order.
- [ ] **1.4.1 Use of Color (A)**: Color is not the sole means of conveying information (active states, errors, status).
- [ ] **1.4.3 Contrast Minimum (AA)**: Text contrast ratio of at least 4.5:1 (3:1 for large text).
- [ ] **1.4.11 Non-text Contrast (AA)**: UI components and graphical objects have at least 3:1 contrast ratio.
- [ ] **1.4.13 Content on Hover or Focus (AA)**: Hover/focus-triggered content is dismissible, hoverable, and persistent.

### Operable
- [ ] **2.1.1 Keyboard (A)**: All functionality is operable via keyboard.
- [ ] **2.1.2 No Keyboard Trap (A)**: Focus can be moved away from any component using keyboard.
- [ ] **2.4.1 Bypass Blocks (A)**: Skip navigation links are provided.
- [ ] **2.4.2 Page Titled (A)**: Each page/view has a descriptive `<title>`.
- [ ] **2.4.3 Focus Order (A)**: Focus order is logical and meaningful.
- [ ] **2.4.6 Headings and Labels (AA)**: Headings and labels describe topic or purpose.
- [ ] **2.4.7 Focus Visible (AA)**: Keyboard focus indicator is always visible.
- [ ] **2.4.11 Focus Not Obscured (Minimum) (AA)**: Focused element is at least partially visible.
- [ ] **2.5.5 Target Size (Enhanced) (AAA)** / **2.5.8 Target Size (Minimum) (AA)**: Touch targets are at least 24x24px (AA) or 44x44px (AAA).

### Understandable
- [ ] **3.2.1 On Focus (A)**: No unexpected context change on focus.
- [ ] **3.2.2 On Input (A)**: No unexpected context change on input unless user is advised beforehand.
- [ ] **3.2.3 Consistent Navigation (AA)**: Navigation is in the same relative order across pages.
- [ ] **3.2.4 Consistent Identification (AA)**: Same functionality uses same labels.
- [ ] **3.3.1 Error Identification (A)**: Errors are identified and described in text.
- [ ] **3.3.2 Labels or Instructions (A)**: Input fields have labels or instructions.

### Robust
- [ ] **4.1.2 Name, Role, Value (A)**: All UI components expose their name, role, and value to assistive technology (via native semantics or ARIA).
- [ ] **4.1.3 Status Messages (AA)**: Status messages (success, error, progress) are programmatically determinable via `role="status"`, `role="alert"`, or `aria-live` without receiving focus.

---

## Quick-Reference: ARIA Role Mapping

| UI Pattern | Container Role | Item Role | Key ARIA Attributes |
|---|---|---|---|
| Tree Navigation | `tree` | `treeitem` | `aria-expanded`, `aria-selected`, `aria-level` |
| Static Table | `table` (or native `<table>`) | `row`, `cell` | `aria-sort`, `aria-label` |
| Interactive Table | `grid` | `row`, `gridcell` | `aria-sort`, `aria-selected`, `aria-readonly` |
| Tab Interface | `tablist` | `tab` + `tabpanel` | `aria-selected`, `aria-controls`, `aria-labelledby` |
| Breadcrumb | `navigation` (via `<nav>`) | links in `<ol>` | `aria-label="Breadcrumb"`, `aria-current="page"` |

---

## Sources

### Tree Navigation / Sidebar
- [Tree View Pattern -- W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [Navigation Treeview Example -- W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/)
- [Tree View UX: Best Practices for Accessibility -- NumberAnalytics](https://www.numberanalytics.com/blog/tree-view-ux-best-practices)
- [Guidelines - TreeView -- GitHub Primer](https://primer.style/product/components/tree-view/guidelines/)
- [PatternFly Tree View Design Guidelines](https://www.patternfly.org/components/tree-view/design-guidelines/)
- [Tree view -- Microsoft Fluent 2](https://fluent2.microsoft.design/components/web/react/core/tree/usage)
- [Don't Use ARIA Menu Roles for Site Nav -- Adrian Roselli](https://adrianroselli.com/2017/10/dont-use-aria-menu-roles-for-site-nav.html)
- [Create an accessible tree view widget using ARIA -- Pope Tech](https://blog.pope.tech/2023/07/06/create-an-accessible-tree-view-widget-using-aria/)

### Tables / Data Grids
- [Data Table Design UX Patterns & Best Practices -- Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)
- [Table Pattern -- W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/table/)
- [Grid Pattern -- W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [Data Table Design Best Practices -- UX Design World](https://uxdworld.com/data-table-design-best-practices/)
- [Data Table Pattern -- UX Patterns for Developers](https://uxpatterns.dev/patterns/data-display/table)
- [ARIA Grids & Data Tables -- Accesify](https://www.accesify.io/blog/aria-grids-data-tables-accessibility/)
- [Table multi-select -- Helios Design System (HashiCorp)](https://helios.hashicorp.design/patterns/table-multi-select)
- [Accessible Tables Example -- TheWCAG](https://www.thewcag.com/examples/tables)
- [Responsive Data Tables Solutions -- SitePoint](https://www.sitepoint.com/responsive-data-tables-comprehensive-list-solutions/)
- [Mobile Tables -- Nielsen Norman Group](https://www.nngroup.com/articles/mobile-tables/)

### Master-Detail / Breadcrumbs
- [Breadcrumbs: 11 Design Guidelines -- Nielsen Norman Group](https://www.nngroup.com/articles/breadcrumbs/)
- [Breadcrumbs UX in 2026 -- Eleken](https://www.eleken.co/blog-posts/breadcrumbs-ux)
- [Designing Better Breadcrumbs UX -- Smart Interface Design Patterns](https://smart-interface-design-patterns.com/articles/breadcrumbs-ux/)
- [Designing Effective Breadcrumbs Navigation -- Smashing Magazine](https://www.smashingmagazine.com/2022/04/breadcrumbs-ux-design/)
- [Breadcrumb Pattern -- UX Patterns for Developers](https://uxpatterns.dev/patterns/navigation/breadcrumb)
- [Designing Empty States in Complex Applications -- Nielsen Norman Group](https://www.nngroup.com/articles/empty-state-interface-design/)

### Navigation & Information Architecture
- [SPA Routing and Navigation: Best Practices -- DocsAllOver](https://docsallover.com/blog/ui-ux/spa-routing-and-navigation-best-practices/)
- [Keyboard Navigation & Focus -- WCAG -- Accesify](https://www.accesify.io/blog/keyboard-navigation-focus-wcag/)
- [Understanding Focus Appearance (2.4.13) -- W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Understanding Focus Visible (2.4.7) -- W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [Managing Focus and Visible Focus Indicators -- TPGi](https://www.tpgi.com/managing-focus-and-visible-focus-indicators-practical-accessibility-guidance-for-the-web/)

### Tab Interfaces
- [Tabs Pattern -- W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Tabs, Used Right -- Nielsen Norman Group](https://www.nngroup.com/articles/tabs-used-right/)
- [Tabs UX Best Practices -- Eleken](https://www.eleken.co/blog-posts/tabs-ux)
- [Tabs UI Design: Anatomy, UX, and Use Cases -- SetProduct](https://www.setproduct.com/blog/tabs-ui-design)
- [Tab Design Guide -- Lollypop Design](https://lollypop.design/blog/2025/december/tabs-design/)

### State Management
- [Best Practices for Persisting State in Frontend Applications -- PixelFree Studio](https://blog.pixelfreestudio.com/best-practices-for-persisting-state-in-frontend-applications/)
- [7 Ways to Persist State in Frontend -- Engineering.Pipefy](https://engineering.pipefy.com/2023/03/24/7-ways-to-persist-state-in-frontend/)
- [Empty State UX Examples & Best Practices -- Pencil & Paper](https://www.pencilandpaper.io/articles/empty-states)
- [UI Best Practices for Loading, Error, and Empty States -- LogRocket](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react/)
- [Empty States Pattern -- Carbon Design System](https://carbondesignsystem.com/patterns/empty-states-pattern/)
