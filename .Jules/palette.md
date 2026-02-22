## 2024-05-22 - Weekly Activity Tracker Accessibility
**Learning:** `TooltipTrigger` wraps its child, but if the child is a non-interactive element like a `div`, it remains unreachable via keyboard navigation.
**Action:** Always ensure `TooltipTrigger` wraps a `button` or an element with `tabIndex={0}` and appropriate ARIA roles. For this app, converting the day indicators to `button` elements with `aria-label` was the semantic fix.
