angular.module('ReactiveChartModule', []).directive('reactiveChart', function() {
  var ctx, canvas;

  var isPresent = function(value) {
    return !(value === null || typeof value === "undefined" || String(value).match(/^\s*$/));
  };

  var clearChart = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  var renderChart = function(scope) {
    var datasets = scope.reactiveChart.datasets,
        labels = scope.reactiveChart.labels,
        graphType = scope.reactiveChart.graphType || 'line',
        options = scope.reactiveChart.options;

    // Handle invalid/null data
    if(!_.isArray(datasets)) {
      return;
    }
    var chartDatasets = [];
    _.each(datasets, function(data, i) {
      var chartDataset,
          isValidData,
          hexString = getDistinctColor(i),
          rgb = hexToRgb(hexString),
          rgbString = [rgb.r, rgb.g, rgb.b].join(",");

      if (graphType === 'pie') {
        // `data` is just a single data point
        isValidData = isPresent(data) && !_.isNaN(data) && _.isFinite(data) && data >= 0;
      }
      else {
        // `data` is an array of data points
        isValidData = _.all(data, function(datapoint) {
          return isPresent(datapoint) && !_.isNaN(datapoint) && _.isFinite(datapoint);
        });
      }
      if (!isValidData || data.length === 0) {
        return;
      }

      switch(graphType) {
        case "bar":
          chartDataset = {
            fillColor : "rgba("+rgbString+",0.5)",
            strokeColor : "rgba("+rgbString+",1)",
            data: data
          };
          break;
        case "pie":
          chartDataset = {
            color: "#"+hexString,
            value: data
          };
          break;
        default:
          chartDataset = {
            fillColor : "rgba("+rgbString+",0)",
            strokeColor : "rgba("+rgbString+",1)",
            pointColor : "rgba("+rgbString+",1)",
            pointStrokeColor : "#fff",
            data: data
          };
      }

      chartDatasets.push(chartDataset);
    });

    if(chartDatasets.length === 0) {
      return;
    }

    var chartDataObj = {},
        chartOptions,
        chartClass;
    if (graphType === 'pie') {
      chartClass = 'Pie';
      chartDataObj = chartDatasets;
      chartOptions = options || {};
    }
    else if (graphType === 'bar') {
      chartClass = 'Bar';
      chartDataObj = {labels: labels, datasets: chartDatasets};
      chartOptions = options || {};
    }
    else {
      chartClass = 'Line';
      chartDataObj = {labels: labels, datasets: chartDatasets};
      chartOptions = options || {bezierCurve: true, datasetStroke: true};
    }
    new Chart(ctx)[chartClass](chartDataObj, chartOptions);
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
