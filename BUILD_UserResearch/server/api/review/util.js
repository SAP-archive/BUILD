/*eslint no-use-before-define: 0 */
'use strict';

var tp = require('norman-server-tp');
var q = require('norman-promise');
var commonServer = require('norman-common-server');
var _ = tp.lodash;
var serviceLogger = commonServer.logging.createLogger('review-util');
var NormanError = commonServer.NormanError;
var utils = require('../../utils');
var updateSnapShotDeepLinks = utils.updateSnapShotDeepLinks;
var getContextFromUrl = utils.getContextFromUrl;

var registry = commonServer.registry;
var snapshotService;
var studyPrototypeService = require('../studyPrototype/service');

var Study = require('../study/model').getModel();
var Tracking = require('../tracking/model').getModel();

var ANSWER_SEPARATOR = ',';
var HASH_FORWARDSLASH = '#/';
var taskStates = {
    NOT_STARTED: 'not started',
    IN_PROGRESS: 'in progress',
    COMPLETED_CORRECTLY: 'completed correctly',
    COMPLETED_INCORRECTLY: 'completed incorrectly',
    ABORTED: 'aborted'
};
var sentiments = {
    POSITIVE: 1,
    NEGATIVE: 2,
    NEUTRAL: 3
};
/**
 * Wraps an error in a NormanError & log's it using the Sevice Logger
 * before returning
 *
 * @param err
 * @returns NormanError
 */
function logError(err) {
    var error = new NormanError(err);
    serviceLogger.error('logError(), error found ' + err);
    return error;
}

/**
 * Get studyId, study name, total number of Participants, total number annotations,
 * over all sentiment statistical breakdown, total number of comments made, statistical overview of tasks
 *
 * @param {object} study - the study object
 * @returns Promise
 */
function getStudyOverviewStats(study) {
    serviceLogger.info({
        id: study._id
    }, '>> getStudyOverviewStats()');

    var deferred = q.defer();
    var studyId = study._id;
    var studyName = study.name;
    // Total number of participants
    var numOfParticipants = study.participants.length;

    // Total number of annotations
    var numOfAnnotations = study.annotations.length;

    // Only freeform questions has sentiment that we care about
    var freeformAnswers = _(study.answers).filter(function (answer) {
        return answer.questionType === 'Freeform';
    }).value();

    // Total sentiments - Freeform and Annotations
    var sentimentsTotal = {
        positive: {
            total: getTotalPercentageStats(study.annotations, sentiments.POSITIVE, 'sentiment').total + getTotalPercentageStats(freeformAnswers, sentiments.POSITIVE, 'sentiment').total
        },
        neutral: {
            total: getTotalPercentageStats(study.annotations, sentiments.NEUTRAL, 'sentiment').total + getTotalPercentageStats(freeformAnswers, sentiments.NEUTRAL, 'sentiment').total
        },
        negative: {
            total: getTotalPercentageStats(study.annotations, sentiments.NEGATIVE, 'sentiment').total + getTotalPercentageStats(freeformAnswers, sentiments.NEGATIVE, 'sentiment').total
        }
    };

    var totalSentiment = sentimentsTotal.positive.total + sentimentsTotal.neutral.total + sentimentsTotal.negative.total;
    if (totalSentiment > 0) {
        // fixes all percentags to 00.00 format for longer decimals
        sentimentsTotal.positive.percentage = parseFloat(((sentimentsTotal.positive.total / totalSentiment) * 100).toFixed(2));
        sentimentsTotal.neutral.percentage = parseFloat(((sentimentsTotal.neutral.total / totalSentiment) * 100).toFixed(2));
        sentimentsTotal.negative.percentage = parseFloat(((sentimentsTotal.negative.total / totalSentiment) * 100).toFixed(2));
    }
    else {
        sentimentsTotal.positive.percentage = 0;
        sentimentsTotal.neutral.percentage = 0;
        sentimentsTotal.negative.percentage = 0;
    }

    // for Pie Chart
    sentimentsTotal.chart = [sentimentsTotal.positive.total, sentimentsTotal.neutral.total, sentimentsTotal.negative.total];
    // total comments
    var comments = _(study.annotations)
        .filter(function (annotation) {
            return annotation.comment && annotation.comment.length > 0;
        })
        .value().length;

    var taskAnswers = _(study.answers).filter(function (answer) {
        return answer.questionType === 'Task';
    }).value();

    var userWhoCompletedStudy = getUsersWhoCompletedAStudy(study);

    var data = {
        studyId: studyId,
        name: studyName,
        participants: numOfParticipants,
        annotations: numOfAnnotations,
        sentiments: sentimentsTotal,
        comments: comments,
        tasks: getStudyTasksOverview(taskAnswers),
        medianDuration: 0,
        averageDuration: 0,
        shortestDuration: 0,
        longestDuration: 0,
        completed: userWhoCompletedStudy.length
    };

    getStudyDurationForUsers(study, userWhoCompletedStudy)
        .then(function (duration) {
            data.averageDuration = duration.average;
            data.longestDuration = duration.slowest;
            data.shortestDuration = duration.fastest;
            return getStudyDurationForUsers(study);
        })
        .then(function (duration) {
            data.medianDuration = duration.average;
            serviceLogger.info('<< getStudyOverviewStats(), returning data');
            deferred.resolve(data);
        })
        .catch(function (err) {
            serviceLogger.warn('<< getStudyOverviewStats(), returning error ' + err);
            deferred.reject(err);
        });
    return deferred.promise;
}

/**
 * Aggregates a study's questions and answers into Array
 * of questions with statistics and information relating to each question
 *
 * @param {object} study
 * @returns {deferred.promise|*}
 */
function getIndividualQuestionsWithStats(study) {
    serviceLogger.info({
        id: study._id
    }, '>> getIndividualQuestionsWithStats()');

    var deferred = q.defer();
    var questions = study.questions;
    var answers = study.answers;
    var annotations = study.annotations;
    var count = questions.length;

    var questionsWithStats = [];

    _.map(questions, function (question) {
        return getIndividualQuestionWithStats(question, answers, annotations, study)
            .then(function (questionWithStatsResults) {
                // This will always return an object, if nothing found will have default values set
                questionsWithStats.push(questionWithStatsResults);
                count--;
                if (count <= 0) {
                     serviceLogger.info('<< getIndividualQuestionsWithStats(), returning questionWithStats');
                    deferred.resolve(questionsWithStats);
                }
            })
            .catch(function (err) {
                serviceLogger.warn('<< getIndividualQuestionsWithStats(), returning error ' + err);
                deferred.reject(logError(err));
            });
    });
    return deferred.promise;
}

/**
 * Get a Study and its Overview statistics for a StudyId
 *
 * @param {string} studyId
 * @returns Promise
 */
function getStudyAndOverviewStats(studyId) {
    serviceLogger.info({
        studyId: studyId
    }, '>> getStudyAndOverviewStats()');

    var deferred = q.defer();

    Study.findOne({
        _id: studyId
    })
        .lean()
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('>> getStudyAndOverviewStats(), returning error ' + err);
                deferred.reject(err);
            }
            else if (!study) {
                serviceLogger.info('>> getStudyAndOverviewStats(), study not found');
                deferred.reject(null);
            }
            else {
                getStudyOverviewStats(study)
                    .then(function (stats) {
                        serviceLogger.info('>> getStudyAndOverviewStats(), returning stats');
                        deferred.resolve({
                            stats: stats,
                            study: study
                        });
                    })
                    .catch(function (er) {
                        serviceLogger.info('>> getStudyAndOverviewStats(), returning err ' + er);
                        deferred.reject(er);
                    });
            }
        });
    return deferred.promise;
}

/**
 * Gets JSON Object containing statistics and information relating to a question
 *
 * @param {object} question - the question that the stats are being retrieved for
 * @param {array} answers - the answers to the question
 * @param {array} annotations - the annotations for the question
 * @param {object} studyDetails - the details of the study that the question is part of
 * @param {boolean} breakdownRequired - Whether to add the participant breakdown to the data
 * @returns Promise
 */
