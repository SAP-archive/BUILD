@composer
Feature: Composer


    @bk
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I signup with random credentials
        Then I am logged in

    @bk
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project Link
        And  I enter Project Name
        Then The project is created

    @bk
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    @bk
    Scenario: User clicks on thumbnail of page 1
        Given I am on the prototype page
        When I click on thumbnail of page
        Then I am in ui composer canvas view
         And There are "2" pages
         And I am on page "1"
         And Desktop mode is active
         And Edit mode is active

    @bk
    Scenario: User drags and drops Button control
        Given I am in ui composer canvas view
         When I drag and drop a control of type "Button" onto the canvas
         Then A control of type "Button" is on the canvas
          And Show me something


