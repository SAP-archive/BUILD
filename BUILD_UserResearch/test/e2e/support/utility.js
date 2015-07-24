/**
 * Created by I311016 on 13/01/2015.
 */
var studyUrl = {
    get  function () {
        return this.value;
    },
    set  function (url) {
        this.value = url;
    }
};

var projUrl = {
    get  function () {

        return this.value;
    },
    set  function (url) {

        this.value = url;
    }
};

module.exports = {

    /*set: function(urlValue){
     studyUrl = urlValue;

     },
     get: function(){
     return studyUrl;
     }*/

    studyUrl: studyUrl,
    projUrl: projUrl


}
