/*
 * modal-popup.js
 * 
 * Simple work-saver for making a bootstrap modal popup
 */

var modalPopup = function (container, id, title, body, buttons, options, display) {
      container = jQuery(container);
      container
        .append(
          "<div id='" + id + "' data-backdrop='static' data-keyboard='false' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='model-title' aria-hidden='true'>" +
            "<div class='modal-dialog'>" +
              "<div class='modal-content'>" +
                "<div class='modal-header'>" +
                  "<h4 class='modal-title'><span class='glyphicon glyphicon-chevron-right'></span>&nbsp" + title + "</h4>" +
                "</div>" +
                "<div class='modal-body'>" +
                  body +
                "</div>" +
                "<div class='modal-footer'>" +
                  buttons +
                "</div>" +
              "</div>" +
            "</div>" +
          "</div>"
        );
        
      if(display && display.image) {
        jQuery("#" + id + " .modal-dialog")
          .addClass("modal-image");
      } else {
        jQuery("#" + id + " .modal-dialog")
          .removeClass("modal-image");
      }
      
      return jQuery("#" + id).modal(options);
    };
    
    // Frequent error-popup
    modalPopup.errorPane = function (container, id, title, error) {
      modalPopup(
        container,
        id,
        title,
        "<p><strong>Error:</strong> Sorry, looks like an error occurred on our side! Please contact Andrew to report this problem... or not, that seems like a bit of an inconvenience.</p>" +
        "<p>Error Status: " + error + "</p>",
        "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>OK</button>"
      );
    };
