@userRes
Feature: Review Study Participant Overview Page

        Scenario: Return the Studies Page
        Given I am in the prototype page
        When  I click into User Research
        Then  Create New Study button is displayed

        Scenario: Click into Acitve Studies
        Given   I am on the study edit page
        When    I click Active study list
        Then    Study name should be "Test Study"

        Scenario:   Review Study Page Is accessible
        Given   I am on the study edit page
        When    I Click the Study Tile
        And     Get Study Review URL
        Then    I am in Study Review Page
        And     All Review Page Icons and Stats are present

        Scenario: 	Navigate to Participant List
        Given 	I am in Study Review Page
        When 	I go to the participant link in the menu
        Then 	I am on the Participant Page

        Scenario: 	Check if Data is present
        Given 	I am on the Participant Page
        When 	There should be "3" Participants
        Then 	The Study has been Participated in

        Scenario: 	Check feedback is present
        Given 	I am on the Participant Page
        When 	I see "9" Annotations in Participants
        And     I see the "1" Tasks Completed Average in Participants
        And     I see the "5" Answers in Participants
        Then 	I see the "9" Questions in Participants


    Scenario: 	Navigate to Participant Invitation Page
        Given 	I am on the Participant Page
        When 	I go to the participant invitation link in the menu
        Then 	I am on the Participant Invitation Page
#####
    Scenario: Input an email to invite
        Given I am on the participant invitation menu page
        When I click email invitation textbox
        And I enter the email "tester@test.com" and click add
        Then Email is added to pending list

    Scenario: Delete email from pending list
        Given I am on the participant invitation menu page
        When I press delete button beside email
        Then Email should be deleted

    Scenario: Input an email to invite
        Given I am on the participant invitation menu page
        When I click email invitation textbox
        And Enter the email "tester@test"
        Then Email error toast should display

    Scenario: Input an email to invite
        Given I am on the participant invitation menu page
        When Refresh Page for Textbox
        And Enter the email "tester@"
        Then Email error toast should display
        And     Reset Page to Projects Page
