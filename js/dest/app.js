(function ($) {
    var DEBUG = true;
    var CURRENCY_LABELS = {
        AUD: 'Australian dollar',
        BGN: 'Bulgarian lev',
        BRL: 'Brazilian real',
        CAD: 'Canadian dollar',
        CHF: 'Swiss franc',
        CNY: 'Chinese renminbi',
        CZK: 'Czech koruna',
        DKK: 'Danish krone',
        GBP: 'British pound',
        HKD: 'Hong Kong dollar',
        HRK: 'Croatian kuna',
        HUF: 'Hungarian forint',
        IDR: 'Indonesian rupiah',
        ILS: 'Israeli new sheqel',
        INR: 'Indian rupee',
        JPY: 'Japanese yen',
        KRW: 'South Korean won',
        MXN: 'Mexican peso',
        MYR: 'Malaysian ringgit',
        NOK: 'Norwegian krone',
        NZD: 'New Zealand dollar',
        PHP: 'Philippine peso',
        PLN: 'Polish zloty',
        RON: 'Romanian leu',
        RUB: 'Russian ruble',
        SEK: 'Swedish krona',
        SGD: 'Singapore dollar',
        THB: 'Thai baht',
        TRY: 'Turkish lira',
        USD: 'US dollar',
        ZAR: 'South African rand',
    };
    var App = (function () {
        function App() {
            this.order = 'ASC';
            this.limit = 50;
        }
        App.prototype.init = function () {
            this.form();
            this.getCurrencyData();
        };
        App.prototype.update = function () {
            var chart = new CurrencyChart(this.data.rates, this.limit, this.order);
            chart.render();
        };
        App.prototype.form = function () {
            var $this = this;
            $('#form-order').click(function (e) {
                e.preventDefault();
                var current_order = $(this).data('order'), input_label = 'Ordine', new_order;
                if (current_order === 'ASC') {
                    input_label += ' &darr;';
                    new_order = 'DESC';
                }
                else if (current_order === 'DESC') {
                    input_label += ' &uarr;';
                    new_order = 'ASC';
                }
                if (new_order) {
                    $(this).html(input_label);
                    $(this).data('order', new_order);
                    $this.order = $('#form-order').data('order');
                    $this.update();
                }
                else {
                }
            });
            var _limit_timeout = null;
            $('#form-limit').change(function () {
                var $el = $(this);
                if (_limit_timeout)
                    clearTimeout(_limit_timeout);
                _limit_timeout = setTimeout(function () {
                    var new_limit = $el.val();
                    if ($this.limit !== new_limit) {
                        $this.limit = $el.val();
                        $this.update();
                    }
                }, 500);
            });
        };
        App.prototype.getCurrencyData = function () {
            var $this = this, url = "http://api.fixer.io/latest";
            if (!DEBUG) {
                $.getJSON(url)
                    .done(function (response) {
                    $this.data = response;
                    $this.update();
                })
                    .fail(function (response) {
                })
                    .always(function (response) { });
            }
            else {
                $this.data = dummy;
                $this.update();
            }
        };
        return App;
    }());
    var CurrencyChart = (function () {
        function CurrencyChart(rates, limit, order) {
            this.labels = [];
            this.series = [];
            this.rates = rates;
            this.limit = limit;
            this.order = order;
            this.init();
        }
        CurrencyChart.prototype.filter = function () {
            var $this = this;
            this.filtered_rates = (function () {
                var arr = [];
                var key;
                for (key in $this.rates) {
                    var value = $this.rates[key];
                    if (value <= $this.limit)
                        arr.push({ key: key, val: value });
                }
                return arr;
            })();
        };
        CurrencyChart.prototype.sort = function () {
            if (this.order === 'ASC') {
                this.filtered_rates.sort(function (a, b) {
                    return a.val - b.val;
                });
            }
            else if (this.order === 'DESC') {
                this.filtered_rates.sort(function (a, b) {
                    return b.val - a.val;
                });
            }
        };
        CurrencyChart.prototype.setLabels = function () {
            var $this = this;
            this.filtered_rates.forEach(function (obj) {
                $this.labels.push(obj.key);
            });
        };
        CurrencyChart.prototype.setSeries = function () {
            var $this = this;
            this.filtered_rates.forEach(function (obj) {
                $this.series.push(obj.val);
            });
        };
        CurrencyChart.prototype.init = function () {
            this.filter();
            this.sort();
            this.setLabels();
            this.setSeries();
        };
        CurrencyChart.prototype.render = function () {
            var ctx = document.getElementById('currency-chart').getContext("2d"), color = Chart.helpers.color;
            if (!CurrencyChart.chart) {
                CurrencyChart.chart_data = {
                    labels: this.labels,
                    datasets: [{
                            label: 'valore',
                            borderWidth: 1,
                            backgroundColor: color('blue').alpha(0.5).rgbString(),
                            borderColor: 'blue',
                            data: this.series
                        }]
                };
                CurrencyChart.chart = new Chart(ctx, {
                    type: 'horizontalBar',
                    data: CurrencyChart.chart_data,
                    options: {
                        elements: {
                            rectangle: {
                                borderWidth: 2,
                            }
                        },
                        responsive: true,
                        legend: {
                            position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'Valore di cambio delle monete rispetto all\'Euro'
                        },
                        tooltips: {
                            custom: function (tooltip) {
                                if (tooltip.title) {
                                    var old_title = tooltip.title[0], currency_label = CURRENCY_LABELS[old_title];
                                    if (currency_label) {
                                        tooltip.title[0] = currency_label + ' (' + old_title + ')';
                                    }
                                }
                            }
                        }
                    }
                });
            }
            else {
                this.update();
            }
        };
        CurrencyChart.prototype.update = function () {
            CurrencyChart.chart_data.labels = this.labels;
            CurrencyChart.chart_data.datasets[0].data = this.series;
            CurrencyChart.chart.update();
        };
        return CurrencyChart;
    }());
    var app = new App();
    app.init();
})(jQuery);
//# sourceMappingURL=app.js.map