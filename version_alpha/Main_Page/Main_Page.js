function change_to_Category1() {
    document.getElementById("axis_inputs").style.display = "";
    document.getElementById("rank_inputs").style.display = "none";
    document.getElementById("explanation_text").innerHTML = "Drag<br>Axis<br>to<br>Plot<br><span>⇨</span>";
}

function change_to_Category2() {
    document.getElementById("axis_inputs").style.display = "none";
    document.getElementById("rank_inputs").style.display = "";
    document.getElementById("explanation_text").innerHTML = "Select<br>Ranking<br>Category";
}

var features = [];
var features_range = {};
var dataSet = {};
var dragging_element = null;
var current_X;
var current_Y;
var X_axis;
var Y_axis;

var prevPos = [-1, -1];
var pos;
const colors = d3.scaleOrdinal(d3.schemeCategory10);

var zoomArea, line;
var delta_x=0;
var delta_y=0;
var flag = -1;
var zoom_count = 1;// zoom 回数の記憶
const scale = 0.5;

var drag = d3.drag();

// set the dimensions and margins of the graph
const graph_area = document.getElementById("my_dataviz");
const graph_area_width = graph_area.clientWidth;
const graph_area_height = graph_area.clientHeight;
const rect_width = Math.min(graph_area_height, graph_area_width);
const rect_height = rect_width;

const main = document.getElementById("main");

// 要素の位置座標を取得
const graph_area_rect = graph_area.getBoundingClientRect();
const main_rect = main.getBoundingClientRect();
// 画面の左端から、要素の左端までの距離
const graph_area_left = graph_area_rect.left - main_rect.left;
// 画面の上端から、要素の上端までの距離
const graph_area_top = graph_area_rect.top - main_rect.top;

const margin = {top: 10, right: 10, bottom: 120, left: 120};
const width = rect_width - margin.left - margin.right;
const height = rect_height - margin.top - margin.bottom;

const animation_time = 1000;

const options = document.querySelectorAll(".option_area button");

// console.log(options)

for (const option of options) {
    features.push(option.id);
}

// console.log(features);

for (const feature of features) {
    dataSet[feature] = new Array();
    features_range[feature] = new Array();
}