function getIndividualQuestionWithStats(question, answers, annotations, studyDetails, breakdownRequired) {
    serviceLogger.info({
        questionId: question._id,
        breakdownRequired: breakdownRequired
    }, '>> getIndividualQuestionWithStats()');

    var deferred = q.defer();

    var questionWithStats = {
        _id: question._id,
        text: question.text,
        ordinal: question.ordinal,
        subOrdinal: question.subOrdinal,
        type: question.type,
        name: question.name,
        hasTarget: question.targetURL && question.targetURL.length !== 0 ? true : false,
        thumbnail: question.thumbnail,
        participantBreakdown: [],
        sentiments: {
            positive: 0,
            neutral: 0,
            negative: 0
        }
    };

    var questionAnswers = getQuestionAnswers(question._id, answers);

    if (question.type === 'MultipleChoice') {
        var choiceStats = getChoiceStats(questionAnswers, question);
        questionWithStats.answers = {};
        questionWithStats.answers.choices = choiceStats;
    }

    if (question.type === 'Freeform') {
        questionWithStats.freeformSentiment = {};
        questionWithStats.freeformSentiment.positive = getTotalPercentageStats(questionAnswers, sentiments.POSITIVE, 'sentiment');
        questionWithStats.freeformSentiment.neutral = getTotalPercentageStats(questionAnswers, sentiments.NEUTRAL, 'sentiment');
        questionWithStats.freeformSentiment.negative = getTotalPercentageStats(questionAnswers, sentiments.NEGATIVE, 'sentiment');
        questionWithStats.freeformSentiment.chart = [questionWithStats.freeformSentiment.positive.total, questionWithStats.freeformSentiment.neutral.total, questionWithStats.freeformSentiment.negative.total];
    }

    var promiseChain;

    promiseChain = getTrackingForQuestion(studyDetails.projectId, studyDetails._id, question._id)
        .then(function (trackings) {
            if (question.type === 'Task') {
                return getTaskStats(question, questionAnswers, annotations, studyDetails, trackings).then(function (taskStats) {
                    questionWithStats.pages = taskStats.pages;
                    questionWithStats.averageDuration = taskStats.averageDuration;
                    questionWithStats.medianDurationPage = taskStats.medianDurationPage;
                    questionWithStats.slowestDurationComment = taskStats.slowestDurationComment;
                    questionWithStats.fastestDurationComment = taskStats.fastestDurationComment;
                    questionWithStats.averagePagesVisited = taskStats.averagePagesVisited;
                    questionWithStats.successful = taskStats.successful;
                    questionWithStats.failed = taskStats.failed;
                    questionWithStats.abandoned = taskStats.abandoned;
                    questionWithStats.sankey = taskStats.sankey;
                    questionWithStats.links = taskStats.links;
                    // for Pie Chart
                    questionWithStats.chart = [questionWithStats.successful.total, questionWithStats.failed.total, questionWithStats.abandoned.total];
                    return getAnnotationsForQuestion(question._id, annotations);
                });
            }
            questionWithStats.averageDuration = getAverageTimeSpentOnQuestion(trackings, question._id.toString());
            return getAnnotationsForQuestion(question._id, annotations);
        });

    // question
    promiseChain.then(function (annots) {
        questionWithStats.participants = getNumberOfParticipants(questionAnswers, annots);
        questionWithStats.annotations = annots.length;
        questionWithStats.comments = _(annots)
            .filter(function (annotation) {
                return annotation.questionId.equals(question._id) && annotation.comment !== null && annotation.comment !== '';

            }).value().length;
        var annotationsWithSentiments = _.filter(annots, function (annotation) {
            return _.indexOf([sentiments.POSITIVE, sentiments.NEGATIVE, sentiments.NEUTRAL], annotation.sentiment) > -1;
        });
        questionWithStats.sentiments.positive = getTotalPercentageStats(annotationsWithSentiments, sentiments.POSITIVE, 'sentiment');
        questionWithStats.sentiments.neutral = getTotalPercentageStats(annotationsWithSentiments, sentiments.NEUTRAL, 'sentiment');
        questionWithStats.sentiments.negative = getTotalPercentageStats(annotationsWithSentiments, sentiments.NEGATIVE, 'sentiment');
        questionWithStats.sentiments.chart = [questionWithStats.sentiments.positive.total, questionWithStats.sentiments.neutral.total, questionWithStats.sentiments.negative.total];

        if (breakdownRequired) {
            return getMultipleParticipantStatsForQuestion(question, studyDetails)
                .then(function (breakdown) {
                    questionWithStats.participantBreakdown = breakdown;
                    serviceLogger.info('<< getIndividualQuestionWithStats(), returning questionWithStats');
                    deferred.resolve(questionWithStats);
                }).catch(function (err) {
                    serviceLogger.warn('<< getIndividualQuestionWithStats(), returning error', err);
                    deferred.reject(logError(err));
                });
        }
        deferred.resolve(questionWithStats);
    });

    promiseChain.catch(function (err) {
        serviceLogger.warn('<< getIndividualQuestionWithStats(), returning error', err);
        deferred.reject(logError(err));
    });
    return deferred.promise;
}

/**
 * gets an Array of answer for a particular Question
 * @param {objectId} questionId (type mongoose/mongodb ObjectID)
 * @param {array} answers
 * @returns Array
 */
function getQuestionAnswers(questionId, answers) {
    var questionsAns = [];
    for (var i = 0, len = answers.length; i < len; i++) {
        if (questionId.equals(answers[i].questionId)) {
            questionsAns.push(answers[i]);
        }
    }
    return questionsAns;
}

/**
 * Get the annotations for a question (including questions of type 'Task')
 * @param id
 * @param {array} annotations
 * @returns Promise
 */
function getAnnotationsForQuestion(id, annotations) {
    return _(annotations)
        .filter(function (annotation) {
            return annotation.questionId.equals(id);
        }).value();
}

/**
 * gets the total number items filtered by property and it's
 * percentage in relation to the total number of items
 *
 * @param {array} items
 * @param propertyValue
 * @param propertyName
 * @returns JSON Object
 */
function getTotalPercentageStats(items, propertyValue, propertyName) {
    serviceLogger.info('>> getTotalPercentageStats()');
    var data = {};
    data.total = _(items)
        .filter(function (item) {
            return item[propertyName] === propertyValue;
        })
        .value().length;

    if (items.length > 0) {
        data.percentage = parseFloat(((data.total / items.length) * 100).toFixed(2));
    }
    else {
        data.percentage = 0;
    }
    serviceLogger.info('<< getTotalPercentageStats()');
    return data;
}

/**
 * Get the Aggregate multi choice question Answers containing
 * the total number of each unique answer selected and its percentage
 * in relation to all answers for question.  Also sets the answer Text property with the string of the selected choice.
 *
 * @param {array} answerItems - All of the answers for the given question
 * @param {object} question - The question which the stats are to be found
 * @returns {array} choiceMap - The array containing the choices for the question including percentages
 */
function getChoiceStats(answerItems, question) {
    serviceLogger.info('>> getChoiceStats()');
    var answers = [];
    var answerOptions = question.answerOptions;
    for (var a = 0, alen = answerItems.length; a < alen; a++) {
        answers = answers.concat(answerItems[a].answer.split(ANSWER_SEPARATOR));
        answerItems[a].answerText = getAnswerTextForMultiChoice(answers, answerOptions).toString();
    }

    var choicesObj = {}; // pair with the answer options
    for (var i = 0; i < answerOptions.length; i++) {
        choicesObj[i] = {
            questionText: answerOptions[i],
            value: 0
        };
    }

    for (var x = 0, len = answers.length; x < len; x++) {
        choicesObj[answers[x]].value = choicesObj[answers[x]].value + 1;
    }

    serviceLogger.info('<< getChoiceStats()');
    return Object.keys(choicesObj).map(function (index) {
        return {
            text: choicesObj[index].questionText,
            total: choicesObj[index].value,
            percentage: (choicesObj[index].value === 0 ? choicesObj[index].value :
                Math.round(choicesObj[index].value / answers.length * 100))
        };
    });
}

/**
 * Get the average, slowest and fastest time spent on a url in a task time
 *
 * @param {object} study - The study for which the trackings are to be found
 * @param {object} task - The task for which all of the trackings were recorded
 * @returns Promise
 */
