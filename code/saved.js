const mpt = d3.select('#mpt')
  .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('position', 'relative');

// Graph information
var width_mpt = document.getElementById('mpt').offsetWidth;
var height_mpt = document.getElementById('mpt').offsetHeight;

// Build X scales and axis
var  x_mpt = mpt.append("g")
  .attr("class", "x-axis")

// Build Y scales and axis
var y_mpt = mpt.append("g")
  .attr("class", "y-axis")

// Add the line
var mptLine = mpt.append("path")
  .attr("class", "return")
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round");

// Add efficient frontier
var efficientLine = mpt.append("line")
  .attr("class", "efficientfrontier")
  .style("stroke-width", 2)
  .style("stroke-dasharray", ("3, 3"))
  .style("stroke", "red")
  .style("fill", "none");

// Creates legends
const yLegend = mpt.append("text")
  .attr("y", legendy)
  .attr("x", legendx)
  .text("Return %");

const xLegend = mpt.append("text")
  .attr("y", height_mpt)
  .attr("x", width_mpt/2)
  .text("Risk %");

var id = 0

plotMPT()

function plotMPT(){

  // d3.selectAll("#mpt > *").remove();

  // asset_1 = "GOLD"//document.getElementById("asset1").value.split(" ")[0]
  asset_1 = document.getElementById("asset1").value.split(" ")[0]
  asset_2 = document.getElementById("asset2").value.split(" ")[0]

  if (asset_1 == "" || asset_2 == ""){
    asset_1 = "GOLD"
    asset_2 = "SPY"

    document.getElementById("asset1").value = "GOLD - Barrick Gold Corporation"
    document.getElementById("asset2").value = "SPY - SPDR S&P 500 ETF"
  }

  Promise.all([
    d3.json("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&outputsize=full&symbol=".concat(asset_1, "&apikey=", key)),
    d3.json("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&outputsize=full&symbol=".concat(asset_2, "&apikey=", key))])
  .then(function(data) {

      data1 = data[0]["Time Series (Daily)"]
      data2 = data[1]["Time Series (Daily)"]

      // console.log(data)

      var dates = Object.keys(data1).reverse().map(dateString => parseTime(dateString))

      // Prepare data
      var samples = Math.min(Object.keys(data1).length, Object.keys(data2).length, 5000)
      var data_1 = extractData(data1, samples)
      var data_2 = extractData(data2, samples)

      // console.log(data_1.length)

      // Daily return
      var daily_1 = dailyChange(data_1);
      var daily_2 = dailyChange(data_2);

      // Calculate return
      return_1 = annualReturn(daily_1)
      return_2 = annualReturn(daily_2)

      // Calculate risk
      risk_1 = math.std(daily_1) * math.sqrt(workDays)
      risk_2 = math.std(daily_2) * math.sqrt(workDays)

      // Calculate correlation
      correlation = correlation_(data_1, data_2)

      // Generate data to plot
      var mpt_data = []
      for (var i = 0; i <= 1; i = i + 0.1 ){
          annual_risk = math.sqrt(math.pow(1 - i, 2) * math.pow(risk_1, 2) +
                                  math.pow(i, 2) * math.pow(risk_2, 2) +
                                  2 * correlation * i * (1-i) * risk_1 * risk_2)*100;
          annual_return = ((1 - i) * return_1 + i * return_2)*100;
          mpt_data.push({id: id++, risk: annual_risk, return: annual_return, asset_1: math.round((1-i)*100), asset_2: math.round(i*100)})
       }

      // console.log(mpt_data)

      // Graph margins
      x_margin = (d3.max(mpt_data, d => d.risk) - d3.min(mpt_data, d => d.risk)) * 0.1
      y_margin = (d3.max(mpt_data, d => d.return) - d3.min(mpt_data, d => d.return)) * 0.1

      // Build X scales and axis
      const x = d3.scaleLinear()
        .domain([d3.min(mpt_data, d => d.risk) - x_margin, d3.max(mpt_data, d => d.risk) + x_margin])
        .range([margin.left, width_mpt - margin.right]);


      x_mpt.attr("transform", `translate(0,${height_mpt - margin.bottom})`)
        .call(d3.axisBottom(x)
          .ticks(width_mpt / 50));

      // Build Y scales and axis
      const y = d3.scaleLinear()
        .domain([d3.min(mpt_data, d => d.return) - y_margin, d3.max(mpt_data, d => d.return) + y_margin])
        .range([height_mpt - margin.bottom, margin.top]);

      y_mpt.attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      // Generate line
      const mpt_line = d3.line()
        .x(d => x(d.risk))
        .y(d => y(d.return))
        .curve(d3.curveCatmullRom.alpha(0.5));

      // Add the lines
      // Risk return
      mptLine.data([mpt_data])
        .transition()
            .duration(1000)
        .attr("d", mpt_line);
      // Efficient frontier
      efficientLine.transition()
            .duration(1000)
        .attr("x1", x(d3.min(mpt_data, d => d.risk)))
        .attr("y1", 0 + margin.top)
        .attr("x2", x(d3.min(mpt_data, d => d.risk)))
        .attr("y2", height_mpt - margin.bottom);

      var frontier = mpt_data.reduce(function(res, obj) {return (obj.risk < res.risk) ? obj : res;})
      calculateHistory(dates, data_1, data_2, frontier.asset_1, frontier.asset_2, asset_1, asset_2)
      calculateDCA(dates, data_1, data_2, frontier.asset_1/100, frontier.asset_2/100, asset_1, asset_2)

      // create tooltip
      const tooltip = d3.select("#mpt")
        .append("div")
          .attr("class", "tooltip")
          .style("opacity", "0")
          .style("display", "none")
          .style("position", "absolute")
          .style('z-index', '1000000');

      // Add the dots
      var dots  = mpt.selectAll("circle")
        .data(mpt_data, function(d) {return d["id"]});

      dots.transition()
          .duration(750)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.risk); })
        .attr("cy", function(d) { return y(d.return); });

      dots.enter().append("circle")
        .attr("r", 0)
        .attr("cx", function(d) { return x(d.risk); })
        .attr("cy", function(d) { return y(d.return); })
        .on("mouseover", function (d) {
          let coords = d3.mouse(this);
          let xCoord = coords[0], yCoord = coords[1];
          d3.select(this).transition()
                    .duration(700)
                    .attr("r", 10)
          tooltip.html(`<div class="tooltiptext">
                        <div class="money"><b>${asset_1} - ${d.asset_1} %</b></div>
                        <div class="money"><b>${asset_2} - ${d.asset_2} %</b></div>
                        <br>
                        <div>Risk: ${parseFloat(d.risk).toFixed(2)} %</div>
                        <div>Return: ${parseFloat(d.return).toFixed(2)} %</div></div>`)
            .style('display', 'block')
            .style('left', xCoord - 60)
            .style('top', yCoord + 20)
            .transition()
                      .duration(300)
                      .style('opacity', '1');
          })
        .on("mouseleave", function() {
          d3.select(this).transition()
                    .duration(700)
                    .attr("r", 4)
          tooltip.transition()
                    .duration(300)
                    .style("opacity", "0")
           // .style("display", "none")
          })
        .on("click", function(d) {
          // console.log(data_1)
          // console.log(daily_1)
          calculateHistory(dates, data_1, data_2, d.asset_1, d.asset_2, asset_1, asset_2)
          calculateDCA(dates, data_1, data_2, d.asset_1/100, d.asset_2/100, asset_1, asset_2)
        })
        .transition()
          .duration(700)
          .attr("r", 4);

      dots.exit().transition()
          .style('fill', 'red')
        .transition()
          .duration(700)
          .style('opacity', 1e-6)
          .remove();

    })
    .catch(err => console.log(err));
}

