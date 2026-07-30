class AdminPage {
  elements = {
    pageTitle: () => cy.get(".oxd-topbar-header-breadcrumb-module"),
    addButton: () => cy.get('.oxd-button').contains("Add"),
    userRoleDropdown: () => cy.get(".oxd-select-text").eq(0),
    employeeNameInput: () => cy.get('input[placeholder="Type for hints..."]'),
    statusDropdown: () => cy.get(".oxd-select-text").eq(1),
    usernameInput: () => cy.get('.oxd-input-group').contains("Username").parent().find("input"),
    passwordInput: () => cy.get('input[type="password"]').eq(0),
    confirmPasswordInput: () => cy.get('input[type="password"]').eq(1),
    saveButton: () => cy.get('button[type="submit"]'),
    searchUsernameInput: () => cy.get('.oxd-input-group').contains("Username").parent().find("input"),
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

  typeEmployeeName(name) {
    // Intercept the employee search API so we know exactly when the
    // response has arrived (avoids racing the autocomplete dropdown).
    cy.intercept("GET", "**/api/v2/pim/employees?**").as("employeeSearch");

    this.elements.employeeNameInput().clear().type(name, { delay: 100 });
    cy.wait("@employeeSearch");

    // The employee typed in the fixture may not exist in this demo
    // instance's seeded data. If no suggestion appears, fall back to a
    // broader single-letter search so we reliably pick *some* existing
    // employee, since the exact name isn't important for this test -
    // only that a valid employee is linked to the new user.
    cy.get("body").then(($body) => {
      if ($body.find(".oxd-autocomplete-dropdown-option").length === 0) {
        cy.log(`No employee found for "${name}", retrying with broader search "a"`);
        this.elements.employeeNameInput().clear().type("a", { delay: 100 });
        cy.wait("@employeeSearch");
      }
    });

    cy.get(".oxd-autocomplete-dropdown-option", { timeout: 10000 })
      .should("have.length.greaterThan", 0)
      .first()
      .click();
    return this;
  }

  selectStatus(status) {
    this.elements.statusDropdown().click();
    this.elements.dropdownOption(status).click();
    return this;
  }

  fillUsername(username) {
    cy.get('.oxd-input-group')
      .contains("Username")
      .parent()
      .find("input")
      .clear()
      .type(username);
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

  addNewUser(user) {
    this.clickAddUser();
    this.selectUserRole(user.userRole);
    this.typeEmployeeName(user.employeeName);
    this.selectStatus(user.status);
    this.fillUsername(user.username);
    this.fillPassword(user.password);
    this.save();
    return this;
  }

  searchUser(username) {
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
