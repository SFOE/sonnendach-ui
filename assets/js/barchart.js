var updateBarChart = function() {
  var roof, eignung, area, print;

  var update = function(r, e, a, p) {
    roof = r;
    eignung = e;
    area = a;
    print = p;

    if (!roof || !eignung || !area) {
      return;
    }

    d3.select("#chart").select("svg").remove();

    var data = roof.attributes;

    var frankenFactor = 0.1;

    var datanew = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
    datanew[0][0] = data.monate[11];
    datanew[0][1] = data.monats_ertrag[11] * area * frankenFactor;
    datanew[1][0] = data.monate[10];
    datanew[1][1] = data.monats_ertrag[10]  * area * frankenFactor;
    datanew[2][0] = data.monate[9];
    datanew[2][1] = data.monats_ertrag[9] * area * frankenFactor;
    datanew[3][0] = data.monate[8];
    datanew[3][1] = data.monats_ertrag[8] * area * frankenFactor;
    datanew[4][0] = data.monate[7];
    datanew[4][1] = data.monats_ertrag[7] * area * frankenFactor;
    datanew[5][0] = data.monate[6];
    datanew[5][1] = data.monats_ertrag[6] * area * frankenFactor;
    datanew[6][0] = data.monate[5];
    datanew[6][1] = data.monats_ertrag[5] * area * frankenFactor;
    datanew[7][0] = data.monate[4];
    datanew[7][1] = data.monats_ertrag[4] * area * frankenFactor;
    datanew[8][0] = data.monate[3];
    datanew[8][1] = data.monats_ertrag[3] * area * frankenFactor;
    datanew[9][0] = data.monate[2];
    datanew[9][1] = data.monats_ertrag[2] * area * frankenFactor;
    datanew[10][0] = data.monate[1];
    datanew[10][1] = data.monats_ertrag[1] * area * frankenFactor;
    datanew[11][0] = data.monate[0];
    datanew[11][1] = data.monats_ertrag[0] * area * frankenFactor;

    var w = window.innerWidth;
    var widthStart = 0;
    var heightStart = 0;

    if (print != 0) {
      //print-view
      widthStart = 550;
      heightStart = 250;
    } else {
      if (w >= 736) {
        //normal size
        widthStart = 700;
        heightStart = 300;
      } else if (w < 736 && w >= 480) {
        //normale-view small
        widthStart = 500;
        heightStart = 250;
      } else {
        //normale-view small
        widthStart = 300;
        heightStart = 250;        
      }
    }

    var margin = {top: 40, right: 20, bottom: 30, left: 60},
        width = widthStart - margin.left - margin.right,
        height = heightStart - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([20, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        //.tickFormat(function(d) { return monthToText(d[0]); });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<span>" + formatNumber(Math.round(d[1])); + "</span>";
      })

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    x.domain(datanew.map(function(d) { return d[0]; }));
    y.domain([0, d3.max(datanew, function(d) { return d[1]; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.selectAll(".bar")
        .data(datanew)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .style("fill", function(d) { 
          if (eignung == 1) {
            return "rgb(0, 197, 255)";
          } else if (eignung == 2) {
            return "rgb(255, 255, 0)";
          } else if (eignung == 3) {
            return "rgb(255, 170, 0)";
          } else if (eignung == 4) {
            return "rgb(255, 85, 0)";
          } else {
            return "rgb(168, 0, 0)";
          }
          });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(translator.get('chartXAxis'));

    function type(d) {
      d[0] = +d[0];
      d[1] = +d[1];
      return d;
    }

  }


  var resize = function(evt) {
    //window.innerHeight;
    //window.innerWidth;
    update(roof, eignung, area, print);
  };

  window.addEventListener('resize', resize);
  return update;
}();

