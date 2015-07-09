@composer
Feature: Composer


    @flow @composerNB
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I signup with random credentials
        Then I am logged in

    @flow @composerNB
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project Link
        And  I enter Project Name
        Then The project is created

    @flow @composerNB
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    @flow @composerNB
    Scenario: Create Prototype Pages as there are none
        Given I see the View All Map
        When  I click the View All Map Icon
        And   I click Add button to add first blank page
        And   Create 2 Blank Prototype Pages
        Then  There are 3 Pages Created
        And   I click Project in the Menu
        And   I am in the prototype page

    @flow @composerNB
    Scenario: User clicks on thumbnail of page 1
        Given I am on the prototype page
        When I click on thumbnail of page "Page 1"
        Then I am in ui composer canvas view
        And There are "3" pages
        And I am on page "1"

    @flow @composerNB
   Scenario: User drags and drops Button control
        Given I am in ui composer canvas view
        When I drag and drop a control of type "Button" onto the canvas
        Then The value of property input field "Text" is "Button"

  @composerNB
    Scenario: User click the publish button
        Given I am in the ui composer canvas view
        When  I click the Publish button
        Then  I click on the publish project
        And   I verify that I see the button
