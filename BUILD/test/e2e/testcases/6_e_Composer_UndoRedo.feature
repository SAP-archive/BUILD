@composer
Feature: Composer - Test Undo and Redo actions


    @composerNB
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I signup with random credentials
        Then I am logged in

    @composerNB
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page for Composer
        When  I click New Project Link
        And  I enter Project Name
        Then The project is created

    @composerNB
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    @composerNB
    Scenario: Create Prototype Pages as there are none
        Given I see the View All Map
        When  I click the View All Map Icon
        And   I click Add button to add first blank page
        And   Create "2" Blank Prototype Pages
        Then  There are "3" Pages Created
        And   I click Project in the Menu
        And   I am in the prototype page

    @composerNB
    Scenario: User clicks on thumbnail of page 1
        Given I am on the prototype page
        When  I click on thumbnail of page "Page 1"
        Then  I am in ui composer canvas view
        And   There are "3" pages
        And   I am on page "1"

   @composerNB
   Scenario: User drags and drops Button control
        Given I am in ui composer canvas view
        When  I drag and drop a control of type "Button" onto the canvas
        Then  The value of property input field "Text" is "Button"

    @composerNB
    Scenario: User undo and then redo the action
        Given A control of type "sap_m_Button" is on the canvas
        When  I click on Undo button
        Then  The control is not on the canvas
        And   I click on Redo button
        Then  A control of type "sap_m_Button" is on the canvas

    @composerNB
    Scenario: User undo and then redo the page deletion
        Given I am in ui composer canvas view
        When  I click on the link for page "2"
        And   I click on the link for page "1"
        Then  I enter delete key from keyboard to delete page
        And   There are "2" pages in tree view
        When  I click on Undo button
        Then  There are "3" pages in tree view
        When  I click on Redo button
        Then  There are "2" pages in tree view
