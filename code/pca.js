var marginPCA = {top: 40, right: 50, bottom: 50, left: 70};

var pca = d3.select('#pca')
  .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('position', 'relative')
    // .call(d3.zoom().on("zoom", function () {
    //        pca.attr("transform", d3.event.transform)
    //     }))
    //   .append("g")

// Graph information
var widthPCA = document.getElementById('pca').offsetWidth;
var heightPCA = document.getElementById('pca').offsetHeight;

// Build X scales and axis
var x_axis_PCA = pca.append("g")
  .attr("class", "x-axis");

// Build Y scales and axis
var y_axis_PCA = pca.append("g")
  .attr("class", "y-axis");

// Creates legends
pca.append("text")
  .attr("y", legendy)
  .attr("x", legendx)
  .text("PC1");

pca.append("text")
  .attr("y", heightPCA)
  .attr("x", widthPCA/2)
  .text("PC2");

d3.json("dataset/data.txt")
  .then(data => {

  var stocks = Object.keys(data)

  // Extract data
  var matrix = extractPca(data, stocks)
  // console.log(matrix)

  // Calculate correlation matrix
  var cols = "01234".split("");
  var corr = jz.arr.correlationMatrix(matrix, cols);
  var corrMatrix = convert2matrix(corr);

  // Calculate PCA
  var vectors = PCA.getEigenVectors(corrMatrix);

  // Get first two eigenvectors
  var p1 = vectors["0"]["vector"]
  var p2 = vectors["1"]["vector"]

  // Multiply matrix by eigenvectors
  var pca_data = []
  for (var i = 0; i < stocks.length; i++){
    pc1 = math.multiply(matrix[i], p1)
    pc2 = math.multiply(matrix[i], p2)

    pca_data.push({pc1: pc1, pc2: pc2, stock: stocks[i]})
  }

  var selected = []



  // create tooltip
  var tooltip_pca = d3.select("#pca")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", "0")
      .style("display", "none")
      .style("position", "absolute")
      .style('z-index', '1000001');

  // Graph margins
  var x_max = 3 //d3.max(pca_data, function(d) {return d.pc1})
  var x_min = -3 //d3.min(pca_data, function(d) {return d.pc1})
  var x_margin = (x_max - x_min) * 0.1
  var y_max = 3//d3.max(pca_data, function(d) {return d.pc2})
  var y_min = -3//d3.min(pca_data, function(d) {return d.pc2})
  var y_margin = (y_max - y_min) * 0.1

  // Build X scales and axis
  var x = d3.scaleLinear()
    .domain([x_min - x_margin, x_max + x_margin])
    .range([widthPCA - marginPCA.bottom, marginPCA.top]);
  x_axis_PCA.attr("transform", `translate(0,${heightPCA - marginPCA.bottom})`)
    .call(d3.axisBottom(x));

  // Build Y scales and axis
  var y = d3.scaleLinear()
    .domain([y_min - y_margin, y_max + y_margin])
    .range([heightPCA - marginPCA.bottom, marginPCA.top]);
  y_axis_PCA.attr("transform", `translate(${marginPCA.left},0)`)
    .call(d3.axisLeft(y));

  // Add the dots
  var dots  = pca.selectAll("circle")
    .data(pca_data);

  dots.transition()
      .duration(750)
    .attr("r", 2)
    .attr("cx", function(d) { return x(d.pc1); })
    .attr("cy", function(d) { return y(d.pc2); });

  dots.enter().append("circle")
    .attr("r", 0)
    .attr("cx", function(d) { return x(d.pc1); })
    .attr("cy", function(d) { return y(d.pc2); })

    .on("mouseover", function (d) {
      let coords = d3.mouse(this);
      let xCoord = coords[0], yCoord = coords[1];
      d3.select(this).transition()
                .duration(300)
                .attr("r", 5)
      tooltip_pca.html(`<div class="tooltiptext">
                    <div class="money"><b>${d.stock}</b></div>`)
        .style('display', 'block')
        .style('left', xCoord - 60)
        .style('top', yCoord + 20)
        .transition()
                  .duration(300)
                  .style('opacity', '1');
      })
    .on("mouseleave", function(d) {

      if (selected.indexOf(d.stock) >= 0){
        d3.select(this).transition()
                  .duration(300)
                  .attr("r", 5)
      }
      else {
        d3.select(this).transition()
                  .duration(300)
                  .attr("r", 2)
      }

      tooltip_pca.transition()
                .duration(300)
                .style("opacity", "0")
      })
    .on("click", function(d) {

      index = selected.indexOf(d.stock)
      if (index >= 0){
        selected.splice(index, 1);
        d3.select(this).transition()
                  .duration(300)
                  .style('fill', 'black')
      }
      else if (selected.length < 2) {
        selected.push(d.stock)
        d3.select(this).transition()
                  .duration(300)
                  .style('fill', 'red')
      }

      document.getElementById("asset1").value = selected[0] == undefined ? "" : selected[0]
      document.getElementById("asset2").value = selected[1] == undefined ? "" : selected[1]

    })
    .transition()
      .duration(700)
      .attr("r", 2);

})

function extractPca(object, keys){
  var matrix = [];

  for (var i = 0; i < keys.length; i++){
      matrix[i] = [];

      for(var j=0; j<Object.keys(object[keys[i]]).length; j++) {
          matrix[i][j] = parseFloat(object[keys[i]][j]);
      }
  }

  return matrix;
}

function convert2matrix(corr){
  var matrix = new Array(5);

  for (var i = 0; i < matrix.length; i++) {
    matrix[i] = new Array(5);
  }
  // console.log(matrix)

  for(var key in Object.keys(corr)){
    var obj = corr[key]
    matrix[parseInt(obj["column_x"])][parseInt(obj["column_y"])] = parseFloat(obj["correlation"])
  }

  return matrix;
}
