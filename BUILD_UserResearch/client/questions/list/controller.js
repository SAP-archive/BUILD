/*eslint consistent-return: 0, no-cond-assign: 0, no-loop-func: 0 */
'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($scope, $state, $filter, $rootScope, $timeout, Questions, Tasks, currentStudy, uiError, TaskCreator, urUtil) {

    $scope.study = currentStudy;
    $scope.isEditStudy = true;
    $scope.isUploadingScreen = false;
    $scope.uploadedImagesList = [];
    $scope.docsUrl = '/api/projects/' + $scope.study.projectId + '/document';
    $scope.serviceUrl = 'api/projects/' + $scope.study.projectId + '/research/uploadFiles/';
    $scope.aProcessingTasksProgress = []; // array of tasks which are currently in the processing phase
    $scope.aTaskCreatorList = [];  // array to hold instances of TaskCreator service which processes the files


    // if its in this array, treat it as a task
    var taskFileTypes = {
        'application/zip': true,
        'application/x-zip-compressed': true,
        zip: true
    };

    $scope.determineHandyTipText = function () {
        if ($scope.study.questions.length < 2) {
            $scope.handyTipText = 'Drag and drop your images onto this page to instantly add them into your study.';
        }
        else if ($scope.study.questions.length > 1) {
            $scope.handyTipText = 'You can re-order the items in your study by dragging and dropping them into the correct place.';
        }
        else {
            $scope.handyTipText = '';
        }
    };

    $scope.determineHandyTipText();

    $scope.goToQuestions = function (id) {
        $scope.questionId = id;
        $scope.currentQuestion = _.find($scope.study.questions, {
            _id: $scope.questionId
        });
        $scope.documentId = $scope.currentQuestion.documentId;
        $scope.ordinal = $scope.currentQuestion.ordinal;
        $scope.documentVersion = $scope.currentQuestion.documentVersion;
        $scope.currentUrl = '//:0';     // remove the previous img so it's not visible while the new one loads
        $scope.currentUrl = $scope.currentQuestion.url;
        $scope.$broadcast('dialog-open', 'editQuestionModal');
    };

    /**
     *  Deletes current image, including all questions
     *  @param image : image to be deleted
     */
    $scope.deleteScreen = function (image) {
        if (image.type === 'Task') {
            Tasks.delete({
                id: image._id
            }).$promise
                .then(function () {
                    $scope.updateOrder();
                });
            $scope.study.questions.splice($scope.study.questions.indexOf(image), 1);
        }
        else if (image.type !== 'Task') {
            // Bulk remove questions i.e. screen can have many questions attached to it
            // Dev-note: this will remove all questions with the ordinal of the current question
            Questions.bulkDelete({
                id: image._id
            }).$promise
                .then(function () {
                    // Update questions on UI
                    _.remove($scope.study.questions, function (question) {
                        return question.ordinal === image.ordinal;
                    });
                    $scope.updateOrder();
                });
        }
    };

    $scope.addQuestions = function (questions) {
        $rootScope.$broadcast('image-uploaded');

        if (!questions || questions.length === 0) {
            return;
        }
        questions = questions.length ? questions : [questions];
        var newQuestionList = [];
        // Cant rely on screen list, the study.questions will always have the correct value
        var uniqueQuestionCount = $filter('QuestionsListFilter')($scope.study.questions).length;

        // SubOrdinal will always be 0 and ordinal is incremented per new question
        questions.forEach(function (question) {
            var tmpQuestionObj = {
                text: '',
                type: 'Annotation',
                url: question.url,
                name: question.name,
                thumbnail: question.thumbnail,
                interactive: question.interactive,
                ordinal: uniqueQuestionCount,
                subOrdinal: 0,
                documentId: question.documentId,
                documentVersion: question.documentVersion
            };
            uniqueQuestionCount++;
            newQuestionList.push(tmpQuestionObj);
        });

        return Questions[questions.length > 1 ? 'saveAll' : 'save'](newQuestionList).$promise
            .then(function (result) {
                $scope.study.questions = $scope.study.questions.concat(result.length ? result : [result]);
                $scope.determineHandyTipText();
            });
    };

    $scope.getScreenList = function () {
        var container = document.getElementById('norman-user-research');
        return container.querySelectorAll('.screen');
    };

    /**
     * Count a group of questions, grouped by ordinal
     * @param   {number}    Ordinal value
     * @return  {number}    Number of questions in that group
     */
    $scope.countQuestionByOrdinal = function (id) {
        var questionList = $scope.study.questions.filter(function (question) {
            return question.ordinal === id;
        });
        var questionListLength = questionList.length;
        if (typeof questionListLength === 'undefined') {
            return 0;
        }

        return questionList.reduce(function (prevIdx, question) {
            var questionAnswered = 0;
            switch (question.type) {
                case 'Freeform':
                    questionAnswered = 1;
                    break;
                case 'Annotation':
                    if (questionListLength > 1) {
                        questionAnswered = 1;
                    }
                    else {
                        if (typeof question.text !== 'undefined' && question.text !== '') {
                            questionAnswered = 1;
                        }
                    }
                    break;
                case 'MultipleChoice':
                    if (typeof question.answerOptions.length !== 'undefined' && question.answerOptions.length !== 0) {
                        questionAnswered = 1;
                    }
                    break;
                default:
                    questionAnswered = 0;
            }
            return prevIdx + questionAnswered;
        }, 0);
    };

    /**
     *
     * @param questions array of questions
     * @returns {int} the number of questions which had type Task
     */
    $scope.getNumberOfTasks = function (questions) {

        var tasks = questions.filter(function (n) {
            return n.type === 'Task';
        });

        return tasks.length;
    };

    /**
     * Saves an uploaded image or task to the associated study.
     * @param responseDetails the json response from the upload service detailing the item that was uploaded.
     * @param sequence the sequence number (relative to the total number of files uploaded in this request) for
     * the image.
     */
    $scope.addUploadedItem = function (responseDetails, sequence) {

        // this is an app (ie, from a zip) if there is appMetadata in response
        if (responseDetails.appMetadata) {

            $scope.$broadcast('clear-file-upload-progress', [sequence]);    // get rid of the progress tile
            var taskName = 'Task: ' + ($scope.getNumberOfTasks($scope.study.questions) + 1);
            var taskDesc = 'Here is a prototype that we want you to explore and provide feedback on.';
            var taskData = $scope.aTaskCreatorList[sequence].createTask(responseDetails, taskName, taskDesc, $scope.study.questions.length, 0);

            // TODO: Decided how to handle assigning ordinals to tasks asynchronously
            taskData.task.then(function (task) {

                // check if progress has already been set (ie, processing has started before task was created);
                if (!$scope.aProcessingTasksProgress[task._id]) {
                    $scope.aProcessingTasksProgress[task._id] = 0;
                }
                $scope.study.questions = $scope.study.questions.concat([task]);
                $scope.init();
            });

            // handlers for the processing progress of the thumbnail generation & upload
            taskData.thumbnails.then(function success(task) {
                    $scope.aProcessingTasksProgress[task._id] = 100;
                },
                function error() {
                    // TODO: handle error in thumbnail creation here?
                },
                function progress(progressData) {
                    // ensure that promise has been resolved.
                    if (progressData.task.$$state.status === 1) {
                        $scope.aProcessingTasksProgress[progressData.task.$$state.value._id] = progressData.progress;
                    }
                });
        }
        // an image, save as a question
        else {

            var docVersion = responseDetails[0].metadata.version;
            var docId = responseDetails[0]._id;
            var fileName = responseDetails[0].filename;
            var url = '/api/projects/' + $scope.study.projectId + '/document/' + docId + '/' + docVersion + '/render';
            $scope.uploadedImagesList.push({
                url: url,
                name: fileName,
                thumbnail: url + '/?thumbOnly=true',
                interactive: false,
                documentId: docId,
                documentVersion: docVersion,
                sequence: sequence
            });
        }
    };

    /**
     * Saves the images to the study after they have completed uploading.
     */
    $scope.saveImagesToStudy = function () {
        if ($scope.uploadedImagesList.length > 0) {
            $scope.addQuestions(_.sortBy($scope.uploadedImagesList, 'sequence')).then(function () {
                // Clear the uploading list as we will reload with the saved list.
                urUtil.clearFileUploadProgress($scope, $scope.uploadedImagesList);
                $scope.isUploadingScreen = false;
                $scope.uploadedImagesList = [];
            });
        }
    };

    $scope.createStaticStudy = function () {
        $state.go('shell.project.UserResearch.create.screens', {
            studyId: $scope.study._id,
            study: $scope.study
        });
    };

    /**
     * Call back for ui-file-upload when a file has started upload.
     * Used to set a boolean to indicate to the controller that this has happened.
     */
    $scope.setScreenUploading = function () {
        $scope.isUploadingScreen = true;
    };

    /**
     * Reset isUploadingScreen to false and hide the upload tiles.
     */
    $scope.onUploadFailure = function () {

        // remove the failed upload tile from the view
        $rootScope.$broadcast('clear-file-upload-progress', [$scope.aTaskCreatorList.length - 1]);

        $scope.isUploadingScreen = false;
        $rootScope.$broadcast('image-uploaded');
    };

    $scope.createPrototypeStudy = function () {
        return;
    };

    /* Function Needed to set the popup to the
     * correct question when the ? icon is clicked
     */
    $scope.setCurrentQuestion = function (question) {
        $scope.questionId = question._id;
        $scope.currentQuestion = _.find($scope.study.questions, {
            _id: $scope.questionId
        });
        $scope.currentUrl = $scope.currentQuestion.url;
    };

    $scope.rejectFiles = function () {
        uiError.create({
            content: 'It is only possible to upload image files and prototype zip files to this study.',
            dismissOnTimeout: true,
            dismissButton: true
        });
    };

    $scope.rejectFilesZipUpload = function () {
        uiError.create({
            content: 'It is only possible to upload .zip here',
            dismissOnTimeout: true,
            dismissButton: true
        });
    };

    /**
     * callback for uploqding files via drag n drop
     * @param file
     */
    $scope.onFileUpload = function (file) {
        if (taskFileTypes[file.type]) {
            $scope.aTaskCreatorList[file.sequenceNum] = new TaskCreator();
            $scope.aTaskCreatorList[file.sequenceNum].onUploadStart(file);
        }
    };


    /**
     * Update questions/tasks order, reflecting the ordinal value in the DB. This method is called each time a user drags/drops
     *  a screen on the screen list page
     */
    $scope.updateOrder = function () {
        var screenList = $scope.getScreenList();
        var i = 0,
            screen, ordinal = 0,
            newOrderedList = [];
        var updatedList = [];

        for (; screen = screenList[i]; i++) {
            var screenOrdinal = parseInt(screen.dataset.ordinal, 10);
            // Reset subOrdinal, used to order group of questions
            var subOrdinal = 0;

            var screenQuestions = _.sortBy(_.filter($scope.study.questions, function (filteredQuestion) {
                return filteredQuestion.ordinal === screenOrdinal;
            }), ['subOrdinal'], [true]);

            // Clone array so that we can update the ordinal values
            var clonedArray = JSON.parse(JSON.stringify(screenQuestions));

            // Update the ordinal/subOrdinal per question
            _.forEach(clonedArray, function (forEachQuestion) {
                newOrderedList.push({
                    _id: forEachQuestion._id,
                    ordinal: ordinal,
                    subOrdinal: subOrdinal
                });
                var tmpObj = forEachQuestion;
                tmpObj.ordinal = ordinal;
                tmpObj.subOrdinal = subOrdinal;
                updatedList.push(tmpObj);
                subOrdinal++;
            });
            ordinal++;
        }

        // Update questions with latest ordinal/subOrdinal values
        $scope.study.questions = updatedList;

        // Update questions
        // dev-note: ensure the list is unique by ID, more safety to ensure there is no duplication
        if (!_.isEmpty(newOrderedList)) {
            Questions.updateOrdinals({
                questions: _.unique(newOrderedList, '_id')
            });
        }
    };

    $scope.$on('update-order', $scope.updateOrder);
};
