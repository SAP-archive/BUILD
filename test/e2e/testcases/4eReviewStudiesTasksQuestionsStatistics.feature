@userRes @review
Feature: Review Study Tasks & Questions Detailed Statistics

    @flow
    Scenario: Click into Question/Task 1
        Given   I am in Study Review Page
        When    I click into the 1st Question
        Then    I am in the Question

    @flow
    Scenario: Review Task Overview for Prototype Task 1
        Given  I am in Question Review Page
        Then   Stats Target Reached equals "2" with percentage "66.67%"
        Then   Stats Not Target Reached equals "1" with percentage "33.33%"
        Then   Proto Page "1" Participants Count equals "3"
        Then   Proto Page "1" Annotations Count equals "6"
        Then   Proto Page "1" Comments Count equals "6"
        Then   Proto Page "1" Task Status Count equals "2"
        Then   Proto Page "1" Task "Positive" Sentiment "2" with percentage "33%"
        Then   Proto Page "1" Task "Nuetral" Sentiment "2" with percentage "33%"
        Then   Proto Page "1" Task "Negative" Sentiment "2" with percentage "33%"
        Then   Proto Page "2" Participants Count equals "3"
        Then   Proto Page "2" Annotations Count equals "3"
        Then   Proto Page "2" Comments Count equals "3"
        Then   Proto Page "2" Task Status Count equals "1"
        Then   Proto Page "2" Task "Positive" Sentiment "1" with percentage "33%"
        Then   Proto Page "2" Task "Nuetral" Sentiment "1" with percentage "33%"
        Then   Proto Page "2" Task "Negative" Sentiment "1" with percentage "33%"

    @flow
    Scenario: Review Prototype Page, Heatmap Annotations for Prototype Task 1
        Given  I am in Question Review Page
        When   I click on the Protoype Tab
        And    I enable annotations
        Then   I see "6" Annotations

    @flow
    Scenario: Review Page Flow for Prototype Task
        Given  I am in Question Review Page
        When   I click on the Page Flow Tab
        Then   I can see the Page Flow
        Then   I see "3" nodes

    @flow
    Scenario: Review Statistics for Prototype Task
        Given  I am in Question Review Page
        When   I click on the Statistics Tab
        Then   I see the Statstics Page Paricipants count is "3"
        Then   I see the Statstics Page Annotation count is "9"
        Then   I see the Statstics Page Comment count is "9"
        Then   I see the Task Statstics Page Avg Visted is "2"
        Then   I see the Task Statstics Task Target Reached equals "2" with percentage "66.67%"
        Then   I see the Task Statstics Task Target Not Reached equals "1" with percentage "33.33%"
        Then   I see the "Task" Statstics Task Annotation "Positive" Sentiment "3" with percentage "33.33%"
        Then   I see the "Task" Statstics Task Annotation "Nuetral" Sentiment "3" with percentage "33.33%"
        Then   I see the "Task" Statstics Task Annotation "Negative" Sentiment "3" with percentage "33.33%"

    @flow
    Scenario: Review Question 2 Overview
        Given   I am in Question Review Page
        When    I click Next
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
    Scenario: Review Question 2 Statistics
        Given   I am in Question Review Page
        When    I click on the Statistics Tab
        Then    I see the Statstics Page Paricipants count is "3"
        Then    I see the Statstics Page Annotation count is "9"
        Then    I see the Statstics Page Comment count is "9"
        Then    I see the "Question" Statstics Task Annotation "Positive" Sentiment "3" with percentage "33.33%"
        Then    I see the "Question" Statstics Task Annotation "Nuetral" Sentiment "3" with percentage "33.33%"
        Then    I see the "Question" Statstics Task Annotation "Negative" Sentiment "3" with percentage "33.33%"

    @flow
    Scenario: Review Question 3 Overview
        Given   I am in Question Review Page
        When    I click Next
        Then    I see "3" Annotations

    @flow
    Scenario: Review Question 3 Statistics
        Given   I am in Question Review Page
        When    I click on the Statistics Tab
        Then    I see the Statstics Page Paricipants count is "3"
        Then    I see the Statstics Page Annotation count is "3"
        Then    I see the Statstics Page Comment count is "3"

    @flow
    Scenario: Review Question 4 Overview
        Given   I am in Question Review Page
        When    I click Next
        Then    Prgress bar is visibile
        And     The "1" Progress Bar is "2 (67%)"
        And     The "2" Progress Bar is "1 (33%)"
        And     I see "3" Annotations

    @flow
    Scenario: Review Question 4 Statistics
        Given   I am in Question Review Page
        When    I click on the Statistics Tab
        Then    I see the Statstics Page Paricipants count is "3"
        Then    I see the Statstics Page Annotation count is "3"
        Then    I see the Statstics Page Comment count is "3"

    @flow
    Scenario: Review Question 5 Overview
        Given   I am in Question Review Page
        When    I click Next
        Then    Prgress bar is visibile
        And     The "1" Progress Bar is "2 (40%)"
        And     The "2" Progress Bar is "1 (20%)"
        And     The "3" Progress Bar is "2 (40%)"
        And     I see "3" Annotations

    @flow
    Scenario: Review Question 5 Statistics
        Given   I am in Question Review Page
        When    I click on the Statistics Tab
        Then    I see the Statstics Page Paricipants count is "3"
        Then    I see the Statstics Page Annotation count is "3"
        Then    I see the Statstics Page Comment count is "3"
        And     I end my Review
        And     Reset Page to Projects Page
