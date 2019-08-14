
var workDays = 261
var period = 236
const parseTime = d3.utcParse("%d-%b-%y");

// Months
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// create tooltip
const tooltip = d3.select(".mpt")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0")
    .style("display", "none")
    .style("position", "absolute")
    .style('z-index', '1000000');

// Graph information
const margin = {top: 20, right: 50, bottom: 40, left: 50};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// get data
d3.csv("dataset/test2.csv")
  .then(data => {

    // Asset names
    var asset_1 = "BOVA11"
    var asset_2 = "FIXX11"

    // Get data from csv
    data = data.map(row => {
      return {
        date: parseTime(row["Date"]),
        slg: +row[asset_1],
        usa: +row[asset_2]
      };
    });

    // Prepare data
    var data_1 = data.slice(0, period).map(function(value){return value.slg;});
    var data_2 = data.slice(0, period).map(function(value){return value.usa;});

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
    correlation = correlation(data_1, data_2)

    // Generate data to plot
    var mpt_data = []
    for (var i = 0; i <= 1; i = i + 0.1 ){
        annual_risk = math.sqrt(math.pow(1 - i, 2) * math.pow(risk_1, 2) +
                                math.pow(i, 2) * math.pow(risk_2, 2) +
                                2 * correlation * i * (1-i) * risk_1 * risk_2)*100;
        annual_return = ((1 - i) * return_1 + i * return_2)*100;
        mpt_data.push({risk: annual_risk, return: annual_return, asset_1: math.round((1-i)*100), asset_2: math.round(i*100)})
     }

    const mpt = d3.select('.mpt')
      .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'relative');

    // Graph margins
    x_margin = (d3.max(mpt_data, d => d.risk) - d3.min(mpt_data, d => d.risk)) * 0.1
    y_margin = (d3.max(mpt_data, d => d.return) - d3.min(mpt_data, d => d.return)) * 0.1

    // Build X scales and axis
    const x = d3.scaleLinear()
      .domain([d3.min(mpt_data, d => d.risk) - x_margin, d3.max(mpt_data, d => d.risk) + x_margin])
      .range([margin.left, width - margin.right]);
    mpt.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .ticks(width / 80));

    // Build Y scales and axis
    const y = d3.scaleLinear()
      .domain([d3.min(mpt_data, d => d.return) - y_margin, d3.max(mpt_data, d => d.return) + y_margin])
      .range([height - margin.bottom, margin.top]);
    mpt.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Generate line
    const mpt_line = d3.line()
      .x(d => x(d.risk))
      .y(d => y(d.return))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Add the line
    mpt.append("path")
      .data([mpt_data])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", mpt_line);

    // Add efficient frontier
    mpt.append("line")
      .attr("x1", x(d3.min(mpt_data, d => d.risk)))
      .attr("y1", 0 + margin.top)
      .attr("x2", x(d3.min(mpt_data, d => d.risk)))
      .attr("y2", height - margin.bottom)
      .style("stroke-width", 2)
      .style("stroke-dasharray", ("3, 3"))
      .style("stroke", "red")
      .style("fill", "none");

    // Add the dots
    mpt.selectAll("dot")
        .data(mpt_data)
      .enter().append("circle")
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.risk); })
        .attr("cy", function(d) { return y(d.return); })
        .on("mouseover", function (d) {
          let coords = d3.mouse(this);
          let xCoord = coords[0], yCoord = coords[1];
          d3.select(this).attr("r", 10)
          tooltip.html(`<div class="tooltiptext">
                        <div class="money"><b>${asset_1} - ${d.asset_1} %</b></div>
                        <div class="money"><b>${asset_2} - ${d.asset_2} %</b></div>
                        <br>
                        <div>Risk: ${parseFloat(d.risk).toFixed(2)} %</div>
                        <div>Return: ${parseFloat(d.return).toFixed(2)} %</div></div>`)
            .style('display', 'block')
            .style('opacity', '1')
            .style('left', xCoord + 50)
            .style('top', yCoord + 10);
          })
        .on("mouseleave", function() {
          d3.select(this).attr("r", 4)
          tooltip.style("opacity", "0")
           .style("display", "none")
          });

    // Creates legends
    const yLegend = mpt.append("text")
      .attr("y", 15)
      .attr("x", 0)
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .text("Return %");

    const xLegend = mpt.append("text")
      .attr("y", height)
      .attr("x", 450)
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .text("Risk %");

  })
  .catch(err => console.log(err));







  // get data
  d3.csv("dataset/test2.csv")
    .then(data => {
      // Asset names
      var asset_1 = "BOVA11"
      var asset_2 = "FIXX11"

      w1 = 0.3
      w2 = 0.7

      // Get data from csv
      data = data.map(row => {
        return {
          date: parseTime(row["Date"]),
          value: row[asset_1] * w1 + row[asset_2] * w2
        };
      });

      const svg = d3.select('.return')
        .append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('position', 'relative');

      // define scales
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([(d3.min(data, d => d.value) / 1.25), d3.max(data, d => d.value)])
        .range([height - margin.bottom, margin.top]);

      // generate line
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

      // generate path for line
      svg.append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // create axes groups
      const xAxisGroup = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`);

      const yAxisGroup = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`);

      // create axes
      const xAxis = d3.axisBottom(x)
        .ticks(width / 80)

      const yAxis = d3.axisLeft(y);

      // call axes
      xAxisGroup.call(xAxis);
      yAxisGroup.call(yAxis);

      // create y-axis legend
      const yLegend = svg.append("text")
        .attr("y", 15)
        .attr("x", 0)
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .text("$ Close");

      const xLegend = svg.append("text")
        .attr("y", height - 10)
        .attr("x", 450)
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .text("Portfolio Evolution");

      // create tooltip
      const tooltip = d3.select(".return")
        .append("div")
          .attr("class", "tooltip")
          .style("opacity", "0")
          .style("display", "none")
          .style("position", "absolute")
          .style('z-index', '1000000');

      // tooltip events
      svg.on("touchmove mousemove", function() {
        let coords = d3.mouse(this);
        let xCoord = coords[0], yCoord = coords[1];
        let date = x.invert(xCoord);
        let value = getValue(data,date);
        let rounded = Math.ceil(value * 100) / 100;
        if (!rounded) return;

        tooltip.html(`<div class="tooltiptext"><div class="money"><b>$${rounded}</b></div><div>${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</div></div>`)
          .style('display', 'block')
          .style('opacity', '1')
          .style('left', xCoord - margin.left)
          .style('top', y(value) + margin.top)
      });
      svg.on("touchend mouseleave", function() {
        tooltip.style("opacity", "0")
         .style("display", "none")
      });
      // make tooltip stay put when it is hovered over
      tooltip.on("touchmove mousemove", function() {
        let coords = d3.mouse(this);
        let xCoord = coords[0], yCoord = coords[1];
        let date = x.invert(xCoord);
        let value = getValue(data,date);
        let rounded = Math.ceil(value * 100) / 100;
        if (!rounded) return;

        let xVal = xCoord - margin.left;
        let yVal = y(value) + margin.top;

        tooltip.html(`<div class="tooltiptext"><div class="money"><b>$${rounded}</b></div><div>${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</div></div>`)
          .style('display', 'block')
          .style('opacity', '1')
      });
    })
    .catch(err => console.log(err));


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
    temp.push((values[i]-values[i+1])/values[i+1])
  }
  return temp
}

// Return annual return
function annualReturn(values){
  averageDaily = math.mean(values)
  return math.pow(averageDaily + 1, workDays) - 1
}

// Calculate correlation
function correlation(data_1, data_2){
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
