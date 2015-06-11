#@composer
#Feature: Composer
#
#
#    @flow @composerNB
#    Scenario: Sign Up with Valid Credentials
#        Given I am on the sign up page
#        When I signup with random credentials
#        Then I am logged in
#
#    @flow @composerNB
#    Scenario: Once Logged in you are on the Norman Page
#        Given I am on the Landing Page
#        When  I click New Project Link
#        And  I enter Project Name
#        Then The project is created
#
#    @flow @composerNB
#    Scenario: Once a project is created
#        Given A project exists
#        When I click to enter the project
#        Then I am in the prototype page
#
###############################################################
#    This section is embedded in the Project e2e test package
#    as the UI Composer Pull Requests are all failing
#
###############################################################

#    @flow @composerNB
#    Scenario: Create Prototype Pages as there are none
#        Given I see the View All Map
#        When  I click the View All Map Icon
#        And   Create 2 Blank Prototype Pages
#        Then  There are 2 Pages Created
#        And   I click Project in the Menu
#        And   I am in the prototype page
###############################################################
#   End of New Section
###############################################################

#    @flow @composerNB
#    Scenario: User clicks on thumbnail of page 1
#        Given I am on the prototype page
#        When I click on thumbnail of page
#        Then I am in ui composer canvas view
#        And There are "2" pages
#        And I am on page "1"
#        And Desktop mode is active
#        And Edit mode is active

#    @flow @composerNB
#    Scenario: User drags and drops Button control
#        Given I am in ui composer canvas view
#        When I drag and drop a control of type "Button" onto the canvas
#        Then A control of type "sap_m_Button" is on the canvas

