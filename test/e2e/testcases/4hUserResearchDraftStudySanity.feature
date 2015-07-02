@userRes
Feature: Draft Study Sanity Checks

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

    @flow
    Scenario: Return the Studies Page
        When  I click into User Research
        Then  Create New Study button is displayed

    @flow
    Scenario: Return the Studies Page
        Given I am in User Research
        When  I click Research in Nav Bar
        Then  Create New Study button is displayed

    @flow
    Scenario: Click into Draft Studies
        Given   I am on the study edit page
        When    I click draft study list
        Then    Study name should be "Draft Study"
        When    I click on Study Tile
        Then    I see "4" Images with Question Ticks

    @flow
    Scenario: Delete Question from Draft Study Screen
        Given   I am in a Draft Study
        When    I click Delete last tile
        And     Confirm Delete of Question
        Then     I see "3" Images with Question Ticks

    @flow
    Scenario: Preview the Draft Study
        Given   I am in a Draft Study
        When    I click Preview Icon
        And     Switch to New Tab
        Then    I am in the Preivew Mode

    @flow
    Scenario: Start study
        Given I am on the study screen
        When  I click start study
        Then  I should be taking to the enlarge image of the first screen
        And   Close Tab 2 and reset to Tab 1
