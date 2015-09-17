@ProtoStudy
Feature: User Research Create Active Study

    @flow
    Scenario: Login with Valid Credentials
        Given   I am on the login page
        When    I enter valid credentials
        Then    I am logged in

    @flow
    Scenario: Once a project is created
        Given   A project exists
        When    I click to enter the project
        Then    I am in the prototype page

    @flow
    Scenario: Create Prototype Pages as there are none
        Given   I see the View All Map
        And     I save the Project URL
        When    I click the View All Map Icon
        And     I click Add button to add first blank page
        And     Create "1" Blank Prototype Pages
        Then    There are "2" Pages Created
        And     I click Project in the Menu
        And     I am in the prototype page

    @flow
    Scenario: User clicks on thumbnail of page 1
        Given   I am on the prototype page
        When    I click on thumbnail of page "Page 1"
        Then    I am in ui composer canvas view
        And     There are "2" pages
        And     I am on page "1"

    @flow
    Scenario: User drags and drops Button control
        Given   I am in ui composer canvas view
        When    I drag and drop a control of type "Link" onto the canvas
        Then    The value of property input field "Text" is "Linked Text"
        When    I add Page Target to the Link on Canvas
        Then    I am in ui composer canvas view

    @flow
    Scenario: User clicks on create study research  icon
        Given     I am in the ui composer canvas view
        When      I click on Create Research Study icon
        And       I type "Test Study" into the Name field
        And       I click on button Create and Go To Research
        Then      The Study Name is "Test Study"

    @flow
    Scenario: Upload files through upload link
        Given   I am on the study edit page
        When    I upload "../zip/angularPrototype.zip" Zip file
        And     I Name the Task "Task Test" and Confirm
        When    I Upload images
        And     I Confirm Upload of Images
        Then    selected Images "6" should displayed on the page

    @flow
    Scenario: Associating Tasks/Info to Task 1
        Given   I am on the study edit page
        When    I click on tile "1"
        And     the image enlarges
        Then    I should be able to enter question

    @flow
    Scenario: Setup Task 1
        Given   There is a task present
        When    I set Start and Target Pages
        And     I Give some user Guidance "This is the Non Angular Task"
        Then    Click Save and Close
        And     I click on tile "2"

    @flow
    Scenario: Setup Task 2
        Given   There is a task present
        When    I set Start and Target Pages
        And     I Give some user Guidance "This is the Angular Task"
        Then    Click Save and Close
        And     I click on tile "3"

    @flow
    Scenario: Add Question to Images
        Given   The Question Popover is Open
        When    I enter a question "Who am I?" Annotation Only
        Then    Click Save and Close
        And     I click on tile "4"
        And     I enter a question "What am I?" Free Text Only
        Then    Click Save and Close
        And     I click on tile "5"
        And     I enter a question "Where am I?" Multiple Choice Only 2 options
        Then    Click Save and Close
        And     I click on tile "6"
        And     I enter a question "When am I?" Multiple Choice More than 2 options
        And     Click Save and Close

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


