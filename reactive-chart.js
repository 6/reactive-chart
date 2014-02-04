angular.module('ReactiveChartModule', []).directive('reactiveChart', function() {
  var $scope, ctx, canvas, spreadsheet, $spreadsheet, swapAxes, graphType;

  var clearVisualization = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  var getSelectionData = function() {
    var selection = spreadsheet.getSelected();
    if(!selection) {
      clearVisualization();
      return;
    }
    var row1 = selection[0],
        col1 = selection[1],
        row2 = selection[2],
        col2 = selection[3];

    if (row1 === row2 && col1 === col2) {
      // Only one cell selected, ignore
      clearVisualization();
      return;
    }

    swapAxes = $scope.reactiveChart.swapAxes || col1 === col2,
    graphType = $scope.reactiveChart.graphType || 'line';

    var selectionData = spreadsheet.getData(row1, col1, row2, col2),
        legendLabels = [],
        xAxisLabels = [];

    if (row1 === row2) {
      swapAxes = false;
    }

    if (swapAxes) {
      selectionData = transposeArray(selectionData);
      legendLabels = spreadsheet.getData(0, col1, 0, col2)[0];
      xAxisLabels = _.map(spreadsheet.getData(row1, 0, row2, 0), function(col) {
        return col[0];
      });
    }
    else {
      xAxisLabels = spreadsheet.getData(0, col1, 0, col2)[0];
      legendLabels = _.map(spreadsheet.getData(row1, 0, row2, 0), function(col) {
        return col[0];
      });
    }
    if (graphType === 'pie') {
      legendLabels = xAxisLabels;
    }
    return {
      selection: selectionData,
      xAxis: xAxisLabels,
      legend: legendLabels
    };
  };

  var getChartDatasets = function(data) {
    var datasets = [];
    for(var i = 0; i < data.selection.length; i++) {
      var rgb = hexToRgb(getDistinctColor(i));
      rgb = [rgb.r, rgb.g, rgb.b].join(",");

      var legendTitle = null;
      if ($scope.reactiveChart.showLegend) {
        legendTitle = data.legend[i];
      }
      if (graphType === 'bar') {
        datasets.push({
          fillColor : "rgba("+rgb+",0.5)",
          strokeColor : "rgba("+rgb+",1)",
          data: data.selection[i],
          title: legendTitle
        });
      }
      else if (graphType === 'pie') {
        // TODO - legend doesn't work correctly
        for(var j = 0; j < data.selection[0].length; j++) {
          datasets.push({
            color: "#"+getDistinctColor(j),
            value: data.selection[0][j],
            title: data.legend[j]
          });
        }
      }
      else {
        datasets.push({
          fillColor : "rgba("+rgb+",0)",
          strokeColor : "rgba("+rgb+",1)",
          pointColor : "rgba("+rgb+",1)",
          pointStrokeColor : "#fff",
          data: data.selection[i],
          title: legendTitle
        });
      }
    }

    return datasets;
  };

  var renderChart = function(data, datasets) {
    var chartData = {},
        chartOptions = {},
        chartClass;
    if (graphType === 'pie') {
      chartClass = 'Pie';
      chartData = datasets;
    }
    else if (graphType === 'bar') {
      chartClass = 'Bar';
      chartData = {labels: data.xAxis, datasets: datasets};
    }
    else {
      chartClass = 'Line';
      chartData = {labels: data.xAxis, datasets: datasets};
      chartOptions = {bezierCurve: true, datasetStroke: true};
    }
    new Chart(ctx)[chartClass](chartData, chartOptions);
  };

  var renderVisualization = function() {
    var data = getSelectionData();
    if(!data) {
      return; // No data selected
    }
    var datasets = getChartDatasets(data);

    if (graphType !== 'pie' && !$scope.reactiveChart.showXAxisLabels) {
      data.xAxis = [];
      for(var i = 0; i < datasets[0].data.length; i++) {
        data.xAxis.push("");
      }
    }

    renderChart(data, datasets);
  };

  return {
    restrict: 'AE',
    template: '<div class="reactive-chart">' +
                '<div class="reactive-chart-spreadsheet"></div>' +
                '<canvas class="reactive-chart-visualization"></canvas>' +
              '</div>',
    link: function(scope, el, attr) {
      $scope = scope;
      canvas = el[0].querySelector(".reactive-chart-visualization");
      ctx = canvas.getContext("2d");
      $spreadsheet = $('.reactive-chart-spreadsheet');
      $spreadsheet.handsontable({
        data: scope.reactiveChart.data,
        minSpareRows: 1,
        minRows: 5,
        minCols: 6,
        stretchH: 'all',
        contextMenu: true,
        manualColumnResize: true,
        colHeaders: true,
        rowHeaders: true,
        afterSelectionEnd: renderVisualization,
        afterDeselect: clearVisualization
      });
      spreadsheet = $spreadsheet.handsontable("getInstance");

      scope.$watch('reactiveChart.data', function() {
        clearVisualization();
        renderVisualization();
      });
    }
  };
});
