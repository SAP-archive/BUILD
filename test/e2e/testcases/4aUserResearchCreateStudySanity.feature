@userRes
Feature: User Research Create Active Study

    @flow
    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
        Then I am logged in

    @flow
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    @flow
    Scenario: User clicks on User Research.
        Given I am in the prototype page
        And   I save the Project URL
        When  I click into User Research
        Then  Create New Study button is displayed

    @flow
    Scenario: Create New Study.
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName and StudyDescription in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    @flow
    Scenario: Upload files through upload link
        Given I am on the study edit page
        When  I upload a Zip file
        And   I Name the Task "Task Test" and Confirm
        When  I Upload images
        And   I Confirm Upload of Images
        Then  selected Images "5" should displayed on the page

    @flow
    Scenario: Associating questions to first image
        Given I am on the study edit page
        When  I click on an image
        And   the image enlarges
        Then  I should be able to enter question

    @flow
    Scenario: Setup Task
        Given There is a task present
        When  I set Start and Target Pages
        And   I Give some user Guidance "This is what the task is about"
        Then   Click Save and Next


    @flow
    Scenario: Add Question to Images
        Given   The Question Popover is Open
        When    I enter a question "Who am I?" Annotation Only
        And     Click Save and Next
        And     I enter a question "What am I?" Free Text Only
        And     Click Save and Next
        And     I enter a question "Where am I?" Multiple Choice Only 2 options
        And     Click Save and Next
        And     I enter a question "When am I?" Multiple Choice More than 2 options
        And     Click Save and Close
        Then    Questions are saved

    @flow
    Scenario: Publishing Study
        Given   I am on the study edit page
        When    I click on publish button
        And     I click on the confirm button
        Then    The study is published

    @flow
    Scenario: Get the Study Address
        Given   I am on the Published Study Page
        When    I save the Study URL
        When    Click Done
        Then    The Study is Active
