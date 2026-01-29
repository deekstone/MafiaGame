# Contributing to Mafia

Contributions are welcome. Whether you want to fix a bug, add a feature, improve docs, or suggest an idea—we're happy to have your help.

---

## Ways to contribute

- **Code** — Open a pull request (bug fixes, features, refactors).
- **Bugs & ideas** — Open an issue to report a bug or propose a feature.
- **Docs** — Improve README files or add missing documentation.

---

## Getting started

1. **Fork and clone** the repo.
2. **Install dependencies** from the repo root:
   ```bash
   pnpm install
   ```
3. **Run the project** to confirm everything works:
   ```bash
   pnpm dev
   ```
   See the main [README](./README.md#how-to-run-the-project) for more run options.

---

## Pull request flow

1. **Branch** from `main` (e.g. `fix/lobby-disconnect`, `feat/new-role`).
2. **Make your changes** and keep the scope focused.
3. **Lint** before submitting:
   ```bash
   pnpm lint
   ```
4. **Open a PR** with a clear title and description of what changed and why.
5. **Respond to feedback** if the maintainers ask for changes.

---

## Code style

- **TypeScript** — The project is fully typed; keep types accurate and avoid `any` where practical.
- **Formatting** — The backend uses Prettier and ESLint; the frontend has its own lint/format setup. Run `pnpm lint` at the root to check both.
- **Structure** — Follow existing patterns in the package you're editing (see [Documentation](./README.md#documentation-readme-files) for per-package READMEs).

---

## Questions?

Open an **issue** for bugs, feature ideas, or general questions. There are no formal rules beyond being respectful and constructive.

Thanks for contributing.
