const delay = ms => new Promise(res => setTimeout(res, ms));
const url = window.location.pathname;
const lastPart = url.substring(url.lastIndexOf("/"));
        
languare();
async function languare() {
    await delay(10);
    var nummer = document.getElementById("lang").selectedIndex;
    var ausgewählt = document.getElementById("lang").options;
    await delay(100);
    if(nummer == 0){
        if (lastPart == "/") {
        document.getElementById("efm").innerHTML = "Beste Modelle";
        document.getElementById("home").innerHTML = "Home";
        document.getElementById("comunity").innerHTML = "Comunity";
        document.getElementById("modells").innerHTML = "Modelle";
        document.getElementById("Hello").innerHTML = "Wilkommen zu PrintCloud";
        document.getElementById("Hello2").innerHTML = "Die beste seite für 3dDruck Modelle";
        document.getElementById("Explorebutton").innerHTML = "Entdecke Modelle";
        document.getElementById("newmodells").innerHTML = "Neste Modelle";
        }

    }
    if(nummer == 1){
        if (lastPart == "/") {
        document.getElementById("efm").innerHTML = "Featured Models";
        document.getElementById("home").innerHTML = "Home";
        document.getElementById("comunity").innerHTML = "Comunity";
        document.getElementById("modells").innerHTML = "Modells";
        document.getElementById("Hello").innerHTML = "Welcomme to PrintCloud";
        document.getElementById("Hello2").innerHTML = "The best side for 3d Printing 3d Modells";
        document.getElementById("Explorebutton").innerHTML = "Explore Modells";
        document.getElementById("newmodells").innerHTML = "New Modells";
        }
    }
    
}



