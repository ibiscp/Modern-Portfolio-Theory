var evolution = d3.select('.history')
  .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('position', 'relative');

// Graph information
var margin = {top: 50, right: 50, bottom: 50, left: 50};
var width = document.getElementById('history').offsetWidth;
var height = document.getElementById('history').offsetHeight;

// Build X scales and axis
var x_axis = evolution.append("g")
  .attr("class", "x-axis");

// Build Y scales and axis
var y_axis = evolution.append("g")
  .attr("class", "y-axis");

// Add the lines
// Asset  1
var asset1Line = evolution.append("path")
              .attr("class", "asset1")
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 1.0);
// Asset  2
var asset2Line = evolution.append("path")
              .attr("class", "asset2")
              .attr("fill", "none")
              .attr("stroke", "red")
              .attr("stroke-width", 1.0);
// Portfolio
var ptfLine = evolution.append("path")
            .attr("class", "portfolio")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3);

// Creates legends
evolution.append("text")
  .attr("y", 15)
  .attr("x", 0)
  .style("font-family", "sans-serif")
  .style("font-size", "14px")
  .text("Value");

evolution.append("text")
  .attr("y", height)
  .attr("x", width/2)
  .style("font-family", "sans-serif")
  .style("font-size", "14px")
  .text("Date");

function calculateHistory(dates, hist1, hist2, p1, p2, asset1_name, asset2_name){

  // create tooltip
  var tooltip_history = d3.select(".history")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", "0")
      .style("display", "none")
      .style("position", "absolute")
      .style('z-index', '1000000');

    // Get the data again
    let start = 1

    let quant1 = start/hist1[0]
    let quant2 = start/hist2[0]

    let data = []

    for(let i = 0; i < hist1.length; i++){
      data.push({date: dates[i],
                asset1: hist1[i] * quant1,
                asset2: hist2[i] * quant2,
                portfolio: quant1*hist1[i]*p1/100 + quant2*hist2[i]*p2/100
      })
    }
    // console.log(data)

    // Graph margins
    var y_max = d3.max(data, function(d) { return d3.max([d.asset1, d.asset2, d.portfolio])})
    var y_min = d3.min(data, function(d) { return d3.min([d.asset1, d.asset2, d.portfolio])})
    var y_margin = (y_max - y_min) * 0.1

    // Build X scales and axis
    var x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);
    x_axis.attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .ticks(width / 50));

    // Build Y scales and axis
    var y = d3.scaleLinear()
      .domain([y_min - y_margin, y_max + y_margin])
      .range([height - margin.bottom, margin.top]);
    y_axis.attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Generate lines
    // Portfolio
    var portfolio_ = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.portfolio))
      .curve(d3.curveCatmullRom.alpha(0.5));
    // Asset 1
    var asset1 = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.asset1))
      .curve(d3.curveCatmullRom.alpha(0.5));
    // Asset 2
    var asset2 = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.asset2))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Add the lines
    // Asset  1
    asset1Line.data([data])
          .transition()
              .duration(1000)
          .attr("d", asset1)
    // Asset  2
    asset2Line.data([data])
          .transition()
              .duration(1000)
          .attr("d", asset2);
    // Portfolio
    ptfLine.data([data])
        .transition()
            .duration(1000)
        .attr("d", portfolio_);


    // tooltip events
    evolution.on("touchmove mousemove", function() {
      let coords = d3.mouse(this);
      let xCoord = coords[0], yCoord = coords[1];
      let date = x.invert(xCoord);
      let value_ = getValue_(data,date);
      // console.log(coords)
      // console.log(value_)

      tooltip_history.html(`<div class="tooltiptext">
                        <div class="money"><b>${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</b></div>
                        <br>
                        <div><font color="steelblue">Portfolio: $ ${parseFloat(value_[2]).toFixed(2)}</font></div>
                        <div><font color="green">${asset1_name}: $ ${parseFloat(value_[0]).toFixed(2)}</font></div>
                        <div><font color="red">${asset2_name}: $ ${parseFloat(value_[1]).toFixed(2)}</font></div>
                        </div>`)
        .style('display', 'block')
        .style('opacity', '1')
        .style('left', xCoord - 60 + "px")
        .style('top', y(value_[2]) + 10 + "px")
        // .style('left', xCoord - 60 + "px")
        // .style('top', y(value_[2]) + 10 + "px")
    });
    evolution.on("mouseleave", function() {
      d3.select(this).attr("r", 4)
      tooltip_history.style("opacity", "0")
        .style("display", "none")
      })

}

  // return value of the date selected
  var getValue_ = (data,date) => {
    var sameDate = (a,b) => (a.getDate() === b.getDate()) && (a.getMonth() === b.getMonth()) && (a.getFullYear() === b.getFullYear());
    for (let i = 0; i < data.length; i++) {
      let same = sameDate(data[i].date, date);
      if (same) {
        return [Math.round(data[i].asset1 * 100)/100, Math.round(data[i].asset2 * 100)/100, Math.round(data[i].portfolio * 100)/100];
      } else {
        continue;
      }
    }
  };
