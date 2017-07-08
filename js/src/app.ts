(function($){
    
    // static
    const DEBUG = true;
    const CURRENCY_LABELS = {
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

    // classes
    class App {
        private data;

        order: string = 'ASC';
        limit: number = 50;

        // init
        init(){
            this.form();
            this.getCurrencyData();
        }

        // update
        update(){
            // chart
            var chart = new CurrencyChart(this.data.rates, this.limit, this.order);
            chart.render();
        }

        // init form events 
        form(){
            // order click event
            var $this = this;
            $('#form-order').click(function(e){
                e.preventDefault();
                var current_order = $(this).data('order'),
                    input_label = 'Ordine', new_order;

                if(current_order === 'ASC'){
                    input_label += ' &darr;';
                    new_order = 'DESC';
                } else if(current_order === 'DESC'){
                    input_label += ' &uarr;';
                    new_order = 'ASC';
                }

                if(new_order){
                    $(this).html(input_label);
                    $(this).data('order', new_order);
                    $this.order = $('#form-order').data('order');

                    // udpate
                    $this.update();
                } else {
                    // TODO: error
                }
            });

            // limit change event
            var _limit_timeout = null;
            $('#form-limit').change(function(){
                var $el = $(this);

                // timeout preventing multiple calls
                if(_limit_timeout) clearTimeout(_limit_timeout);
                _limit_timeout = setTimeout(function(){
                    var new_limit = $el.val();
                    if($this.limit !== new_limit){
                        $this.limit = $el.val();
                        // udpate
                        $this.update();
                    }
                }, 500);
            });
        }
        
        // get currency json data  
        getCurrencyData(){
            var $this = this,
                url = "http://api.fixer.io/latest";

            if(!DEBUG){
                // request
                $.getJSON(url)
                    .done(function(response){
                        $this.data = response;

                        // first update
                        $this.update();
                    })
                    .fail(function(response){
                        // TODO: error
                    })
                    .always(function(response){})
            } else {
                $this.data = dummy;

                // first update
                $this.update();
            }
        }
    }

    class CurrencyChart {
        static chart;
        static chart_data;
        private rates;
        private filtered_rates;
        private limit;
        private order;
        private labels: string[] = [];
        private series: number[] = [];
        private chart;

        constructor(rates, limit: number, order: string){
            this.rates = rates;
            this.limit = limit;
            this.order = order;

            // init
            this.init();
        }
        private filter(){
            var $this = this;
            this.filtered_rates = (function(){
                var arr = [], var key;
                for(key in $this.rates){
                    var value = $this.rates[key];
                    if(value <= $this.limit) arr.push({key: key, val: value});
                }
                return arr;
            })();
        }
        private sort(){
            if(this.order === 'ASC'){
                this.filtered_rates.sort(function(a, b){
                    return a.val - b.val;
                });
            } else if(this.order === 'DESC'){
                this.filtered_rates.sort(function(a, b){
                    return b.val - a.val;
                });
            }
        }
        private setLabels(){
            var $this = this;
            this.filtered_rates.forEach(function(obj){
                $this.labels.push(obj.key);
            });
        }
        private setSeries(){
            var $this = this;
            this.filtered_rates.forEach(function(obj){
                $this.series.push(obj.val);
            });
        }
        private init(){
            this.filter();
            this.sort();
            this.setLabels();
            this.setSeries();
        }
        render() {
            // new only once
            var ctx = document.getElementById('currency-chart').getContext("2d"),
                color = Chart.helpers.color;

            if(!CurrencyChart.chart){
                CurrencyChart.chart_data = {
                    labels: this.labels,
                    datasets:[{
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
                            custom: function(tooltip){
                                if(tooltip.title){
                                    var old_title = tooltip.title[0],
                                        currency_label = CURRENCY_LABELS[old_title];
                                    
                                    if(currency_label){
                                        tooltip.title[0] = currency_label + ' (' + old_title + ')';
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                this.update();   
            }
        }
        private update(){
            CurrencyChart.chart_data.labels = this.labels;
            CurrencyChart.chart_data.datasets[0].data = this.series;
            CurrencyChart.chart.update();
        }
    }

    var app = new App();
    app.init();
})(jQuery);
