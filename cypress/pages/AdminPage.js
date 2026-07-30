class AdminPage {
  elements = {
    pageTitle: () => cy.get(".oxd-topbar-header-breadcrumb-module"),
    addButton: () => cy.get('.oxd-button').contains("Add"),
    userRoleDropdown: () => cy.get(".oxd-select-text").eq(0),
    employeeNameInput: () => cy.get('input[placeholder="Type for hints..."]'),
    employeeNameFieldError: () =>
      cy.contains(".oxd-label", "Employee Name").parents(".oxd-input-group").find(".oxd-input-field-error-message"),
    successToast: () => cy.contains(".oxd-toast-content", "Successfully Saved", { timeout: 10000 }),
    statusDropdown: () => cy.get(".oxd-select-text").eq(1),
    usernameInput: () =>
      cy.contains(".oxd-label", "Username").parents(".oxd-input-group").find("input"),
    passwordInput: () => cy.get('input[type="password"]').eq(0),
    confirmPasswordInput: () => cy.get('input[type="password"]').eq(1),
    saveButton: () => cy.get('button[type="submit"]'),
    searchUsernameInput: () =>
      cy.contains(".oxd-label", "Username").parents(".oxd-input-group").find("input"),
    searchButton: () => cy.get('button[type="submit"]'),
    userTableRows: () => cy.get(".oxd-table-card"),
    dropdownOption: (text) =>
      cy.get(".oxd-select-dropdown .oxd-select-option").contains(text),
  };

  isAdminPageVisible() {
    this.elements.pageTitle().should("be.visible").and("contain.text", "Admin");
    return this;
  }

  clickAddUser() {
    this.elements.addButton().click();
    return this;
  }

  selectUserRole(role) {
    this.elements.userRoleDropdown().click();
    this.elements.dropdownOption(role).click();
    return this;
  }

  // Fetch employees directly from the API and keep only names that look
  // like real, well-formed names (letters/spaces/apostrophe/hyphen only).
  // The public OrangeHRM demo server is shared worldwide, so some seeded
  // employee records get vandalized into garbage text (e.g. "99N75",
  // random symbols) by other users - filtering these out up front avoids
  // wasting search attempts on names that were never going to work.
  fetchExistingEmployeeNames() {
    const validNamePattern = /^[A-Za-z\s'.-]{2,30}$/;
    return cy
      .request({
        method: "GET",
        url: "/web/index.php/api/v2/pim/employees?limit=50&sortField=employee.firstName&sortOrder=ASC",
      })
      .then((response) => {
        const employees = response.body.data || [];
        const validNames = employees
          .map((emp) => emp.firstName)
          .filter((name) => name && validNamePattern.test(name));

        if (validNames.length === 0) {
          throw new Error(
            "No valid-looking employee names found via the PIM API - cannot proceed with Add User test."
          );
        }
        return validNames;
      });
  }

  // Types a name into the Employee Name field and reports (via the
  // yielded boolean) whether the autocomplete produced any suggestions,
  // instead of failing immediately - so the caller can try the next
  // candidate name if this one turns out not to be selectable.
  trySearchEmployee(name) {
    cy.intercept("GET", "**/api/v2/pim/employees*").as("employeeSearch");

    // Set the value in a SINGLE 'input' trigger instead of typing letter
    // by letter. Typing character-by-character fires one search request
    // per keystroke, which can race: a response for an earlier partial
    // keystroke can arrive AFTER the final one and overwrite the
    // (correct) final result. A single trigger guarantees exactly one
    // search request for the exact term we care about.
    this.elements
      .employeeNameInput()
      .clear()
      .invoke("val", name)
      .trigger("input", { force: true })
      .trigger("keyup", { force: true });

    cy.wait("@employeeSearch");

    return this.pollForDropdownOptions();
  }

  // Polls the DOM up to `maxAttempts` times (with `intervalMs` between
  // each check) for autocomplete suggestions, yielding true as soon as
  // any are found, or false once attempts are exhausted. This is a
  // manual, non-failing alternative to cy's built-in should() retry -
  // we need a boolean result here rather than an assertion that throws.
  pollForDropdownOptions(maxAttempts = 10, intervalMs = 300) {
    const attempt = (remaining) =>
      cy.get("body").then(($body) => {
        // IMPORTANT: the correct OrangeHRM class is
        // ".oxd-autocomplete-option" - NOT ".oxd-autocomplete-dropdown-
        // option". The extra "-dropdown-" was the actual root cause of
        // every earlier "Expected ... but got 0" failure: the dropdown
        // WAS rendering correctly the whole time, we were just querying
        // for a class that never existed.
        const found = $body.find(".oxd-autocomplete-option").length > 0;
        if (found || remaining <= 0) {
          return found;
        }
        cy.wait(intervalMs);
        return attempt(remaining - 1);
      });

    return attempt(maxAttempts);
  }

  // Recursively tries each candidate name until one produces a real
  // autocomplete suggestion, then selects it. Throws only if every
  // candidate in the list fails.
  selectFirstEligibleEmployee(names, index = 0) {
    if (index >= names.length) {
      throw new Error(
        `None of the candidate employees (${names.join(", ")}) were selectable in the Add User form.`
      );
    }

    this.trySearchEmployee(names[index]).then((found) => {
      if (!found) {
        cy.log(`"${names[index]}" produced no suggestions, trying next candidate`);
        this.selectFirstEligibleEmployee(names, index + 1);
        return;
      }

      cy.get(".oxd-autocomplete-option", { timeout: 15000 })
        .should("have.length.greaterThan", 0)
        .first()
        .click();

      // Guard: confirm the field was actually accepted as a valid
      // employee selection (OrangeHRM shows an "Invalid" error if the
      // value wasn't picked from the dropdown properly), and that the
      // value is more than just the raw search term (proving a real
      // suggestion - full name - was picked, not free text).
      this.elements.employeeNameFieldError().should("not.exist");
      this.elements
        .employeeNameInput()
        .invoke("val")
        .should("have.length.greaterThan", 1);
    });

    return this;
  }

  selectStatus(status) {
    this.elements.statusDropdown().click();
    this.elements.dropdownOption(status).click();
    return this;
  }

  fillUsername(username) {
    this.elements.usernameInput().clear().type(username);
    return this;
  }

  fillPassword(password) {
    this.elements.passwordInput().clear().type(password);
    this.elements.confirmPasswordInput().clear().type(password);
    return this;
  }

  save() {
    this.elements.saveButton().click();
    return this;
  }

  verifySuccessToast() {
    this.elements.successToast().should("be.visible");
    return this;
  }

  addNewUser(user) {
    this.clickAddUser();
    this.selectUserRole(user.userRole);

    // Everything that depends on the employee name must be chained
    // inside this .then(), otherwise Cypress would enqueue those
    // commands BEFORE the async cy.request resolves (since cy commands
    // are queued in the order they're invoked, not when they resolve).
    this.fetchExistingEmployeeNames().then((candidateNames) => {
      this.selectFirstEligibleEmployee(candidateNames);
      this.selectStatus(user.status);
      this.fillUsername(user.username);
      this.fillPassword(user.password);
      this.save();
    });

    return this;
  }

  searchUser(username) {
    // After saving a new user, OrangeHRM redirects back to the Admin
    // user list. If we start typing into the search field while that
    // navigation/render is still in progress, Cypress can throw an
    // internal "Cannot read properties of undefined (reading
    // 'KeyboardEvent')" error - so we explicitly wait for the list page
    // (URL + a visible, interactable search input) before doing anything.
    cy.url({ timeout: 15000 }).should("include", "/admin/viewSystemUsers");
    this.elements.searchUsernameInput().should("be.visible");

    this.elements.searchUsernameInput().clear().type(username);
    this.elements.searchButton().click();
    return this;
  }

  verifyUserExists(username) {
    cy.get(".oxd-table-body .oxd-table-row", { timeout: 10000 })
      .should("have.length.at.least", 1)
      .first()
      .should("contain.text", username);
    return this;
  }
}

export default new AdminPage();
