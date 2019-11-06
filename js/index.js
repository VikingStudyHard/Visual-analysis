
// 地图
var data = [{"name":"和平区","value":2521225},{"name":"河东区","value":2081065},{"name":"河西区","value":2684214},{"name":"南开区","value":5503582},{"name":"河北区","value":1760772},{"name":"红桥区","value":1945781},{"name":"东丽区","value":2344213},{"name":"西青区","value":3200416},{"name":"津南区","value":2042216},{"name":"北辰区","value":2143256},{"name":"武清区","value":3166553},{"name":"宝坻区","value":1832049},{"name":"滨海新区","value":4615361},{"name":"宁河区","value":1778371},{"name":"静海区","value":1887592},{"name":"蓟州区","value":1706478}];
// 初始化图表
var map = new Highcharts.Map('map', {
    title: {
        text: '2019年天津市各区招聘计算机类职位的数量',
        style: {color: '#3E576F', fontSize: '16px'}
    },
    subtitle: {
        text: '总招聘人数：41 213 144人'
    },

    // 放大
    mapNavigation: {
        enabled: true,
        // buttonOptions: {
        //     height: 20,
        //     width: 20,
        //     verticalAlign: 'top',
        //     align: 'right',
        // }
        buttonOptions: {
            mouseWheelSensitivity: 1.1,
            align: 'right',
            theme: {
                fill: '#dddddd',
                'stroke-width': 1,
                stroke: 'silver',
                r: 0,
                states: {
                    hover: {
                        fill: '#a6c9ff'
                    },
                    select: {
                        stroke: '#039',
                        fill: '#a6c9ff'
                    }
                }
            },
            verticalAlign: 'top'
        },

    },
    //变色条
    legend: {
        layout: 'horizontal',
        borderWidth: 0,
        backgroundColor: 'rgba(255,255,255,0.85)',
        floating: false,
        verticalAlign: 'bottom',
        y: 10
    },
    colorAxis: {
        // min: 0,
        // startOnTick: true,
        type: 'linear',
        // type: 'logarithmic',
        tickAmount: 4,
        minColor: '#a6c9ff',
        maxColor: '#000022',
        stops: [
            [0, '#a9cdff'],
            // [0.33, '#5992ff']
            [0.5, '#2530ff'],
            [1, '#000022']
        ]
    },
    series: [{
        data: data,
        name: '提供职位数量',
        mapData: Highcharts.maps['cn/tianjin'],
        joinBy: 'name',// 根据 name 属性进行关联
        tooltip: {
            pointFormat: '{point.name}：{point.value}个'
        },
        dataLabels: {
            enabled: true,
            color: 'white',
            format: '{point.name}'
        },
    }]
});


