# 🛠️ Contributing to mern-todo-list

Thank you for helping improve mern-todo-list! This document explains how to report issues, set up the project locally, and submit changes.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Creating an Issue](#creating-an-issue)
- [Setting Up Your Local Environment](#setting-up-your-local-environment)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [PR Template](#pr-template)
- [Issue Template](#issue-template)
- [Thank You](#thank-you)

---

## 🧑‍💻 Code of Conduct

Be respectful and constructive. See `CODE_OF_CONDUCT.md` for full details.

---

## 🚀 How to Contribute

We welcome:

- Bug reports and fixes
- Small features and UX improvements
- Documentation, tests, and examples
- Performance or accessibility improvements

For larger work, open an issue first so maintainers can provide guidance.

---

## 🐛 Creating an Issue

1. Go to the Issues tab.
2. Choose the appropriate template (bug, feature, docs).
3. Provide a clear title, steps to reproduce, expected vs actual behavior, environment, and screenshots/logs if relevant.
4. Wait for review before starting work.

---

## ⚙️ Setting Up Your Local Environment (Windows examples)

1. Fork and clone:

```bash
git clone https://github.com/<YOUR_USERNAME>/mern-todo-list.git
cd mern-todo-list
git remote add upstream https://github.com/debugfest/mern-todo-list.git
```

2. Backend (API):

```bash
cd App/server
npm install
# create App/server/.env with:
# MONGODB_URI='your-mongodb-connection-string'
# PORT=5000
npm run dev
```

Default API: http://localhost:5000/api/todos

3. Frontend (React + Vite):

```bash
cd ../..   # back to repo root
cd App
npm install
npm run dev
```

Vite will print the dev URL (usually http://localhost:5173).

---

## 🌱 Making Changes

1. Create a branch for each change:

```bash
git fetch upstream
git checkout -b feature/short-description
```

2. Keep changes focused and tested:

- Backend: test endpoints (curl/Postman).
- Frontend: run Vite and test UI flows.
- Add/update tests where applicable.

3. Keep your branch up to date:

```bash
git fetch upstream
git rebase upstream/main
```

---

## ✍️ Commit Guidelines

- Use clear, imperative messages.
- Reference issues when applicable.

Examples:

```
feat(api): add pagination to GET /api/todos
fix(ui): preserve input value after submit
docs: add Windows setup steps
chore(deps): upgrade tailwindcss
```

---

## 🚢 Pull Request Process

1. Push your branch:

```bash
git push origin feature/short-description
```

2. Open a PR against the repository's `main` branch.
3. In the PR:

- Reference related issue(s) (e.g., "Closes #123").
- Describe the change and how to test it.
- Add screenshots for UI changes.

4. Respond to review feedback and update the PR.

PR checklist:

- Follows project style
- Tests added/updated if applicable
- No sensitive data (no .env) committed
- Documentation updated if behavior changed

---

## 🧩 PR Template

Include the following in your PR description:

- Summary of changes
- Related issue (Closes #)
- Type of change: bugfix / feature / docs / chore
- How has this been tested (commands or steps)
- Screenshots (if UI)

---

## 🐞 Issue Template

Include these in a new issue:

- Summary: short description
- Steps to reproduce: numbered steps
- Expected behavior vs actual behavior
- Environment: OS, Node/npm versions, browser (if applicable)
- Additional context / logs / screenshots

---

## ❤️ Thank You

Small contributions matter — documentation, examples, and tiny fixes are great first PRs. Thanks for making mern-todo-list better! 🙌