function extractData(object, samples){
  data = []

  keys = Object.keys(object).slice(0, samples)

  for (var i = 0; i < keys.length; i++){
  // for (var key in keys) {
      // if (object.hasOwnProperty(key)) {
        data.push(parseFloat(object[keys[i]]["5. adjusted close"]));
      // }
  }
  return data.reverse();
}

// return value of the date selected
var getValue = (data,date) => {
  var sameDate = (a,b) => (a.getDate() === b.getDate()) && (a.getMonth() === b.getMonth()) && (a.getFullYear() === b.getFullYear());
  for (let i = 0; i < data.length; i++) {
    let same = sameDate(data[i].date, date);
    if (same) {
      return data[i].value;
    } else {
      continue;
    }
  }
};

// Calculate the return of one day in respect of the previous one
function dailyChange(values){
  temp = []
  for (i=0; i < values.length - 1; i++){
    temp.push((values[i+1]-values[i])/values[i])
  }
  return temp
}

// Return annual return
function annualReturn(values){
  averageDaily = math.mean(values)
  return math.pow(averageDaily + 1, workDays) - 1
}

// Calculate correlation
function correlation_(data_1, data_2){
  average_1 = math.mean(data_1)
  average_2 = math.mean(data_2)
  stdev_1 = math.std(data_1)
  stdev_2 = math.std(data_2)

  diff_1 = data_1.map(function(value){return value - average_1})
  diff_2 = data_2.map(function(value){return value - average_2})

  mult = []

  for (i=0; i < data_1.length; i++){
    mult.push(diff_1[i] * diff_2[i])
  }

  correlation = (math.sum(mult)/(stdev_1 * stdev_2)) / diff_1.length

  return correlation
}
