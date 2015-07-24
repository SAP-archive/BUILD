'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($state, $stateParams, $scope, $rootScope, $window, $timeout, $log,
    currentStudy, SENTIMENT, NavBarService, AsideFactory, urUtil, Reviews, uiTabHelper, scrollToCommentApi) {

    $scope.scale = 1;

    $scope.svgContainer = {
        width: 1200,
        height: 600
    };

    $scope.sentimentChartColor = [
        '#2ECC71',
        '#677279',
        '#E74C3C'
    ];

    $scope.taskChartColor = [
        '#2ECC71',
        '#E74C3C',
        '#677279'
    ];

    $scope.selectedTab = 'results-tab';
    $scope.showBusyIndicator = true;

    $scope.heatmap = {
        data: {
            max: 0,
            data: []
        },
        opacity: 0.95,
        radius: 60,
        gradient: {
            0.4: '#4FB9FF',
            '.5': '#2ECC71',
            '.8': '#F1C40E',
            '.95': '#E74C3C'
        }
    };

    $scope.iFrameCurrentScroll = {
        scrollLeft: 0,
        scrollTop: 0
    };

    $scope.current_context = {
        entity: null,
        context_type: null,
        data: null
    };

    var initSentiment = function () {
        $scope.SENTIMENT = SENTIMENT; // need this to access sentiment in the template
        $scope.listOfFilters = [SENTIMENT.HAPPY, SENTIMENT.SAD, SENTIMENT.NEUTRAL, SENTIMENT.NONE];
        $scope.happyCheck = true;
        $scope.neutralCheck = true;
        $scope.sadCheck = true;
        $scope.noneCheck = true;
    };



    $scope.processData = function (data, url) {
        $scope.statistics = data.stats;

        if ($scope.question.interactive) {
            // this allows us to use the the url from the prototyp if passed in (allows us to take into account hashChanges)
            $scope.prototypeUrl = url || $scope.question.url;
            $scope.imageLoaded = true;
            $scope.containerName = 'interactive-container';
            // Retrieve the page names for the overview page.
            $scope.pages = data.stats.links;
            if ($scope.pages) {
                $scope.pages.forEach(function (page) {
                    page.fullName = page.name;
                    page.name = page.name.replace(/\.html$/, '');
                });
            }
        }

        if ($scope.question.type === 'MultipleChoice') {
            $scope.multiChoiceAnswers = data.stats.answers.choices;
            // we need the highest number of responses to mark colours correctly
            var temp = 0;
            var highestIndex = [];
            $scope.multiChoiceAnswers.forEach(function (answer, index) {
                if (temp < answer.total) {
                    temp = answer.total;
                    highestIndex = [index]; // wipe it out start fresh
                }
                else if (temp === answer.total) {
                    highestIndex.push(index);
                }
            });
            $scope.multiChoiceAnswers.forEach(function (answer, index) {
                if (_.contains(highestIndex, index)) {
                    answer.highest = true;
                }
            });
        }
    };


    $scope.initDetail = function (curStudy, curQuestionId) {
        initSentiment();
        $scope.filterItems = {
            list: [{
                text: 'All Annotations',
                sentiment: -1
            }, {
                text: 'Happy',
                sentiment: SENTIMENT.HAPPY
            }, {
                text: 'Indifferent',
                sentiment: SENTIMENT.NEUTRAL
            }, {
                text: 'Sad',
                sentiment: SENTIMENT.SAD
            }, {
                text: 'No Sentiment',
                sentiment: SENTIMENT.NONE
            }]
        };
        $scope.currentFilter = {
            list: $scope.filterItems.list[0]
        }; // filter for annotations
        $scope.currentAnswerFilter = {
            list: $scope.filterItems.list[0]
        };
        $scope.hideResults = true;
        $scope.study = curStudy;
        $scope.participantMap = {};
        $scope.currentSelected = $scope.currentSelected || null;
        // Setup map to be used when showing avatar for annotations {_id, name, avatar_url, email}
        $scope.study.participants.forEach(function (particiapant) {
            $scope.participantMap[particiapant._id] = particiapant;
        });

        $scope.imageLoaded = false;
        $scope.containerName = '';

        // Get the current Q, and the next and previous Q ids
        for (var i = 0; i < curStudy.questions.length; i++) {
            if (curStudy.questions[i]._id === curQuestionId) {
                $scope.question = curStudy.questions[i];
                $scope.questionIndex = i;
                // should show results tab header
                if ($scope.question.type === 'Freeform' || $scope.question.type === 'MultipleChoice') {
                    $scope.hideResults = false;
                }

                if (!$scope.wasHashchange) {
                    $scope.showBusyIndicator = $scope.question.type === 'Task';
                }
                else {
                    $scope.wasHashchange = false;
                }

                // init detail can be called when not changing question - stats don't need to be updated.
                if ($scope.statistics === undefined || $scope.statistics === null) {
                    Reviews
                        .getQuestionStats({
                            projectId: $scope.study.projectId,
                            id: $scope.study._id,
                            questionId: $scope.question._id
                        })
                        .$promise
                        .then($scope.processData);
                }

                $scope.$broadcast('updateQuestionImage', $scope.question.url);

                if (i === 0) {
                    $scope.prevQId = currentStudy.questions[currentStudy.questions.length - 1]._id;
                }
                else {
                    $scope.prevQId = currentStudy.questions[i - 1]._id;
                }

                if (i === curStudy.questions.length - 1) {
                    $scope.nextQId = curStudy.questions[0]._id;
                }
                else {
                    $scope.nextQId = curStudy.questions[i + 1]._id;
                }
                break;
            }
        }

        if (typeof $scope.showAnnotations === 'undefined') {
            $scope.showAnnotations = $scope.question.type !== 'Task';
        }

         $scope.qAnnotations = currentStudy.annotations ? currentStudy.annotations.filter(function (annotation) {
            if (annotation.questionId === $scope.question._id) {
                if (($scope.question.snapshotUILang === 'UI5') || ((!$scope.prototypeUrl || annotation.url === $scope.prototypeUrl))) {
                    if ($scope.question.snapshotUILang === 'UI5') {
                        $scope.current_context = urUtil.getContextFromUrl($scope.prototypeUrl || $scope.question.url);
                    }
                    updateAvatarDetails(annotation.createBy, annotation);
                    annotation.newAbsoluteX = annotation.absoluteX;
                    annotation.newAbsoluteY = annotation.absoluteY;
                    annotation.containerId = $scope.containerName;
                    return annotation;
                }
            }
        }) : [];

        if (!$scope.hideResults) {
            $scope.qAnswers = currentStudy.answers ? currentStudy.answers.filter(function (answer) {
                if (answer.questionId === $scope.question._id) {
                    if ($scope.question.type === 'Freeform') {
                        updateAvatarDetails(answer.stats.created_by, answer);
                        answer.createTime = answer.stats.created_at;
                    }
                    answer.containerId = $scope.containerName;
                    return answer;
                }
            }) : [];
        }

        $scope.selectedTab = $scope.hideResults ? 'comments-tab' : 'results-tab';
        $scope.noOfComments = $scope.qAnnotations.length;

    };

    if (currentStudy.$promise) {
        currentStudy.$promise.then(function () {
            $scope.initDetail(currentStudy, $stateParams.questionId);
        });
    }
    else {
        $scope.initDetail(currentStudy, $stateParams.questionId);
    }

    $scope.onImageResize = function (scale) {
        $scope.scale = scale;
        // refresh the laser pointer and scrolling after the resize animation is completed
        $timeout(function () {
            $scope.$broadcast('laser-render');
            $rootScope.$broadcast('fire-scroll');
        }, 300);
    };

    $scope.calculateAnnotationPosition = function (annotation) {
        var dimensions = $scope.iFrameCurrentScroll;
        annotation.positionX = (annotation.absoluteX + annotation.scrollLeft - dimensions.scrollLeft) * $scope.scale;
        annotation.positionY = (annotation.absoluteY + annotation.scrollTop - dimensions.scrollTop) * $scope.scale;

        // put in a check whether annotation is in view
        annotation.isVisible = annotation.positionX > 0 && annotation.positionX < 1280
                && annotation.positionY > 0 && annotation.positionY < 800;
    };


    $scope.getLeftPos = function (annotation) {
        // only tasks have iFrames
        return (annotation.absoluteX + annotation.scrollLeft - $scope.iFrameCurrentScroll.scrollLeft) * $scope.scale;
    };

    $scope.getTopPos = function (annotation) {
        // only tasks have iFrames
        return (annotation.absoluteY + annotation.scrollTop - $scope.iFrameCurrentScroll.scrollTop) * $scope.scale;
    };

    /**
     * Updates to the next/previous comment if the comments have currently been selected.
     * @param action the action to update to (either next or previous).
     */
    $scope.updateComment = function (action) {
        if (!$scope.currentSelected) {
            // if there isn't a currently selected comment, don't update the comment due to an arrow key update.
            return;
        }
        var filteredComments = $scope.qAnnotations.filter(function (q) {
            return q.sentiment === $scope.currentFilter.list.sentiment || $scope.currentFilter.list.sentiment === -1;
        });

        var currentlySelectedIndex = -1;
        for (var i = 0; i < filteredComments.length; i++) {
            if (filteredComments[i]._id === $scope.currentSelected._id) {
                currentlySelectedIndex = i;
                break;
            }
        }
        if (currentlySelectedIndex === -1) {
            return;
        }
        if (action === 'previous' && currentlySelectedIndex === 0) {
            // Cannot show previous comment if on the first one.
            return;
        }
        else if (action === 'next' && currentlySelectedIndex === filteredComments.length - 1) {
            // Cannot show next comment if on the last one.
            return;
        }
        if (action === 'next') {
            $scope.setSelected(filteredComments[currentlySelectedIndex + 1]);
        }
        else if (action === 'previous') {
            $scope.setSelected(filteredComments[currentlySelectedIndex - 1]);
        }
        // re-render the laser.
        $scope.$broadcast('laser-render');
    };

    /**
     * Set the avatar URL and name belonging to the participant.
     *
     * @param userId
     * @param obj
     */
    function updateAvatarDetails(userId, obj) {
        var avatar = $scope.participantMap[userId];
        if (avatar) {
            obj.createdName = avatar.name;
            obj.avatar_url = avatar.avatar_url || '';
        }
        else {
            obj.createdName = '';
            obj.avatar_url = '';
        }
    }

    $scope.checkPosition = function (annotationId) {
        if ($scope.question.interactive) {
            $scope.$broadcast('popup-has-been-opened', {
                id: '_' + annotationId
            });
        }
    };

    $scope.getPlacement = function (annotation) {
        if (annotation.absoluteX > ($window.innerWidth / 2)) {
            return 'left';
        }
        return 'right';
    };

    $scope.displayAnnotations = function () {
        $scope.showHeatMap = false;
        $scope.showAnnotations = true;
    };

    $scope.hideAnnotations = function () {
        $scope.showAnnotations = false;
        $scope.currentSelected = null;
    };

    /**
     * Refresh the heat map canvas
     */
    $scope.refreshHeatMap = function () {
        if ($scope.question.snapshotUILang === 'UI5') {
            // if is a smartApp, we process the stats again in the context of the current prototypeUrl
            $scope.processData({
                stats: $scope.statistics
            }, $scope.prototypeUrl);
        }
        $timeout(function () {
            // refresh if the iframe has been scrolled or the dimensions change
            var refreshMap = false;
            // if we scrolled since we last opened the heatmap we need to reposition the elements
            if ($scope.iFrameScrolled) {
               $scope.iFrameScrolled = false;
               $scope.calculateHeatmap();
               refreshMap = true;
            }

            var domElt = angular.element(document.querySelector('#overlayHeatMap'));
            var canvasElt = angular.element(domElt[0].querySelector('.heatmap-canvas'));

            // this is needed incase the iFrameScrolled - throws error in the heatmap without
            var dimension = {
                    width: domElt[0].clientWidth,
                    height: domElt[0].clientHeight
            };

            if (!canvasElt[0].clientHeight || !canvasElt[0].clientWidth) {
                refreshMap = true;
            }
            if (refreshMap) {
                $rootScope.$broadcast('heatmapRefresh', dimension);
            }
        }, 50);
    };

    // Navigation between screens
    $scope.next = function () {
        $scope.action = 'next';
        $timeout(function () {
            $state.go($state.current.name, {
                questionId: $scope.nextQId,
                study: currentStudy,
                action: $scope.action
            });
        });
    };

    $scope.previous = function () {
        $scope.action = 'previous';
        $timeout(function () {
            $state.go($state.current.name, {
                questionId: $scope.prevQId,
                study: currentStudy,
                action: $scope.action
            });
        });
    };

    $scope.resetAnnotations = function () {
        $timeout(function () {
            if (!$scope.openingOtherAnnotation) {
                // don't fade the other annotations if displaying a new one.  Causes a flash of animation on screen.
                $scope.qAnnotations.forEach(function (q) {
                    q.fade = false;
                });
            }
        });
    };

    $scope.goBack = function () {
        NavBarService.show();
        AsideFactory.show();

        $timeout(function () {
            $state.go('^.review.questions', {
                studyId: currentStudy._id,
                currentProject: currentStudy.projectId
            });
        });
    };

    /**
     * Sets currently selected answer
     * @param selected answer to be selected
     */
    $scope.setSelected = function (selected) {
        if (!selected || selected === $scope.currentSelected) {
            $scope.currentSelected = null; // turn off
        }
        else {
            $scope.selectedTab = 'comments-tab';
            $scope.currentSelected = selected;
        }
    };

    /**
     * navigates to prototype tab if needed and sets the annotation
     * @param selected answer to be selected
     */
    $scope.selectAnnotation = function (selected) {
        $scope.goToAnnotationScreen(selected.url);
        if (selected === $scope.currentSelected) {
            $scope.currentSelected = null;
        }
        else {
            $scope.currentSelected = selected;
        }
        if ($scope.question.type === 'Task') {
            $scope.showHeatMap = false;
            $scope.showAnnotations = true;
            // The laser is rendered for tasks after the task has re-sized, ensuring that it has loaded

            // Call the directive controller to scroll the comment container to display the selected comment
            // as we group the active ones to the top of the list of comments
            scrollToCommentApi.scrollToComment(selected, event);
        }

        // only rerender if it's an image - tasks are handled in the handleMessage function
        if ($scope.question.type.toLowerCase() !== 'task') {
            $timeout(function () {
                $scope.$broadcast('laser-render');
            }, 100);
        }
    };

    // un-select the current comment and hide the laserline when the the current tab is not 'COMMENTS'
    $scope.$watch('selectedTab', function (val) {
        if (val !== 'comments-tab') {
            $scope.setSelected(null);
        }
    });

    $scope.$watch('topPanelSelectedTab', function (val) {
        if (val !== undefined && !(val === 'prototype-tab' || val === 'overview')) {
            $scope.handleLeaveAnnotationScreen();
        }
        if (val === 'sankey-tab' && !$scope.sankeyRendered) {
            $timeout(function () {
                $scope.$broadcast('sankey-rerender');
                $scope.sankeyRendered = true;
            }, 300);
        }
    });

    // un-select the current comment and hide the laser when leaving a page where annotations are visible
    $scope.handleLeaveAnnotationScreen = function () {
        $scope.setSelected(null);
        if ($scope.question.type === 'Task') {
            $scope.showAnnotations = false;
            // will either be statistics or task overview screen - want to see all the annotations for a question
            $scope.qAnnotations = currentStudy.annotations ? currentStudy.annotations.filter(function (annotation) {
                if (annotation.questionId === $scope.question._id) {
                    return annotation;
                }
            }) : [];
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
                    questionId: currentStudy.questions[data.index]._id,
                    study: currentStudy,
                    action: $scope.action
                });
            });
        }
    });

    $scope.filterBySentiment = function (value) {
        return value.sentiment === $scope.currentFilter.list.sentiment || $scope.currentFilter.list.sentiment === -1;
    };

    $scope.filterAnswerBySentiment = function (value) {
        return value.sentiment === $scope.currentAnswerFilter.list.sentiment || $scope.currentAnswerFilter.list.sentiment === -1;
    };

    // Navigates to the correct screen when an annotation is selected from the sidebar
    $scope.goToAnnotationScreen = function (pageUrl) {
        if ($scope.question.type === 'Task') {
            uiTabHelper.openTab('prototype-tab');
            $scope.prototypeUrl = pageUrl;
        }
        else {
            uiTabHelper.openTab('overview');
        }
    };

    $scope.calculateHeatmap = function () {
        if ($scope.pages) {
            // need to reset the heatmap on each page
            var oRelativeUrlInformation = urUtil.getRelativeURI($scope.location, true);
            _.forEach($scope.pages, function (page) {
                // Get all points for the heat map
                if (page.url === (oRelativeUrlInformation.pathname + oRelativeUrlInformation.hash.split('(')[0]) && typeof page.clickLocations !== 'undefined') {
                    page.clickLocations.forEach(function (point) {
                        var temp = {};
                        temp.x = point.x - $scope.iFrameCurrentScroll.scrollLeft;
                        temp.y = point.y - $scope.iFrameCurrentScroll.scrollTop;
                        temp.value = point.value;
                        temp.context = point.context;
                        if ($scope.question.snapshotUILang === 'UI5') {
                            // if both the point and the Context have context add points
                            var pageContext = urUtil.getContextFromUrl($scope.location, $scope.question.snapshotUILang);
                            if (point.context && pageContext.data === point.context.data) {
                                $scope.heatmap.data.data.push(temp);
                                $scope.heatmap.data.max = Math.max($scope.heatmap.data.max, temp.value);
                            }
                        }
                        else {
                            $scope.heatmap.data.data.push(temp);
                            $scope.heatmap.data.max = Math.max($scope.heatmap.data.max, temp.value);
                        }
                    });
                }
            });
        }
    };

    /**
     *  Store the initial lenght of the page history.
     *  This value is used in the iframe to determine wheter it can go back or not
     *  as the history object is shared between main window and iframe
     */
    var historyLength = window.history.length;

    $scope.handleMessage = function (event) {
        if (urUtil.verifyIframe('prototype-iframe', event) === true) {
            if (event.data.type === 'iframeOnload' || event.data.type === 'iframeHashchange') {
                $scope.location = event.data.newLocation || event.data.location;
                if (typeof $scope.location !== 'undefined') {
                    var oRelativeUrlInformation = urUtil.getRelativeURI($scope.location, true);

                    $scope.heatmap.data.data = [];
                    $scope.heatmap.data.max = 0;
                    $scope.calculateHeatmap();

                    $scope.prototypeUrl = oRelativeUrlInformation.pathname + oRelativeUrlInformation.hash;
                    if (event.data.type === 'iframeHashchange') {
                        $scope.wasHashchange = true;
                    }
                    $scope.initDetail($scope.study, $stateParams.questionId);

                    $scope.$apply();

                    $scope.$broadcast('send-iframe-message', {
                        iframeId: 'prototype-iframe',
                        iframeMessage: {
                            type: 'historyLength',
                            value: historyLength
                        }
                    });
                }
                else {
                    $log.info('Error in iframe: location undefined');
                }
            }
            else if (event.data.type === 'iframeClick') {
                // just catch it and discard, otherwise will pop up in console
            }
            else if (event.data.type === 'iframeError') {
                $log.info('Error in iframe: ', event.data.errorMsg);
            }
            else if (event.data.type === 'pageSize') {
                $scope.showBusyIndicator = false;

                // we need to calculate iFrame annoations seperately to consider the scrol
                _.forEach($scope.qAnnotations, function (annotation) {
                   $scope.calculateAnnotationPosition(annotation);
                });
                // now that the prototype is loaded we want to ensure the laser is drawn in the correct place
                $scope.$broadcast('laser-render');
                $scope.$apply();
            }
            else if (event.data.type === 'beforeUnload') {
                $scope.showBusyIndicator = true;
            }
            else if (event.data.type === 'iFrameScroll') {

                // we want to wipe the heatmap after a scroll this prevents
                // flickering
                $scope.heatmap.data.data = [];
                $scope.heatmap.data.max = 0;
                var dimension = {
                    width: 0,
                    height: 0
                };
                $rootScope.$broadcast('heatmapRefresh', dimension);

                $scope.iFrameScrolled = true;
                $scope.iFrameCurrentScroll = event.data.scrollDimensions;
                 // we need to calculate iFrame annoations seperately to consider the scrol
                _.forEach($scope.qAnnotations, function (annotation) {
                   $scope.calculateAnnotationPosition(annotation);
                });
                if ($scope.rerenderLaser === true) {
                    $scope.$broadcast('laser-render');
                    $scope.$apply();
                    $scope.rerenderLaser = false;
                }
            }
            else if (event.data.type === 'finishedScroll') {
                // we've scrolled but the scroll callback happens - so easiest just to
                // set a boolean for when it's messaged is returned
                $scope.rerenderLaser = true;
            }
            else {
                $log.info('Unknown message: ', event.data.type);
            }

        }
        else {
            $log.info('Unknown origin: ', event.origin);
        }
    };
};
