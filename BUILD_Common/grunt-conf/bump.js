var projects = require('./projects');
function getProjectPackages() {
    var packages = [ 'package.json' ];
    projects.forEach(function (pkg) {
        packages.push(pkg + '/package.json');
    });
    return packages;
}
module.exports = {
    options: {
        files: getProjectPackages(),
        commit: true,
        commitMessage: 'Release v%VERSION% [ci skip]',
        commitFiles: [ '-a' ],
        createTag: false,
        push: true,
        pushTo: 'origin'
    }
};

