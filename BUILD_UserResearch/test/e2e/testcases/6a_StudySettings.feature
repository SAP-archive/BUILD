@userRes
Feature: Study Settings, Pause, Archive and Restart a Study

    Scenario: Return the Studies Page
        Then  Reset Page to Projects Page
        Given I am in the prototype page
        When  I click into User Research
        Then  Create New Study button is displayed

    #   ##########  Pause Studies  ##########

    Scenario: Go to Settings And Pause Study:
        Given I am Study Menu Page
        When  I go to the settings link in the menu
        And   I Pause the study
        And   I click Research in Nav Bar
        Then  the study is paused


#   ##########  Archive Studies  ##########

    Scenario: Go to Settings And Archive Study:
        Given I am Study Menu Page
        And   I go to the settings link in the menu
        And   I Archive the study
        And   I click Research in Nav Bar
        And   I click archive study list
        Then  Study name should be "Test Study"

   ##########  Restart Studies  ##########

    Scenario: Go to Settings And Restart Archived Study:
        Given I am Study Menu Page
        And   I go to the settings link in the menu
        And   I Restart Archived the study
        And   I click Research in Nav Bar
        Then  Study name should be "Test Study"
        And   I see the Link Icon
        And   I have the Projects URL
        And   Reset Page to Projects Page
