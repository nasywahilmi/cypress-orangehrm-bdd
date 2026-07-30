import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../../pages/LoginPage";
import DashboardPage from "../../pages/DashboardPage";
import AdminPage from "../../pages/AdminPage";

Given("user is on the login page", () => {
  LoginPage.visit();
});

When("user logs in with valid credentials", () => {
  cy.fixture("credentials").then((creds) => {
    LoginPage.login(creds.validAdmin.username, creds.validAdmin.password);
  });
});

When("user logs in with invalid credentials", () => {
  cy.fixture("credentials").then((creds) => {
    LoginPage.login(creds.invalidUser.username, creds.invalidUser.password);
  });
});

Then("user should see the dashboard page", () => {
  DashboardPage.isDashboardVisible();
});

Then("user should see an error message {string}", (expectedMessage) => {
  LoginPage.getErrorMessage().should("be.visible").and("contain.text", expectedMessage);
});

When("user navigates to the Admin menu", () => {
  DashboardPage.goToAdminMenu();
});

Then("user should see the Admin page", () => {
  AdminPage.isAdminPageVisible();
});

When("user adds a new user with role {string} from fixture index {int}", (role, index) => {
  cy.fixture("newUsers").then((users) => {
    const user = users[index];
    AdminPage.addNewUser(user);
  });
});

Then("the newly created user {string} should appear in the user list", (index) => {
  cy.fixture("newUsers").then((users) => {
    const user = users[Number(index)];
    AdminPage.searchUser(user.username);
    AdminPage.verifyUserExists(user.username);
  });
});
