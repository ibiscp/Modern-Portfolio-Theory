workDays = 261

// get data
d3.csv("dataset/test2.csv")
  .then(data => {
    const parseTime = d3.utcParse("%d-%b-%y");
    data = data.map(row => {
      return {
        date: parseTime(row["Date"]),
        slg: +row["BOVA11"],
        usa: +row["FIXX11"],
        sep: +row["S&P"]
      };
    });

    // Asset names
    var asset_1 = "BOVA11"
    var asset_2 = "FIXX11"

    // Prepare data
    var period = 236
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
        mpt_data.push({risk: annual_risk, return: annual_return, asset_1: Math.round((1-i)*100), asset_2: Math.round(i*100)})
     }

    const margin = {top: 20, right: 50, bottom: 40, left: 50};
    const width = 1000;
    const height = 500;

    const svg = d3.select('.root')
      .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'relative');

    x_margin = (d3.max(mpt_data, d => d.risk) - d3.min(mpt_data, d => d.risk)) * 0.1
    y_margin = (d3.max(mpt_data, d => d.return) - d3.min(mpt_data, d => d.return)) * 0.1

    const x = d3.scaleLinear()
      .domain([d3.min(mpt_data, d => d.risk) - x_margin, d3.max(mpt_data, d => d.risk) + x_margin])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(mpt_data, d => d.return) - y_margin, d3.max(mpt_data, d => d.return) + y_margin])
      .range([height - margin.bottom, margin.top]);

    // generate line
    const line = d3.line()
      .x(d => x(d.risk))
      .y(d => y(d.return))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // generate path for line
    svg.append("path")
      .data([mpt_data])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(mpt_data)
      .enter().append("circle")
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.risk); })
        .attr("cy", function(d) { return y(d.return); })
        .on("mouseover", function (d) {
          let coords = d3.mouse(this);
          let xCoord = coords[0], yCoord = coords[1];
          tooltip.html(`<div class="tooltiptext">
                        <div class="money"><b>${asset_1}  ${d.asset_1} %</b></div>
                        <div class="money"><b>${asset_2}  ${d.asset_2} %</b></div>
                        <br>
                        <div>Risk: ${parseFloat(d.risk).toFixed(2)} %</div>
                        <div>Return: ${parseFloat(d.return).toFixed(2)} %</div></div>`)
          // tooltip.html("<p>Risk: " + parseFloat(d.risk).toFixed(2) + " %</p> <p>Return: " + parseFloat(d.return).toFixed(2) + " %</p>")
            .style('display', 'block')
            .style('opacity', '1')
            .style('left', xCoord - margin.left)
            .style('top', yCoord + margin.top);
          })
        .on("mouseleave", function() {
          tooltip.style("opacity", "0")
           .style("display", "none")
          });

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
      .text("Return %");

    const xLegend = svg.append("text")
      .attr("y", height)
      .attr("x", 450)
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .text("Risk %");

    // create tooltip
    const tooltip = d3.select(".root")
      .append("div")
        .attr("class", "tooltip")
        .style("opacity", "0")
        .style("display", "none")
        .style("position", "absolute")
        .style('z-index', '1000000');

    // // tooltip events
    // svg.on("touchmove mousemove", function() {
    //   let coords = d3.mouse(this);
    //   let xCoord = coords[0], yCoord = coords[1];
    //   let risk = x.invert(xCoord);
    //   // let value = y.invert(yCoord);
    //   let value = getValue(mpt_data,risk);
    //   let rounded = Math.ceil(value * 100) / 100;
    //   if (!rounded) return;
    //
    //   tooltip.html(`<div class="tooltiptext"><div class="money"><b>$${rounded}</b></div><div>${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</div></div>`)
    //     .style('display', 'block')
    //     .style('opacity', '1')
    //     .style('left', xCoord - margin.left)
    //     .style('top', y(value) + margin.top)
    // });

    // svg.on("touchend mouseleave", function() {
    //   tooltip.style("opacity", "0")
    //    .style("display", "none")
    // });
    // // make tooltip stay put when it is hovered over
    // tooltip.on("touchmove mousemove", function() {
    //   let coords = d3.mouse(this);
    //   let xCoord = coords[0], yCoord = coords[1];
    //   let date = x.invert(xCoord);
    //   let value = getValue(data,date);
    //   let rounded = Math.ceil(value * 100) / 100;
    //   if (!rounded) return;
    //
    //   let xVal = xCoord - margin.left;
    //   let yVal = y(value) + margin.top;
    //
    //   tooltip.html(`<div class="tooltiptext"><div class="money"><b>$${rounded}</b></div><div>${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</div></div>`)
    //     .style('display', 'block')
    //     .style('opacity', '1')
    //     // .style('left', `${xVal}px`)
    //     // .style('top', `${yVal}px`)
    // });
  })
  .catch(err => console.log(err));

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

var getValue = (data, x) => {
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
