# Contributing to Phoenix Admin UI

Thanks for considering a contribution. This project follows the standard GitHub fork-and-PR flow — nobody, maintainers included, pushes directly to `main`. Everything lands via a reviewed pull request.

## Before you start

- For anything non-trivial (new feature, behavior change, architectural change), open an issue first using the [feature request](.github/ISSUE_TEMPLATE/feature_request.yml) or [question](.github/ISSUE_TEMPLATE/question.yml) template and get alignment before writing code. It saves you from a PR that gets rejected on approach, not implementation.
- For bugs, check [existing issues](https://github.com/Yukthi-Systems/Phoenix-Admin-UI/issues) first, then file one with the [bug report](.github/ISSUE_TEMPLATE/bug_report.yml) template if it's not already tracked.
- Small, focused fixes (typo, obvious bug, one small component) can skip straight to a PR.

## Step-by-step

1. **Fork the repo** — click "Fork" on [github.com/Yukthi-Systems/Phoenix-Admin-UI](https://github.com/Yukthi-Systems/Phoenix-Admin-UI).

2. **Clone your fork:**

   ```bash
   git clone https://github.com/<your-username>/Phoenix-Admin-UI
   cd Phoenix-Admin-UI
   ```

3. **Install dependencies** (Node.js 18+ recommended):

   ```bash
   npm install
   ```

4. **Set up your environment:**

   ```bash
   cp .env.example .env
   # fill in your own API URL / keys
   ```

5. **Create a branch off `main`** — name it by type:

   ```bash
   git checkout -b feat/short-description
   # or fix/..., chore/..., docs/..., refactor/...
   ```

6. **Make your change.** Run the dev server to check it locally:

   ```bash
   npm run dev
   ```

7. **Verify before committing:**

   ```bash
   npm run lint      # ESLint — must be 0 errors
   npm run build     # vite build — must succeed
   npm run format    # Prettier — auto-formats
   ```

8. **Commit using [Conventional Commits](https://www.conventionalcommits.org/)** — matches this repo's existing history:

   ```
   feat: add saved-search filters to the mailbox toolbar
   fix: correct timezone offset in domain migration display
   chore: bump vite to 6.x
   docs: update README setup instructions
   refactor: extract ListEditors into its own component
   ```

9. **Push to your fork and open a PR against `main`:**

   ```bash
   git push -u origin feat/short-description
   ```

   Open the PR on GitHub. Fill out the PR template — description, what changed, how you tested it. Link the issue it resolves (`Closes #123`) if there is one.

10. A maintainer reviews the PR and requests changes if needed. Once approved, a maintainer merges it — contributors should not merge their own PRs.

## Code guidelines

- Match the existing code style — JavaScript, functional components, hooks. `npm run format` handles formatting; don't hand-format.
- Keep PRs scoped to one concern. A bug fix doesn't need a drive-by refactor bundled in — makes review slower and history noisier.
- No unrelated file churn (don't let your editor auto-reformat files you didn't otherwise touch).
- Reuse existing helpers under `src/api/`, `src/utils/`, `src/hooks/` instead of re-declaring shapes or logic.
- Add the GPLv3 file header (see any existing file under `src/`) to new files.

## Getting help

Stuck, or want feedback on an approach before investing time in it? Ask in [Discord](https://discord.gg/29zTxvque) or open a [question issue](.github/ISSUE_TEMPLATE/question.yml).
