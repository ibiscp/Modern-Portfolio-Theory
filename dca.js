var dca = d3.select('#dca')
  .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('position', 'relative');

// Graph information
var marginDCA = {top: 20, right: 20, bottom: 40, left: 60};
var widthDCA = document.getElementById('dca').offsetWidth;
var heightDCA = document.getElementById('dca').offsetHeight;

// Build X scales and axis
var x_axis_DCA = dca.append("g")
  .attr("class", "x-axis");

// Build Y scales and axis
var y_axis_DCA = dca.append("g")
  .attr("class", "y-axis");

// Add the lines
// Asset  1
var asset1LineDCA = dca.append("path")
              .attr("class", "asset1")
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 1.0);
// Asset  2
var asset2LineDCA = dca.append("path")
              .attr("class", "asset2")
              .attr("fill", "none")
              .attr("stroke", "red")
              .attr("stroke-width", 1.0);
// Portfolio
var ptfLineDCA = dca.append("path")
            .attr("class", "portfolio")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3);
// Portfolio
var moneyLineDCA = dca.append("path")
            .attr("class", "money")
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 3);

// Creates legends
dca.append("text")
  .attr("y", 15)
  .attr("x", 0)
  // .attr("transform", "rotate(-90)")
  .style("font-family", "sans-serif")
  .style("font-size", "14px")
  .text("Value");

// dca.append("text")
//     .attr("text-anchor", "end")
//     .attr("transform", "rotate(-90)")
//     .attr("y", -marginDCA.left+20)
//     .attr("x", -marginDCA.top)
//     .text("Y axis title")
// https://www.d3-graph-gallery.com/graph/custom_axis.html

dca.append("text")
  .attr("y", heightDCA)
  .attr("x", widthDCA/2)
  .style("font-family", "sans-serif")
  .style("font-size", "14px")
  .text("Date");

