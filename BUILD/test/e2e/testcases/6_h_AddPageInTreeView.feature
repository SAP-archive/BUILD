@composer
Feature: Composer - add page in tree view


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

    @composerNB
    Scenario: User adds a page from tree view
        Given  I am in the ui composer canvas view
        When   I add page 4 from the tree view
        Then   There are "4" pages in tree view
        And    I see the View All Map Icon
        And    There are "4" pages in page map view
        And    I click Project in the Menu
        And    I am in the prototype page
        And    There are "5" pages in prototype page
