@composer
Feature: Composer


    @temp
    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When I enter valid signup details
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
        Then I am in ui composer page
        Then Desktop mode is active
        Then Edit mode is active

    @temp
    Scenario: User clicks on Phone Portrait icon
        Given I am in ui composer page
        When I click on Phone Portrait icon
        Then I am in ui composer page
        Then Phone Portrait mode is active

    @temp
    Scenario: User clicks on Tablet Portrait icon
        Given I am in ui composer page
        When I click on Tablet Portrait icon
        Then I am in ui composer page
        Then Tablet Portrait mode is active

    @temp
    Scenario: User clicks on Desktop icon
        Given I am in ui composer page
        When I click on Desktop icon
        Then I am in ui composer page
        Then Desktop mode is active

    @temp
    Scenario: User clicks on Preview icon
        Given I am in ui composer page
          And Edit mode is active
        When I click on Preview icon
        Then I am in ui composer page
        Then Preview mode is active

    @temp
    Scenario: User clicks on Edit icon
        Given I am in ui composer page
        And Preview mode is active
        When I click on Edit icon
        Then I am in ui composer page
        Then Edit mode is active

    @temp
    Scenario: User adds a new page
        Given I am on the ui composer page
        When I click on the Add Page link
        Then A new page is created

    @temp
    Scenario: User clicks on something
        Given I am in ui composer page
        When I click on something
        Then I am in ui composer page

    @temp1
    Scenario: User drag and drop Button control
        Given I am on the ui composer page
        When I drag and drop button control to canvas
        Then button control displayed in the canvas


