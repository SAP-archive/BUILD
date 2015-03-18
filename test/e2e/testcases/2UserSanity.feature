@user
Feature: User

    @flow
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I enter valid signup details
        Then I am logged in

    @flow
    Scenario: Forgot Password
        Given I am on the login page
        When I Click Forgot Password
        And I Enter my Email
        And Click Reset Password
        Then I see the Reset Password Confirmation Label

    @flow
    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter 2nd User credentials
        Then I am logged in

    @flow
    Scenario: Go to Profile Settings
        Given I am on the Landing Page
        When I click the Avatar Image
        And I click Settings
        Then I am on the profile Page

    @flow
    Scenario: Change the username
        Given I am on the Settings Page
        When I change the name
        And I click Save
        Then The username is changed

    @flow
    Scenario: Change the email
        Given I am on the Settings Page
        When I change the email
        And I click Save
        Then The email is changed

    @flow
    Scenario: Upload a Avatar Picture
        Given I am on the Picture Page
        When I upload a picture
        And I Cilck Select Button
        Then Avatar image is displayed

    @flow
    Scenario: Change Password
        Given I am on the Change Passowrd Page
        When I Change Password
        And I click Save
        Then The Password is changed
