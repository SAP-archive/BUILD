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
    Scenario: User clicks on thumbnail of page 1
        Given I am on the prototype page
        When I click on thumbnail of page
        Then I am in ui composer canvas view
         And There are "2" pages
         And I am on page "1"
         And Desktop mode is active
         And Edit mode is active

    @flow @composerNB
    Scenario: User drags and drops Button control
        Given I am in ui composer canvas view
         When I drag and drop a control of type "Button" onto the canvas
         Then A control of type "Button" is on the canvas


    @flow @composerNB
    Scenario: User clicks on icon Create Research Study
        Given I am in ui composer canvas view
        When I click on Create Research Study icon
        Then I am on the Create Research Study popup

    @flow @composerNB
    Scenario: User enters name on button Create on popup Create New Research Study
        Given I am in ui composer canvas view
          And I am on the Create Research Study popup
         When I type "UIComposer Test Study" into the Name field
          And I click on button Create and Go To Research
         Then I am on the study edit page
          And The Study Name is "UIComposer Test Study"




