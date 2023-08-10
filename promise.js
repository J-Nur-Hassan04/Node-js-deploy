const highchartsExporter = require('highcharts-export-server');

let promiseId = 0;

exports.generateAllCharts = (iteration, chartData, callback) => {
    let allPromises = [];
    let chartsLen = iteration.length;

    highchartsExporter.logLevel(4);
    highchartsExporter.initPool({
        maxWorkers: 100,
        initialWorkers: 50,
        workLimit: 100,
        queueSize: 50,
        timeoutThreshold: 10000
    });

    if (!iteration || !chartsLen) {
        highchartsExporter.killPool();

        return callback({
            code: '4',
            msg: 'Please send chartdata'
        });
    }

    for (let i = 0; i < chartsLen; i++) {
        allPromises.push(
            new Promise((resolve, reject) => {
                exports.getPieChartImg(chartData, false, results => {
                    if (results.code !== '0') {
                        return reject(results);
                    }

                    return resolve(results);
                });
            })
        );
    }

    Promise.all(allPromises)
        .then(data => {
            highchartsExporter.killPool();

            let imagesObject = {
                code: '0',
                custImg: {}
            };

            data.forEach((image, index) => {
                imagesObject.custImg['pc' + (index + 1)] = image.data;
                imagesObject.custImg.promiseId = image.promiseId;
            });

            return callback(imagesObject);
        })
        .catch(err => callback({
            code: '5',
            msg: 'Error generating charts',
            err
        }));
};

exports.getPieChartImg = (chartData, xlob, cb) => {
    let exportSettings = chartData;
    return generateBase64Chart(exportSettings, 1, cb);
};

function generateBase64Chart(exportSettings, number, cb) {
    // Perform an export
    highchartsExporter.export(exportSettings, function (err, res) {
        // The export result is now in res.
        // If the output is not PDF or SVG, it will be base64 encoded (res.data).
        // If the output is a PDF or SVG, it will contain a filename (res.filename).

        if (err) {
            return cb({
                code: '1',
                msg: 'Error in chart',
                err,
                exportSettings
            });
        }

        promiseId++;
        return cb({
            code: '0',
            msg: 'Success',
            promiseId: promiseId,
            data: 'data:image/png;base64,' + res.data,
        });
        // Kill the pool when we're done with it, and exit the application
        // highchartsExporter.killPool();
        // process.exit(1);
    });
}