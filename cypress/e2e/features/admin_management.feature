Feature: OrangeHRM Login and Admin User Management
  As an OrangeHRM administrator
  I want to log in, validate the dashboard, and manage admin users
  So that I can control system access

  Background:
    Given user is on the login page

  @login @positive
  Scenario: User logs in with valid credentials and sees the dashboard
    When user logs in with valid credentials
    Then user should see the dashboard page

  @login @negative
  Scenario: User fails to log in with invalid credentials
    When user logs in with invalid credentials
    Then user should see an error message "Invalid credentials"

  @admin @navigation
  Scenario: User navigates to the Admin menu
    When user logs in with valid credentials
    And user navigates to the Admin menu
    Then user should see the Admin page

  @admin @create
  Scenario Outline: Add a new admin user and validate creation
    When user logs in with valid credentials
    And user navigates to the Admin menu
    And user adds a new user with role "<role>" from fixture index <index>
    Then the newly created user "<index>" should appear in the user list

    Examples:
      | index | role  |
      | 0     | ESS   |
      | 1     | Admin |
