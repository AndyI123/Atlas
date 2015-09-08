var itemIndex = 4;
function randomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
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
      });
      $("#defaultradio").attr('checked', true);
  })
    
  Template.home.startup(function () {
      jsPlumb.ready(function() {
          jsPlumb.setContainer($("#bg"));
      });
      
  })
  
  Template.notetaker.events({
      'submit .new-bullet' : function (e) {
          e.preventDefault();
          var newState = $('<div>').attr('id', randomId()).addClass('item');
          var title = $('<div>').addClass('title').text($("#newnote").val());
          var connect = $('<div>').addClass('connect');

          newState.css({
              'top': e.pageY,
              'left': e.pageX
          });

          newState.append(connect);
          connect.append(title)

          $('#flowContainer').append(newState);
          jsPlumb.makeTarget(newState, {
              anchor: 'Continuous'
          });
          jsPlumb.makeSource(connect, {
              parent: newState,
              anchor: 'Continuous'
          });
          jsPlumb.draggable(newState, {
              containment: 'parent'
          });
          $("#newnote").val("");
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
