//Globals
var userId = window.localStorage["userId"];
var maxValue = 0;

$(document).ready(function () {
    document.addEventListener("deviceready", function () {
        //localStorage.setItem("userId", '');
        forceLogin();
    });
});

function forceLogin() {
    console.log("forceLogin " + userId);
    location.href = (userId !== undefined && userId !== '' && userId !== null) ? "#Data" : "#loginPage";
    showMyGraph();
    getMyObjectsData();
    getMyPersonalData();

}

function getUserId() {
    var username = $('#username').val();
    var password = $('#password').val();

    if (username !== undefined && username !== '' && password !== undefined && password !== '')
    {
        $.post('http://data.showmydata.nl/logindata', {name: username, password: password})
                .done(function (data) {
                    data = JSON.parse(data);
                    var receivedUserId = data[0].id;
                    if ($.isNumeric(receivedUserId) === true)
                    {
                        console.log("getUserId " + receivedUserId);
                        //window.localStorage["userId"] = ;
                        userId = receivedUserId;
                        localStorage.setItem("userId", receivedUserId);
                        forceLogin();
                    } else {
                        console.log("No Valid UserId Found");
                    }
                });
    } else {
        console.log('invalid stuff');
    }
}

function removeUserSettings() {
    userId = null;
    localStorage.setItem("userId", "");
    forceLogin();
}

function getMyPersonalData() {

    var dataUrl = 'http://data.showmydata.nl/customerdata/' + userId;
    var result_html = '';

    $.ajax({
        url: dataUrl,
        dataType: 'json',
        success: function (response) {
            //console.log("getMyPersonalData " + response);
            $.each(response, function (key, val) {                
                result_html += '<tr>';
                result_html += '<td>' + val.name + '</td>';
                result_html += '<td>' + val.street + ' ' + val.housenr + '</td>';
                result_html += '<td>' + val.zip + '</td>';
                result_html += '<td>' + val.city_name + '</td>';
                result_html += '<td>' + val.phone + '</td>';
                result_html += '<td>' + val.email + '</td>';
                result_html += '<td><a href="#" onclick="window.open(\'' + val.web + '\', \'_system\');" title="Visit your website" >' + val.web + '</a></td>';
                result_html += '</tr>';
            });
            $('#customer-data').empty().append(result_html);
        }
    });
}

function getMyObjectsData() {
    var dataUrl = 'http://data.showmydata.nl/objectdata/' + userId;
    var result_html = '';

    $.ajax({
        url: dataUrl,
        dataType: 'json',
        success: function (response) {
            console.log("getMyObjectsData " + response);
            $.each(response, function (key, val) {
                result_html += '<tr>';
                result_html += '<td>' + val.object_name + '</td>';
                result_html += '<td>' + val.object_street + ' ' + val.object_housenr + '</td>';
                result_html += '<td>' + val.object_zip + '</td>';
                result_html += '<td>' + val.object_city_name + '</td>';
                result_html += '<td>' + val.object_description + '</td>';
                result_html += '<td>' + val.object_remarks + '</td>';
                result_html += '<td>' + val.num_locations + '</td>';
                result_html += '</tr>';
            });
            $('#objects-body').empty().append(result_html);
            //$('#objects-body').table("rebuild");
        },
        error: console.log('getMyObjectsData failure')
    });
}

function showMyGraph() {
    // prepare chart data
    var dataUrl = 'http://data.showmydata.nl/graphdata/' + userId;

    var rawData = {};
    var sampleData = [];
    var maxValues = [];
    $.ajax({
        url: dataUrl,
        dataType: 'json',
        success: function (response) {
            $.each(response, function (key, val) {
                rawData[val.date_only] = {};
                $.each(response, function (key_new, val_new) {
                    if (val_new.date_only === val.date_only) {
                        rawData[val.date_only][val_new.object_name] = val_new.visitors_in;
                    }
                });
                //Send data to objects div

            });
            $.each(rawData, function (index, value) {
                var obj = {};
                obj['Day'] = index;
                $.each(value, function (key, val) {
                    obj[key] = val;
                });
                sampleData.push(obj);
            });
            //console.log(sampleData);
            createGraph(sampleData);
            //console.log(rawData);
        },
        //error: console.log('Miserable failure')
    });

}

function createGraph(sampleData) {
    console.log("createGraph " + sampleData);
    /*
     var demoData = [
     {Day: 'Ma', Amsterdam: 30, Haarlem: 15, Utrecht: 25},
     {Day: 'Di', Amsterdam: 25, Haarlem: 25, Utrecht: 30},
     {Day: 'Wo', Amsterdam: 30, Haarlem: 20, Utrecht: 25},
     {Day: 'Do', Amsterdam: 35, Haarlem: 25, Utrecht: 45},
     {Day: 'Vr', Amsterdam: 20, Haarlem: 20, Utrecht: 25},
     {Day: 'Za', Amsterdam: 30, Haarlem: 20, Utrecht: 30},
     {Day: 'Zo', Amsterdam: 60, Haarlem: 45, Utrecht: 90}
     ];
     */
    // prepare jqxChart settings
    var settings = {
        title: "Bezoekers per locatie",
        description: "",
        padding: {left: 5, top: 5, right: 5, bottom: 5},
        titlePadding: {left: 90, top: 0, right: 0, bottom: 10},
        source: sampleData,
        categoryAxis:
                {
                    dataField: 'Day',
                    showGridLines: false
                },
        colorScheme: 'scheme01',
        seriesGroups:
                [
                    {
                        type: 'column',
                        columnsGapPercent: 30,
                        seriesGapPercent: 0,
                        valueAxis:
                                {
                                    minValue: 0,
                                    //maxValue: 100,
                                    //unitInterval: 10,
                                    description: ''
                                },
                        series: [
                            {dataField: 'Amsterdam', displayText: 'Amsterdam'},
                            {dataField: 'Haarlem', displayText: 'Haarlem'},
                            {dataField: 'Utrecht', displayText: 'Utrecht'}
                        ]
                    }
                ]
    };

    // select the chartContainer DIV element and render the chart.
    $('#chartContainer').jqxChart(settings);
}