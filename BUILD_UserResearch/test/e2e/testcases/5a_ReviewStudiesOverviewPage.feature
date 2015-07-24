@userRes @review
Feature: Review Study Overview Page

    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
#        When I enter email address: "vizaf@zuk.gov", password: "Password1"
        Then I am logged in
        And  Reset Page to Projects Page

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

    Scenario: Preview the Active Study
        Given   I am on the study edit page
        When    I click Review Study Preview Icon
        And     Switch to New Tab
        Then    I am in the Preivew Mode

    Scenario: Start study
        Given I am on the study screen
        When  I click start study
        Then  I should see the Start Task PopUp

    Scenario: Participate in the Tasks
        Given I am a Task Page to Participate
        When  I click on the Start Task Button
        Then  Close Tab 2 and reset to Tab 1

    Scenario: Review the Totals in the Overview Page:
        Given   I am on the Overview Page
        Then    I check the participant count is "3"
        And     I check the annotation count is "27"
        And     I check the comment count is "27"
        And     I check the "Positive" sentiment is "6 33.33%" answers
        And     I check the "Positive" sentiment percentage is "33.33%"
        And     I check the "Nuetral" sentiment is "6 33.33%" answers
        And     I check the "Nuetral" sentiment percentage is "33.33%"
        And     I check the "Negative" sentiment is "6 33.33%" answers
        And     I check the "Negative" sentiment percentage is "33.33%"
        And     I check complete tasks is "3"
        And     I check task "Success" rate is "2 66.67%"
        And     I check task "Success" percentage is "66.67%"
        And     I check task "Failure" rate is "1 33.33%"
        And     I check task "Failure" percentage is "33.33%"
#        And     Reset Page to Projects Page
