'use strict';

// @ngInject
module.exports = function ($scope, uiError) {

    // value for pie chart
    $scope.pieChartData = [25, 40, 35];
    $scope.pieChartData1 = [5, 10, 15, 20, 25, 10, 15];
    $scope.pieChartColor = ['#3398DB', '#9B59B6', '#F1C40E', '#FFFCB6', '#E67E22', '#E74C3C', '#BDC3C7'];

    // Rich text editor variable.
    $scope.someHtmlVariable = "";

    // Progress bar
    $scope.pbValue = 40;
    $scope.pb75 = function () {
        $scope.pbValue = 75;
    };
    $scope.pb0 = function () {
        $scope.pbValue = 0;
    };
    $scope.pb100 = function () {
        $scope.pbValue = 100;
    };

    $scope.loadFiles = function () {
        return [{
            name: "beforetomcat.png",
            createdAt: "2015-06-03T08:24:45.306Z",
            date: "2015-06-03T08:24:45.306Z",
            ext: "png",
            fileUrl: "/api/projects/071df815009df7210a318cc0/document/556eb9cd1b27a77beec5fdaa/render?download=true",
            projectId: "071df815009df7210a318cc0",
            size: 45813,
            type: "image",
            url: "/api/projects/071df815009df7210a318cc0/document/556eb9cd1b27a77beec5fdaa/render/?thumbOnly=true"
        },
            {
                name: "2015Interns.xlsx",
                createdAt: "2015-05-03T06:12:41.312Z",
                date: "2015-05-28T06:12:41.312Z",
                ext: "xlsx",
                fileUrl: "/api/projects/071df815009df7210a318cc0/document/556eb9bf1b27a77beec5fda4/render?download=true",
                projectId: "071df815009df7210a318cc0",
                size: 10908,
                type: "document",
                url: ""
            }];
    };

    $scope.selectFilesCallback = function(files) {
        console.log("Selected Files:",files);
    };

    $scope.items = [{
        name: 'First Item 123456789',
        selected: false
    }, {
        name: 'Second Item 098765432',
        selected: true
    }, {
        name: 'Third Item 123456789',
        selected: true
    }, {
        name: 'Fourth Item 5555',
        selected: false
    }, {
        name: 'Fifth Item rrrr',
        selected: true
    }];
    $scope.selectedOption = 'Option1';
    $scope.selectedOption2 = 'Option21';
    $scope.selectedOption3 = 'check21';
    $scope.selectedOption4 = 'check22';
    $scope.selectedItem = $scope.items[2]; // red


    $scope.errortitle = 'Uh, something happened, please fix the following:';
    $scope.errorcontent = {
        name: {
            name: '',
            value: '',
            message: 'Study name should be between 1 and 45 characters'
        },
        description: {
            name: '',
            value: '',
            message: 'This is a scrollable area'
        },
        size: {
            name: '',
            value: '',
            message: 'Used to show extra erro text'
        },
        surname: {
            name: '',
            value: '',
            message: 'It can contains as many error message you want'
        },
        email: {
            name: '',
            value: '',
            message: 'This should be upper case'
        },
        test: {
            name: '',
            value: '',
            message: 'Study owner should be between 1 and 45 characters'
        }
    };

    $scope.openToastMultiple = function (title, content) {
        uiError.create({
            title: title,
            content: content,
            dismissOnTimeout: false,
            dismissButton: true
        });
    };

    $scope.openToast = function (text) {
        uiError.create({
            content: text,
            dismissOnTimeout: false,
            dismissButton: true
        });
    };

    $scope.openToastSuccess = function (text) {
        uiError.create({
            content: text,
            dismissOnTimeout: false,
            dismissButton: true,
            className: 'success'
        });
    };

    $scope.openToastAutoClose = function (text, timeout) {
        uiError.create({
            content: text,
            dismissOnTimeout: true,
            timeout: timeout,
            dismissButton: false
        });
    };

    $scope.closeToast = function () {
        uiError.dismiss();
    };


    $scope.uiInputContainerData = {
        lastName: null
    };

    $scope.accordionControl = {
        onExpand: function (expandedPaneIndex) {
            console.log('expanded:', expandedPaneIndex);
        },
        onCollapse: function (collapsedPaneIndex) {
            console.log('collapsed:', collapsedPaneIndex);
        },
        addElt: function () {
            $scope.panes[0].content.unshift({
                section: 'autocomplete'
            });
        },
        addPane: function () {
            $scope.panes.unshift({
                header: 'NEW PANE',
                content: [{
                    section: 'New element'
                }]
            });
        },
        UpdatePane: function () {
            $scope.panes[0].content = [{
                section: 'Test1'
            }, {
                section: 'Test2'
            }];
        }
    };


    $scope.indicator_show = false;
    $scope.indicator_fullScreen = false;

    $scope.indicator_show_1 = false;

    $scope.busyIndicatorfullScreen = function () {
        $scope.indicator_show = true;
        $scope.indicator_fullScreen = true;

        window.setTimeout(function () {
            $scope.indicator_show = false;
            $scope.$apply();
        }, 2000);
    };

    $scope.busyIndicatorContainer = function (val) {
        if (val === 'show') {
            window.setTimeout(function () {
                $scope.indicator_show_1 = true;
                $scope.$apply();
            }, 10);
        }
        else if (val === 'hide') {
            window.setTimeout(function () {
                $scope.indicator_show_1 = false;
                $scope.$apply();
            }, 10);
        }
    };


    $scope.users = [{
        name: 'Bob Dylan',
        state: 'active',
        email: 'test@example.com'
    }, {
        name: 'Jimi Hendrix',
        picture: 'url(../resources/angular-sap-ui-elements/assets/sample_user.png)',
        email: 'test@example.com'
    }, {
        name: 'Freddie Mercury',
        email: 'test@example.com'
    }, {
        name: 'David Bowie',
        state: 'active',
        email: 'test@example.com'
    }, {
        name: 'John Lennon',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }, {
        name: 'Test User',
        email: 'test@example.com'
    }];

    $scope.popLegend = [
        'David Bowie',
        'John Lennon',
        'Freddie Mercury',
        'Bob Dylan'
    ];

    $scope.rockLegend = [
        'Angus Young',
        'Bon Jovi',
        'Peter Framton',
        'Bon Scott'
    ];

    $scope.currentUser = {
        name: 'Test User',
        picture: ''
    };

    $scope.sliderModel = {};
    $scope.sliderModel.value = '70';


    $scope.panes = [{
        header: 'STANDARD COMPONENTS',
        content: [{
            section: 'Button'
        }, {
            section: 'Input'
        }, {
            section: 'Checkbox'
        }, {
            section: 'Radio'
        }, {
            section: 'Textarea'
        }, {
            section: 'Chart'
        }]
    }, {
        header: 'DESIGN ELEMENTS',
        content: [{
            section: 'Accordion'
        }, {
            section: 'Toast'
        }, {
            section: 'File upload'
        }]
    }, {
        header: 'OTHER ELEMENTS',
        content: [{
            section: 'Google map'
        }]
    }];

    $scope.changeItem = function (item) {
        console.log(item.name + ':' + item.selected);
    };

    $scope.projectTileAccept = function () {
        console.log('Accept the project');
    };

    $scope.projectTileReject = function () {
        console.log('Reject the project');
    };

    $scope.projectTileEnter = function () {
        console.log('Create the project');
    };

    $scope.clicked = function () {
        console.log('clicked!!');
    };

    $scope.doSomething = function (fileId) {
        console.log('do something with file: ' + fileId);
    };

    $scope.handleFileUploadError = function (response) {
        console.log('handle upload error response: ' + response);
    };

    $scope.onDrop = function ($event, $data, array) {
        array.push($data);
    };

    $scope.dropSuccessHandler = function ($event, index, array) {
        array.splice(index, 1);
    };

    // Function to be called when the user hits the enter key
    $scope.enterFunction = function () {
        console.log('You triggered an nnEnter event');
    };

    // Style inline for now on sample page, as we don't want it delivered as part of a build
    // function loadcssfile(filename) {
    //     var fileref = document.createElement('link');
    //     fileref.setAttribute('rel', 'stylesheet');
    //     fileref.setAttribute('type', 'text/css');
    //     fileref.setAttribute('href', filename);
    //     document.getElementsByTagName('head')[0].appendChild(fileref);
    // }
    // loadcssfile('docs/styles/style.css');


    var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

    $scope.usState = '';

    $scope.autocomplete_options = {
        suggest: function (term) {
            var q = term.toLowerCase().trim();
            var results = [];

            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state.toLowerCase().indexOf(q) === 0)
                    results.push({
                        label: state,
                        value: state
                    });
            }
            return results;
        },
        on_select: function (term) {
            $scope.usState = term.value;
        }
    };
    $scope.aCarouselItems = [{
        name: "img 1 ",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img1.jpg'
    }, {
        name: "img 2",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img2.jpg'
    }, {
        name: "img 3",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img3.jpg'
    }, {
        name: "img 4",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img4.jpg'
    }, {
        name: "img 5",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img5.jpg'
    }, {
        name: "img 6",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img6.jpg'
    }, {
        name: "img 7",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img7.jpg'
    }, {
        name: "img 8",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img8.jpg'
    }, {
        name: "img 9",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img9.jpg'
    }, {
        name: "img 10",
        thumbnail: '../resources/angular-sap-ui-elements/docs/assets/img10.jpg'
    }];

    $scope.oCarouselCurrentItem = $scope.aCarouselItems[0];
    $scope.oCarouselCurrentItemV = $scope.aCarouselItems[0];
    $scope.$on("updateScreen", function (oEvent, oItem) {
        $scope.oCarouselCurrentItem = oItem;
    });

    $scope.carouselGo = function (sAction) {
        var aItems = $scope.aCarouselItems || [];
        var iL = aItems.length
        var currentIndex = aItems.indexOf($scope.oCarouselCurrentItem);
        if (sAction === "next") {
            if (currentIndex < iL - 1 || currentIndex === 0) {
                $scope.oCarouselCurrentItem = aItems[currentIndex + 1];
            }
            else {
                $scope.oCarouselCurrentItem = aItems[0];
            }
        }
        else {
            if (currentIndex === 0) {
                $scope.oCarouselCurrentItem = aItems[iL - 1];
            }
            else {
                $scope.oCarouselCurrentItem = aItems[currentIndex - 1];
            }

        }
        $scope.$broadcast("updateCarouselScroll", $scope.oCarouselCurrentItem);

    };
    $scope.domain = {
        width: 1000,
        height: 400
    };
    // data for heat map generation
    $scope.heatMapData1 = {
        max: 120,
        data: [{
            x: 120,
            y: 50,
            value: 90
        }, {
            x: 500,
            y: 200,
            value: 120,
            radius: 10
        }]
    };
    $scope.gradientData1 = {
        '0.4': 'aqua',
        '.5': 'green',
        '.8': 'yellow',
        '.95': 'red'
    };
    // $scope.heatMapData2=[{ x: 60, y: 50, value: 120}];
    // generate random data
    var points = [];
    var max = 0;
    var width = 200;
    var height = 200;
    var len = 5;

    while (len--) {
        var val = Math.floor(Math.random() * 100);
        var radius = Math.floor(Math.random() * 70);
        max = Math.max(max, val);
        var point = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            value: val,
            // radius configuration on point basis
            radius: radius
        };
        points.push(point);
    }
    // heatmap data format
    var data = {
        max: max,
        data: points
    };
    $scope.heatMapData2 = data;
    $scope.gradientData2 = {
        '.5': 'yellow',
        '.8': 'red',
        '.95': 'blue',
        '.6': 'aqua'
    };
    $scope.getData = function (data) {
        var tooltip = document.querySelector('.tooltip');

        function updateTooltip(x, y, value) {
            // + 15 for distance to cursor
            var transl = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
            tooltip.style.webkitTransform = transl;
            tooltip.style.display = 'block';
            tooltip.innerHTML = value;
        }
        tooltip.style.display = 'block';
        updateTooltip(data.offSetX, data.offSetY, data.value);
    };

    $scope.$on('fit-width', function (event, args) {
        $scope.$broadcast('fit-width-value', {
            value: 25
        });
    });
    // sankey diagram data
    $scope.graphData = {
        'nodes': [{
            'node': 0,
            'name': 'Login',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 1,
            'name': 'Landing Page',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 2,
            'name': 'Project Page',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 3,
            'name': 'User Research',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png',
            'isTarget': 'true'
        }, {
            'node': 4,
            'name': 'UI Composer',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 5,
            'name': 'UI Catalog',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 6,
            'name': 'Data Modeler',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }],
        'links': [{
            'source': 0,
            'target': 1,
            'value': 20,
            'color': '#2ECC71'
        }, {
            'source': 1,
            'target': 2,
            'value': 20,
            'color': '#2ECC71'
        }, {
            'source': 2,
            'target': 3,
            'value': 10,
            'color': 'blue'
        }, {
            'source': 2,
            'target': 4,
            'value': 5,
            'color': 'blue'
        }, {
            'source': 2,
            'target': 6,
            'value': 5,
            'color': 'blue'
        }, {
            'source': 4,
            'target': 5,
            'value': 5,
            'color': 'blue'
        }, {
            'source': 6,
            'target': 5,
            'value': 5,
            'color': 'blue'
        }]
    };
    $scope.graphData1 = {
        'nodes': [{
            'node': 0,
            'name': 'Login',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 1,
            'name': 'Landing Page',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 2,
            'name': 'Project Page',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 3,
            'name': 'User Research',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 4,
            'name': 'UI Composer',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 5,
            'name': 'UI Catalog',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png',
            'isTarget': 'true'
        }, {
            'node': 6,
            'name': 'Data Modeler',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 7,
            'name': 'UI Composer',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 8,
            'name': 'Generate App',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 9,
            'name': 'Landing Page',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png'
        }, {
            'node': 10,
            'name': 'Review Study',
            image: '/resources/angular-sap-ui-elements/docs/assets/map3.png',
            'isTarget': 'true'
        }],
        'links': [{
            'source': 0,
            'target': 1,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 1,
            'target': 2,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 2,
            'target': 3,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 2,
            'target': 4,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 2,
            'target': 6,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 4,
            'target': 5,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 5,
            'target': 7,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 6,
            'target': 8,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 3,
            'target': 9,
            'value': 3,
            'color': 'blue'
        }, {
            'source': 9,
            'target': 10,
            'value': 3,
            'color': 'blue'
        }]
    };
    $scope.svgContainer = {
        width: 900,
        height: 450
    };
    $scope.svgContainer1 = {
        width: 1600,
        height: 600
    };
    $scope.showToolTip = function (data) {
        data = data.data;
        var tooltip = document.querySelector('.tooltip'),
            x, y, value;
        if (data.source) {
            x = data.source.dx + data.source.x;
            y = data.source.y + data.sy + data.dy / 2;
            value = data.value;
        }
        else {
            x = data.dx + data.x - 50;
            y = data.y / 2 + 50;
            value = data.name;
        } // + 15 for distance to cursor
        var transl = 'translate(' + (x + 50) + 'px, ' + (y + 15) + 'px)';
        tooltip.style.webkitTransform = transl;
        tooltip.style.display = 'block';
        tooltip.innerHTML = value;
    };
    $scope.dismissToolTip = function () {
        var tooltip = document.querySelector('.tooltip');
        tooltip.style.display = 'none';
    };
};