function getAverageTimeSpentOnTask(study, task) {
    serviceLogger.info({
        studyId: study._id,
        taskId: task._id
    }, '>> getAverageTimeSpentOnTask()');

    var deferred = q.defer();

    Tracking.find({
        projectId: study.projectId,
        studyId: study._id,
        questionId: task._id.toString()
    }).lean().exec(function (err, trackings) {
        if (err) {
            serviceLogger.warn('<< getAverageTimeSpentOnTaskByUrl(), returning error', err);
            deferred.reject(err);
        }
        var navigationTrackings = _.filter(trackings, function (tracking) {
            return tracking.eventType === 'navigation';
        });

        var participantTime = [];
        var userNavTrackings = _.groupBy(navigationTrackings, 'user');


        _.each(userNavTrackings, function (userTrackings) {
            var duration = 0;
            _.each(userTrackings, function (tracking) {
                duration += getDuration(tracking);
            });
            participantTime.push(duration);
        });

        var sum = _.reduce(participantTime, function (s, n) {
            return s + n;
        });

        var nonZeroValue = _.filter(participantTime, function (time) {
            return time > 0;
        });
        var average = (sum / participantTime.length) || 0;
        var slowest = _.max(nonZeroValue);
        var fastest = _.min(participantTime);

        serviceLogger.info('<< getAverageTimeSpentOnTaskByUrl(), returning stats');
        deferred.resolve({
            average: average,
            slowest: slowest,
            fastest: fastest
        });
    });
    return deferred.promise;
}

/**
 * For SmartApp : get the status statistics, average duration, average pages visited, number of pages in task
 *
 * @param {object} task - The task object
 * @param {array} answers - The array of answers with question type 'Task' and all with same `questionId`
 * @param {array} annotations  - The annotations that were created against the Task
 * @param {object} studyDetails - the study object
 * @returns Promise - JSON Object
 */
function getTaskStats(task, answers, annotations, studyDetails) {
    serviceLogger.info('>> getTaskStats()');
    var deferred = q.defer();
    var data = {
        pages: -1,
        averagePagesVisited: 0,
        successful: getTotalPercentageStats(answers, taskStates.COMPLETED_CORRECTLY, 'status'),
        failed: getTotalPercentageStats(answers, taskStates.COMPLETED_INCORRECTLY, 'status'),
        abandoned: getTotalPercentageStats(answers, taskStates.ABORTED, 'status')
    };
    data.chart = [data.successful.total, data.failed.total, data.abandoned.total];

    getAverageTimeSpentOnTask(studyDetails, task)
        .then(function (duration) {
            serviceLogger.info('>> getTaskStats() obtained duration', duration);
            data.medianDurationPage = duration.average;
            data.slowestDurationComment = duration.slowest;
            data.fastestDurationComment = duration.fastest;
            return getUrlsInSnapshot(studyDetails.projectId, task);
        })
        .then(function (pages) {
            serviceLogger.info('>> getTaskStats() obtained pages', pages);
            if (pages && pages.length) {
                data.pages = pages.length;
            }
            return getStatsForTaskUrls(studyDetails, task, annotations, answers);
        })
        .then(function (stats) {
            serviceLogger.info('>> getTaskStats() obtained stats', stats);
            data.links = stats.links;
            data.averagePagesVisited = stats.averagePagesVisited;
            return getSankeyStatistics(studyDetails, task);
        }).then(function (sankeyStats) {
            serviceLogger.info('>> getTaskStats() obtained sankeyStats', sankeyStats);
            data.sankey = sankeyStats;
            serviceLogger.info('<< getTaskStats(), returning data');
            deferred.resolve(data);
        })
        .catch(function (err) {
            serviceLogger.warn('<< getTaskStats(), returning error ' + err);
            deferred.reject(logError(err));
        });
    return deferred.promise;
}

/**
 *
 * Return a list of nodes and the number of connections between each node
 *
 * @param {array} aTrackings - list of trackings for a question of a study
 * @param {array} aDeepLinks - list of all the links that can potentially be a node
 * @param {array} aTargetUrls - url of 'target' page in a study
 * @retuns {object} object - object containing list of all nodes and list of connections
 */
function buildSankey(aTrackings, aDeepLinks, aTargetUrls) {
    serviceLogger.info('>> buildSankey()');

    var iNodeIndexer = 0; // the count for nodes in the diagram
    var oTree = {};
    var aLinks = [];
    var aNodes = [];

    var iMaxPixelSize = 30; // max pixel width of node connections
    var iTotalUsers = _.size(aTrackings); // since aTrackings is grouped by Users

    /**
     * Nodes within this function are in a form as follows;
     *
     * Type Node = {
     *      nodeNumber: number,
     *      count: number,
     *      children: {Url - > Node}
     * }
     */

    /**
     * Converts a list of trackings into a node sequence
     *
     * @param aList list of nodes to convert
     * @param oNode parent node that children hang from.
     */
    var createBranchFromList = function (aList, oNode) {
        if (aList.length === 0) {
            return;
        }

        var nodeKey = aList[0].pathName;

        // check for if the page has context
        if (aList[0].context && aList[0].context.entity) {
            nodeKey = nodeKey + '#/' + aList[0].context.entity;
        }

        oNode[nodeKey] = {
            nodeNumber: iNodeIndexer,
            count: 1,
            children: {}
        };

        iNodeIndexer++;
        createBranchFromList(_.drop(aList, 1), oNode[nodeKey].children);
    };

    /**
     * Builds a tree of connected nodes whilst incrementing
     * how often a particular node has been seen
     *
     * If a node has already been seen we continue checking using it's children
     * otherwise we create a new branch hanging from this node to account for a new path
     *
     * @param aList - list to check against current node level
     * @param oNode - current node level
     */
    var checkPath = function (aList, oNode) {
        if (aList.length === 0) {
            return;
        }

        var nodeKey = aList[0].pathName;

        // check for if the page has context
        if (aList[0].context && aList[0].context.entity) {
            nodeKey = nodeKey + '#/' + aList[0].context.entity;
        }

        if (oNode && oNode[nodeKey]) { // this is an existing path
            oNode[nodeKey].count++;
            checkPath(_.drop(aList, 1), oNode[nodeKey].children);
        }
        else { // new path
            createBranchFromList(aList, oNode);
        }
    };

    /**
     * Function that takes nodes and maps them to the values we want
     * the sankey diagrams to consume.
     *
     * @param oNode - current node level that we are mapping
     * @param sKey  - current key for the node level we are on
     * @param iParentNumber - the node number of the parent node
     */
    var transformData = function (oNode, sKey, iParentNumber) {
        if (_.isEmpty(oNode)) {
            return;
        }

        var oLink = _.find(aDeepLinks, function (oDeepLink) {
            return oDeepLink.pageUrl === sKey;
        });

        if (!oLink) {
            return;
        }

        var bTargetLink = _.findIndex(aTargetUrls, function (sTargetURL) {
            return sTargetURL === sKey;
        }) > -1 ? true : false;

        aNodes.push({
            node: oNode.nodeNumber,
            name: oLink.pageName,
            image: oLink.thumbnail,
            isTarget: bTargetLink
        });
        if (iParentNumber !== null) {
            var weight = Math.round(iMaxPixelSize * (oNode.count / iTotalUsers));

            aLinks.push({
                source: iParentNumber,
                target: oNode.nodeNumber,
                value: weight
            });
        }
        _.forEach(oNode.children, function (oChild, sChildKey) {
            transformData(oChild, sChildKey, oNode.nodeNumber);
        });
    };

    _.forEach(aTrackings, function (aUserData) {
        checkPath(aUserData, oTree);
    });

    var sRoot = Object.keys(oTree)[0];
    transformData(oTree[sRoot], sRoot, null);

    serviceLogger.info('<< buildSankey(), returning nodes');
    return {
        nodes: aNodes,
        links: aLinks
    };
}

/**
 * Gets the required data to be consumed for a sankey diagram, the data for the nodes
 * and the progress between each node
 *
 * @param {object} studyDetails - details of the study
 * @param {object} task - current task within the study
 *
 * @returns deferred.promise
 */
