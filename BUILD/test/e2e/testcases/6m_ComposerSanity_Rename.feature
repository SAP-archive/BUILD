@composer
Feature: Composer - Rename page

    @composerNB
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I signup with random credentials
        Then I am logged in

    @composerNB
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project Link
        And  I enter Project Name
        Then The project is created

    @composerNB
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

###############################################################
#    This section is embedded in the Project e2e test package
#    as the UI Composer Pull Requests are all failing
#
###############################################################

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
    Scenario:Rename a Page
        Given I am in the ui composer canvas view
        When  I Double click to rename a page in the tree view
        And   I enter "new name"
        Then  The page "1" Name in tree view is "new name"
        And   I click on the pagename in the tree view
        And   I click on the pagemapview icon
        And   The page name in pagemapview is verified as "new name"
        And   I click Project in the Menu
        And   I verify the name of the page "1" is changed in projectpage
