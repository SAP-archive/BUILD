@userRes
Feature: Create Draft Study
As a user, I want to create a study by selecting the Assets

    Scenario: Login as Participant 2
        Given I am on the login page
        When I enter Participant 2 User credentials
        Then I am logged in

    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project
        And  I enter Project Name
        Then The project is created

    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    Scenario: User clicks on User Research.
      When  I click into User Research
      Then  Create New Study button is displayed

    Scenario: Create New Draft Study.
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName "Draft Study" and StudyDescription "This is a draft Study" in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    Scenario: Upload files through upload link
        Given I am on the study edit page
        When  I Upload images
        And   I Confirm Upload of Images
        Then  selected Images "4" should displayed on the page

    Scenario: Associating questions to first image
        Given I am on the study edit page
        When  I click on an image
        And   the image enlarges

    Scenario: Add Question to Image 1
        Given   The Question Popover is Open
        When    I enter a question "Draft Question 1?" Free Text Only
        And     Click Save and Next
        And     I enter a question "Draft Question 2?" Free Text Only
        And     Click Save and Next
        And     I enter a question "Draft Question 3?" Free Text Only
        And     Click Save and Next
        And     I enter a question "Draft Question 4?" Free Text Only
        And     Click Save and Close
        Then    Questions are saved