function getSankeyStatistics(studyDetails, task) {
    serviceLogger.info({
        studyDetailsId: studyDetails._id
    }, '>> getSankeyStatistics()');

    var deferred = q.defer();
    var aTaskTrackings;
    getTrackingForQuestion(studyDetails.projectId, studyDetails._id, task._id)
        .then(function (trackings) {
            // we only want navigation tracking
            aTaskTrackings = _(trackings).filter(function (oTracking) {
                return oTracking.eventType === 'navigation' && oTracking.pageUrl !== oTracking.referrer;
            }).groupBy('user')
                .forEach(function (array) {
                    return _.sortBy(array, function (oItem) { // sort them by the time they entered a page at
                        return oItem.stats.created_at;
                    });
                })
                .value();
            snapshotService = registry.lookupModule('SnapshotService');
            if (task.snapshotUILang === 'html') {
                serviceLogger.info('getSankeyStatistics(), returning studyProto');
                return studyPrototypeService.getStudyPrototype(task.snapshotId);
            }
            else if (snapshotService !== undefined) {
                serviceLogger.info('getSankeyStatistics(), returning UIC Proto');
                // could likely be refactored into use getUrlsInSnapshot
                return snapshotService.getSnapshots(studyDetails.projectId, task.snapshotVersion);
            }
            serviceLogger.info('getSankeyStatistics(), returning nothing');
        })
        .then(function (aSnapshots) {

            var aNodes = [];
            var aLinks = [];

            // check whether it is a UI Proto or studyProto
            var aDeepLinks;
            if (_.isArray(aSnapshots) && aSnapshots[0]) {
                aDeepLinks = aSnapshots[0].deepLinks;
            }
            else if (aSnapshots && aSnapshots.snapshot) {
                aDeepLinks = aSnapshots.snapshot.deepLinks;
            }
            else {
                aDeepLinks = [];
            }

            aDeepLinks = updateSnapShotDeepLinks(aDeepLinks, task.snapshotUILang);

            var oSankey = buildSankey(aTaskTrackings, aDeepLinks, task.targetURL);
            aNodes = oSankey.nodes;
            aLinks = oSankey.links;

            serviceLogger.info('<< getSankeyStatistics(), returning nodes/links');
            deferred.resolve({
                nodes: aNodes,
                links: aLinks
            });
        })
        .catch(function (err) {
            serviceLogger.error('<< getSankeyStatistics(), returning error');
            deferred.reject(logError(err));
        });

    return deferred.promise;
}

/**
 * Gets the success, failed and abandoned breakdown of a study's tasks
 * includes both value and percentage
 * @param {array} taskAnswers
 * @returns {object} data
 */
function getStudyTasksOverview(taskAnswers) {
    var data = {
        successful: getTotalPercentageStats(taskAnswers, taskStates.COMPLETED_CORRECTLY, 'status'),
        failed: getTotalPercentageStats(taskAnswers, taskStates.COMPLETED_INCORRECTLY, 'status'),
        abandoned: getTotalPercentageStats(taskAnswers, taskStates.ABORTED, 'status')
    };
    data.chart = [data.successful.total, data.failed.total, data.abandoned.total];
    return data;
}

/**
 * Get the total number of Unique Participants the question
 * which the answers and annotations belong to
 *
 * @param {array} answers
 * @param {array} annotations
 * @returns Integer
 */
function getNumberOfParticipants(answers, annotations) {
    var uniqueIds = _.union(_.pluck(answers, 'stats.created_by'), _.pluck(annotations, 'createBy'));
    uniqueIds = _.map(uniqueIds, function (id) {
        return id.toString();
    });

    uniqueIds = _.uniq(uniqueIds);
    return uniqueIds.length;
}

/**
 * Get all Tracking information associated with a Question
 * @param {objectId} projectId - The projectId used for filtering trackings
 * @param {objectId} studyId - The studyId used for filtering trackings
 * @param {objectId} questionId - The questionId used for filtering trackings
 * @returns Promise JSON Array
 */
function getTrackingForQuestion(projectId, studyId, questionId) {
    serviceLogger.info({
        projectId: projectId,
        studyId: studyId,
        questionId: questionId
    }, '>> getTrackingForQuestion()');

    var deferred = q.defer();
    Tracking.find({
        projectId: projectId,
        studyId: studyId,
        questionId: questionId
    })
        .lean()
        .exec(function (err, trackings) {
            if (err) {
                serviceLogger.warn('<< getTrackingForQuestion(), error found ' + err);
                deferred.reject(logError(err));
            }
            else if (!trackings) {
                serviceLogger.info('<< getTrackingForQuestion(), no tracking found');
                deferred.reject(logError('No trackings for question'));
            }
            else {
                serviceLogger.info('<< getTrackingForQuestion(), return trackings');
                deferred.resolve(trackings);
            }
        });
    return deferred.promise;
}

/**
 * Get the stats for the Urls for a task prototype
 *
 * @param {object} studyDetails - The study object
 * @param {object} task - the task question object
 * @param {array} annotations
 * @param {array} answers
 * @returns PRomise
 */
function getStatsForTaskUrls(studyDetails, task, annotations, answers) {
    serviceLogger.info('>> getStatsForTaskUrls()');

    var deferred = q.defer();
    var taskTrackings;
    var data = {};
    getTrackingForQuestion(studyDetails.projectId, studyDetails._id, task._id)
        .then(function (trackings) {
            taskTrackings = trackings;
            data.averagePagesVisited = getAverageNumberOfPageVisits(trackings, true);
            return getUrlsInSnapshot(studyDetails.projectId, task);
        })
        .then(function (deepLinks) {
            if (deepLinks && deepLinks.length) {
                var links = [];
                var linkCount;
                linkCount = deepLinks.length;
                _.map(deepLinks, function (deepLink) {
                    var link = {};
                    link.url = deepLink.pageUrl;
                    link.name = deepLink.pageName;
                    link.thumbnail = deepLink.thumbnail;
                    link.participants = getNumberOfPeopleWhoVisitedPage(link.url, taskTrackings, task);

                    var stats = getAnnotationStatsForUrl(link.url, annotations, task);
                    link.stats = stats;
                    link.clickLocations = getClickLocationsForUrl(link.url, taskTrackings, task);

                    link.stats.completed = getCompletedTasksForUrl(link.url, answers, task);
                    link.stats.abandoned = getAbortedTasksForUrl(link.url, answers, task);
                    link.averageTime = getAverageTimeSpentOnUrl(link.url, taskTrackings, task);
                    link.averageTime = getAverageTimeSpentOnUrl(link.url, taskTrackings, task);

                    links.push(link);
                    linkCount--;
                    if (linkCount <= 0) {
                        data.links = links;
                        serviceLogger.info('<< getStatsForTaskUrls(), returning data');
                        deferred.resolve(data);
                    }
                });
            }
            else {
                data.links = [];
                serviceLogger.info('<< getStatsForTaskUrls(), returning data');
                deferred.resolve(data);
            }
        })
        .catch(function (err) {
            serviceLogger.warn('<< getStatsForTaskUrls(), returning error ' + err);
            deferred.reject(logError(err));
        });

    return deferred.promise;
}

/**
 * Gets the the locations that users clicked for a particular url
 * This takes into account the scrollTop and scrollLeft to allow for more accurate rendering
 * @param {string} sUrl - the url for a page that we want to get the clicks for
 * @param {array} oTrackings - all tracking entries for a question/task
 * @returns {array}
 */
function getClickLocationsForUrl(sUrl, oTrackings) {
    var aClicks = _(oTrackings)
        .filter(function (track) {
            // occurrences of track without clicks - filter those out too
            if (track.context && track.context.entity && track.context.data) {
                return track.pathName + HASH_FORWARDSLASH + track.context.entity === sUrl && (track.clickX || track.clickY);
            }
            return (track.pathName + track.hash) === sUrl && (track.clickX || track.clickY);
        }).groupBy(function (track) {
            // the x and y combined will always be a unique value - easiest way to group.
            return track.clickX + ':' + track.clickY;
        }).map(function (click) {
            var temp = {
                x: click[0].clickX + click[0].scrollLeft,
                y: click[0].clickY + click[0].scrollTop,
                value: click.length
            };
            if (click[0].context) {
                temp.context = click[0].context;
            }

            return temp;
        }).value();
    return aClicks;
}

/**
 * Gets the Average number of  Page visits, and can be filtered by unique urls
 * @param {array} trackings - all tracking entries for a question/task
 * @param {bool} uniqueOnly - bool to filter on unique if true
 * @returns {number}
 */
function getAverageNumberOfPageVisits(trackings, uniqueOnly) {
    var visitors = _.groupBy(trackings, function (track) {
        return track.user;
    });

    var visits = [];
    _.transform(visitors, function (res, visitor) {

        var filteredPageArray = _.remove(_.pluck(visitor, 'pageUrl'), function (n) {
            return n !== undefined;
        });
        if (uniqueOnly) {
            filteredPageArray = _.unique(filteredPageArray);
        }
        visits.push(filteredPageArray.length);
    });
    var sum = _.reduce(visits, function (s, num) {
        return s + num;
    });
    if (visits.length < 1 || sum < 1) {
        return 0;
    }

    return parseFloat((sum / visits.length).toFixed(2));
}

/**
 * gets the number of unique users who visited a url
 * @param {string} url - the url for which unique visitors are to be found
 * @param {array} trackings - the trackings for a questionID
 * @returns number
 */
function getNumberOfPeopleWhoVisitedPage(url, trackings, task) {
    var visitors = _.filter(trackings, function (track) {
        var relativePath = updateRelativePathWithContext(track.pathName, track.context, task);
         return relativePath === url;
    });

    var unique = _.uniq(visitors, function (visitor) {
        return visitor.user.toString();
    });
    return unique.length;
}

