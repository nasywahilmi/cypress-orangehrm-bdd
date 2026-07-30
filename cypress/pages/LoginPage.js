class LoginPage {
  elements = {
    usernameInput: () => cy.get('input[name="username"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    loginButton: () => cy.get('button[type="submit"]'),
    errorMessage: () => cy.get('.oxd-alert-content-text'),
  };

  visit() {
    cy.visit("/web/index.php/auth/login");
    return this;
  }

  login(username, password) {
    this.elements.usernameInput().clear().type(username);
    this.elements.passwordInput().clear().type(password);
    this.elements.loginButton().click();
    return this;
  }

  getErrorMessage() {
    return this.elements.errorMessage();
  }
}

export default new LoginPage();
