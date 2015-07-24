/*global chai, inject, sinon */
/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for questionEdit directive', function () {
    var scope, rootScope, el, compile,
        questionUpdated = false,
        questionSaved = false,
        questionDeleted = false,
        Questions = function () {
            return {
                update: function () {
                    questionUpdated = true;
                },
                save: function (q) {
                    questionSaved = true;
                    q.$promise = {
                        then: function (cb) {
                            cb();
                        }
                    };
                    q.$delete = function () {
                        return {
                            then: function (cb) {
                                cb();
                            }
                        };
                    };
                    return q;
                },
                delete: function () {
                    questionDeleted = true;
                    return {
                        $promise: {
                            then: function (cb) {
                                cb();
                            }
                        }
                    };
                }
            };
        },
        urUtil = function () {
            return {
                textCountValidation: function () {
                    return {
                        max: 123,
                        remaining: 123
                    };
                }
            };
        },
        study = {
            questions: [{
                _id: 1,
                url: 'url',
                text: 'Im a question',
                ordinal: 0,
                subOrdinal: 0
            }, {
                _id: 2,
                url: 'url2',
                text: 'Im a question too',
                ordinal: 1,
                subOrdinal: 0
            }]
        },
        templates = [
            'resources/norman-user-research-client/questions/directives/questionEdit/template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-input/input.template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-textarea/textarea.template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-radio/radio.template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-checkbox/checkbox.template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-select/select.template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-tabs/tabs.template.html',
            'resources/angular-sap-ui-elements/ui-elements/ui-tabs/tab.option.template.html'
        ],
        initDirective = function (usePromise) {
            rootScope.study = study;
            if (usePromise) {
                rootScope.study.$promise = {
                    then: function (cb) {
                        cb({});
                    }
                };
            }
            el = compile('<edit-question study="study" question-id="" question-document-id="" question-document-version=""></edit-question>')(rootScope);
            rootScope.$digest();
            scope = el.isolateScope();
        };


    /*** SETUP ************************************************************************************/
    beforeEach(module('UserResearch', 'dev/' + templates[0], 'dev/' + templates[1], 'dev/' + templates[2], 'dev/' + templates[3], 'dev/' + templates[4], 'dev/' + templates[5], 'dev/' + templates[6], 'dev/' + templates[7]));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('common.utils'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(function () {
        module(function ($provide) {
            $provide.service('Questions', Questions);
        });
    });

    beforeEach(function () {
        module(function ($provide) {
            $provide.service('urUtil', urUtil);
        });
    });

    beforeEach(inject(function ($injector, $compile, $rootScope, $templateCache) {
        templates.forEach(function (tpl) {
            $templateCache.put(tpl, $templateCache.get('dev/' + tpl));
        });

        questionUpdated = false;
        questionSaved = false;
        questionDeleted = false;
        rootScope = $rootScope;
        compile = $compile;
        initDirective();
    }));
    /*** SETUP ************************************************************************************/


    /*** TESTS ************************************************************************************/
    it('should initialise', function () {
        expect(el).not.to.be.undefined;
        expect(scope.questionId).to.be.undefined;
        expect(scope.questionOrdinal).to.be.undefined;
        expect(scope.study).not.to.be.undefined;
        expect(scope.questions).to.be.instanceof(Array);
        expect(scope.currentQuestion).to.be.undefined;

        // Setup params
        scope.questionId = 1;
        scope.questionOrdinal = 0;

        // Init directive
        scope.$digest();
        expect(scope.currentQuestion.url).to.be.equal(study.questions[0].url);
        expect(scope.study.questions.length).to.be.equal(2);

        // Should filter by ordinal
        expect(scope.questions.length).to.be.equal(1);
    });

    it('should initialise (with promise)', function () {
        initDirective(true);

        expect(el).not.to.be.undefined;
        expect(scope.questionId).to.be.undefined;
        expect(scope.study).not.to.be.undefined;
        expect(scope.questions).to.be.instanceof(Array);
        expect(scope.currentQuestion).to.be.undefined;

        // Setup params
        scope.questionId = 1;
        scope.questionOrdinal = 0;

        // Init directive
        scope.$digest();
        expect(scope.currentQuestion.url).to.be.equal(study.questions[0].url);
        expect(scope.study.questions.length).to.be.equal(2);

        // Should filter by ordinal
        expect(scope.questions.length).to.be.equal(1);

    });

    it('should update the question.changed status', function () {
        var spy = sinon.spy(scope, 'change'),
            question = {
                changed: false
            };
        scope.change(question);
        spy.should.have.been.called;
        expect(question.changed).to.be.equal(true);
    });

    it('should update the question', function () {
        var question = {
                changed: false
            },
            promisedQuestion = {
                changed: true,
                $promise: {
                    then: function (cb) {
                        cb();
                    }
                },
                $update: function () {}
            },
            spy = sinon.spy(scope, 'update'),
            qspy = sinon.spy(promisedQuestion, '$update');

        scope.update(question);
        spy.should.have.been.called;
        expect(question.changed).to.be.equal(false);
        spy.reset();

        question.changed = true;
        scope.update(question);
        spy.should.have.been.called;
        expect(question.changed).to.be.undefined;
        expect(questionUpdated).to.be.equal(true);
        spy.reset();

        scope.update(promisedQuestion);
        spy.should.have.been.called;
        expect(promisedQuestion.changed).to.be.undefined;
        qspy.should.have.been.called;
    });

    it('should add questions', function () {
        scope.study = study;
        scope.questionId = 1;
        scope.questionOrdinal = 0;
        scope.tabSelected = 'tab-0';
        scope.$digest();
        scope.add();

        expect(scope.currentQuestion.url).to.be.equal(study.questions[0].url);
        expect(scope.questions.length).to.be.equal(2);
        expect(scope.questions[0].ordinal).to.be.equal(0);
        expect(scope.questions[1].ordinal).to.be.equal(0);
        expect(questionSaved).to.be.equal(true);
    });

    it('should delete questions', function () {
        var ql = study.questions.length,
            promisedQuestion = {
                $promise: {
                    then: function (cb) {
                        cb();
                    }
                },
                $delete: function () {
                    return {
                        then: function (cb) {
                            cb();
                        }
                    };
                }
            },
            qspy = sinon.spy(promisedQuestion, '$delete');

        scope.questionId = 1;
        scope.questionOrdinal = 0;
        scope.$digest();

        // just delete question from the array
        scope.delete({});
        expect(scope.questions.length).to.be.equal(1);
        expect(scope.study.questions.length).to.be.equal(2);
        expect(questionDeleted).to.be.equal(false);

        // delete question from the array and call service
        scope.delete({
            _id: 1
        });
        expect(scope.questions.length).to.be.equal(0);
        expect(scope.study.questions.length).to.be.equal(1);
        expect(questionDeleted).to.be.equal(true);

        // delete promised question from the array and call its $delete
        scope.delete(promisedQuestion);
        expect(scope.questions.length).to.be.equal(ql - 3);
        qspy.should.have.been.called;
    });



});