/**
 * gets the url for an annotation
 *
 * @param {object} annotation
 * @param {object} task
 * @returns {string} annotationUrl
 */
function getAnnotationUrl(annotation, task) {
    var annotationUrl;
        annotationUrl = annotation.url;
    if (annotation.context) {
        annotationUrl = annotation.pathName;
        if (annotation.context.entity) {

            annotationUrl = updateRelativePathWithContext(annotationUrl, annotation.context, task);
        }
    }
    return annotationUrl;
}

/**
 * get the totalAnnotations, totalComments and the total
 * annotations for each sentiment
 *
 * @param {string} url
 * @param {array} annotations for a question
 * @param {object} task
 * @returns JSON Object
 */
function getAnnotationStatsForUrl(url, annotations, task) {

    // taskId as a number doesn't compare with questionId even when the same
    var taskId = task._id.toString();


    var totalAnnotations = _.filter(annotations, function (annotation) {
        return taskId === annotation.questionId.toString() && getAnnotationUrl(annotation, task) === url;
    });


    var positive = _.filter(annotations, function (annotation) {
        return taskId === annotation.questionId.toString() && getAnnotationUrl(annotation, task) === url && annotation.sentiment === sentiments.POSITIVE;
    });

    var negative = _.filter(annotations, function (annotation) {
        return taskId === annotation.questionId.toString() && getAnnotationUrl(annotation, task) === url && annotation.sentiment === sentiments.NEGATIVE;
    });

    var neutral = _.filter(annotations, function (annotation) {
        return taskId === annotation.questionId.toString() && getAnnotationUrl(annotation, task) === url && annotation.sentiment === sentiments.NEUTRAL;
    });
    var comments = _.filter(annotations, function (annotation) {
        return taskId === annotation.questionId.toString() && getAnnotationUrl(annotation, task) === url && annotation.comment;
    });
    var totalSentiments = positive.length + negative.length + neutral.length;

    var positiveAnnotationsPercent = totalSentiments > 0 ? Math.round((positive.length / totalSentiments) * 100) : 0;
    var neutralAnnotationsPercent = totalSentiments > 0 ? Math.round((neutral.length / totalSentiments) * 100) : 0;
    var negativeAnnotationsPercent = totalSentiments > 0 ? Math.round((negative.length / totalSentiments) * 100) : 0;

    var data = {
        totalAnnotations: totalAnnotations.length,
        positiveAnnotations: positive.length,
        positiveAnnotationsPercent: positiveAnnotationsPercent,
        negativeAnnotations: negative.length,
        negativeAnnotationsPercent: negativeAnnotationsPercent,
        neutralAnnotations: neutral.length,
        neutralAnnotationsPercent: neutralAnnotationsPercent,
        annotationsChart: [positive.length, neutral.length, negative.length],
        TotalsComments: comments.length,
        comments: comments
    };
    return data;
}

/**
 * Gets the completed tasks answers for a task
 *
 * @param {string} url
 * @param {object} task
 * @param {array} answers
 * @returns JSON Object
 */
function getCompletedTasksForUrl(url, answers, task) {

    var completedAnswers = {};

    if (task.targetURL && task.targetURL.length > 0) {
        if (_.indexOf(task.targetURL, url) > -1) {
            completedAnswers.isTarget = true;
        }
        else {
            completedAnswers.isTarget = false;
        }
    }
    else {
        completedAnswers.isTarget = true; // no target means no wrong answer
    }

    var answersForUrls = _.filter(answers, function (answer) {
        if (answer.status === taskStates.ABORTED || !answer.answer) {
            return false;
        }
        var context = getContextFromUrl(answer.answer, task);
        var answerUrl = context.relativePath;
        return answerUrl === url;
    });
    completedAnswers.answersForUrl = answersForUrls.length;


    return completedAnswers;
}


/**
 * Updates the Relative Path from a context and
 *
 * @param {string} path
 * @param {object} context
 * @param {object} task
 * @returns {string} String - the path with the hash and context entity appended
 */
function updateRelativePathWithContext(path, context, task) {
    if (context) {
        if (context.entity && task.snapshotUILang === 'UI5') {
            path += HASH_FORWARDSLASH + context.entity;
        }
    }
    return path;
}

/**
 * Gets the number of aborted task answers
 *
 * @param {string} url
 * @param {array} answers
 * @param {object} task - the task object
 * @returns answers
 */
function getAbortedTasksForUrl(url, answers, task) {

    var abortedAnswers = _.filter(answers, function (answer) {
        if (answer.status !== taskStates.ABORTED || !answer.answer) return false;
            var context = getContextFromUrl(answer.answer, task);
            var answerUrl = context.relativePath;
            return answerUrl === url;

    }).length;

    return abortedAnswers;
}

/**
 * Gets the time pent on Question
 *
 * @param {array} trackings
 * @param {string} questionIdStr
 * @returns Number
 */
function getAverageTimeSpentOnQuestion(trackings, questionIdStr) {

    if (!trackings || !trackings.length) {
        return 0;
    }

    var questionTrackings = _.filter(trackings, function (tracking) {
        return tracking.questionId.toString() === questionIdStr && tracking.eventType !== 'iframeClick';
    });

    var totalTime = 0;
    _.each(questionTrackings, function (qTracking) {
        if (qTracking.stats.updated_at) {
            var seconds = (qTracking.stats.updated_at.getTime() - qTracking.stats.created_at.getTime()) / 1000;
            totalTime += seconds;
        }
    });

    var users;

    if (totalTime !== 0) {
        users = _.groupBy(trackings, 'user');
    }
    else {
        return 0;
    }

    if (!users) {
        return 0;
    }

    return Math.floor(totalTime / _.keys(users).length);
}

/**
 * Gets the time in seconds spent on a Url
 *
 * @param {string} url
 * @param {array} trackings
 * @param {object} task
 * @returns Number
 */
function getAverageTimeSpentOnUrl(url, trackings, task) {


    var navigationTrackings = _.filter(trackings, function (tracking) {
        return tracking.eventType === 'navigation';
    });

    var duration = 0;
    _.each(navigationTrackings, function (navTracking) {
        if (navTracking.context) {
            if (navTracking.context.entity && url === updateRelativePathWithContext(navTracking.pathName, navTracking.context, task)) {
                duration += getDuration(navTracking);

            }
            else if (url === navTracking.pathName && !navTracking.hash) {
                duration += getDuration(navTracking);
            }
        }
        else if ((url.indexOf('#') === -1 && url === navTracking.pathName)) {
            duration += getDuration(navTracking);
        }
    });

    var users = _.unique(_.pluck(trackings, 'user'), function (userId) {
        // this is required because the Id's are objects and need to be strings to be considered equal to each other
        return userId.toString();
    });

    if (users.length > 0 && duration > 0) {
        return duration / users.length;
    }

    return 0;
}

/**
 * gets the deepLinks for a Snapshot
 *
 * @param {string} projectId
 * @param {object} task
 * @param {array} trackings
 * @returns Promise
 */
function getUrlsInSnapshot(projectId, task) {
    serviceLogger.info({
        projectId: projectId,
        task: task._id
    }, '>> getUrlsInSnapshot()');

    var snapshotversion = task.snapshotVersion;
    var snapshotUILang = task.snapshotUILang;
    var snapshotId = task.snapshotId;

    var deferred = q.defer();
    // This needs to be updated When the Service to provide SmartTemplates & UI5 prototypes is available
    if (snapshotUILang === 'UI5') {
        serviceLogger.info('getUrlsInSnapshot(), getting prototypes from snapshots');

        snapshotService = registry.lookupModule('SnapshotService');
        if (snapshotService !== undefined) {
            snapshotService.getSnapshots(projectId, snapshotversion)
                .then(function (snapshots) {
                    if (snapshots && snapshots[0]) {
                        serviceLogger.info('getUrlsInSnapshot(), returning deeplinks for the snapshot');
                        var deepLinks = updateSnapShotDeepLinks(snapshots[0].deepLinks, snapshotUILang);
                        deferred.resolve(deepLinks);
                    }
                    else {
                        serviceLogger.info('getUrlsInSnapshot(), no snaphots retrieved, returning empty array');
                        deferred.resolve([]);
                    }
                })
                .catch(function (err) {
                    serviceLogger.warn('getUrlsInSnapshot(), error retrieving snapshots');
                    deferred.reject(logError(err));
                });
        }
        else {
            serviceLogger.info('getUrlsInSnapshot(), snapshotService not available');
            deferred.resolve();
        }
    }
    else {
        serviceLogger.info('getUrlsInSnapshot(), getting prototypes from study prototypes');
        studyPrototypeService.getStudyPrototype(snapshotId)
            .then(function (snapshot) {
                if (!snapshot) {
                    serviceLogger.info('getUrlsInSnapshot(), no snapshots found, returning empty array');
                    deferred.resolve([]);
                }
                else {
                    serviceLogger.info('getUrlsInSnapshot(), snapshot found, returning deeplinks');

                    var deepLinks = snapshot.snapshot.deepLinks;
                    deferred.resolve(deepLinks);
                }
            })
            .catch(function (err) {
                serviceLogger.warn('getUrlsInSnapshot(), error getting snapshot from studyPrototypeServcie');
                deferred.reject(logError(err));
            });
    }

    return deferred.promise;
}

