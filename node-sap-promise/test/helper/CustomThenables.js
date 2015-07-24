function ValueThenable (value) {
    this.then = value;
}
function ThrowingThenable (error) {
    this.then = function () {
        throw error;
    }
}
function ThrowingThenProperty (error) {
    this.error = error;
}
Object.defineProperty(ThrowingThenProperty.prototype, "then", {
    get: function () {
        throw this.error;
    }
});

module.exports = {
    ValueThenable: ValueThenable,
    ThrowingThenable: ThrowingThenable,
    ThrowingThenProperty: ThrowingThenProperty
};
