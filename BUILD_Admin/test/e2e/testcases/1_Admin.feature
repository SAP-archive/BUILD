@admin
Feature: Admin

  @flow
  Scenario: Login with Valid Credentials in the Admin
    Given I am on the admin login page
    When I enter admin credentials
    Then I am logged in in the Admin

  @flow
  Scenario: I'm logged in and I click on UI Catalog button
    Given I am in the Admin
    When I open UI Catalog
    Then UICatalog is displayed


