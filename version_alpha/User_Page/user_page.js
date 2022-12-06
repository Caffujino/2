var dataset;
var num = 1;// ユーザの切り替え
d3.csv("../csv/reviewer_2.csv").then(function(data){
    console.log(data)
    dataset=data;
    document.getElementById("username").innerHTML=("User Name: "+dataset[num]["reviewer_name"]);
    document.getElementById("Review_count").innerHTML=("累積の投稿数： "+dataset[num]["review_cnt"]+" (全体"+(Number(dataset[num]["num"])+1)+"位)");
    document.getElementById("Area").innerHTML=("投稿の多い地域： "+dataset[num]["area"]);
    document.getElementById("Genre").innerHTML=("投稿の多いジャンル： "+dataset[num]["genre"]);
    document.getElementById("Follower").innerHTML=("フォロワー数： "+dataset[num]["follower"]);
    document.getElementById("Favorite").innerHTML=("いいねの数： "+dataset[num]["favorite"]);
    document.getElementById("Photo").innerHTML=("投稿された写真の枚数： "+dataset[num]["photo"]);

    // var svg = d3.select("body").append("svg")
    //             .attr("width", 1400)
    //             .attr("height", 800);

    // var text = svg.append("text")
    //             .attr("x", 10)
    //             .attr("y", 100)
    //             .attr("font-size", 16)
    //             .attr("fill", "black")
    //             //.attr("stroke", "none")
    //             .text(
    //                 "投稿の多い地域: "+dataset[0]["area"]
    //                 +", 投稿の多いジャンル: "+dataset[0]["genre"]
    //                 +", \レビュー数: "+dataset[0]["review_cnt"]
    //                         +"\nフォロワー数: "+dataset[0]["follower"]
    //                         +"\nいいね数: "+dataset[0]["favorite"]
    //                         +"\n写真投稿枚数: "+dataset[0]["photo"]
    //             );
});
