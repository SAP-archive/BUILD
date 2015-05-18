@userRes
Feature: Create Draft Study
    As a user, I want to create a study by selecting the Assets

    @flow
    Scenario: User clicks on User Research.
        When  I click Research in Nav Bar
        Then  Create New Study button is displayed

    @flow
    Scenario: Create New Draft Study.
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName "Draft Study" and StudyDescription "This is a draft Study" in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    @flow
    Scenario: Upload files through upload link
        Given I am on the study edit page
        When  I Upload images
        And   I Confirm Upload of Images
        Then  selected Images "4" should displayed on the page

    @flow
    Scenario: Associating questions to first image
        Given I am on the study edit page
        When  I click on an image
        And   the image enlarges
#        Then  I should be able to enter question

    @flow
    Scenario: Add Question to Images
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
