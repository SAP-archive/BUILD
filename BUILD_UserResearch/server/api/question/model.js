/*eslint key-spacing: 0 */
'use strict';

var commonServer = require('norman-common-server'),
    mongoose = commonServer.db.mongoose;

/**
 * Ordinal/SubOrdinal
 * - the ordinal value determines the grouping to allow questions be added together
 * - the subordinal value determines the sub-order of the group
 *
 */
var QuestionSchema = mongoose.createSchema('norman-user-research', {
    url:  { type: String },
    text: { type: String },
    name: { type: String },
    type: { type: String, enum: ['Freeform', 'Annotation', 'MultipleChoice', 'Task'], default: 'Annotation' },
    thumbnail:       { type: String },
    answerLimit:     { type: Number },
    answerIsLimited: { type: Boolean, default: false },
    answerOptions:   { type: Array, default: [] },
    allowMultipleAnswers: { type: Boolean, default: false },
    ordinal:         { type: Number },
    subOrdinal:      { type: Number },
    interactive:     { type: Boolean },
    documentId:      { type: String },
    documentVersion: { type: String },
    snapshotVersion: { type: String },
    snapshotUILang:  { type: String },
    snapshotId:      { type: String },
    targetURL:       { type: Array, default: [] },
    isTargetable:    { type: Boolean, default: true }
});
QuestionSchema.set('autoIndex', false);

var Question;
function getModel() {
    if (!Question) {
        Question = mongoose.createModel('Question', QuestionSchema);
    }
    return Question;
}

function createIndexes(done) {
    getModel().ensureIndexes();
    done();
}

module.exports = {
    createIndexes: createIndexes,
    getModel: getModel
};
