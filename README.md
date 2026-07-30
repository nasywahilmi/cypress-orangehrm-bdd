# Cypress BDD + POM Automation – OrangeHRM Demo

Automation project for testing the core features of the **OrangeHRM demo
application** (`https://opensource-demo.orangehrmlive.com`), built with:

- **Cypress** as the test runner
- **BDD (Behavior Driven Development)** via `@badeball/cypress-cucumber-preprocessor`
- **POM (Page Object Model)** to separate locators/actions from test logic
- **cypress-mochawesome-reporter** for test result reports + screenshots

## Project Structure

```
cypress-orangehrm-bdd/
├── cypress/
│   ├── e2e/
│   │   ├── features/
│   │   │   └── admin_management.feature      # BDD scenarios (Gherkin)
│   │   └── step_definitions/
│   │       └── admin_management.steps.js     # Step implementations
│   ├── pages/
│   │   ├── LoginPage.js                      # Page Object: Login
│   │   ├── DashboardPage.js                  # Page Object: Dashboard & navigation
│   │   └── AdminPage.js                      # Page Object: Admin - add/verify user
│   ├── fixtures/
│   │   ├── credentials.json                  # Sensitive data (username/password)
│   │   └── newUsers.json                     # New user data to be created
│   └── support/
│       └── e2e.js                            # Global setup + auto screenshot on fail
├── cypress.config.js
├── .cypress-cucumber-preprocessorrc.json
├── package.json
└── README.md
```

## Testing Scope Covered

| # | Test Case | Tag |
|---|-----------|-----|
| 1 | Login with valid credentials | `@login @positive` |
| 2 | Login with invalid credentials (negative case) | `@login @negative` |
| 3 | Validate the Dashboard page is shown after login | `@login @positive` |
| 4 | Navigate to the Admin menu | `@admin @navigation` |
| 5 | Add a new Admin User (2 data sets via `Scenario Outline`) | `@admin @create` |
| 6 | Validate the newly created user appears in the user list | `@admin @create` |

## How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Run tests interactively (Cypress Test Runner)
```bash
npm run cy:open
```
Select **E2E Testing** → browser → then click the `admin_management.feature` file.

### 3. Run tests headlessly (CI/CLI) + generate a report
```bash
npm run test
```

This command will:
- Run every scenario under `cypress/e2e/features/`
- Automatically take a **screenshot** whenever a step fails
  (saved to `cypress/screenshots/`)
- Generate an **HTML report** (mochawesome) at `cypress/reports/html/index.html`

### 4. Open the test report
After `npm run test` finishes, open:
```
cypress/reports/html/index.html
```
in your browser to see the pass/fail summary, duration, and failure
screenshots (if any).

## Implementation Notes

- **POM**: All UI locators & actions live in `cypress/pages/*.js` as classes;
  step definitions only call page object methods (no locators directly in
  step definitions).
- **BDD**: Scenarios are written in Gherkin inside `.feature` files, making
  them readable by non-technical stakeholders (product owner/QA lead), per
  BDD principles.
- Because the employee data on OrangeHRM's public demo server changes
  between sessions/resets, and some employee records get "vandalized" into
  garbage text by other users (the demo server is shared worldwide),
  `AdminPage.fetchExistingEmployeeNames()` fetches a batch (50) of employee
  names from the PIM API and filters them with a regex
  (`/^[A-Za-z\s'.-]{2,30}$/`) so only names that look legitimate are tried.
  `AdminPage.selectFirstEligibleEmployee()` then tries each candidate one by
  one in the form until it finds one that actually produces a suggestion,
  then selects it.

## Run Results

> - Total scenarios: 5
> - Passed: 5
> - Failed: 0
> - Duration: ~45s

## 🔗 References
- Boilerplate: https://github.com/purrarri/BoilerplateCermatiCypress
- OrangeHRM Demo: https://opensource-demo.orangehrmlive.com
