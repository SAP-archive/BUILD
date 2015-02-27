@norman
Feature: Projects

    @flow
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I enter valid signup details
        Then I am logged in

    @flow
    @createUser
    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
        Then I am logged in

    @flow
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When I click Project in Nav Bar
        And  I click New Project
        And  I enter Project Name
        Then The project is created

    @flow
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page
