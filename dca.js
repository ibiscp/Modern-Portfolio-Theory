
function calculateDCA(dates, hist1, hist2, p1, p2, asset1_name, asset2_name){

  start = document.getElementById("startingAmount").value
  montly = document.getElementById("contributionAmount").value

  portfolio  = []

  quant1 = start/hist1[0]
  quant2 = start/hist2[0]

  data = []

  for(let i = 0; i < hist1.length; i++){
    data.push({date: dates[i],
              asset1: hist1[i] * quant1,
              asset2: hist2[i] * quant2,
              portfolio: quant1*hist1[i]*p1/100 + quant2*hist2[i]*p2/100
    })
  }

  // Delete previous graph
  d3.selectAll(".dca > *").remove();

  const dca = d3.select('.dca')
    .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'relative');

  // Graph margins
  y_max = d3.max(data, function(d) { return d3.max([d.asset1, d.asset2, d.portfolio])})
  y_min = d3.min(data, function(d) { return d3.min([d.asset1, d.asset2, d.portfolio])})
  y_margin = (y_max - y_min) * 0.1

  // Graph information
  const margin = {top: 50, right: 50, bottom: 50, left: 50};
  const width = document.getElementById('dca').offsetWidth - margin.left - margin.right;
  const height = document.getElementById('dca').offsetHeight - margin.top - margin.bottom;

  // Build X scales and axis
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);
  dca.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
      .ticks(width / 80));

  // Build Y scales and axis
  const y = d3.scaleLinear()
    .domain([y_min - y_margin, y_max + y_margin])
    .range([height - margin.bottom, margin.top]);
  dca.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Generate lines
  // Portfolio
  const portfolio_ = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.portfolio))
    .curve(d3.curveCatmullRom.alpha(0.5));
  // Asset 1
  const asset1 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.asset1))
    .curve(d3.curveCatmullRom.alpha(0.5));
  // Asset 2
  const asset2 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.asset2))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Add the lines
  // Asset  1
  dca.append("path")
    .data([data])
    .transition()
      .duration(750)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1.0)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", asset1)
  // Asset  2
  dca.append("path")
    .data([data])
    .transition()
      .duration(750)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.0)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", asset2);
  // Portfolio
  dca.append("path")
    .data([data])
    .transition()
      .duration(750)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", portfolio_);

    // create tooltip
    const tooltip_dca = d3.select(".dca")
      .append("div")
        .attr("class", "tooltip")
        .style("opacity", "0")
        .style("display", "none")
        .style("position", "absolute")
        .style('z-index', '1000001');

    // tooltip events
    dca.on("touchmove mousemove", function() {
      let coords = d3.mouse(this);
      let xCoord = coords[0], yCoord = coords[1];
      let date = x.invert(xCoord);
      value_ = getValue_(data,date);
      // console.log(value_)

      tooltip_dca.html(`<div class="tooltiptext">
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
    });
    dca.on("mouseleave", function() {
      d3.select(this).attr("r", 4)
      tooltip_dca.style("opacity", "0")
       .style("display", "none")
      })

  // Creates legends
  const yLegend = dca.append("text")
    .attr("y", 15)
    .attr("x", 0)
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .text("Value");

  const xLegend = dca.append("text")
    .attr("y", height)
    .attr("x", width/2)
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .text("Date");

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

  // ** Update data section (Called from the onclick)
  function updateData() {

      // Get the data again
      start = document.getElementById("startingAmount").value
      montly = document.getElementById("contributionAmount").value

      portfolio  = []

      quant1 = start/hist1[0]
      quant2 = start/hist2[0]

      data = []

      for(let i = 0; i < hist1.length; i++){
        data.push({date: dates[i],
                  asset1: hist1[i] * quant1,
                  asset2: hist2[i] * quant2,
                  portfolio: quant1*hist1[i]*p1/100 + quant2*hist2[i]*p2/100
        })
      }

      	// Scale the range of the data again
      	x.domain(d3.extent(data, function(d) { return d.date; }));
  	    y.domain([0, d3.max(data, function(d) { return d.close; })]);

      // Select the section we want to apply our changes to
      var svg = d3.select("body").transition();

      // Make the changes
          svg.select(".line")   // change the line
              .duration(750)
              .attr("d", valueline(data));
          svg.select(".x.axis") // change the x axis
              .duration(750)
              .call(xAxis);
          svg.select(".y.axis") // change the y axis
              .duration(750)
              .call(yAxis);

      });
  }
