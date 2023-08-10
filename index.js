const express = require("express");
const bodyParser = require("body-parser");
const exporter = require('./promise.js');
const chartExporter = require("highcharts-export-server");
const app = express();
app.use(bodyParser.json());
const port = 5000;

app.post("/chart", function (req, res) {
  const itertate = [1];
  exporter.generateAllCharts(itertate, req.body, results => {
    console.log(results)
    if (results.code === '0') {
      return res.send({
        status: 200,
        message: "Success",
        body: `<html><body><img src=${results.custImg.pc1} alt="image will apear here" width="1000" height="1200"></body></html>`,
      });
    } else {
      console.log('Error #' + results.code + ': ' + results.msg);
      if (results.err) {
        return res.send({
          status: 400,
          message: "Error",
          body: results?.err
        });
      }
    }
    process.exit();
  });
  // chartExporter.initPool();
  // chartExporter.export(req.body, (err, response) => {
  //   if (err) {
  //     console.error("Error:", err);
  //     return res.send({
  //       status: 200,
  //       message: "Success",
  //       body: `<html><body><img src=data:image/png;base64,${imageb64} alt="image will apear here" width="1000" height="1200"></body></html>`,
  //     });
  //   }
  //   var imageb64 = response.data;
  //   res.send({
  //     status: 200,
  //     message: "Success",
  //     body: `<html><body><img src=data:image/png;base64,${imageb64} alt="image will apear here" width="1000" height="1200"></body></html>`,
  //   });
  // });

}, () => chartExporter.killPool());

app.get("/", function (req, res) {
  res.send("GET request to homepage");
});

app.listen(port, () => {
  console.log(`server Now Listening on Port ${port}`);
});

module.exports = app;
