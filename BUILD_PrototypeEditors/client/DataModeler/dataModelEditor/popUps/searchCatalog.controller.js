'use strict';


function SearchCatalog($timeout, ModelEditorService, Catalog) {

    var vm = this;
    vm.creationTypes = { OBJECT: 'Object', ALL: 'All' };
    vm.steps = { CHOOSE_ENTITY: 'EntityList', CHOOSE_TYPE: 'ChooseType' };
    vm.clear = function () {
        vm.searchText = '';
        vm.splitRegex = undefined;
        vm.matchRegex = undefined;
        vm.searchResults = [];
        vm.searchDone = false;
        vm.selectedEntity = '';
        vm.creationType = vm.creationTypes.OBJECT;
        vm.step = vm.steps.CHOOSE_ENTITY;
    };

    vm.clear();

    vm.onSearch = function () {
        var currentSearchText = vm.searchText;
        $timeout(function () {
            if (currentSearchText === vm.searchText) {
                vm.searchCatalogs();
            }
        }, 250);
    };

    vm.clearSearch = function () {
        vm.searchText = '';
    };

    vm.searchCatalogs = function () {
        vm.searchDone = false;
        vm.splitRegex = undefined;
        vm.matchRegex = undefined;
        vm.searchResults = [];
        if (vm.searchText) {
            var postInfo = {
                search: vm.searchText
            };

            Catalog.search(postInfo, function (data) {
                if (postInfo.search === vm.searchText) {
                    vm.searchDone = true;
                    var bStartWith = true; // search is just a start with currently
                    var prefix = '';
                    if (bStartWith) {
                        prefix = '^';
                    }
                    vm.splitRegex = new RegExp(prefix + vm.searchText, 'gi');
                    vm.matchRegex = new RegExp('^' + vm.searchText + '$', 'i');
                    vm.searchResults = data;
                }
            });
        }
        else {
            vm.searchDone = true;
        }
    };

    vm.formatEntity = function (entity) {
        return entity.name + ' from ' + entity.catalog.description;
    };

    vm.setSelectedEntity = function (entity) {
        vm.step = 'ChooseType';
        vm.selectedEntity = entity;
    };

    vm.getTitle = function (step) {
        return (step === 'EntityList') ? 'Search for Data Objects' : 'What to add?';
    };

    vm.setCreationType = function (type) {
        vm.creationType = type;
    };

    vm.createEntities = function () {
        // Use a timeout to avoid that the dialog changes its size when closing
        if (vm.selectedEntity) {
            $timeout(function () {
                switch (vm.creationType) {
                    case vm.creationTypes.OBJECT:
                        ModelEditorService.importOriginalEntity(vm.selectedEntity);
                        break;
                    case vm.creationTypes.ALL:
                        ModelEditorService.importAllCatalog(vm.selectedEntity);
                        break;
                }
                // Use a timeout to avoid that the dialog changes its size when closing
                $timeout(function () {
                    vm.clear();
                }, 500);
            });
        }
        else {
            vm.clear();
        }
    };

    vm.split = function (text) {
        var results = [], searchedString = vm.searchText;
        var re = vm.splitRegex, match;
        if (re) {
            var searchLength = searchedString.length;
            var previousIndex = -1, str;

            while ((match = re.exec(text)) != null) {
                if (previousIndex + 1 !== match.index) {
                    str = text.substring(previousIndex + 1, match.index);
                    results.push(str);
                }

                str = text.substring(match.index, match.index + searchLength);
                results.push(str);

                previousIndex = match.index + searchLength - 1;
            }

            if (previousIndex + 1 <= text.length) {
                str = text.substring(previousIndex + 1);
                results.push(str);
            }
        }
        return results;
    };

    vm.match = function (text) {
        var re = vm.matchRegex;
        var isMatch = false;
        if (re) {
            isMatch = re.test(text);
        }
        return isMatch;
    };

}

module.exports = ['$timeout', 'dm.ModelEditorService', 'dm.Catalog', SearchCatalog];
