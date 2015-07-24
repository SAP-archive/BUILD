/*eslint no-unused-expressions: 0*/
'use strict';
var _ = require('norman-client-tp').lodash;
var moment = require('norman-client-tp').moment;
var answers = require('../answers.js');

// @ngInject
module.exports = function ($window, urUtil, $log, $scope, $state, $stateParams, $timeout, $location,
    $rootScope, currentStudy, Annotations, NavBarService, AsideFactory, Answers, Auth,
    uiPopupHelper, SENTIMENT, uiError, TrackingService) {

    $scope.scale = 1;
    $scope.lastPageViewId = $stateParams.lastPageViewId;
    $scope.displayWithEditBox = true;
    $scope.selectedChoice = null;
    $scope.currentAnnotation = null;
    $scope.study = currentStudy;
    $scope.study.questions = _.sortByAll($scope.study.questions, ['ordinal', 'subOrdinal'], [true, true]);
    $scope.stateParams = $stateParams;
    $scope.currentQuestionId = $stateParams.questionId;
    $scope.action = $stateParams.action || 'open'; // used for css animations;
    $scope.progress = $stateParams.progress || answers(currentStudy).progress;
    $scope.feedbackMode = true;
    $scope.blockScroll = false;
    $scope.iframeLoc = null;
    $scope.urlSettings = {
        landingUrl: null,
        referrerUrl: null
    };
    $scope.defaultIframeSize = {
        width: 1280,
        height: 800
    };

    // by defining this we get away with images working as expected
    $scope.iFrameScroll = {
        scrollLeft: 0,
        scrollTop: 0
    };


    // show the busy indicator if, after one second, the prototype has not been loaded (this also allow the animation to be completed)
    $timeout(function () {
        if ($scope.showBusyIndicator !== false) {
            $scope.showBusyIndicator = true;
        }
    }, 1000);

    $scope.changeFeedbackMode = function (event) {
        if ($scope.feedbackMode) {
            $scope.feedbackMode = false;
        }
        else {
            $scope.feedbackMode = true;
            $scope.showCursor('side-cursor', event);
        }
    };

    // Track a pageView only when a question is loaded, Tasks are only tracked when the user selects 'start task' and the
    // status is 'in-progress'
    $scope.$watch('currentQuestionId', function () {
        // When the current question id changes, re-set the messaging events for the window.
        $scope.currentUrl = $scope.currentQuestion.url;
        if ($scope.currentQuestion.type && $scope.currentQuestion.type.toLowerCase() !== 'task') {
            var inputParams = {
                eventType: 'pageView'
            };
            if ($scope.lastPageViewId) {
                inputParams.closeTrackId = $scope.lastPageViewId;
                $scope.lastPageViewId = null;
            }
            trackEvent(inputParams, true, true);
        }
    });

    function getDefaultTrackingData() {
        // Default tracking info sent with all new requests
        var dateStr = moment.utc().toDate();
        var defaultData = {
            projectId: $scope.study.projectId,
            studyId: $scope.study._id,
            questionId: $scope.currentQuestionId,
            timezone: dateStr,
            offset: dateStr.getTimezoneOffset()
        };
        return defaultData;
    }

    /**
     * Function that calculates the position of an annotation with respect to current scroll bar
     * If it is a task, annotations will also be checked to see if still within iframe visibilty
     * @oaram annotation - the annotation we are positioning on the screen.
     */
    $scope.calculateAnnotationPosition = function (annotation) {

        annotation.positionX = (annotation.absoluteX + annotation.scrollLeft - $scope.iFrameScroll.scrollLeft) * $scope.scale;
        annotation.positionY = (annotation.absoluteY + annotation.scrollTop - $scope.iFrameScroll.scrollTop) * $scope.scale;

        // images annotations will always be visible
        if ($scope.currentQuestion.type && $scope.currentQuestion.type.toLowerCase() === 'task') {
            annotation.isVisible = annotation.positionX > 0 && annotation.positionX < $scope.defaultIframeSize.width
            && annotation.positionY > 0 && annotation.positionY < $scope.defaultIframeSize.height;
        }
    };

    // Close the PV tracking request, this is called from the directive when the user selects 'DONE' or 'Return to Study'
    $scope.resetPageViewTracking = function () {
        if ($scope.lastPageViewId) {
            trackEvent({
                _id: $scope.lastPageViewId
            }, true, false);
            $scope.lastPageViewId = null;
        }
    };

    $scope.resetNavigationTracking = function () {
        if ($scope.lastNavigationId) {
            trackEvent({
                _id: $scope.lastNavigationId
            }, false, false);
            $scope.lastNavigationId = null;
        }
    };

    // used to hide the scroll bar, needed because ui-popup on-close requires a function as input
    $scope.closeAnnotation = function () {
        // prevent nulling currentAnnotation when a new one is already assigned
        if ($scope.openingNewPopupBeforeClosingTheOldPopup) return;
        $scope.blockScroll = false;
        $scope.currentAnnotation = null;
    };

    // used to show the scroll bar, needed because ui-popup on-open requires a function as input
    $scope.lockScroll = function () {
        $scope.blockScroll = true;
    };

    $scope.showCursor = function (id, $event) {
        $timeout(function () {
            $scope.$broadcast('showCursorTooltip', {
                id: id,
                clientX: $event.clientX,
                clientY: $event.clientY
            });
        });
    };

    // Send navigation/click tracking request
    function trackEvent(eventData, isPageView, useDefaultData) {
        if ($scope.currentQuestion.snapshotUILang === 'UI5' && eventData.pageUrl) {
            eventData.context = urUtil.getContextFromUrl(eventData.pageUrl, $scope.currentQuestion.snapshotUILang);
        }
        eventData = _.isEmpty(eventData) ? {} : eventData;
        isPageView = _.isUndefined(isPageView) ? false : isPageView;
        useDefaultData = _.isUndefined(useDefaultData) ? true : useDefaultData;
        var inputParams = _.merge(eventData, useDefaultData ? getDefaultTrackingData() : {});
        // Dont do anything to existing values if the eventType is a click tracker or user is selecting done/abandon
        var updateScope = useDefaultData && (inputParams.eventType && inputParams.eventType.toLowerCase() !== 'iframeclick');
        // Only track if study has a status of 'published'
        if ($scope.study.status.toLowerCase() === 'published') {
            TrackingService.save(inputParams).$promise
                .then(function (data) {
                    if (updateScope) {
                        isPageView ? $scope.lastPageViewId = data._id : $scope.lastNavigationId = data._id;
                    }
                }).catch(function () {
                    isPageView ? $scope.lastPageViewId = null : $scope.lastNavigationId = null;
                });
        }
    }

    function initAnnotations(currentQuestionId) {
        if (currentQuestionId) {
            $scope.currentQuestionId = currentQuestionId;
            $scope.currentQuestion = _.filter($scope.study.questions, function (q) {
                return q._id === currentQuestionId;
            })[0];
            $scope.currentUrl = $scope.currentQuestion.url;

            $scope.currentAnswer = $scope.study.answers.filter(function (q) {
                return q.questionId === currentQuestionId;
            })[0];

            if ($scope.currentAnswer && $scope.currentQuestion.type === 'Freeform') {
                setUserName($scope.currentAnswer.stats.created_by, $scope.currentAnswer);
                $scope.currentAnswer.createTime = $scope.currentAnswer.stats.created_at;
            }
            else if (!$scope.currentAnswer) { // need currentAnswer for sentimentManager to work
                $scope.currentAnswer = {};
            }

            $scope.participantUrl = '/api/participant/' + $scope.study._id + '/document/' + $scope.currentQuestion.documentId + '/' + $scope.currentQuestion.documentVersion + '/render';
            $scope.currentIndex = $scope.study.questions.indexOf($scope.currentQuestion);
            $scope.isLastQuestion = ($scope.currentIndex >= $scope.study.questions.length - 1);
            $scope.isFirstQuestion = ($scope.currentIndex === 0);

            if ($scope.currentQuestion.type === 'MultipleChoice' && $scope.currentAnswer) {
                if ($scope.currentQuestion.allowMultipleAnswers) {
                    if ($scope.currentAnswer.answer) {
                        $scope.selectedChoice = [];
                        // currentAnswer.answer is a comma separated string of indices, we only split it if there is at least 1 comma
                        if ($scope.currentAnswer.answer.indexOf(',') > -1) {
                            $scope.selectedChoice = $scope.currentAnswer.answer.split(',');
                        }
                        else {
                            $scope.selectedChoice.push($scope.currentAnswer.answer);
                        }
                    }
                    else {
                        $scope.selectedChoice = [];
                    }
                }
                else {
                    $scope.selectedChoice = $scope.currentAnswer.answer;
                }
            }
        }

        $scope.annotations = $scope.study.annotations.filter(function (a) {
            if (a.url === $scope.currentUrl && a.questionId === $scope.currentQuestionId) {
                a.isVisible = true; // true by default
                $scope.calculateAnnotationPosition(a);
                setUserName(a.createBy, a);
                return a;
            }
        });

        /**
         * Show dialog with task mission if this question is a new task.
         */
        if ($scope.currentQuestion.type === 'Task') {
            $scope.feedbackMode = false;

            // sets the task number to show the user - assumes array is already sorted by ordinal (done on publish)
            $scope.taskNumber = 1 + _.findIndex(_.filter($scope.study.questions, {
                type: 'Task'
            }), function (task) {
                return task._id === $scope.currentQuestionId;
            });

            if (!$scope.currentAnswer || !$scope.currentAnswer.status || $scope.currentAnswer.status === 'not started') {
                $timeout(function () {
                    $scope.$broadcast('dialog-open', 'task-mission-dialog');
                });
            }
        }
        else {
            // hide the busy indicator as there is not a protorype to load
            $scope.showBusyIndicator = false;
        }
    }

    if (currentStudy.$promise) {
        currentStudy.$promise.then(function () {
            // if a study is closed redirect back to message
            if (currentStudy.studyStatus === 'closed') {
                $state.go('shell.project.UserResearch.participant.list', $scope.stateParams);
                return;
            }
            $scope.studyActive = true;
            initAnnotations($scope.currentQuestionId);
        });
    }
    else {
        initAnnotations($scope.currentQuestionId);
    }

    // Annotations add, update and delete
    $scope.add = function (event) {
        if (!$scope.allowedToDropAnnotations()) return;
        // we need to store this as the annotation setting is done in the iFrameMessage handler
        var relativeUrl = urUtil.getRelativeURI($scope.currentUrl, true);

        // set scrollTop and scrollLeft to 0
        // for images.
        var newAnnotation = {
            questionId: $scope.currentQuestionId,
            absoluteX: event.offsetX / $scope.scale,
            absoluteY: event.offsetY / $scope.scale,
            sentiment: SENTIMENT.NONE,
            url: relativeUrl.pathname + relativeUrl.hash,
            pathName: relativeUrl.pathname,
            hash: relativeUrl.hash,
            scrollTop: $scope.iFrameScroll.scrollTop, // this should always be 0 for images.
            scrollLeft: $scope.iFrameScroll.scrollLeft // this should always be 0 for images
        };

        $scope.calculateAnnotationPosition(newAnnotation);

        newAnnotation.context = urUtil.getContextFromUrl(newAnnotation.url, $scope.currentQuestion.snapshotUILang);
        newAnnotation.isVisible = true;
        newAnnotation.promise = Annotations.save(_.clone(newAnnotation)).$promise;
        newAnnotation.promise.then(function (saved) {
            newAnnotation._id = saved._id;
            newAnnotation.createTime = saved.createTime;
            setUserName(saved.createBy, newAnnotation);
            $scope.progress = answers(currentStudy).progress;
        });
        // Set a temporary id, required to bind the annotation to a popup
        newAnnotation._id = Date.now().toString();
        $scope.study.annotations.push(newAnnotation);
        $scope.annotations.push(newAnnotation);
        $scope.displayWithEditBox = true;

        $scope.blockScroll = true;
        $scope.currentAnnotation = newAnnotation;

        // ignore closeAnnotation function temporarily
        $scope.openingNewPopupBeforeClosingTheOldPopup = true;
        $timeout(function () {
            $scope.$broadcast('popup-open', {
                id: 'currentAnnotation',
                elem: angular.element(document.getElementById('annotation-' + newAnnotation._id))
            });
            $timeout(function () {
                // unignore closeAnnotation once we have a new popup opened
                $scope.openingNewPopupBeforeClosingTheOldPopup = false;
            }, 300);
        });
    };

    $scope.update = function (annotation, afterDrag) {
        if (annotation.promise) {
            annotation.promise.then(function () {
                annotation.promise = Annotations.update(annotation).$promise;
            });
        }
        else {
            annotation.promise = Annotations.update(annotation).$promise;
        }

        if (!afterDrag && annotation.comment) {
            $timeout(function () {
                uiPopupHelper.recalculate('currentAnnotation');
            });
            $scope.displayWithEditBox = false;
        }
        else {
            $scope.$broadcast('popup-close', {
                id: 'currentAnnotation'
            });
        }
    };

    $scope.delete = function (annotation) {
        if (annotation.promise) {
            annotation.promise.then(function () {
                Annotations.delete({
                    id: annotation._id
                });
            });
        }
        else {
            Annotations.delete({
                id: annotation._id
            });
        }
        $scope.study.annotations.splice($scope.study.annotations.indexOf(annotation), 1);
        $scope.annotations.splice($scope.annotations.indexOf(annotation), 1);
        $scope.progress = answers(currentStudy).progress;
        $scope.$broadcast('popup-close', {id: 'currentAnnotation'});
    };


    // Drag and drop of annotations
    $scope.drag = function (event) {
        if ($scope.draggingAnnotation) {
            $scope.isDragging = true;
            $scope.draggingAnnotation.absoluteX = event.offsetX / $scope.scale;
            $scope.draggingAnnotation.absoluteY = event.offsetY / $scope.scale;

            $scope.calculateAnnotationPosition($scope.draggingAnnotation);
        }
    };

    $scope.startDrag = function (annotation) {
        $scope.draggingAnnotation = annotation;
    };

    $scope.stopDrag = function () {
        if ($scope.isDragging) {
            $scope.update($scope.draggingAnnotation, true);
            $scope.isDragging = false;
        }
        else {
            $scope.setAnnotationAndOpen($scope.draggingAnnotation);
        }
        $scope.draggingAnnotation = null;

    };


    // Navigation between screens
    $scope.next = function () {
        $scope.action = 'next';
        $timeout(function () {
            $scope.saveFreeform();
            $scope.resetPageViewTracking();
            $state.go($state.current.name, {
                questionId: $scope.study.questions[$scope.currentIndex + 1]._id,
                study: $scope.study,
                action: $scope.action,
                lastPageViewId: $scope.lastPageViewId
            });
        });
    };

    $scope.previous = function () {
        $scope.action = 'previous';
        $timeout(function () {
            $scope.saveFreeform();
            $scope.resetPageViewTracking();
            $state.go($state.current.name, {
                questionId: $scope.study.questions[$scope.currentIndex - 1]._id,
                study: $scope.study,
                action: $scope.action,
                lastPageViewId: $scope.lastPageViewId
            });
        });
    };

    $scope.returnToStudy = function () {
        if ($scope.currentAnswer.status === 'in progress') {
            $scope.abandon(true);
        }
        else {
            $scope.goToList();
        }
    };

    $scope.goToList = function () {
        $scope.action = 'close';
        $scope.blockScroll = true;
        $timeout(function () {
            $state.go('^.list', {
                study: $scope.study
            });
        });
    };

    $scope.endTask = function (finished) {
        $scope.resetNavigationTracking();

        var status;
        $scope.currentAnswer.answer = $scope.iframeLoc;
        if (finished === true) { // Task completed
            if ($scope.currentQuestion.targetURL.length === 0) {
                status = 'completed correctly';
            }
            else {
                var acceptableAnswer = $scope.currentQuestion.targetURL.filter(function (ans) {
                    // check if target url contains a hash, if not ignore any hash in current answer
                    if (ans.indexOf('#') > -1) {
                        return ans === $scope.currentAnswer.answer;
                    }
                    return ans === $scope.currentAnswer.answer.split('#')[0];
                });
                if (acceptableAnswer.length > 0) {
                    status = 'completed correctly';
                }
                else {
                    status = 'completed incorrectly';
                }
            }
        }
        else { // Abandoned
            status = 'aborted';
        }
        $scope.currentAnswer.status = status;
        $scope.addOrUpdateAnswer($scope.currentAnswer);
        if (finished === false && $scope.abandonThenLeave === true) {
            $scope.goToList();
        }
    };

    $scope.$on('goToQuestionIndex', function (event, data) {
        if (data) {
            if ($scope.currentIndex > data.index) {
                $scope.action = 'previous';
            }
            else {
                $scope.action = 'next';
            }
            $timeout(function () {
                $state.go($state.current.name, {
                    questionId: data.questionId,
                    study: $scope.study,
                    action: $scope.action,
                    lastPageViewId: $scope.lastPageViewId,
                    lastNavigationId: $scope.lastNavigationId
                });
            });
        }
    });

    $scope.onImageResize = function (scale) {
        $scope.scale = scale;
        _.forEach($scope.annotations, function (annotation) {
            $scope.calculateAnnotationPosition(annotation);
        });
    };

    /**
     * Handle user moving between pages
     * - if user lands on default landing page, then referrer will be empty
     * - if user moves to another prototype page, referrer will be previous page and landingURl will be the new landing page
     * - the lastNavigationId is sent to the user as well, this will set the end-date for the previous page loaded
     * - eventTypes for prototype navigation are tagged as 'navigation', while eventTypes for Questions are tagged as 'pageViews'
     *
     * @param location
     */
    function navigationTracking(locationStr) {
        // Only fire event if the status of the answer is in progress, all other values are ignored
        if ($scope.currentAnswer.status && $scope.currentAnswer.status.toLowerCase() === 'in progress') {
            // First time user lands on page then both of these will be empty so referrer will not be set for landing page
            $scope.urlSettings.referrerUrl = $scope.urlSettings.landingUrl;
            $scope.urlSettings.landingUrl = locationStr;
            var parsedURI = urUtil.getRelativeURI(locationStr, true);
            var landingPath = parsedURI.pathname || '';
            var landingHash = parsedURI.hash || '';

            // prevent navigation tracking from logging when url is not changing
            // e.g. for a reload
            if ($scope.urlSettings.referrerUrl === $scope.urlSettings.landingUrl) {
                return;
            }

            var inputParams = {
                eventType: 'navigation',
                referrer: $scope.urlSettings.referrerUrl,
                pageUrl: $scope.urlSettings.landingUrl,
                pathName: landingPath,
                hash: landingHash
            };

            inputParams.context = urUtil.getContextFromUrl(inputParams.pageUrl, $scope.currentQuestion.snapshotUILang);

            // When moving from Page A to Page B, need to close Page A, the server takes care of this if its passed in
            if ($scope.lastNavigationId) {
                inputParams.closeTrackId = $scope.lastNavigationId;
            }

            trackEvent(inputParams, false, true);
        }
    }

    /**
     *  Store the initial lenght of the page history.
     *  This value is used in the iframe to determine wheter it can go back or not
     *  as the history object is shared between main window and iframe
     */
    var historyLength = window.history.length;

    /**
     * Sets up the messaging events that the controller needs to listen to from the
     */
    $scope.handleMessage = function (event) {
        if (urUtil.verifyIframe('prototype-iframe', event) === true) {
            if (event.data.type === 'iframeOnload') {
                var location = event.data.location || event.data.newLocation;
                $scope.iframeLoc = urUtil.getRelativeURI(location);

                // Fire new request to track prototype page being loaded
                $scope.currentUrl = $scope.iframeLoc;
                navigationTracking($scope.currentUrl);
                initAnnotations();
                _.forEach($scope.annotations, function (annotation) {
                    $scope.calculateAnnotationPosition(annotation);
                });

                $scope.$apply();

                $scope.$broadcast('send-iframe-message', {
                    iframeId: 'prototype-iframe',
                    iframeMessage: {
                        type: 'historyLength',
                        value: historyLength
                    }
                });
            }
            else if (event.data.type === 'iframeHashchange') {
                $scope.currentUrl = urUtil.getRelativeURI(event.data.newLocation);
                event.data.hash = $scope.currentUrl.hash;
                navigationTracking($scope.currentUrl);

                initAnnotations();
                $scope.$apply();
            }
            else if (event.data.type === 'pageSize') {
                $scope.showBusyIndicator = false;
                $scope.$apply();
            }
            else if (event.data.type === 'iframeError') {
                $log.info('Error in iframe: ', event.data.errorMsg);
            }
            else if (event.data.type === 'iframeClick') {
                // remove the UI message type before saving the object
                delete event.data.type;
                event.data.eventType = 'iframeClick';
                var relativeUrl = urUtil.getRelativeURI(event.data.pageUrl, true);
                event.data.pathName = relativeUrl.pathname;
                event.data.hash = relativeUrl.hash;
                // save tracking information, don't care about tracking ID here as its a fire and forget for a click
                trackEvent(event.data, false, true);
            }
            else if (event.data.type === 'beforeUnload') {
                $scope.showBusyIndicator = true;
            }
            else if (event.data.type === 'iFrameScroll') {
                 $scope.iFrameScroll = event.data.scrollDimensions;
                 _.forEach($scope.annotations, function (annotation) {
                    $scope.calculateAnnotationPosition(annotation);
                     $scope.$apply();
                });
            }
            else {
                $log.info('Unknown message: ', event.data.type);
            }

        }
        else {
            $log.info('Unknown origin: ', event.origin);
        }
    };

    $scope.setAnnotationAndOpen = function (annotation) {
        if ($scope.currentAnnotation !== null) {
            // We're coming from another open popup so we need to hide the old text
            $scope.currentAnnotation = null;
        }
        else {
            $scope.currentAnnotation = annotation;
        }

        // default to display with edit box - if comment show
        // without
        $scope.displayWithEditBox = true;
        if (annotation.comment) {
            $scope.displayWithEditBox = false;
        }

        $timeout(function () {
            $scope.$broadcast('popup-open', {
                id: 'currentAnnotation',
                elem: angular.element(document.getElementById('annotation-' + annotation._id))
            });
        });
        // If the currentAnnotation is null then it means we're transiting from one annotation to another
        // We wait for the old popup to close before adding the new text
        if ($scope.currentAnnotation === null) {
            $timeout(function () {
                $scope.currentAnnotation = annotation;
            }, 300);
        }
    };

    /**
     * checks if the max number of annotations dropped has been reached
     */
    $scope.allowedToDropAnnotations = function () {
        return !($scope.currentQuestion.answerIsLimited === true && typeof $scope.currentQuestion.answerLimit !== 'undefined' && $scope.currentQuestion.answerLimit === $scope.annotations.length);
    };

    $scope.addOrUpdateAnswer = function (currentAnswer) {
        var newAnswer = {
            questionId: $scope.currentQuestionId,
            answer: currentAnswer.answer,
            sentiment: currentAnswer.sentiment || SENTIMENT.NONE,
            questionType: $scope.currentQuestion.type
        };
        if (currentAnswer.status) {
            newAnswer.status = currentAnswer.status;
        }
        if (currentAnswer && currentAnswer.answer) {
            Answers.save(newAnswer).$promise.then(function (saved) {
                $scope.currentAnswer = saved;
                if (!currentAnswer._id) {
                    $scope.study.answers.push(saved);
                }
                $scope.currentAnswer.isEditing = false;
                setUserName($scope.currentAnswer.stats.created_by, $scope.currentAnswer);
                $scope.currentAnswer.createTime = $scope.currentAnswer.stats.created_at;
            });
        }
    };

    $scope.deleteAnswer = function (currentAnswer) {
        if (currentAnswer && currentAnswer._id) {
            Answers.delete({
                id: currentAnswer._id
            }).$promise.then(function () {
                    _.remove($scope.study.answers, {
                        _id: currentAnswer._id
                    });
                    $scope.currentAnswer = {};
                });
        }
    };

    $scope.startEdit = function () {
        $scope.displayWithEditBox = true;
        $timeout(function () {
            uiPopupHelper.recalculate('currentAnnotation');
        });
    };

    // Checks if the choice exists in the selectedChoice - used to determine if UI need to select
    $scope.isMultipleChoiceSelected = function (choice) {
        if ($scope.selectedChoice) {
            var choiceIndex = $scope.selectedChoice.indexOf(choice.toString());
            if (choiceIndex > -1) {
                return true;
            }
            return false;
        }
        return false;
    };

    // updates the multiple choice answers (including both adding and removing as well as multiple answers)
    $scope.updateMultipleChoice = function (choice) {
        var answer = {
            questionId: $scope.currentQuestionId,
            sentiment: SENTIMENT.NONE,
            questionType: $scope.currentQuestion.type
        };
        if ($scope.currentQuestion.allowMultipleAnswers) {
            var choiceIndex = $scope.selectedChoice.indexOf(choice.toString());
            // if choice is not in SelectedChoice array then add
            if (choiceIndex === -1) {
                $scope.selectedChoice.push(choice.toString());
            }
            else {
                // remove choice if already in SelectedChoice array - for deselect
                $scope.selectedChoice.splice(choiceIndex, 1);

            }
            answer.answer = $scope.selectedChoice;
        }
        else {
            if (choice === $scope.selectedChoice) {
                // This is already the saved choice, don't update it.
                return;
            }
            answer.answer = choice.toString();
            $scope.selectedChoice = choice;
        }
        Answers.save(answer).$promise.then(function (saved) {
            if ($scope.currentAnswer && $scope.currentAnswer.answer !== undefined) {
                $scope.currentAnswer.answer = saved.answer;
            }
            else {
                $scope.currentAnswer = answer;
                $scope.currentAnswer.answer = saved.answer;
                answer._id = saved._id;
                $scope.study.answers.push(answer);
            }
        });
    };

    $scope.startEditFreeForm = function () {
        $scope.currentAnswer.isEditing = true;
    };

    function setUserName(userId, obj) {
        // this should go in auth module inside getCurrentUser
        if (!Auth.getCurrentUser().name) {
            Auth.initCurrentUser();
        }
        Auth.getCurrentUser().$promise
            .then(function (data) {
                obj.createdName = data.name;
                obj.avatar_url = data.avatar_url;
            })
            .catch(function (error) {
                var err;
                if (error && error.data && error.data.error) err = error.data.error;
                else err = 'Unable to retrieve user information';

                uiError.create({
                    content: err,
                    dismissOnTimeout: false
                });
            });
    }

    /**
     * Function to initiate a task.
     * Should set status for this task to be started.
     */
    $scope.startTask = function () {

        var answer = {
            questionId: $scope.currentQuestionId,
            status: 'in progress',
            questionType: 'Task'
        };

        // save answer, update client with result or init new answer
        Answers.save(answer).$promise.then(function (saved) {
            if ($scope.currentAnswer && $scope.currentAnswer.status) {
                $scope.currentAnswer.status = saved.status;
            }
            else {
                $scope.currentAnswer = answer;
                $scope.currentAnswer.status = saved.status;
                answer._id = saved._id;
                $scope.study.answers.push(answer);
            }
            navigationTracking($scope.iframeLoc);
        }).catch(function (error) {
            uiError.create({
                content: error.data.error,
                dismissOnTimeout: false
            });
        });
    };

    // Save freeform answer if it has not been closed
    $scope.saveFreeform = function () {
        if ($scope.currentQuestion.type === 'Freeform' && ($scope.currentAnswer.isEditing === true || !$scope.currentAnswer._id)) {
            $scope.addOrUpdateAnswer($scope.currentAnswer);
            $scope.currentAnswer.isEditing = false;
        }
    };

    $scope.abandon = function (andLeave) {
        if ($scope.feedbackMode) {
            return;
        }
        $scope.abandonThenLeave = andLeave;
        $scope.$broadcast('dialog-open', 'abandon-dialog');
    };

    // Don't continue to ask the user to do things they've already completed
    $scope.showHelperText = function () {
        if (($scope.currentQuestion.type === 'Freeform' && $scope.currentAnswer.isEditing === false) ||
            ($scope.currentQuestion.type === 'MultipleChoice' && $scope.currentQuestion.allowMultipleAnswers === false && typeof $scope.selectedChoice !== 'undefined')) {
            return false;
        }
        return true;
    };
};
