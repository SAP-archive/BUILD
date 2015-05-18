@userRes
Feature: Review Study

    @flow
    Scenario: Return the Studies Page
        Given I am in the prototype page
        When  I click into User Research
        Then  Create New Study button is displayed

    ##########  Draft Studies  ##########

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
        Then    I see Images with Question Ticks
        And     I see "4" Images with Question Ticks

    @flow
    Scenario: Delete Question from Draft Study Screen
        Given   I am in a Draft Study
        When    I click Delete last tile
        And     Confirm Delete of Question
        Then    I see "3" Images with Question Ticks

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

