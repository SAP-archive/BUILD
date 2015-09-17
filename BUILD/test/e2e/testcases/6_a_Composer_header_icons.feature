@composer
Feature: Composer - test header icons


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
        Then There are "3" pages
        Then I am on page "1"


     @composerNB
     Scenario: User clicks on Phone Portrait icon
         Given I am in ui composer canvas view
         When I click on Phone Portrait icon
         Then I am in ui composer canvas view
         And Phone Portrait mode is active

    @composerNB
    Scenario: User clicks on Tablet Portrait icon
        Given I am in ui composer canvas view
        When I click on Tablet Portrait icon
        Then I am in ui composer canvas view
        And Tablet Portrait mode is active

    @composerNB
    Scenario: User clicks on Desktop icon
        Given I am in ui composer canvas view
        When I click on Desktop icon
        Then I am in ui composer canvas view
        And Desktop mode is active

    @composerNB
    Scenario: User clicks on Preview icon
        Given I am in ui composer canvas view
        And Edit mode is active
        When I click on Preview icon
        Then ui composer preview screen displayed
        Then Preview mode is active

    @composerNB
    Scenario: User clicks on Edit icon
        Given ui composer preview screen displayed
        And Preview mode is active
        When I click on Edit icon
        Then I am in ui composer canvas view
        And Edit mode is active

    @composerNB
    Scenario: User click ruler icon at canvas
        Given I am in ui composer canvas view
        When I click on ruler icon
        Then There is a X ruler shown
        And  There is a Y ruler shown

    @composerNB
    Scenario: User click snapping icon
        Given I am in ui composer canvas view
        And snapping icon is active
        When I click on snapping icon
        Then snapping icon is not active

    @composerNB
    Scenario: User click on page map icon, it goes to page map page
        Given I am in ui composer canvas view
        When I click page map icon
        Then page map page displayed
        Then I click Project in the Menu
        Then I am in the prototype page
        Then I click on thumbnail of page "Page 1"
        Then I am in ui composer canvas view

    @composerNB
    Scenario: User clicks on grid icon
        Given I am in ui composer canvas view
        When I drag and drop a control of type "Button" onto the canvas
        Then The value of property input field "Text" is "Button"
        And  I click grid icon
        And  I click the canvas
        And  I click grid icon
        And  I click the canvas
        And  I verify they is no red dotted line present around the controll

    @composerNB
    Scenario: User clicks on the left and the right side bars
        Given I am in the ui composer canvas view
        When  I click on the the left side bar icon
        And   Left side bar is not visible
        Then  I click on the the right side bar icon
        And   Right side bar is not visible
        And   I click on the the left side bar icon
        And   Left side bar is visible
        And   I click on the the right side bar icon
        And   Right side bar is visible

    @composerNB
    Scenario:User clicks on the Zoom icon
        Given I am in the ui composer canvas view
        When  I click on the zoom icon
        Then  I click on the full width option
        And   I check the zoom percentage for the full width option
        And   I click on the zoom icon
        And   I click on the fit width option
        And   I compare the zoom percentage value of fit width and full width to verify it
        And   I compare the canvas pixel value of fit width and full width to verify it
        And   I click the plus sign of the slider once inside zoom
        And   I compare the zoom percentage value obtained after clicking the plus sign once against full width and verify it
