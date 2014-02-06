angular.module('ReactiveChartModule', []).directive('reactiveChart', function() {
  var ctx, canvas;

  var isPresent = function(value) {
    return !(value === null || typeof value === "undefined" || String(value).match(/^\s*$/));
  };

  var clearChart = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // var getSelectionData = function() {
  //   if(!) {
  //     clearVisualization();
  //     return;
  //   }
  //   var row1 = selection[0],
  //       col1 = selection[1],
  //       row2 = selection[2],
  //       col2 = selection[3];

  //   if (row1 === row2 && col1 === col2) {
  //     // Only one cell selected, ignore
  //     clearVisualization();
  //     return;
  //   }


  //   var selectionData = spreadsheet.getData(row1, col1, row2, col2),
  //       legendLabels = [],
  //       xAxisLabels = [];

  //   if (row1 === row2) {
  //     swapAxes = false;
  //   }

  //   if (swapAxes) {
  //     selectionData = transposeArray(selectionData);
  //     legendLabels = spreadsheet.getData(0, col1, 0, col2)[0];
  //     xAxisLabels = _.map(spreadsheet.getData(row1, 0, row2, 0), function(col) {
  //       return col[0];
  //     });
  //   }
  //   else {
  //     xAxisLabels = spreadsheet.getData(0, col1, 0, col2)[0];
  //     legendLabels = _.map(spreadsheet.getData(row1, 0, row2, 0), function(col) {
  //       return col[0];
  //     });
  //   }
  //   if (graphType === 'pie') {
  //     legendLabels = xAxisLabels;
  //   }
  //   return {
  //     selection: selectionData,
  //     xAxis: xAxisLabels,
  //     legend: legendLabels
  //   };
  // };

  // var getChartDatasets = function(data) {
  //   var datasets = [];
  //   for(var i = 0; i < data.selection.length; i++) {
  //     var rgb = hexToRgb(getDistinctColor(i));
  //     rgb = [rgb.r, rgb.g, rgb.b].join(",");

  //     var legendTitle = null;
  //     if ($scope.reactiveChart.showLegend) {
  //       legendTitle = data.legend[i];
  //     }
  //     if (graphType === 'bar') {
  //       datasets.push({
  //         fillColor : "rgba("+rgb+",0.5)",
  //         strokeColor : "rgba("+rgb+",1)",
  //         data: data.selection[i],
  //         title: legendTitle
  //       });
  //     }
  //     else if (graphType === 'pie') {
  //       // TODO - legend doesn't work correctly
  //       for(var j = 0; j < data.selection[0].length; j++) {
  //         datasets.push({
  //           color: "#"+getDistinctColor(j),
  //           value: data.selection[0][j],
  //           title: data.legend[j]
  //         });
  //       }
  //     }
  //     else {
  //       datasets.push({
  //         fillColor : "rgba("+rgb+",0)",
  //         strokeColor : "rgba("+rgb+",1)",
  //         pointColor : "rgba("+rgb+",1)",
  //         pointStrokeColor : "#fff",
  //         data: data.selection[i],
  //         title: legendTitle
  //       });
  //     }
  //   }

  //   return datasets;
  // };

  var renderChart = function(scope) {
    var datasets = scope.reactiveChart.datasets,
        labels = scope.reactiveChart.labels,
        graphType = scope.reactiveChart.graphType || 'line',
        options = scope.reactiveChart.options;

    // Handle invalid/null data
    if(!_.isArray(datasets)) {
      return;
    }
    var newDatasets = [];
    _.each(datasets, function(dataset) {
      var areAnyNull = _.any(dataset, function(datapoint) {
        return !isPresent(datapoint) || _.isNaN(datapoint);
      });
      if (!areAnyNull && dataset.length > 0) {
        newDatasets.push(dataset);
      }
    });
    datasets = newDatasets;

    if(datasets.length === 0) {
      return;
    }

    console.log(labels, datasets);

    var chartData = {},
        chartOptions,
        chartClass;
    if (graphType === 'pie') {
      chartClass = 'Pie';
      chartData = datasets;
      chartOptions = options || {};
    }
    else if (graphType === 'bar') {
      chartClass = 'Bar';
      chartData = {labels: labels, datasets: datasets};
      chartOptions = options || {};
    }
    else {
      chartClass = 'Line';
      chartData = {labels: labels, datasets: datasets};
      chartOptions = options || {bezierCurve: true, datasetStroke: true};
    }
    new Chart(ctx)[chartClass](chartData, chartOptions);
  };

  return {
    restrict: 'AE',
    template: '<canvas class="reactive-chart"></canvas>',
    link: function(scope, el, attr) {
      canvas = el[0].querySelector(".reactive-chart");
      ctx = canvas.getContext("2d");

      scope.$watch('reactiveChart.data', function() {
        clearChart();
        renderChart(scope);
      });
    }
  };
});
