/**
 * general-display.js
 * 
 * Javascript-mediated display elements for most site pages
 */
$(function () {
  var scrollspy = $("#scrollspy"),
      presentationMode = false,
      presentationClass = "presentation-display",
      styleMap = {
        ".question": {
          glyphicon: "glyphicon-question-sign",
          classes: "alert alert-warning"
        },
        ".definition": {
          glyphicon: "glyphicon-info-sign",
          classes: "alert alert-info"
        },
        ".toolkit": {
          glyphicon: "glyphicon-cog",
          classes: "alert alert-info"
        },
        ".example": {
          glyphicon: "glyphicon-check",
          classes: "alert alert-warning"
        },
        ".debug": {
          glyphicon: "glyphicon-warning-sign",
          classes: "alert alert-danger"
        },
        ".answer": {
          glyphicon: "glyphicon-chevron-right",
          classes: "alert alert-success"
        }
      },
      animationTime = 200,
      refreshScrollspy = function () {
        $('[data-spy="scroll"]').each(function () {
          var $spy = $(this).scrollspy('refresh');
        });
      };
  
  // Set up ScrollSpy elements
  $(".scrollspy-element")
    .each(function () {
      scrollspy.append(
        "<li><a href='#" + $(this).attr("id") + "'>" + $(this).attr("scrollspy-title") + "</a></li>"
      );
    });
    
  // Refresh scrollspy
  refreshScrollspy();
  
  // Set up presentation mode
  $(document)
    .on("keypress", function (e) {
      if (e.keyCode === 80) {
        // If we're already in presentation mode, turn it off...
        if (presentationMode) {
          $("." + presentationClass)
            .removeClass(presentationClass);
        
        // Otherwise, we need to apply presentation mode
        } else {
          // Soooo select all descendants of presentation content
          $(".presentation-content")
            .find("p, pre")
            .addClass(presentationClass);
        }
        presentationMode = !presentationMode;
        setTimeout(function () {
          refreshScrollspy();
        }, animationTime + 100);
      }
    });
  
  // Configure display of the alert elements
  for (var elements in styleMap) {
    $(elements)
      .addClass(styleMap[elements].classes)
      .prepend("<span class='glyphicon " + styleMap[elements].glyphicon + "'></span>&nbsp");
  }
  
  $(".example")
    .prepend("<strong>Example</strong><br/>");
  
  // Questions can be clicked on for the answer
  $(".question")
    .each(function () {
      $(this)
        .click(function () {
          $("[name='" + $(this).attr("name") + "'].answer")
            .fadeIn(animationTime);
        });
    });
});