/**
 * Gets a list of userId strings who have completed a Study
 *
 * @param {object} study - the study object
 * @returns Array of userIdStrings
 */
function getUsersWhoCompletedAStudy(study) {

    var questionTypes = _.groupBy(study.questions, function (question) {
        return question.type;
    });
    var usersCompleted = [];

    if (questionTypes.MultiChoice || questionTypes.Freeform) {
        var multiChoiceFreeformAnswers = _.filter(study.questions, function (question) {
            return question.type === 'Freeform' || question.type === 'MultipleChoice';
        });
        var multiChoiceFreeFormUserIds = getUsersWhoCompletedMultiChoiceFreeformQuestions(study.answers, multiChoiceFreeformAnswers.length);
        // Do not want to add empty array as this will prevent intersection from working as expected
        if (multiChoiceFreeFormUserIds.length > 0) {
            usersCompleted.push(multiChoiceFreeFormUserIds);
        }
    }

    if (questionTypes.Annotation) {
        var annotationUserIds = getUsersWhoCompletedAnnotationQuestions(study.annotations, questionTypes.Annotation);
        if (annotationUserIds.length > 0) {
            usersCompleted.push(annotationUserIds);
        }
    }

    if (questionTypes.Task) {
        var taskAnswers = _.filter(study.answers, function (answer) {
            return answer.questionType === 'Task';
        });
        var taskUserIds = getUsersWhoCompletedTasks(taskAnswers, questionTypes.Task.length);
        if (taskUserIds.length > 0) {
            usersCompleted.push(taskUserIds);
        }
    }

    // returns the intersect of users who completed each of the question types
    // study is only complete if all question types are complete
    return usersCompleted.length === 1 ? usersCompleted[0] : _.intersection.apply(this, usersCompleted);
}

/**
 * Gets the userIds for the Users completed all Multi-Choice and or Freeform questions supplied by
 * checking who has a corresponding answers for each of the questions
 *
 * @param answers
 * @param numberOfQuestions
 * @returns Array of User Ids
 */
function getUsersWhoCompletedMultiChoiceFreeformQuestions(answers, numberOfQuestions) {
    var participantsAnswers = _.groupBy(answers, function (answer) {
        return answer.stats.created_by;
    });

    var usersFinishedAllFreeformMultipleChoice = [];
    var inCompleteUsers = [];

    _.each(participantsAnswers, function (participant) {

        if (participant.length === numberOfQuestions) {
            usersFinishedAllFreeformMultipleChoice.push(participant[0].stats.created_by.toString());
        }
        else {
            inCompleteUsers.push(participant);
        }
    });
    return usersFinishedAllFreeformMultipleChoice;
}

/**
 * Gets the userIds for the Users completed all annotation questions supplied by
 * checking who have dropped 1 or more annotations on each of annotation questions
 *
 * @param annotations
 * @param annotationQuestions
 * @returns Array of User Ids
 */
function getUsersWhoCompletedAnnotationQuestions(annotations, annotationQuestions) {
    var usersCompleted = [];

    // get the questionId & user for each Annotation
    var annotationQuestionIds = _.pluck(annotationQuestions, '_id');

    var userGroupAnnotation = _.groupBy(annotations, 'createBy');
    // for each user group their annotation's by question ID and check against the questionIds of the annotation questions
    _.each(userGroupAnnotation, function (userAnnotations) {
        var questionGroupAnnotation = _.groupBy(userAnnotations, 'questionId');

        var complete = true;
        // if the User does not have an entry for any of the question Ids - make complete as false
        _.each(annotationQuestionIds, function (qId) {
            if (!questionGroupAnnotation[qId]) {
                complete = false;
            }
        });

        if (complete) {
            usersCompleted.push(userAnnotations[0].createBy.toString());
        }
    });

    return usersCompleted;
}

/**
 * gets a list of userIds for users who completed all tasks
 *
 * @param answers - answers for a questions of type 'Task'
 * @param numberOfTasks
 * @returns Array
 */
function getUsersWhoCompletedTasks(answers, numberOfTasks) {
    // groupby by User
    var participantsAnswers = _.groupBy(answers, function (answer) {
        return answer.stats.created_by;
    });

    var usersFinishedAllFreeformMultipleChoice = [];
    // for each User's Answers
    _.each(participantsAnswers, function (participant) {
        // check they have same about of answers as there are tasks
        if (participant.length !== numberOfTasks) {
            return;
        }
        var isCompleted = true;
        // for of the participants answers check if completed correctly or incorrectly
        _.each(participant, function (answer) {
            if (answer.status !== 'completed correctly' && answer.status !== 'completed incorrectly') {
                isCompleted = false;
            }
        });
        // is any are not completed correctly or incorrectly do not add user
        if (isCompleted) {
            usersFinishedAllFreeformMultipleChoice.push(participant[0].stats.created_by.toString());
        }
    });

    return usersFinishedAllFreeformMultipleChoice;
}

/**
 * Gets the Study duration average, fastest and slowest
 *
 * @param {object} study - the study object
 * @param userIds (optional - allow to get for subset of users)
 * @returns Promise - JSON Object with average, fastest and slowest
 */
function getStudyDurationForUsers(study, userIds) {
    serviceLogger.info({
        studyId: study._id,
        userIds: userIds
    }, '>> getStudyDurationForUsers()');

    var deferred = q.defer();

    var query;
    if (userIds) {
        query = Tracking.find({
            projectId: study.projectId,
            studyId: study._id,
            user: {
                $in: userIds
            }
        });
    }
    else {
        query = Tracking.find({
            projectId: study.projectId,
            studyId: study._id
        });
    }

    query.lean().exec(function (err, trackings) {
        if (err) {
            deferred.reject(err);
        }

        var users = _.groupBy(trackings, 'user');
        var userTimes = [];
        _.each(users, function (userTrackings) {

            var time = 0;
            _.each(userTrackings, function (userTracking) {

                if (userTracking.stats && userTracking.stats.updated_at) {
                    time += Math.floor((userTracking.stats.updated_at.getTime() - userTracking.stats.created_at.getTime()) / 1000);
                }
            });
            userTimes.push(time);

        });
        var sum = _.reduce(userTimes, function (s, n) {
            return s + n;
        });
        var nonZeroValue = _.filter(userTimes, function (time) {
            return time > 0;
        });
        var average = (sum / userTimes.length) || 0;
        var slowest = _.max(nonZeroValue);
        var fastest = _.min(userTimes);

        serviceLogger.info('<< getStudyDurationForUsers(), returning data');
        deferred.resolve({
            average: average,
            slowest: slowest,
            fastest: fastest
        });
    });

    return deferred.promise;
}

/**
 * get the the Participant stats for question or Task
 *
 * @param {object} question
 * @param {object} studyDetails
 * @returns Promise - Participant breakdown for question
 */
function getMultipleParticipantStatsForQuestion(question, studyDetails) {
    serviceLogger.info({
        questionId: question._id
    }, '>> getMultipleParticipantStatsForQuestion()');

    var deferred = q.defer();
    var promiseChain;

    if (studyDetails.participants) {
        if (question.type === 'Task') {
            promiseChain = getParticipantBreakdownForTask(question, studyDetails);
        }
        else {
            promiseChain = getParticipantBreakdownForQuestion(question, studyDetails);
        }

        promiseChain.then(function (breakdown) {
            serviceLogger.info('<< getMultipleParticipantStatsForQuestion(), returning breakdown');
            deferred.resolve(breakdown);
        })
            .catch(function (err) {
                serviceLogger.warn('<< getMultipleParticipantStatsForQuestion(), returning error ' + err);
                deferred.reject(err);
            });
    }
    else {
        serviceLogger.info('<< getMultipleParticipantStatsForQuestion(), returning empty array');
        deferred.resolve([]);
    }

    return deferred.promise;
}

