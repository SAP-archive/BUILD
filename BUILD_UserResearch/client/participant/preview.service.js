'use strict';

function fakeMethod(obj) {
    return {
        $promise: {
            then: function (cb) {
                obj._id = Date.now().toString();
                if (obj.status === 'not started') {
                    obj.status = 'in progress';
                }
                obj.questionType = obj.questionType;
                obj.stats = {
                    created_by: 'Preview Participant',
                    created_at: Date.now().toString()
                };

                cb(obj);
                return this;
            },
            catch: function () {
                return this;
            }
        }
    };
}

function toggle() {
    return {
        $promise: {
            then: function (cb) {
                var obj = {};
                obj.participants = [{
                    isAnonymous: true
                }];
                cb(obj);
                return this;
            },
            catch: function () {
                return this;
            }
        }
    };
}

module.exports = function () {
    return {
        save: fakeMethod,
        update: fakeMethod,
        delete: fakeMethod,
        toggle: toggle,
        initCurrentUser: fakeMethod,
        getCurrentUser: function () {
            return {
                $promise: {
                    then: function (cb) {
                        cb({
                            name: 'Preview User'
                        });
                        return {
                            catch: function () {}
                        };
                    }
                }
            };
        }
    };
};
