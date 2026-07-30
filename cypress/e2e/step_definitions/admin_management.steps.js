import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../../pages/LoginPage";
import DashboardPage from "../../pages/DashboardPage";
import AdminPage from "../../pages/AdminPage";

// Tracks the actual (timestamp-suffixed) username generated for each
// fixture index within a scenario, so the later "should appear in the
// list" step searches for the exact username that was created - not the
// raw fixture value.
const generatedUsernames = {};

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
    const baseUser = users[index];
    // Suffix the username with a timestamp so re-running the suite never
    // collides with a username created by a previous run.
    const uniqueUsername = `${baseUser.username}.${Date.now()}`;
    generatedUsernames[index] = uniqueUsername;

    AdminPage.addNewUser({ ...baseUser, username: uniqueUsername });
    AdminPage.verifySuccessToast();
  });
});

Then("the newly created user {string} should appear in the user list", (index) => {
  const username = generatedUsernames[Number(index)];
  AdminPage.searchUser(username);
  AdminPage.verifyUserExists(username);
});
