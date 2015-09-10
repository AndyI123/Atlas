/**Utitlity functions**/
var paper, circs, i, nowX, nowY, timer, props = {}, toggler = 0, elie, dx, dy, rad, cur, opa, c, lines, lineIds, circIds;

var faIcons = ["fa-umbrella", "fa-clock-o", "fa-arrows-h"]
circIds = [];
lineIds = []

function randomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

allWebs = new Mongo.collection("webs");

function rane(min, max, except) {
    var a = Math.floor(Math.random() * (max - min + 1)) + min; 
    while (a == except) {
        a = Math.floor(Math.random() * (max - min + 1)) + min; 
    }
    return a;
}

function ran(min, max)  
{  
    return Math.floor(Math.random() * (max - min + 1)) + min;  
} 

function moveIt()
{
    var thisWidth = document.getElementById("canvas").getBoundingClientRect().width;
    var thisHeight = document.getElementById("canvas").getBoundingClientRect().height;
    //c.attr("path", "M" + ran(10, 100).toString() + " " + ran(10, 100).toString() + "L" + ran(100, 200).toString() + " " + ran(100, 200).toString());
    for(i = 0; i < circs.length; ++i)
    {
        // Reset when time is at zero
        if (! circs[i].time) 
        {
            circs[i].time  = ran(30, 100);
            circs[i].deg   = ran(-179, 180);
            circs[i].vel   = ran(1, 5);  
            circs[i].curve = ran(0, 1);
            circs[i].fade  = ran(0, 1);
            circs[i].grow  = ran(-2, 2); 
        }                
        // Get position
        nowX = circs[i].attr("cx");
        nowY = circs[i].attr("cy");   
        // Calc movement
        dx = circs[i].vel * Math.cos(circs[i].deg * Math.PI/180);
        dy = circs[i].vel * Math.sin(circs[i].deg * Math.PI/180);
        // Calc new position
        nowX += dx;
        nowY += dy;
        // Calc wrap around
        if (nowX < 0) nowX = thisWidth - 10 + nowX;
        else          nowX = nowX % (thisWidth - 10);            
        if (nowY < 0) nowY = thisHeight - 10 + nowY;
        else          nowY = nowY % (thisHeight - 10);

        // Render moved particle
        circs[i].attr({cx: nowX, cy: nowY});

        // Calc growth
        rad = circs[i].attr("r");
        if (circs[i].grow > 0) circs[i].attr("r", 10);
        else                   circs[i].attr("r", 10);

        // Calc curve
        if (circs[i].curve > 0) circs[i].deg = circs[i].deg + 2;
        else                    circs[i].deg = circs[i].deg - 2;

        // Calc opacity
        opa = circs[i].attr("fill-opacity");
        if (circs[i].fade > 0) {
            circs[i].attr("fill-opacity", 0.9);
            circs[i].attr("stroke-opacity", 0.9); }
        else {
            circs[i].attr("fill-opacity", 0.9);
            circs[i].attr("stroke-opacity", 0.9); }

        // Progress timer for particle
        circs[i].time = circs[i].time - 1;

        // Calc damping
        if (circs[i].vel < 1) circs[i].time = 0;
        else circs[i].vel = circs[i].vel - .05;              

    }
    for(j = 0; j < lineIds.length;j++) {
        var thisLineIds = lineIds[j];
        var thisLine =  lines[j];
        var circ1 = circs[circIds.indexOf(thisLineIds[0])]
        var circ2 = circs[circIds.indexOf(thisLineIds[1])]
        thisLine.attr("path", "M" + circ1.attr("cx").toString() + " " + circ1.attr("cy").toString() + "L" + circ2.attr("cx").toString() + " " + circ2.attr("cy").toString());
    }
    timer = setTimeout(moveIt, 60);
}

