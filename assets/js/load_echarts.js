var echart_chart_variables = new Map();

// load one chart, as a promise
const loadChart = (filename, target_element) => {
    return new Promise((resolve, reject) => {
        import(filename)
        .then(module => {
            if (! filename) {
                reject(`Failed to provide data-filename attribute, can't load chart.`);
            }
            
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            let chart = echarts.init(target_element, isDark ? 'dark' : 'macarons');
            chart.setOption(module.option);
            echart_chart_variables.set(filename, chart);
            resolve();
        })
        .catch(err => {
            reject(`Error loading module for chart '${filename}': ${err}`);
        });
    });
};

const loadAllCharts = function() {
    return new Promise((resolve, reject) => {
        // schedule asynchronous loading of all charts all charts, sequentially
        let chart_loading_promises = [];
        Array.from(document.getElementsByClassName("echarts_chart")).forEach(el => {
            let p = loadChart(el.dataset.filename, el);
            chart_loading_promises.push(p);
        });

        // execute all chart-loading promises sequentially
        Promise.all(chart_loading_promises).then(result => {
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });
};

document.addEventListener("DOMContentLoaded", function(event) {
    if (document.getElementsByClassName("echarts_chart").length == 0) return;
    loadAllCharts().then(result => {
        // ensure charts are resized when the viewport changes
        document.addEventListener('resize', function () {
            echart_chart_variables.forEach((chartvar) => {
                chartvar.resize();
            });
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            loadAllCharts();
        });
    });
});