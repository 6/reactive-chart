angular.module('HandsOnChartModule', []).directive('handsonchart', function() {
  return {
    restrict: 'AE',
    template: '<div class="handsonchart">' +
                '<div class="handsonchart-spreadsheet"></div>' +
                '<canvas class="handsonchart-visualization"></canvas>' +
              '</div>',
    link: function(scope, el, attr) {
      var canvas = el[0].querySelector(".handsonchart-visualization");
      var ctx = canvas.getContext("2d");
      $('.handsonchart-spreadsheet').handsontable({
        data: scope.handsonchart.data,
        minSpareRows: 1,
        minRows: 5,
        minCols: 6,
        stretchH: 'all',
        contextMenu: true,
        manualColumnResize: true,
        colHeaders: true,
        rowHeaders: true
      });
    }
  };
});
