# Palette's Journal

## 2024-05-22 - Accessibility of Hover-Only Actions
**Learning:** Icon-only buttons that use `opacity-0 group-hover:opacity-100` to reduce visual clutter are completely invisible to keyboard users navigating via Tab. They can receive focus but the user doesn't know where they are.
**Action:** Always add `focus:opacity-100` to any element that uses hover-based visibility toggling to ensure keyboard accessibility.

## 2024-05-22 - Micro-Feedback for Deletions
**Learning:** Immediate deletions without visual feedback (besides the eventual disappearance of the item) can feel jarring or leave the user unsure if the click registered, especially if the API call takes a moment.
**Action:** Implement a local loading state (e.g., `deletingId`) to replace the action icon with a spinner during the async operation.