function startup () {
    var num = 40;
    if(typeof Raphael !== "undefined") {
        paper = Raphael("canvas", "100%", "100%");
        circs = paper.set();
        lines = paper.set();
        for (i = 0; i < num; ++i) {
            opa = ran(3,10)/10;
            circs.push(paper.circle(ran(1000,2000), ran(1000,2000), 5).attr({"fill-opacity": 1, "stroke-opacity": 1}));
            circIds.push(randomId());
        }
        circs.attr({fill: "#BBB", stroke: "#03A9F4", "stroke-width": 2});
        for (j = 0; j < num; j++) {
            var circ1 = circs[j];
            var k = rane(0,num-1, j);
            var circ2 = circs[k]
            lines.push(paper.path("M" + circ1.attr("cx").toString() + " " + circ1.attr("cy").toString() + "L" + circ2.attr("cx").toString() + " " + circ2.attr("cy").toString()).attr({stroke: "#BBB", "stroke-opacity": 0.7}));
            lineIds.push([circIds[j], circIds[k]]);
            console.log(j);
        }
        moveIt();
    }
    else {
        setTimeout(function(){
            startup();
        }, 250)
    }
}

function newBlock(content) {
    var newState = $('<div>').attr('id', randomId()).addClass('item');
    var title = $('<div>').addClass('title').text($("#newnote").val());
    var connect = $('<div>').addClass('connect');

    newState.css({
        'top': document.pageY,
        'left': document.pageX
    });

    newState.append(connect);
    connect.append(title)

    $('#flowContainer').append(newState);
    jsPlumb.makeTarget(newState, {
        anchor: 'Continuous'
    });
    jsPlumb.makeSource(connect, {
        parent: newState,
        anchor: 'Continuous',
        connectorOverlays: [["Custom", {
            create: function(component) {
                return $('<div>').css({"border": "4px solid #445566", "border-radius": "50px", "background-clip": "padding-box"}).append($("<i>").addClass("fa fa-umbrella faitem"))
            },
            cssClass: "overlayItem"
        }]],
        endpoint: ["Rectangle", { width:10, height:10 }]
    });
    jsPlumb.draggable(newState, {
        containment: 'parent'
    });
    $("#newnote").val("");
}

Router.route("/flowchart");
Router.route("/", function() {
    this.render("home")
})

if (Meteor.isClient) {
  var startLocation = [-1, -1];
  Meteor.startup(function () {
      jsPlumb.ready(function() {
          jsPlumb.setContainer($("#flowContainer"));
          jsPlumb.bind("click", function (connection, e) {
              e.preventDefault();
              var thisObj = $(connection.getElement()).find("i")
              console.log(thisObj);
              for(k = 0; k < faIcons.length; k++) {
                  if(thisObj.hasClass(faIcons[k])) {
                      thisObj.removeClass(faIcons[k]);
                      console.log((k+1) % (faIcons.length));
                      thisObj.addClass(faIcons[(k+1) % (faIcons.length)])
                      break;
                  }
              }
          });
          jsPlumb.bind("contextmenu", function(connection, e) {
              jsPlumb.detach(connection.component);
              e.preventDefault();
          });
          jsPlumb.bind("connectionDrag", function(params) {
              $("#linker").addClass("dragging");
              return {};
          });
          jsPlumb.bind("beforeDrop", function(info) {
              console.log("test")
              $("#linker").removeClass("dragging");
              return {};
          });
          jsPlumb.bind("connectionDetached", function(info) {
              console.log("test")
              $("#linker").removeClass("dragging");
              return {};
          });
      });
      $("#defaultradio").attr('checked', true);
      $("#faitem").click(function() {
          console.log("Hello");
      })
  });
    
  Template.home.onRendered(function() {
      startup();
  });
    
  Template.body.helpers({ 
      
  })
  
  Template.notetaker.onRendered(function() {
      web = new Mongo.collection(randomId());
  })
  
  Template.notetaker.events({
      'submit .new-bullet' : function (e) {
          e.preventDefault();
          web.insert({
              id: randomId(),
              text: $("#newnote").val()
          });
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