/**
 * gets the participant breakdown for ma question
 *
 * @param {object} question
 * @param {object} studyDetails
 * @returns promise
 */
function getParticipantBreakdownForQuestion(question, studyDetails) {
    serviceLogger.info({
        questionId: question._id
    }, '>> getParticipantBreakdownForQuestion()');

    var deferred = q.defer();

    // answers
    var questionAnswers = _.filter(studyDetails.answers, function (answer) {
        return String(answer.questionId) === String(question._id);
    });

    // annotations
    var questionAnnotation = _.filter(studyDetails.annotations, function (annotation) {
        return String(annotation.questionId) === String(question._id);
    });

    var participantsInAnswers = _.pluck(_.pluck(questionAnswers, 'stats'), 'created_by');
    var participantsInAnnotation = _.pluck(questionAnnotation, 'createBy');

    var participantList = _.merge(participantsInAnswers, participantsInAnnotation);
    participantList = participantList.map(function (id) {
        return id.toString();
    });

    var participants = [].concat(studyDetails.participants.filter(function (participant) {
        var id = participant._id.toString();
        return participantList.indexOf(id) > -1;
    }));

    if (participants) {
        // TIME ON PAGE
        Tracking.find({
            projectId: studyDetails.projectId,
            studyId: studyDetails._id,
            questionId: question._id,
            eventType: 'pageView',
            user: {
                $in: participantList
            }
        }).lean().exec(function (err, tracks) {
            if (err) {
                deferred.reject(err);
            }
            else {
                _.each(participants, function (participant) {
                    // answers
                    participant.answers = _.filter(questionAnswers, function (answer) {
                        return String(answer.stats.created_by) === String(participant._id);
                    });

                    // annotations
                    participant.annotations = _.filter(questionAnnotation, function (annotation) {
                        return String(annotation.createBy) === String(participant._id);
                    });

                    // comments
                    participant.comments = _.filter(questionAnnotation, function (annotation) {
                        return String(annotation.createBy) === String(participant._id) && annotation.comment && annotation.comment.length > 0;
                    });

                    if (tracks) {
                        // tracks
                        participant.tracks = _.filter(tracks, function (tracking) {
                            return String(tracking.user) === String(participant._id);
                        });

                        participant.timeOnPage = 0;
                        _.every(participant.tracks, function (tracking) {
                            participant.timeOnPage += getDuration(tracking);
                        });

                        participant.timeOnPage = 0;
                        _.every(participant.tracks, function (tracking) {
                            participant.timeOnPage += getDuration(tracking);
                        });
                        delete participant.tracks;
                    }
                });

                serviceLogger.info('>> getParticipantBreakdownForQuestion(), returning participants');
                deferred.resolve(participants);
            }

        });
    }
    else {
        serviceLogger.info('>> getParticipantBreakdownForQuestion(), returning empty array');
        deferred.resolve([]);
    }

    return deferred.promise;
}

/**
 * Gets the breakdown per participant
 *
 * @param {object} task
 * @param {object} studyDetails
 * @returns Promise
 */
function getParticipantBreakdownForTask(task, studyDetails) {
    serviceLogger.info({
        projectId: task.projectId,
        studyId: studyDetails._id,
        questionId: task._id
    }, '>> getParticipantBreakdownForTask()');
    var deferred = q.defer();
    var taskId = task._id;

    Tracking.find({
        projectId: studyDetails.projectId,
        studyId: studyDetails._id,
        questionId: taskId
    }).lean().exec(function (err, trackings) {
        if (err) {
            serviceLogger.info('>> getParticipantBreakdownForTask(), returning error ' + err);
            deferred.reject(err);
        }

        var navigationTrackings = _.filter(trackings, function (tracking) {
            return tracking.eventType === 'navigation';
        });

        var userGroup = _.groupBy(studyDetails.participants, '_id');
        var userNavTrackings = _.groupBy(navigationTrackings, 'user');
        var aggregatedTrackings = [];
        _.each(userNavTrackings, function (userTrackings) {
            var participant;
            var duration;
            if (userTrackings.length > 1) {
                participant =
                    _.reduce(userTrackings, function (result, currentTrack) {
                        var taskResult = getParticipantTaskStatus(studyDetails.answers, currentTrack.questionId, userGroup[currentTrack.user][0]._id);
                        var res = {};
                        res._id = userGroup[currentTrack.user][0]._id;
                        res.result = taskResult;
                        res.totalDuration = 0;
                        res.totalAnnotations = 0;
                        res.totalComments = 0;

                        return res;
                    });
                var taskObj = {};
                var pageCount = 0;

                var relevantAnnotations = filterAnnotationsByUser(studyDetails.annotations, participant._id);
                var relevantComments = filterAnnotationsWithComments(relevantAnnotations);

                participant.totalAnnotations += relevantAnnotations.length;
                participant.totalComments += relevantComments.length;

                _.each(userTrackings, function (tracking) {
                    duration = getDuration(tracking);
                    var trackingKey = tracking.pageUrl;
                    if (tracking.context) {
                            // if it's a smart app and the page contains brackets (where the entity id is found), use the baseURI -> ( as the url
                            trackingKey = tracking.pageUrl.split('(')[0];

                    }

                    var trackingAnnotationCount = getNumberOfAnnotationsForUrl(relevantAnnotations, tracking);
                    var trackingCommentCount = getNumberOfComments(relevantComments, tracking);

                    if (!taskObj[trackingKey]) {
                        taskObj[trackingKey] = {
                            pages: (pageCount + 1) + '(x' + getVisitsForTaskUrl(userTrackings, trackingKey, task) + ')',
                            duration: duration,
                            annotation: trackingAnnotationCount,
                            comments: trackingCommentCount
                        };
                        pageCount++;
                    }
                    else {
                        taskObj[trackingKey].duration += duration;
                    }
                    participant.totalDuration += duration;
                });
                var tasks = [];
                _.each(taskObj, function (oTask) {
                    tasks.push(oTask);
                });
                participant.totalPagesVisited = pageCount;
                participant.tasks = tasks;
                aggregatedTrackings.push(participant);
            }
            else if (userTrackings.length === 1) {
                duration = Math.floor((userTrackings[0].stats.updated_at - userTrackings[0].stats.created_at) / 1000) || 0;
                var totalAnnotations = _.filter(studyDetails.annotations, function (annotation) {
                    return annotation.url === userTrackings[0].pathName && annotation.createBy.equals(userTrackings[0].user);
                }).length;
                var totalComments = _.filter(studyDetails.annotations, function (annotation) {
                    return annotation.url === userTrackings[0].pathName && annotation.createBy.equals(userTrackings[0].user) && annotation.comment && annotation.comment.length > 0;

                }).length;

                participant = {
                    _id: userGroup[userTrackings[0].user][0]._id,
                    result: getParticipantTaskStatus(studyDetails.answers, userTrackings[0].questionId, userGroup[userTrackings[0].user][0]._id),
                    totalDuration: duration,
                    totalPagesVisited: 1,
                    totalAnnotations: totalAnnotations,
                    totalComments: totalComments,
                    tasks: [{
                        pages: 1 + '(x' + getVisitsForTaskUrl(userTrackings, userTrackings[0].pageUrl, task) + ')',
                        duration: duration,
                        annotation: totalAnnotations,
                        comments: totalComments
                    }]
                };
                aggregatedTrackings.push(participant);
            }
        });
        serviceLogger.info('>> getParticipantBreakdownForTask(), returning trackings');
        deferred.resolve(aggregatedTrackings);
    });

    return deferred.promise;
}


/**
 *  gets the Study duration breakdown
 *
 * @param {string} studyId
 * @returns Promise - JSON Object with average, fastest and slowest
 */
function getStudyDurationBreakdown(studyId) {
    serviceLogger.info({
        id: studyId
    }, '>> getStudyDurationBreakdown()');

    var deferred = q.defer();

    Tracking.find({
        studyId: studyId
    }).lean().exec(function (err, trackings) {
        if (err) {
            serviceLogger.warn('<< getStudyDurationBreakdown(), returning err, ' + err);
            deferred.reject(err);
        }

        var trackingsByUser = _.groupBy(trackings, 'user');
        var breakdown = {};
        _.each(trackingsByUser, function (trackingByUser) {

            var time = 0;
            _.each(trackingByUser, function (userTracking) {
                time += getDuration(userTracking);
            });
            breakdown[trackingByUser[0].user] = {
                timeInStudy: time
            };

        });
        serviceLogger.info('<< getStudyDurationBreakdown(), returning breakdown');
        deferred.resolve({
            breakdown: breakdown,
            averageTimeInStudy: calculateAverage(breakdown, 'timeInStudy')
        });
    });
    return deferred.promise;
}


