## 2024-05-24 - Accessibility IDs and Repo Constraints

**Learning:** When adding accessibility attributes like `aria-labelledby`, avoid hardcoded string IDs. They can cause duplicate ID errors if the component is rendered multiple times.
**Action:** Always use `React.useId()` to generate unique, safe IDs for accessibility references.

**Learning:** This repository uses `package-lock.json` but seems to lack `node_modules` in the environment initially. It also has conflicting instructions about package managers (`pnpm` vs `bun`).
**Action:** Use `bun` for speed but be extremely careful not to commit generated `bun.lock` files if `package-lock.json` is the authority. Always clean up environment-specific artifacts before submitting.
