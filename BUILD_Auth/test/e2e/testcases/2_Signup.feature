@signup
Feature: Sign Up

  Background:
    Given I am on the sign up page

  @negative
  Scenario: Sign Up with Blank Credentials
    When I click on log in
    Then I should see a tooltip beside name
    Then I should see a tooltip beside email address
    Then I should see a tooltip beside password
#    Then I should see a tooltip beside Agree with terms and policy   #Removed due to the check agree box being removed from the signup screen

  @negative
  Scenario: Sign Up with Only Name entered
    When I enter a name "FakeTester"
    When I click on log in
    Then I should see a tooltip beside email address
    Then I should see a tooltip beside password
#    Then I should see a tooltip beside Agree with terms and policy   #Removed due to the check agree box being removed from the signup screen

  @smoke
  Scenario: Sign Up with Valid Credentials
    When I enter valid signup details
    Then I am logged in

  @negative
  Scenario: Sign Up with an exiting user
    When I enter valid signup details
    Then I get warning tooltips
    Then I should see a tooltip above the form stating that the email is already registered