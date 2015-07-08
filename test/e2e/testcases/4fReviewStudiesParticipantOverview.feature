@userRes
Feature: Access and Test new Participant Feature

    @flow
    Scenario: Return the Studies Page
        Given   I am in the prototype page
        When    I click into User Research
        Then    Create New Study button is displayed

    @flow
    Scenario: Click into Acitve Studies
        Given   I am on the study edit page
        When    I click Active study list
        Then    Study name should be "Test Study"

    @flow
    Scenario:   Review Study Page Is accessible
        Given   I am on the study edit page
        When    I Click the Study Tile
        And     Get Study Review URL
        Then    I am in Study Review Page
        And     All Review Page Icons and Stats are present

    @flow
    Scenario: 	Navigate to Participant List
        Given 	I am in Study Review Page
        When 	I go to the participant link in the menu
        Then 	I am on the Participant Page

    @flow
    Scenario: 	Check if Data is present
        Given 	I am on the Participant Page
        When 	There should be "3" Participants
        Then 	The Study has been Participated in

    @flow
    Scenario: 	Check feedback is present
        Given 	I am on the Participant Page
        When 	I see "9" Annotations in Participants
        And     I see the "1" Tasks Completed Average in Participants
        And     I see the "5" Answers in Participants
        Then 	I see the "9" Questions in Participants
        And     Reset Page to Projects Page
