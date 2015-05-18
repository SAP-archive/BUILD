@userRes
Feature: Review Study

    @flow
    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
        Then I am logged in
        And  Reset Page to Projects Page

    @flow
    Scenario: Return the Studies Page
        Given I am in the prototype page
        When  I click into User Research
        Then  Create New Study button is displayed


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
    Scenario: Preview the Active Study
        Given   I am on the study edit page
        When    I click Review Study Preview Icon
        And     Switch to New Tab
        Then    I am in the Preivew Mode

    @flow
    Scenario: Start study
        Given I am on the study screen
        When  I click start study
        Then  I should see the Start Task PopUp

    @flow
    Scenario: Participate in the Tasks
        Given I am a Task Page to Participate
        When  I click on the Start Task Button
        Then  Close Tab 2 and reset to Tab 1

    #########  Active Studies  ##########

    @flow
    Scenario: Review Question 1 on Active Study
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "5" Questions
        When    I click into the 1st Question
        Then    I am in the Question


    @flow
    Scenario: Review Question 1 Stats
        Given  I am in Question Review Page
        When   I click on the Protoype Tab
        And    I enable annotations
        Then   I see "9" Annotations
#        When   I click on the Statistics Tab
#        Then   All Review Page Icons and Stats are present

    @flow
    Scenario: Review Question 2 Stats etc...
        Given   I am in Question Review Page
        Then    I see "9" Annotations
        And     The 1st comment should from Annon User
        When    I click a Sentiment
        Then    I see the laser pointer
        When    I filter Sentinment "Happy"
        Then    The Sentiment Container count is "3"
        When    I filter Sentinment "Sad"
        Then    The Sentiment Container count is "3"
        When    I filter Sentinment "Indifferent"
        Then    The Sentiment Container count is "3"
        When    I filter Sentinment "None"
        Then    The Sentiment Container count is "0"

    @flow
    Scenario: Review Question 3 on Active Study
        Given   I am in Question Review Page
        When    I click Next
        Then    I see "3" Annotations

    @flow
    Scenario: Review Question 4 on Active Study
        Given   I am in Question Review Page
        When    I click Next
        Then    Prgress bar is visibile
        And     The "1" Progress Bar is "2 (67%)"
        And     The "2" Progress Bar is "1 (33%)"
        And     I see "3" Annotations

    @flow
    Scenario: Review Question 5 on Active Study
        Given   I am in Question Review Page
        When    I click Next
        Then    Prgress bar is visibile
        And     The "1" Progress Bar is "2 (40%)"
        And     The "2" Progress Bar is "1 (20%)"
        And     The "3" Progress Bar is "2 (40%)"
        And     I see "3" Annotations
        And     I end my Review

#   ##########  Pause Studies  ##########

    @flow
    Scenario: Go to Settings And Pause Study:
        Given I am Study Menu Page
        When  I go to the settings link in the menu
        And   I Pause the study
        And   I click Research in Nav Bar
        Then  the study is paused


#   ##########  Archive Studies  ##########

    @flow
    Scenario: Go to Settings And Archive Study:
        Given I am Study Menu Page
        And   I go to the settings link in the menu
        And   I Archive the study
        And   I click Research in Nav Bar
        And   I click archive study list
        Then  Study name should be "Test Study"

   ##########  Restart Studies  ##########

    @flow
    Scenario: Go to Settings And Restart Archived Study:
        Given I am Study Menu Page
        And   I go to the settings link in the menu
        And   I Restart Archived the study
        And   I click Research in Nav Bar
        Then  Study name should be "Test Study"
        And   I see the Link Icon
        And   I have the Projects URL
        And   Reset Page to Projects Page
