const express = require("express");
const bodyParser = require("body-parser");
const chartExporter = require("highcharts-export-server");
const app = express();
app.use(bodyParser.json());
const port = 7000;

app.post("/chart", function (req, res) {
  chartExporter.initPool();
  chartExporter.export(req.body, (err, response) => {
    if (err) {
      console.error("Error:", err);
      return res.send({
        status : 400,
        message : "Error",
        err 
      });
    }
    var imageb64 = response.data;
    chartExporter.killPool();
    return res.send({
      status: 200,
      message: "Success",
      body: `<html><body><img src=data:image/png;base64,${imageb64} alt="image will apear here" width="1000" height="1200"></body></html>`,
    });
  });
});

app.get("/", function (req, res) {
  res.send("GET request to homepage");
});

app.listen(port, () => {
  console.log(`server Now Listening on Port ${port}`);
});

module.exports = app;
