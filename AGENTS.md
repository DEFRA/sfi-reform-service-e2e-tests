# Repository Guidelines

## Project Structure & Module Organization

This repository contains WebdriverIO end-to-end tests for SFI reform service journeys. Test specs live in `test/specs/`, page objects in `test/page-objects/`, and reusable helpers/API clients in `test/utils/`. Root WDIO configs select the execution target: `wdio.conf.js`, `wdio.local.conf.js`, and `wdio.github.conf.js`. Docker and CI support files are in `Dockerfile`, `compose.yml`, `docker/`, `.github/workflows/`, `entrypoint.sh`, and `run-journey-tests/`. Allure report output is generated into `allure-results/` and `allure-report/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies and set up Husky hooks.
- `npm run test`: clean reports, then run WDIO using `wdio.conf.js`.
- `npm run test:local`: run tests against the local `baseUrl` in `wdio.local.conf.js`.
- `npm run test:local:debug`: run local tests with `DEBUG=true`.
- `npm run test:github`: run the GitHub-oriented WDIO config.
- `npm run lint` / `npm run lint:fix`: check or fix ESLint issues.
- `npm run format:check` / `npm run format`: check or apply Prettier formatting.
- `npm run report`: generate a single-file Allure report from `allure-results/`.

## Coding Style & Naming Conventions

Use Node.js `>=20.11.1` and ES modules. Formatting follows `.editorconfig` and Prettier: 2-space indentation, LF endings, no semicolons, single quotes, and no trailing commas. ESLint extends Standard, Prettier, recommended JavaScript rules, and WDIO recommendations. Keep page objects named by page or journey, for example `cw.tasks.page.js`; keep specs descriptive and journey-oriented, for example `single_action_journey.js`.

## Testing Guidelines

Tests use WebdriverIO with the Mocha framework and WDIO globals. Prefer shared page objects and helper modules over duplicating browser/API setup in specs. Run `npm run lint` and the relevant WDIO command before opening a PR. When debugging locally, ensure the target service is running at the `baseUrl` configured in `wdio.local.conf.js`.

## Domain Language

Use `CONTEXT.md` as the source of truth for grant, land action, casework, agreement, and journey-test language. When adding specs, page objects, helpers, or generated docs, prefer the glossary terms there and avoid synonyms that obscure the business flow.

## Developer Addenda

Developers can add their own `AGENTS.local.md` and should be read as an addendum to this file. Keep that file local to your machine and do not commit it.

## Commit & Pull Request Guidelines

Recent history uses short, imperative or descriptive commit subjects, often tied to a feature branch or merge PR, for example `Clear grant version specific state`. Keep commits focused. PRs should explain the journey or environment affected, list the test command run, link any relevant issue, and include report or screenshot evidence when browser behaviour changes.

## Security & Configuration Tips

Use `.env.example` and `docker/config/*.env` as templates; do not commit real secrets or environment-specific credentials. Generated report directories should remain disposable.
