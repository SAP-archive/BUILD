@userRes @review
Feature: Review Study Tasks & Questions

    Scenario: Review Question/Task 1 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "5" Questions
        Then    QuestionTask "1" Participants are "3"
        Then    Task Page visited Avg is "2 pages avg."
        Then    Task Target Reached equals "2" with percentage "66.67%"
        Then    Task Target Not Reached equals "1" with percentage "33.33%"

    Scenario: Review Question/Task 2 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "5" Questions
        Then    QuestionTask "2" Participants are "3"
        Then    QuestionTask "2" Annotations dropped equals "9"
        Then    QuestionTask "2" Comments left equals "9"
        Then    Question Annotation Question "Positive" Sentiment "3" with percentage "33.33%"
        Then    Question Annotation Question "Nuetral" Sentiment "3" with percentage "33.33%"
        Then    Question Annotation Question "Negative" Sentiment "3" with percentage "33.33%"

    Scenario: Review Question/Task 3 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "5" Questions
        Then    QuestionTask "3" Participants are "3"
        Then    QuestionTask "3" Annotations dropped equals "3"
        Then    QuestionTask "3" Comments left  equals "3"

    Scenario: Review Question/Task 4 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "5" Questions
        Then    QuestionTask "4" Participants are "3"
        Then    QuestionTask "4" Annotations dropped equals "3"
        Then    QuestionTask "4" Comments left equals "3"
        Then    2 MultiChoice answers Progress Bar for "This" is equal to "2" and percentage "(67%)"
        Then    2 MultiChoice answers Progress Bar for "That" is equal to "1" and percentage "(33%)"

    Scenario: Review Question/Task 5 on Tasks & Questions Overview
        Given   I am in Study Review Page
        When    I am click the Tasks & Questions link
        Then    I see the "5" Questions
        Then    QuestionTask "5" Participants are "3"
        Then    QuestionTask "5" Annotations dropped equals "3"
        Then    QuestionTask "5" Comments left equals "3"
        Then    3 MultiChoice answers Progress Bar for "This" is equal to "2" and percentage "(40%)"
        Then    3 MultiChoice answers Progress Bar for "That" is equal to "1" and percentage "(20%)"
        Then    3 MultiChoice answers Progress Bar for "Those" is equal to "2" and percentage "(40%)"