// 树图
// main svg
function treeMoney(id) {
    // main svg
    var svg = d4.select(id).select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(20,0)");       // move right 20px.
    // x-scale and x-axis
    var experienceName = ["", "Basic 1.0", "Alright 2.0", "Handy 3.0", "Expert 4.0", "Guru 5.0"];
    var formatSkillPoints = function (d) {
        return experienceName[d % 6];
    }
    var xScale = d4.scaleLinear()
        .domain([0, 5])
        .range([0, 400]);

    var xAxis = d4.axisTop()
        .scale(xScale)
        .ticks(5)
        .tickFormat(formatSkillPoints);

    // Setting up a way to handle the data
    var tree = d4.cluster()                 // This D3 API method setup the Dendrogram datum position.
        .size([height, width - 460])    // Total width - bar chart width = Dendrogram chart width
        .separation(function separate(a, b) {
            return a.parent == b.parent            // 2 levels tree grouping for category
            || a.parent.parent == b.parent
            || a.parent == b.parent.parent ? 0.4 : 0.8;
        });

    var stratify = d4.stratify()            // This D3 API method gives cvs file flat data array dimensions.
        .parentId(function (d) {
            return d.id.substring(0, d.id.lastIndexOf("."));
        });

    d4.csv("skillsdata.csv", row, function (error, data) {
        if (error) throw error;

        var root = stratify(data);
        tree(root);

        // Draw every datum a line connecting to its parent.
        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                return "M" + d.y + "," + d.x
                    + "C" + (d.parent.y + 100) + "," + d.x
                    + " " + (d.parent.y + 100) + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });

        // Setup position for every datum; Applying different css classes to parents and leafs.
        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Draw every datum a small circle.
        node.append("circle")
            .attr("r", 4);

        // Setup G for every leaf datum.
        var leafNodeG = g.selectAll(".node--leaf")
            .append("g")
            .attr("class", "node--leaf-g")
            .attr("transform", "translate(" + 8 + "," + -13 + ")");

        leafNodeG.append("rect")
            .attr("class", "shadow")
            .style("fill", function (d) {
                return d.data.color;
            })
            .attr("width", 2)
            .attr("height", 30)
            .attr("rx", 2)
            .attr("ry", 2)
            .transition()
            .duration(800)
            .attr("width", function (d) {
                return xScale(d.data.value);
            });

        leafNodeG.append("text")
            .attr("dy", 19.5)
            .attr("x", 8)
            .style("text-anchor", "start")
            .text(function (d) {
                return d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
            });

        // Write down text for every parent datum
        var internalNode = g.selectAll(".node--internal");
        internalNode.append("text")
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
            });

        // Attach axis on top of the first leaf datum.
        var firstEndNode = g.select(".node--leaf");
        firstEndNode.insert("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(" + 7 + "," + -14 + ")")
            .call(xAxis);

        // tick mark for x-axis
        firstEndNode.insert("g")
            .attr("class", "grid")
            .attr("transform", "translate(7," + (height - 15) + ")")
            .call(d4.axisBottom()
                .scale(xScale)
                .ticks(5)
                .tickSize(-height, 0, 0)
                .tickFormat("")
            );

        // Emphasize the y-axis baseline.
        svg.selectAll(".grid").select("line")
            .style("stroke-dasharray", "20,1")
            .style("stroke", "black");

        // The moving ball
        var ballG = svg.insert("g")
            .attr("class", "ballG")
            .attr("transform", "translate(" + 1100 + "," + height / 2 + ")");
        ballG.insert("circle")
            .attr("class", "shadow")
            .style("fill", "steelblue")
            .attr("r", 5);
        ballG.insert("text")
            .style("text-anchor", "middle")
            .attr("dy", 5)
            .text("0.0");

        // Animation functions for mouse on and off events.
        d4.selectAll(".node--leaf-g")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        function handleMouseOver(d) {
            var leafG = d4.select(this);

            leafG.select("rect")
                .attr("stroke", "#4D4D4D")
                .attr("stroke-width", "2");


            var ballGMovement = ballG.transition()
                .duration(400)
                .attr("transform", "translate(" + (d.y
                    + xScale(d.data.value) + 90) + ","
                    + (d.x + 1.5) + ")");

            ballGMovement.select("circle")
                .style("fill", d.data.color)
                .attr("r", 18);

            ballGMovement.select("text")
                .delay(300)
                .text(Number(d.data.value).toFixed(1));
        }

        function handleMouseOut() {
            var leafG = d4.select(this);

            leafG.select("rect")
                .attr("stroke-width", "0");
        }

    });

    function row(d) {
        return {
            id: d.id,
            value: +d.value,
            color: d.color
        };
    }
}
treeMoney('#tree')


// 饼图
var freqData=[
    {State:'银行柜员',freq:{low:4786, mid:45089, high:249}}
    ,{State:'金融产品',freq:{low:1101, mid:412, high:674}}
    ,{State:'保险销售',freq:{low:932, mid:2149, high:418}}
    ,{State:'证券',freq:{low:832, mid:1152, high:1862}}
    ,{State:'股票',freq:{low:4481, mid:3304, high:948}}
    ,{State:'担保',freq:{low:1619, mid:167, high:1063}}
    ,{State:'车险',freq:{low:1819, mid:247, high:1203}}
    ,{State:'理赔',freq:{low:4498, mid:3852, high:942}}
    ,{State:'信贷',freq:{low:797, mid:1849, high:1534}}
    ,{State:'保险内勤',freq:{low:162, mid:379, high:471}}
];
function dashboard(id, fData){
    var barColor = 'steelblue';
    function segColor(c){ return {low:"#807dba", mid:"#e08214",high:"#41ab5d"}[c]; }

    // compute total for each state.
    fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});

    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 500 - hGDim.l - hGDim.r,
            hGDim.h = 300 - hGDim.t - hGDim.b;

        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
            .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
            .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
            .append("g").attr("class", "bar");

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.State == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});

            // call update functions of pie-chart and legend.
            pC.update(nD);
            leg.update(nD);
        }

        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.
            pC.update(tF);
            leg.update(tF);
        }

        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }
        return hG;
    }

    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }

    // function to handle legend.
    function legend(lD){
        var leg = {};

        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
            .attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){
                var edu;
                if(d.type =='low') {
                    edu = '大专及以下';
                }
                else if (d.type == 'mid') {
                    edu = '本科';
                } else {
                    edu = '硕士及以上';
                }
                return edu;
            }
        );

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }

    // calculate total frequency by segment for all state.
    var tF = ['low','mid','high'].map(function(d){
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
    });

    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.State,d.total];});

    var hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.
}
dashboard('#dashboard',freqData);