angular.module('HandsOnChartModule', []).directive('handsonchart', function() {
  return {
    restrict: 'AE',
    template: '<div class="handsonchart">' +
                '<div class="handsonchart-spreadsheet"></div>' +
              '</div>',
    link: function(scope, el, attr) {
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
