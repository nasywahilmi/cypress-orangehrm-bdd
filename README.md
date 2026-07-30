# Cypress BDD + POM Automation – OrangeHRM Demo

This repository contains a Cypress automation project using BDD (Cucumber)
and the Page Object Model (POM) for testing the OrangeHRM demo application
at https://opensource-demo.orangehrmlive.com.

Key technologies:
- Cypress (test runner)
- BDD with `@badeball/cypress-cucumber-preprocessor`
- Page Object Model in `cypress/pages/`
- `cypress-mochawesome-reporter` for JSON/HTML reports and screenshots

## Project structure

```
cypress-orangehrm-bdd/
├── cypress/
│   ├── e2e/
│   │   ├── features/
│   │   │   └── admin_management.feature
│   │   └── step_definitions/
│   │       └── admin_management.steps.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   └── AdminPage.js
│   ├── fixtures/
│   │   ├── credentials.json
│   │   └── newUsers.json
│   └── support/
│       └── e2e.js
├── cypress.config.js
├── .cypress-cucumber-preprocessorrc.json
├── package.json
└── README.md
```

## Covered scenarios (high level)

The test suite covers the following flows (tags included):

- Login with valid credentials (`@login @positive`)
- Login with invalid credentials (`@login @negative`)
- Verify Dashboard after login (`@login @positive`)
- Navigate to Admin menu (`@admin @navigation`)
- Add new Admin users (Scenario Outline examples) (`@admin @create`)
- Verify newly created user appears in the user list (`@admin @create`)

Sensitive data (username/password) are stored in fixtures and loaded via
`cy.fixture(...)` (`cypress/fixtures/credentials.json` and `newUsers.json`).

## How to run

1. Install dependencies:

```bash
npm install
```

2. Open Cypress interactive runner:

```bash
npm run cy:open
```

3. Run tests headless and generate a mochawesome report:

```bash
npm run test
```

- `npm run test` uses the `cypress-mochawesome-reporter` to produce JSON
  and HTML reports in `cypress/reports/` and saves screenshots for failed
  steps to `cypress/screenshots/`.

After the test run, open the HTML report at:

```
cypress/reports/index.html
```

## Implementation notes

- POM: UI locators and actions are implemented as classes in
  `cypress/pages/*.js`. Step definitions call page object methods.
- BDD: Feature files use Gherkin syntax and are located in
  `cypress/e2e/features/`.

## Latest test run (local)

This repository's test suite was executed locally (headless) with the
following result (captured from the test run):

- Total tests: 5
- Passed: 3
- Failed: 2
- Screenshots saved: 2 (in `cypress/screenshots/`)
- HTML report: `cypress/reports/index.html`
- Duration: ~56s

## References
- Boilerplate: https://github.com/purrarri/BoilerplateCermatiCypress
- OrangeHRM Demo: https://opensource-demo.orangehrmlive.com
