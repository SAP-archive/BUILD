@projects
Feature: Projects

    @flow
    Scenario: Login with Valid Credentials
        Given I am on the login page
        When I enter valid credentials
        Then I am logged in

    @flow
    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When I click Project in Nav Bar
        And  I click New Project
        And  I enter Project Name
        Then The project is created

    @flow
    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    @flow
    Scenario: Invite User To A Project
        Given: I Am In A Project
        When I click Team in Nav Bar
        And I am in the Team Page
        And I click Add People
        And I Add A New Team Member
        And I Send an Invite
        Then Team Invite is Sent
        And I Logout

    @flow
    Scenario: Accept Team Invite
        Given I am logged out
        When I login using Invitee Credentails
        And I click Project in Nav Bar
        And I Accept the Invite
       Then I am Collaborating on the Project
