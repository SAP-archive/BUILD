@userRes
Feature: Create User and Project

    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
        Then I am logged in

    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project
        And  I enter Project Name
        Then The project is created

    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page
