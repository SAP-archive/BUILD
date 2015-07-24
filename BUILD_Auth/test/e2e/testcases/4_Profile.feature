@profile
Feature: Profile

  @smoke
  Scenario: Login with Profile User
    Given I am on the login page
    When I enter 2nd User credentials
    Then I am logged in

  @smoke
  Scenario: Go to Profile Settings
   Given I am on the Landing Page
   When I click the Avatar Image
   And I click Settings
   Then Profile is opened

  @smoke
  Scenario: Change the username and email
    Given I am on the Settings Page
    When I change the name
    When I change the email
    Then button Save is enabled
    When I click Save

  @smoke
  Scenario:Check that username and email are changed
    Given I am on the Landing Page
    When I click the Avatar Image
    And I click Settings
    Then The username is changed
    Then The email is changed

  @smoke
  Scenario: Upload a Avatar Picture
    Given I am on the Picture Page
    When I upload a picture
    When I Click crop and use link
    Then Avatar image is displayed

  @smoke
   Scenario: Change Password
   Given I am on the Change Password Page
   When I Change Password
   Then button Save is enabled
   When I click Save
   Then The Password is changed