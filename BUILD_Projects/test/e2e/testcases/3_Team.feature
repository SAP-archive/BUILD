@projects
Feature: Team

    @smoke
    Scenario: Invite User To A Project
        Given: I Am In A Project
        When I click Add People
        And I Add A New Team Member
        And I Send an Invite
        Then Team Invite is Sent

    @smoke
    Scenario: Accept Team Invite
        Given I am on the login page
        When I login using Invitee Credentails
        Given I am on the Landing Page
        When I Click on New Project Invite
        And I Accept the New Invite
        Then I am Collaborating on the Project