d3.csv("../csv/reviewer_2.csv").then(function(data) {
    for (const d of data) {
        // console.log(d);
        for (const feature of features) {
            dataSet[feature].push(parseFloat(d[feature]));
        }
    }
    // console.log(dataSet);

    for (const feature of features) {
        var diff = (Math.max(...dataSet[feature]) - Math.min(...dataSet[feature])) * 0.1;
        features_range[feature].push(Math.min(...dataSet[feature])-diff);
        features_range[feature].push(Math.max(...dataSet[feature])+diff);
    }

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz").append("svg")
        .attr("id", "svg_area")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect");

    // Add X axis
    X_axis = d3.scaleLinear()
        .domain([0, 0])
        .range([ 0, 0 ]);
    svg.append("g")
        .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(X_axis))
        .attr("opacity", "0")
        .selectAll("text")
            .attr("transform", "rotate(45)")    // 文字を時計回りに45度回転させる
            .style("text-anchor", "start");

    // Add Y axis
    Y_axis = d3.scaleLinear()
        .domain([0, 0])
        .range([ height, height]);
    svg.append("g")
        .attr("class", "myYaxis") // Note that here we give a class to the Y axis, to be able to call it later and modify it
        .call(d3.axisLeft(Y_axis))
        .attr("opacity", "0");
    
    const svg_area = document.querySelector("svg");
    const svg_rect = svg_area.getBoundingClientRect();
    const svg_left = svg_rect.left;
    const svg_top = svg_rect.top;

    d3.select("#zoomOverlay")
        .on("dblclick", function(e){// zoom処理
            // console.log("doubleclick");
            zoom_count += 1;

            var pos = [e.x - svg_left, e.y - svg_top];
            var x_pos = X_axis.invert(pos[0]);
            var y_pos = Y_axis.invert(pos[1]);

            // console.log(x_pos, y_pos);
            // console.log(pos);

            var zoom_scope_x = (features_range[current_X][1]-features_range[current_X][0])*0.5**zoom_count;
            var zoom_scope_y = (features_range[current_Y][1]-features_range[current_Y][0])*0.5**zoom_count;

            // console.log(zoom_scope_x, zoom_scope_y);
            // console.log(zoomArea);

            zoomArea.x1 = x_pos-zoom_scope_x;
            zoomArea.x2 = x_pos+zoom_scope_x;
            zoomArea.y1 = y_pos+zoom_scope_y;
            zoomArea.y2 = y_pos-zoom_scope_y;

            // console.log(zoomArea);

            prevPos = [-1, -1];

            zoom(animation_time, 3);
        })
        .call(drag)

    // Add dots
    svg.append('g')
        .attr("id", "component")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", 0)
            .attr("cy", height)
            .attr("r", 5)
            .attr("clip-path", "url(#clip)")
            .style("fill", function(d) { return colors(d.genre)})
            .style("stroke", "black")
            .on("click", function(e) {
                console.log(this);
            });
    
    current_X = features[0];
    current_Y = features[1];

    // new X axis
    X_axis.domain(features_range[current_X]).range([0, width]);
    Y_axis.domain(features_range[current_Y]).range([height, 0]);
    svg.select(".myXaxis")
        .transition()
        .duration(animation_time)
        .attr("opacity", "1")
        .call(d3.axisBottom(X_axis))
        .selectAll("text")
            .attr("transform", "rotate(45)")    // 文字を時計回りに45度回転させる
            .style("text-anchor", "start"); //　文字の表示開始位置を指定にする;
    svg.select(".myYaxis")
        .transition()
        .duration(animation_time)
        .attr("opacity", "1")
        .call(d3.axisLeft(Y_axis));

    svg.selectAll("circle")
        .transition()
        .delay(function(d,i){return(i*3)})
        .duration(animation_time)
        .attr("cx", function (d) { return X_axis(d[current_X]); } )
        .attr("cy", function (d) { return Y_axis(d[current_Y]); } )
        .attr("r", 5);

    const feature_X = document.getElementById(current_X);
    const feature_Y = document.getElementById(current_Y);
    const feature_X_label = document.getElementById("X_axisLabel");
    // const feature_Y_label = document.getElementById("Y_axisLabel");
    const feature_X_label_rect = document.getElementById("X_axisLabel_rect");
    const feature_Y_label_rect = document.getElementById("Y_axisLabel_rect");

    // console.log(feature_X_label);

    feature_X_label.style.top = graph_area_top + svg_area.clientHeight;
    feature_X_label.style.right = main.clientWidth - (graph_area_left + svg_area.clientWidth);

    feature_X_label_rect.style.width = feature_X.clientWidth;
    feature_X_label_rect.style.height = feature_X.clientHeight;
    feature_Y_label_rect.style.width = feature_X.clientWidth;
    feature_Y_label_rect.style.height = feature_X.clientHeight;

    feature_X_label_rect.firstElementChild.innerHTML = feature_X.innerHTML;
    feature_Y_label_rect.firstElementChild.innerHTML = feature_Y.innerHTML;
    
    zoomArea = {
        x1: features_range[current_X][0],
        y1: features_range[current_Y][0],
        x2: features_range[current_X][1],
        y2: features_range[current_Y][1]
    };

    const Xaxis_area = document.getElementById("Xaxis_area");
    Xaxis_area.style.top = graph_area_top + height + margin.top;
    Xaxis_area.style.left = graph_area_left + margin.left;
    Xaxis_area.style.width = width + margin.right;
    Xaxis_area.style.height = margin.bottom;

    const Yaxis_area = document.getElementById("Yaxis_area");
    Yaxis_area.style.top = graph_area_top;
    Yaxis_area.style.left = graph_area_left;
    Yaxis_area.style.width = margin.left;
    Yaxis_area.style.height = height + margin.top;

    const zoomOverlay = document.getElementById("zoomOverlay");
    zoomOverlay.style.top = graph_area_top + margin.top;
    zoomOverlay.style.left = graph_area_left + margin.left;
    zoomOverlay.style.width = width;
    zoomOverlay.style.height = height;

    const clip = document.getElementById("clip");
    const clip_rect = clip.firstElementChild;
    clip.style.top = graph_area_top + margin.top;
    clip.style.left = graph_area_left + margin.left;
    clip_rect.style.width = width;
    clip_rect.style.height = height;

    const drop_areas = document.querySelectorAll(".drop_area");

    for (const option of options) {
        // console.log(option)
        option.draggable = true;
        option.addEventListener("drag", undefined);
        option.addEventListener("dragstart", (e) => {
            // console.log("start");

            dragging_element = e.target;

            // console.log(dragging_element)
        });
        option.addEventListener("dragend", (e) => {
            var x = e.clientX;
            var y = e.clientY;
            var element = document.elementFromPoint(x, y);

            // console.log(e.target)

            if (element.classList.contains("drop_areaX")) {
                const prev_X = current_X;
                current_X = dragging_element.id;
                new_axis(prev_X, current_Y, current_X, current_Y, "0", "1");
            } else if (element.classList.contains("drop_areaY")) {
                const prev_Y = current_Y;
                current_Y = dragging_element.id;
                new_axis(current_X, prev_Y, current_X, current_Y, "1", "0");
            }
            dragging_element = null;
        });
    }

    for (const area of drop_areas) {
        area.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        area.addEventListener("dragenter", (e) => {
            if (area.classList.contains("drop_areaX")) {
                document.getElementById("Xaxis_area").classList.remove("hidden");
                document.getElementById("Xaxis_area").classList.add("visible");
            } else if (area.classList.contains("drop_areaY")) {
                document.getElementById("Yaxis_area").classList.remove("hidden");
                document.getElementById("Yaxis_area").classList.add("visible");
            }
        });
        area.addEventListener("dragleave", (e) => {
            if (area.classList.contains("drop_areaX")) {
                document.getElementById("Xaxis_area").classList.remove("visible");
                document.getElementById("Xaxis_area").classList.add("hidden");
            } else if (area.classList.contains("drop_areaY")) {
                document.getElementById("Yaxis_area").classList.remove("visible");
                document.getElementById("Yaxis_area").classList.add("hidden");
            }
        });
        area.addEventListener("drop", (e) => {
            e.preventDefault();
            if (area.classList.contains("drop_areaX")) {
                const prev_X = current_X;
                current_X = dragging_element.id;
                new_axis(prev_X, current_Y, current_X, current_Y, "0", "1");
            } else if (area.classList.contains("drop_areaY")) {
                const prev_Y = current_Y;
                current_Y = dragging_element.id;
                new_axis(current_X, prev_Y, current_X, current_Y, "1", "0");
            }
            area.classList.remove("visible");
            area.classList.add("hidden");
            dragging_element = null;
        });
    }

    // 変更があった方のopacity引数を"0", もう片方を"1"とすることで、変更があった方は
    // 透明から徐々に色を帯びるアニメーションになる
    function new_axis(prev_X, prev_Y, curr_X, curr_Y, X_opacity, Y_opacity) {
        // console
        // X axis
        X_axis = d3.scaleLinear()
            .domain(features_range[prev_X])
            .range([ 0, width ]);
        svg.select(".myXaxis")
            .call(d3.axisBottom(X_axis))
            .attr("opacity", X_opacity)
            .selectAll("text")
                .attr("transform", "rotate(45)")    // 文字を時計回りに45度回転させる
                .style("text-anchor", "start");

        // Y axis 
        Y_axis = d3.scaleLinear()
            .domain(features_range[prev_Y])
            .range([ height, 0]);
        svg.select(".myYaxis")
            .call(d3.axisLeft(Y_axis))
            .attr("opacity", Y_opacity);
        
        // new X axis
        X_axis.domain(features_range[curr_X]);
        svg.select(".myXaxis")
            .transition()
            .duration(animation_time)
            .attr("opacity", "1")
            .call(d3.axisBottom(X_axis))
            .selectAll("text")    
                .attr("transform", "rotate(45)")    // 文字を時計回りに45度回転させる
                .style("text-anchor", "start");
        
        // new Y axis
        Y_axis.domain(features_range[curr_Y])
            .range([height, 0]);
        svg.select(".myYaxis")
            .transition()
            .duration(animation_time)
            .attr("opacity", "1")
            .call(d3.axisLeft(Y_axis));

        zoom_count = 1;    
        
        // plot dots
        svg.selectAll("circle")
            .transition()
            .delay(function(d,i){return(i*3)})
            .duration(animation_time)
            .attr("cx", function (d) { return X_axis(d[current_X]); } )
            .attr("cy", function (d) { return Y_axis(d[current_Y]); } )
            .attr("r", "5");

        feature_X_label_rect.firstElementChild.innerHTML = document.getElementById(current_X).innerHTML;
        feature_Y_label_rect.firstElementChild.innerHTML = document.getElementById(current_Y).innerHTML;
    }

    drag.on("drag", function(e) {// drag中
        if (flag == -1) {
            flag = 1;
            prevPos = [e.x, e.y];
            // console.log("start position :"+prevPos)
        } else if(flag > 0){// dragが発生した後のみ以下の処理を行う。
            var pos = [e.x, e.y];

            // console.log(pos);

            // deltaに上限を設ける
            // if ((pos[0]-prevPos[0]) < 50)

            var x1 = X_axis.invert(prevPos[0]);
            var x2 = X_axis.invert(pos[0]);// 今のマウスの位置

            // console.log(x1);
            // console.log(x2);
            // console.log("pos_diffx :"+(pos[0]-prevPos[0]));

            delta_x = (x2-x1)*scale;// 追加
            
            var y1 = Y_axis.invert(pos[1]);
            var y2 = Y_axis.invert(prevPos[1]);

            delta_y = (y1-y2)*scale;// 追加
            
            prevPos = pos;

            // console.log(zoomArea);
            // console.log("delta_x :"+delta_x);
            
            zoomArea.x2 -= delta_x;
            zoomArea.x1 -= delta_x;
            zoomArea.y2 -= delta_y;
            zoomArea.y1 -= delta_y;

            // console.log(zoomArea);
            
            zoom(0, 0);
            
            delta_x = 0;
            delta_y = 0;
            
            // console.log("transition");
        }

        // console.log("dragging");
        
    });
    
    drag.on("end", function(e) {// dragが終了した時の処理
        flag = -1;
    });
    
    function zoom(a_time, delay_time) {
        //recalculate domains
        if (zoomArea.x1 > zoomArea.x2) {
            X_axis.domain([zoomArea.x2, zoomArea.x1]);
        } else {
            X_axis.domain([zoomArea.x1, zoomArea.x2]);
        }
        
        if (zoomArea.y1 > zoomArea.y2) {
            Y_axis.domain([zoomArea.y2, zoomArea.y1]);
        } else {
            Y_axis.domain([zoomArea.y1, zoomArea.y2]);
        }

        //update axis and redraw lines
        var t = svg.transition().duration(a_time);
        t.select(".myXaxis")
            .call(d3.axisBottom(X_axis))
            .selectAll("text")
                .attr("transform", "rotate(45)")    // 文字を時計回りに45度回転させる
                .style("text-anchor", "start");
        t.select(".myYaxis")
            .call(d3.axisLeft(Y_axis));

        svg.selectAll("circle")
            .transition()
            .delay(function(d,i){return(i*delay_time)})
            .duration(a_time)
            .attr("cx", function (d) { return X_axis(d[current_X]); } )
            .attr("cy", function (d) { return Y_axis(d[current_Y]); } )
            .attr("r", 5*zoom_count);
    }

    var zoomOut = function() {// zoomOutボタンが押されたときの処理
        X_axis.domain([features_range[current_X][0], features_range[current_X][1]]);
        Y_axis.domain([features_range[current_Y][0], features_range[current_Y][1]]);
        zoomArea.x1 = features_range[current_X][0];// ズームエリアのリセット。そうしないと、前の設定が残って、スクロール時に変なところがズームされる。
        zoomArea.x2 = features_range[current_X][1];
        zoomArea.y1 = features_range[current_Y][0];
        zoomArea.y2 = features_range[current_Y][1];
        
        zoom_count = 1;// zoom回数のリセット. 1にリセットすることに注意。範囲の問題。
        
        var t = svg.transition().duration(animation_time);
        t.select(".myXaxis")
            .call(d3.axisBottom(X_axis))
            .selectAll("text")
                .attr("transform", "rotate(45)")    // 文字を時計回りに45度回転させる
                .style("text-anchor", "start");
        t.select(".myYaxis")
            .call(d3.axisLeft(Y_axis)); 

        svg.selectAll("circle")
            .transition()
            .delay(function(d,i){return(i*3)})
            .duration(animation_time)
            .attr("cx", function (d) { return X_axis(d[current_X]); } )
            .attr("cy", function (d) { return Y_axis(d[current_Y]); } )
            .attr("r", 5);
    }

    document.getElementById("zoom_out_btn").addEventListener("click", zoomOut);

    // グラフエリアをクリックしたときになんの要素が選択されたかを出力
    // var check_area = document.getElementById("my_dataviz");
    // check_area.addEventListener("click", (e) => {
    //     console.log(document.elementsFromPoint(e.clientX, e.clientY));
    //     console.log(e.target);
    // });
})