function calculateDCA(dates, hist1, hist2, p1, p2, asset1_name, asset2_name){

  // Delete previous graph
  // d3.selectAll(".dca > *").remove();
  // console.log(dca)
  d3.select("#startingAmount").on("change", function(d) {
      update()})
  d3.select("#contributionAmount").on("change", function(d) {
      update()})
  d3.select("#frequency").on("change", function(d) {
      update()})
  d3.select("#rebalance").on("change", function(d) {
      update()})

  // create tooltip
  var tooltip_dca = d3.select("#dca")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", "0")
      .style("display", "none")
      .style("position", "absolute")
      .style('z-index', '1000001');

  update();

  function update() {

    // Get the data again
    let start = parseInt(document.getElementById("startingAmount").value)
    let contribution = parseInt(document.getElementById("contributionAmount").value)
    let frequency = document.getElementById("frequency").value
    let rebalance = document.getElementById("rebalance").checked

    // Total invested
    var money = start

    // Variables
    let q1 = start/hist1[0]
    let q2 = start/hist2[0]
    let q1p = start/hist1[0] * p1
    let q2p = start/hist2[0] * p2

    let data = []
    let previousValue = 100

    for(let i = 0; i < hist1.length; i++){

      tot1 = q1p * hist1[i]
      tot2 = q2p * hist2[i]
      sum = tot1 + tot2

      // Current percentage of asset1
      curr1 = tot1 / sum

      if (Math.abs(curr1 - p1) > 0.05 && rebalance) {
        q1p = sum/hist1[i] * p1
        q2p = sum/hist2[i] * p2
      }

      var contribute = false
      switch(frequency) {
        case "daily":
          contribute = true
          break;
        case "weekly":
          if (dates[i].getDay() <= previousValue){
            contribute = true
          }
          previousValue = dates[i].getDay()
          break;
        case "monthly":
        if (dates[i].getMonth() != previousValue){
          previousValue = dates[i].getMonth()
          contribute = true
        }
          break;
      }

      if (contribute) {
          if (curr1 < p1) {
            q1p += contribution / hist1[i]
          }
          else {
            q2p += contribution / hist2[i]
          }

          q1 += contribution / hist1[i]
          q2 += contribution / hist2[i]

          money = money + contribution
        }

      data.push({date: dates[i],
                asset1: hist1[i] * q1,
                asset2: hist2[i] * q2,
                portfolio: q1p*hist1[i] + q2p*hist2[i],
                money: money
              })

      }

      // console.log(data)

    document.getElementById("total_invested").innerHTML = "$ " + (data.slice(-1)[0]["money"]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    document.getElementById("total_value").innerHTML = "$ " + (data.slice(-1)[0]["portfolio"]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    var percentage = ((data.slice(-1)[0]["portfolio"] - data.slice(-1)[0]["money"])/data.slice(-1)[0]["money"]*100).toFixed(2)
    document.getElementById("percent_change").innerHTML = percentage + " %";

    // var up = document.getElementById("up");
    // var down = document.getElementById("down");
    //
    // if (percentage >= 0){
    //   up.style.display = "block";
    //   down.style.display = "none";
    // }
    // else {
    //   down.style.display = "block";
    //   up.style.display = "none";
    // }

    // Graph margins
    var y_max = d3.max(data, function(d) { return d3.max([d.asset1, d.asset2, d.portfolio, d.money])})
    var y_min = d3.min(data, function(d) { return d3.min([d.asset1, d.asset2, d.portfolio, d.money])})
    var y_margin = (y_max - y_min) * 0.1

    // Build X scales and axis
    var x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([marginDCA.left, widthDCA - marginDCA.right]);
    x_axis_DCA.attr("transform", `translate(0,${heightDCA - marginDCA.bottom})`)
      .call(d3.axisBottom(x)
        .ticks(widthDCA / 50));

    // Build Y scales and axis
    var y = d3.scaleLinear()
      .domain([y_min - y_margin, y_max + y_margin])
      .range([heightDCA - marginDCA.bottom, marginDCA.top]);
      // .base(10);
    y_axis_DCA.attr("transform", `translate(${marginDCA.left},0)`)
      .call(d3.axisLeft(y));

    // Generate lines
    // Portfolio
    var portfolio_ = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.portfolio))
      // .curve(d3.curveCatmullRom.alpha(0.5));
    // Asset 1
    var asset1 = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.asset1))
      // .curve(d3.curveCatmullRom.alpha(0.5));
    // Asset 2
    var asset2 = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.asset2))
      // .curve(d3.curveCatmullRom.alpha(0.5));
    // Asset 2
    var moneyL = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.money))
      // .curve(d3.curveCatmullRom.alpha(0.5));

    // Add the lines
    // Asset  1
    asset1LineDCA.data([data])
          .transition()
              .duration(1000)
          .attr("d", asset1)
    // Asset  2
    asset2LineDCA.data([data])
          .transition()
              .duration(1000)
          .attr("d", asset2);
    // Portfolio
    moneyLineDCA.data([data])
        .transition()
            .duration(1000)
        .attr("d", moneyL);
    // Portfolio
    ptfLineDCA.data([data])
        .transition()
            .duration(1000)
        .attr("d", portfolio_);


    // tooltip events
    dca.on("touchmove mousemove", function() {
      let coords = d3.mouse(this);
      let xCoord = coords[0], yCoord = coords[1];
      let date = x.invert(xCoord);
      let value_ = getValue_(data,date);
      // console.log(value_)

      tooltip_dca.html(`<div class="tooltiptext">
                        <div class="money"><b>${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</b></div>
                        <br>
                        <div><font color="steelblue">Portfolio: $ ${parseFloat(value_[2]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</font></div>
                        <div><font color="green">${asset1_name}: $ ${parseFloat(value_[0]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</font></div>
                        <div><font color="red">${asset2_name}: $ ${parseFloat(value_[1]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</font></div>
                        <div><font color="gray">Investeed: $ ${parseFloat(value_[3]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</font></div>
                        </div>`)
        .style('display', 'block')
        .style('opacity', '1')
        .style('left', xCoord - 75 + "px")
        .style('top', y(value_[2]) + 10 + "px")
    });
    dca.on("mouseleave", function() {
      d3.select(this).attr("r", 4)
      tooltip_dca.style("opacity", "0")
       .style("display", "none")
      })

  }
}

  // return value of the date selected
  var getValue_ = (data,date) => {
    var sameDate = (a,b) => (a.getDate() === b.getDate()) && (a.getMonth() === b.getMonth()) && (a.getFullYear() === b.getFullYear());
    for (let i = 0; i < data.length; i++) {
      let same = sameDate(data[i].date, date);
      if (same) {
        return [data[i].asset1, data[i].asset2, data[i].portfolio, data[i].money];
      } else {
        continue;
      }
    }
  };