/**
 * Gets the Study breakdown: annotations, comments, answers, tasks completed
 *
 * @param {string} studyId
 * @returns Promise - JSON Object with average, fastest and slowest
 */
function getStudyBreakdown(studyId) {
    serviceLogger.info({
        id: studyId
    }, '>> getStudyBreakdown()');

    var deferred = q.defer();

    Study.findOne({
        _id: studyId
    })
        .lean()
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< getStudyBreakdown(), returning error, ' + err);
                deferred.reject(err);
            }
            else if (!study) {
                serviceLogger.warn('<< getStudyBreakdown(), no study found');
                deferred.reject(null);
            }
            else {
                var breakdown = {};

                var comments = _.filter(study.annotations, function (annotation) {
                    return annotation.comment && annotation.comment.length > 0;
                });
                // Dev-note: filter by Task states i.e. incomplete/completed. Aborted/in-progress will not be included here
                var completedTasks = _.filter(study.answers, function (answer) {
                    return answer.questionType === 'Task' && [taskStates.COMPLETED_CORRECTLY, taskStates.COMPLETED_INCORRECTLY].indexOf(answer.status) > -1;
                });

                var answers = _.filter(study.answers, function (n) {
                    return n.questionType !== 'Task';
                });

                var annotationsCounts = _.countBy(study.annotations, 'createBy');
                var commentsCounts = _.countBy(comments, 'createBy');
                var completedTasksCounts = _.countBy(completedTasks, 'stats.created_by');

                _.each(study.participants, function (user) {
                    // Dev-note: Calculate the answers by taking also annotations into account
                    var answered = [];
                    var userAnswers = _.filter(answers, function (answer) {
                        return String(answer.stats.created_by) === String(user._id);
                    });
                    var userAnnotations = _.filter(study.annotations, function (annotation) {
                        return String(annotation.createBy) === String(user._id);
                    });
                    _.each(userAnswers, function (answer) {
                        answered.push(String(answer.questionId));
                    });
                    _.each(userAnnotations, function (annotation) {
                        answered.push(String(annotation.questionId));
                    });
                    answered = _.unique(answered);

                    breakdown[user._id] = {
                        comments: commentsCounts[user._id] || 0,
                        annotations: annotationsCounts[user._id] || 0,
                        answers: answered.length,
                        completedTasks: completedTasksCounts[user._id] || 0,
                        studyStarted: user.created_at
                    };
                });

                serviceLogger.info('<< getStudyBreakdown(), returning breakdown');
                deferred.resolve({
                    breakdown: breakdown,
                    averageAnnotations: roundAvg(calculateAverage(breakdown, 'annotations')),
                    averageComments: roundAvg(calculateAverage(breakdown, 'comments')),
                    averageAnswers: roundAvg(calculateAverage(breakdown, 'answers')),
                    averageCompletedTasks: roundAvg(calculateAverage(breakdown, 'completedTasks')),
                    study: study
                });
            }
        });
    return deferred.promise;
}

/**
 * Round numbers to one decimal place.
 *
 * @param {number} num
 * @returns number
 */
function roundAvg(num) {
    return Math.round(num * 10) / 10;
}
/**
 * Get the time for a tracking entry in seconds
 *
 * @param {object} tracking
 * @returns number
 */
function getDuration(tracking) {
    var duration = 0;
    if (tracking.stats.updated_at && tracking.stats.created_at) {
        duration = Math.floor((tracking.stats.updated_at - tracking.stats.created_at) / 1000) || 0;
    }
    return duration;
}

/**
 * Get the total number of annotations for a tracking entry
 * @param {array} annotations
 * @param {object} trackingEntry
 * @returns Number
 */
function getNumberOfAnnotationsForUrl(annotations, trackingEntry) {
    return _.filter(annotations, function (annotation) {
        var trackingUrl = '';
        if (trackingEntry.hash) {
            trackingUrl = trackingEntry.pathName + trackingEntry.hash;
        }
        else {
            trackingUrl = trackingEntry.pathName;
        }

        return annotation.url === trackingUrl && annotation.questionId.equals(trackingEntry.questionId);
    }).length;
}

/**
 * get the total number of comments for the annotations of a tracking entry
 * @param {array} annotations
 * @param {object} trackingEntry
 * @returns Number
 */
function getNumberOfComments(annotations, trackingEntry) {
    return _.filter(annotations, function (annotation) {
        var trackingUrl = '';
        if (trackingEntry.hash) {
            trackingUrl = trackingEntry.pathName + trackingEntry.hash;
        }
        else {
            trackingUrl = trackingEntry.pathName;
        }

        return annotation.url === trackingUrl;
    }).length;
}

/**
 * get the status of a Task for a participant (completed correctly of incorrectly)
 *
 * @param {array} answers
 * @param {string} questionId
 * @param {string} userId
 * @returns String
 */
function getParticipantTaskStatus(answers, questionId, userId) {
    var ansArr = _.filter(answers, function (ans) {
        return ans.questionId.equals(questionId) && ans.stats.created_by.equals(userId);
    });

    if (ansArr.length && ansArr.length >= 0) {
        return ansArr[0].status;
    }
}

/**
 * get the total number of tracking occurances for a page url
 *
 * @param {Array} trackings - The array of trackings that needs to be filtered against
 * @param {string} pageUrl - The string representing the url that has been visited
 * @param {task} task - The task object
 * @returns Number
 */
function getVisitsForTaskUrl(trackings, pageUrl, task) {
    return _.filter(trackings, function (track) {
            if (track.context && track.context.entity) {
                return (track.pathName + '#/' + track.context.entity === pageUrl) && (track.questionId.toString() === task._id.toString());
            }
            return (track.pageUrl === pageUrl) && (track.questionId.toString() === task._id.toString());

        }).length || 0;
}

/**
 * calculate the average of an array of numbers or objects
 *
 * @param {array} items - array of numbers or objects from wich the average will be calculated
 * @param property of the object to use for the calculation
 * @returns Number
 */
function calculateAverage(items, property) {
    if (property) {
        items = _.map(items, _.property(property));
    }
    var sum = _.reduce(items, function (s, n) {
        return s + n;
    });
    return sum / items.length || 0;
}

/**
 * Get the answers for multi choice questions.
 *
 * @param {array} aAnswers - list of indices of the options selected.
 * @param {array} aChoices - The list of possible options
 * @returns {array} answers - array of strings containing the actuall answers
 */
function getAnswerTextForMultiChoice(aAnswers, aChoices) {
    var answers = new Array(aAnswers.length);
    for (var i = 0, len = aAnswers.length; i < len; i++) {
        answers[aAnswers[i]] = aChoices[aAnswers[i]];
    }
    return answers;
}

/**
 * Filter array of annotations by user.
 *
 * @param {array} annotations - list of annotations of a study
 * @param {object} userId - id of a user
 * @returns {array} of annotations
 */
function filterAnnotationsByUser(annotations, userId) {
    return _.filter(annotations, function (annotation) {
        return String(annotation.createBy) === String(userId);
    });
}

/**
 * Filter array of annotations by comment.
 *
 * @param {array} annotations - list of annotations of a study
 * @returns {array} of annotations that have a comment
 */
function filterAnnotationsWithComments(annotations) {
    return _.filter(annotations, function (annotation) {
        return annotation.comment && annotation.comment.length > 0;
    });
}

exports.getAnnotationsForQuestion = getAnnotationsForQuestion;
exports.logError = logError;
exports.getStudyOverviewStats = getStudyOverviewStats;
exports.getStudyAndOverviewStats = getStudyAndOverviewStats;
exports.getIndividualQuestionsWithStats = getIndividualQuestionsWithStats;
exports.getIndividualQuestionWithStats = getIndividualQuestionWithStats;
exports.getQuestionAnswers = getQuestionAnswers;
exports.getTotalPercentageStats = getTotalPercentageStats;
exports.getChoiceStats = getChoiceStats;
exports.getStudyTasksOverview = getStudyTasksOverview;
exports.getTaskStats = getTaskStats;
exports.getNumberOfParticipants = getNumberOfParticipants;
exports.getStudyDurationBreakdown = getStudyDurationBreakdown;
exports.getStudyBreakdown = getStudyBreakdown;
