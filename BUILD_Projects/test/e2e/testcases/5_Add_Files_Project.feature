@projects
Feature: Files

    @smoke
    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
        Then I am logged in

    @smoke
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When I click to enter the project
        Then I am in the prototype page

    @smoke
    Scenario: Enter the Files Section in Projects
        Given I am in the prototype page
        When I click Files in Nav Bar
        Then I am on the files page


    @smoke
    Scenario: Enter the Files Section in Projects
        Given I am on the files page
        When  I Upload project files
        Then  "4" files are uploaded
