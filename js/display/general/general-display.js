/**
 * general-display.js
 * 
 * Javascript-mediated display elements for most site pages
 */
$(function () {
  var scrollspy = $("#scrollspy"),
      presentationMode = false,
      dyerMode = false,
      DYER_RATE = 0.15,
      presentationClass = "presentation-display",
      noteMode = false,
      currentNote = 0,
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
  
  // Set up presentation mode
  $(document)
    .on("keypress", function (e) {
      if (e.keyCode === 80) {
        // If we're already in presentation mode, turn it off...
        if (presentationMode) {
          $("." + presentationClass)
            .removeClass(presentationClass);
          $(".presentation-content")
            .addClass("col-md-10")
            .removeClass("presentation-container");
          $("#scrollspy")
            .removeClass("hidden");
        
        // Otherwise, we need to apply presentation mode
        } else {
          // Soooo select all descendants of presentation content
          $(".presentation-content")
            .find("p, blockquote, pre, h3")
            .addClass(presentationClass);
          $(".presentation-content")
            .removeClass("col-md-10")
            .addClass("presentation-container");
          $("#scrollspy")
            .addClass("hidden");
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
      .each(function () {
        var target = ($(this).prop("tagName") === "DIV") ? $(this).find("p:first") : $(this);
        target
          .prepend("<span class='glyphicon " + styleMap[elements].glyphicon + "'></span>&nbsp");
      });
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
  
  // Setup question reset
  $(document)
    .on("keypress", function (e) {
      if (e.keyCode === 82) {
        $(".question")
          .each(function () {
            $("[name='" + $(this).attr("name") + "'].answer")
              .hide();
          });
      }
    });
    
  // Configure display of file tags
  $("[filetag]").each(function () {
    var filename = $(this).attr("filetag");
    $(this).before("<span class='filetag'><span class='glyphicon glyphicon-file'></span>&nbsp;" + filename + "</span>");
  });
    
  // Dyer mode
  $(document)
    .on("keypress", function (e) {
      if (e.keyCode === 68) {
        if (dyerMode) {
          dyerMode = false;
          $(".dyer-mode").remove();
        } else {
          dyerMode = true;
          alert("[!] Dyer mode enabled. Press SHIFT+D again to disable.")
          $("#main-content p").each(function () {
            if (Math.random() < DYER_RATE) {
              var currentText = $(this).text(),
                  currentLength = currentText.length,
                  randomPos = currentLength * Math.random();
              
              currentText = currentText.substring(0, randomPos) + "<span class='dyer-mode'>" +
                            ((Math.random() < 0.5) ? "(" : ")") + "</span>" +
                            currentText.substring(randomPos, currentLength);
              
              $(this).html(currentText);
            }
          });
        }
      }
    });
  
  /*
   * NOTE TAKING MECHANICS
   */
  
  // Note-taking mode: engage!
  $(document)
    .on("keypress", function (e) {
      if (e.keyCode === 78) {
        // If we're in noteMode, then disable it...
        if (noteMode) {
          noteMode = false;
          $(document).unbind("click");
          $(".presentation-content").removeClass("note-aim");
        
        // ...otherwise, go ahead and turn it on
        } else {
          noteMode = true;
          $(".presentation-content").addClass("note-aim");
          $(document).click(function(event) {
            var target = $(event.target);
            if ($(".presentation-content").find(target).length) {
              target
                .after(
                  "<div id='note-" + currentNote + "' class='alert alert-note note text-left'>" +
                    "<a id='note-remove-" + currentNote + "' class='pull-right note-removal'>" +
                      "<span class='glyphicon glyphicon-remove'></span>" +
                    "</a>" +
                    "<span class='glyphicon glyphicon-pencil'></span>" +
                    "<strong> Notes</strong><br/><br/>" +
                    "<textarea class='expanding note-textarea' />" +
                  "</div>"
                );
                
              // Event handler for the remove button
              (function (note) {
                $("#note-remove-" + note)
                  .click(function () {
                    var removeNote = function () {
                      $("#note-" + note)
                        .remove();
                      if (!$(".note").length) {
                        window.onbeforeunload = null;
                      }
                    };
                    
                    if ($(this).siblings().find("textarea").val()) {
                      if (confirm("[!] WARNING: You've entered text into this note; are you sure you want to delete it?")) {
                        removeNote();
                      }
                    } else {
                      removeNote();
                    }
                  });
              })(currentNote);
              
              // Make the text area stretchy
              $("#note-" + currentNote + " textarea")
                .expandingTextarea();
              currentNote++;
              
              $(document).unbind("click");
              $(".presentation-content").removeClass("note-aim");
              
              // Window warning for notes
              // Shamelessly taken from http://stackoverflow.com/questions/1119289/how-to-show-the-are-you-sure-you-want-to-navigate-away-from-this-page-when-ch
              if (!window.onbeforeunload) {
                window.onbeforeunload = function (e) {
                  // If we haven't been passed the event get the window.event
                  e = e || window.event;
                  
                  var message = "[!] WARNING: You have made notes on this page that will be lost if you navigate away.";
                  
                  // For IE6-8 and Firefox prior to version 4
                  if (e) {
                    e.returnValue = message;
                  }
                  
                  // For Chrome, Safari, IE8+ and Opera 12+
                  return message;
                }
              }
            }
          });
        }
      }
    });
    
  // Set up ScrollSpy elements
  $(".scrollspy-element")
    .each(function () {
      scrollspy.append(
        "<li><a href='#" + $(this).attr("id") + "'>" + $(this).attr("scrollspy-title") + "</a></li>"
      );
    });
  
  // Refresh scrollspy
  refreshScrollspy();
  
  setTimeout(function () {
    refreshScrollspy();
  }, 1000);
  
  // Google analytics plugin
  $("body").append(
    "<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create', 'UA-58457464-1', 'auto');ga('send', 'pageview');</script>"
  );
    
});
