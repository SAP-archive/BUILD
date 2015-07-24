@login
Feature: Login

  #  Background allows you to add some context to the scenarios in a single feature.
  #  A Background is much like a scenario containing a number of steps.

  Background:
    Given I am on the login page

  @smoke @integrated
  Scenario: Login with Valid Credentials
    When I enter valid credentials
    Then I am logged in

  @smoke
  Scenario: Forgot Password
    When I Click Forgot Password
    And I Enter my Email
    And Click Reset Password
    Then I see the Reset Password Confirmation Label

  @negative
  Scenario: Login with Valid Email Address and Invalid Password
    When I enter valid email address and invalid password
    Then I should see an error message

  @negative
  Scenario: Login with no Email Address and no Password
        When I click on log in
        Then I get warning tooltips

