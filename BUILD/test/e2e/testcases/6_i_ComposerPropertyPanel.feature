@composers
Feature: Composer - test Button Control Property Panel

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
        When I click on thumbnail of page "Page 1"
        Then I am in ui composer canvas view
        And There are "3" pages
        And I am on page "1"

    @composerNB
    Scenario: User drags and drops Button control Properties
        Given I am in ui composer canvas view
        When I drag and drop a control of type "Button" onto the canvas
        Then The property toggle field "Enabled" is active in "PROPERTIES" section
        And The value of property input field "Text" is "Button" in "PROPERTIES" section
        And The "Type" DDLB has "Default" value selected under "PROPERTIES" section
        And The "Interaction" DDLB has "On Click" value selected under "ACTIONS" section
        And The "Action" DDLB has "None" value selected under "ACTIONS" section

    @composerNB
    Scenario: User drags and drops Button control Properties
        Given I am in ui composer canvas view
        When I click on the Show More Property icon
        Then The property panel displays more properties
        And The value of property input field "Icon" is "" in "PROPERTIES" section
        And The property toggle field "Show Icon First" is inactive in "PROPERTIES" section
        And The value of property input field "Width" is "auto" in "PROPERTIES" section

    @composerNB
    Scenario: User toggle Enabled in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I click on the property toggle field "Enabled" in "PROPERTIES" section
        Then The property toggle field "Enabled" is inactive in "PROPERTIES" section

    @composerNB
    Scenario: User change Text field value in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I type "Go Back" into the property input field "Text" in "PROPERTIES" section
        Then The value of property input field "Text" is "Go Back" in "PROPERTIES" section

    @composerNB
    Scenario: User change Type field value in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I display the select options for the property "Type" DDLB under "PROPERTIES" section
        And I select option "Back" in the property "Type" DDLB under "PROPERTIES" section
        Then The "Type" DDLB has "Back" value selected under "PROPERTIES" section

    @composerNB
    Scenario: User change Icon field value in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I type "sap-icon://hint" into the property input field "Icon" in "PROPERTIES" section
        Then The value of property input field "Icon" is "sap-icon://hint" in "PROPERTIES" section

    @composerNB
    Scenario: User toggle Advance Properties Show Icon First in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I click on the property toggle field "Show Icon First" in "PROPERTIES" section
        Then The property toggle field "Show Icon First" is active in "PROPERTIES" section

#    @composerNB
#    Scenario: User change Icon field value in button properties
#        Given I am in ui composer canvas view
#        And I am on page "1"
#        When I clear the default value of input field "Width" in "PROPERTIES" section
#        And I type "200px" into the property input field "Width" in "PROPERTIES" section
#        Then The value of property input field "Width" is "200px" in "PROPERTIES" section

    @composerNB
    Scenario: User change Action field value in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I display the select options for the property "Action" DDLB under "ACTIONS" section
        And I select option "Navigate To" in the property "Action" DDLB under "ACTIONS" section
        Then The "Action" DDLB has "Navigate To" value selected under "ACTIONS" section
        And  The "Page" DDLB has "Page 2" value selected under "ACTIONS" section

    @composerNB
    Scenario: User change Page field value in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I display the select options for the property "Page" DDLB under "ACTIONS" section
        And I select option "Page 2" in the property "Page" DDLB under "ACTIONS" section
        Then The "Page" DDLB has "Page 2" value selected under "ACTIONS" section

    @composerNB
    Scenario: User change Action field value in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I display the select options for the property "Action" DDLB under "ACTIONS" section
        And I select option "Show Alert" in the property "Action" DDLB under "ACTIONS" section
        And I type "Watch out" into the property input field "Text" in "ACTIONS" section
        Then The "Action" DDLB has "Show Alert" value selected under "ACTIONS" section
        And The value of property input field "Text" is "Watch out" in "ACTIONS" section

    @composerNB
    Scenario: User click see less to close Advance Properties in button properties
        Given I am in ui composer canvas view
        And I am on page "1"
        When I click on the Show Less Property icon
        Then The property panel displays less properties

