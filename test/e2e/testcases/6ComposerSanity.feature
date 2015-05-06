@composer
Feature: Composer


    @temp
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I signup with random credentials
        Then I am logged in

    @temp
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project Link
        And  I enter Project Name
        Then The project is created

    @temp
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    @temp
    Scenario: User clicks on thumbnail of page 1
        Given I am on the prototype page
        When I click on thumbnail of page
        Then I am in ui composer canvas view
         And There are 2 pages
         And I am on page 1
         And Desktop mode is active
         And Edit mode is active

    @temp1
    Scenario: User clicks on link of page 2
        Given I am in ui composer canvas view
          And Edit mode is active
         When I click on the link for page 2
         Then I am in ui composer canvas view
          And I am on page 2
          And Desktop mode is active
          And Edit mode is active

    @temp1
    Scenario: User clicks on link of page 1
        Given I am in ui composer canvas view
          And I am on page 2
          And Edit mode is active
         When I click on the link for page 1
         Then I am in ui composer canvas view
          And I am on page 1
          And Desktop mode is active
          And Edit mode is active

    @temp1
    Scenario: User clicks on Phone Portrait icon
        Given I am in ui composer canvas view
        When I click on Phone Portrait icon
        Then I am in ui composer canvas view
         And Phone Portrait mode is active

    @temp1
    Scenario: User clicks on Tablet Portrait icon
        Given I am in ui composer canvas view
        When I click on Tablet Portrait icon
        Then I am in ui composer canvas view
         And Tablet Portrait mode is active

    @temp1
    Scenario: User clicks on Desktop icon
        Given I am in ui composer canvas view
        When I click on Desktop icon
        Then I am in ui composer canvas view
         And Desktop mode is active

    @temp1
    Scenario: User clicks on Preview icon
        Given I am in ui composer canvas view
          And Edit mode is active
         When I click on Preview icon
         Then I am in ui composer canvas view
         Then Preview mode is active

    @temp1
    Scenario: User clicks on Edit icon
        Given I am in ui composer canvas view
          And Preview mode is active
         When I click on Edit icon
         Then I am in ui composer canvas view
          And Edit mode is active

    @temp1
    Scenario: User adds a new page
        Given I am in ui composer canvas view
          And There are 2 pages
         When I click on the Add Page link
         Then There are 3 pages
          And I am on page 3

    @temp
    Scenario: User drag and drop Button control
        Given I am in ui composer canvas view
         When I drag and drop a control of type "Button" onto the canvas
          And I drag and drop a control of type "Check Box" onto the canvas
          And I wait for 10000 ms
         Then button control displayed in the canvas

    @temp1
    Scenario: User drag and drop Button control
        Given I am in ui composer canvas view
        When I drag and drop button control to canvas
        Then button control displayed in the canvas

