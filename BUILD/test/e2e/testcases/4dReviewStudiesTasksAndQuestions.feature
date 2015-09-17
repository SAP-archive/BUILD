@userRes @review
Feature: Review Study Tasks & Questions

    @flow
    Scenario: Review Question/Task 1 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "6" Questions
        Then    QuestionTask "1" Participants are "3"
        Then    Task Page visited Avg is "2 pages avg."
        Then    Task "1" Target Reached equals "0" with percentage "0%"
        Then    Task "1" Target Not Reached equals "3" with percentage "100%"
        Then    Task "1" Target Abandoned equals "0" with percentage "0%"

    @flow
    Scenario: Review Question/Task 2 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "6" Questions
        Then    QuestionTask "2" Participants are "3"
        Then    Task Page visited Avg is "2 pages avg."
        Then    Task "2" Target Reached equals "2" with percentage "66.67%"
        Then    Task "2" Target Not Reached equals "0" with percentage "0%"
        Then    Task "2" Target Abandoned equals "1" with percentage "33.33%"

    @flow
    Scenario: Review Question/Task 3 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "6" Questions
        Then    QuestionTask "3" Participants are "3"
        Then    QuestionTask "3" Annotations dropped equals "9"
        Then    QuestionTask "3" Comments left equals "9"
        Then    Question Annotation Question "Positive" Sentiment "3" with percentage "33.33%"
        Then    Question Annotation Question "Nuetral" Sentiment "3" with percentage "33.33%"
        Then    Question Annotation Question "Negative" Sentiment "3" with percentage "33.33%"

    @flow
    Scenario: Review Question/Task 4 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "6" Questions
        Then    QuestionTask "4" Participants are "3"
        Then    QuestionTask "4" Annotations dropped equals "3"
        Then    QuestionTask "4" Comments left  equals "3"

    @flow
    Scenario: Review Question/Task 5 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "6" Questions
        Then    QuestionTask "5" Participants are "3"
        Then    QuestionTask "5" Annotations dropped equals "3"
        Then    QuestionTask "5" Comments left equals "3"
        Then    2 MultiChoice answers Progress Bar for "This" is equal to "2" and percentage "(67%)"
        Then    2 MultiChoice answers Progress Bar for "That" is equal to "1" and percentage "(33%)"

    @flow
    Scenario: Review Question/Task 6 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "6" Questions
        Then    QuestionTask "6" Participants are "3"
        Then    QuestionTask "6" Annotations dropped equals "3"
        Then    QuestionTask "6" Comments left equals "3"
        Then    3 MultiChoice answers Progress Bar for "This" is equal to "2" and percentage "(40%)"
        Then    3 MultiChoice answers Progress Bar for "That" is equal to "1" and percentage "(20%)"
        Then    3 MultiChoice answers Progress Bar for "Those" is equal to "2" and percentage "(40%)"
