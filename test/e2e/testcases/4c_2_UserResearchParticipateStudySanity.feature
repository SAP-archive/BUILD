@userRes
Feature: User 2 Participate in Study
    As a user, I want to participate publish study

    @flow
    Scenario: Login as Participant 2
        Given I am on the login page
        When I enter Participant 1 User credentials
        Then I am logged in

    @flow
    Scenario: I go to Home Page
        Given I am on the Landing Page
       # When I click Home in Nav Bar
        Then I am on the Home page

    @flow
    Scenario: Delete a Project
        Given I am on the Landing Page
        When  I click New Project Button
        And  I click delete project
        Then The project is deleted

    @flow
    Scenario: Once Logged in go to the Study URL
        Given I am on the Landing Page
        And I have the link location
        When I navigate to the Study Url
        Then The start Study Button is available

    @flow
    Scenario: Start study
        Given I am on the study screen
        When  I click start study
        Then  I should see the Start Task PopUp

    @flow
    Scenario: Participate in the Tasks
        Given I am a Task Page to Participate
        When  I click on the Start Task Button
#        And   Click on the Prototype Panel to interact
        And   Leave Feedack for the Page
        And   I finish the Task
        Then  I see the congratulations icon
        And   I enter next screen

    @flow
    Scenario: Dropping annotations first screen.
        Given I am on screen enlarge page
        When  I drop annotations and comment
        And   I see No more floating toast after 3 comments
        Then  I should see "3" annotations
        And   I enter next screen

    @flow
    Scenario: Dropping annotations second screen.
        Given  I am on a study Participant screen enlarge page
        When   I drop annotation no comment or sentiment
        And    I answer on the Free Text Question with "BOOOOO"
        Then   I see the Freetext "BOOOOO"
        And    I should see "1" annotations
        And    I enter next screen

    @flow
    Scenario: Dropping annotations third screen.
        Given I am on a study Participant screen enlarge page
        When  I drop annotation no comment or sentiment
        And   I click Answer That
        Then  I should see "1" annotations
        Then  I enter next screen

    @flow
    Scenario: Dropping annotations last screen.
        Given I am on a study Participant screen enlarge page
        When  I drop annotation no comment or sentiment
        And   I click Answer This
        And   I click Answer That
        Then  I should see "1" annotations

    @flow
    Scenario: Finishing Study and Go Back into the Application
        Given I am on last screen enlarge page
        When  I click done
        Then  I should be taken to stating page
