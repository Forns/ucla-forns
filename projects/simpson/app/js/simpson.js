/**
 * simpson.js
 * Includes Daggity-mediated functionality for Simpson's Paradox operations
 */



var simpsonAnalysis = function () {
      var dag = Model.dag,
          allPaths = [],
          pathCount = 0,
          sources = dag.getSources(),
          targets = dag.getTargets(),
          minimalSeparators = GraphAnalyzer.listMsasTotalEffect(dag),
          dontCondition = [],
          allLatentReport = "";
      
      // Let's make sure we can even run the rest of our algorithm before continuing
      if (dag.containsCycle()) {
        return {
          possible: "No; cycle in graph",
          condition: "N/A",
          code: 0
        };
      }
      
      if (sources.length === 0 || targets.length === 0) {
        return {
          possible: "No; exposure or outcome not set",
          condition: "N/A",
          code: -1
        }
      }
      
      // We'll start off by looking at every path between our sources and targets
      sources.each(function (s) {
        targets.each(function (t) {
          dag.listPathsBetween(s, t).each(function (p) {
            allPaths.push(p.splice(0));
          });
        });
      });
      
      pathCount = allPaths.length;
      
      // Verify that there are enough paths between X and Y for Simpson's paradox
      if (pathCount <= 1) {
        return {
          possible: "No; one path from exposure to outcome",
          condition: "N/A",
          code: 1
        };
      }
      
      // Next, we want to test if there's an all-latent variable undirected path from X to Y
      allPaths.each(function (p) {
        if (dag.isLatentPath(p, dag)) {
          allLatentReport = {
            possible:
              "No; all latent path:<br/>" +
              "<ul>" +
                (function () {
                  var result = "";
                  p.each(function (n) {
                    result += "<li><p>" + n.id + "</p></li>"
                  });
                  return result;
                })() +
              "</ul>",
            condition: "N/A",
            code: 2
          };
        }
      });
      
      if (allLatentReport) {
        return allLatentReport;
      }
      
      // Otherwise, it's possible and we should report where the correct answer is!
      
      // Check if we've accidentally conditioned on something along the causal path:
      dag.nodesOnCausalPaths().each(function (n) {
        if (dag.isAdjustedNode(n)) {
          dontCondition.push(n.id);
        }
      });
      
      if (dontCondition.length) {
        dontCondition = "{" + dontCondition.join(", ") + "}";
      }
      
      if (dag.activeBiasGraph().edges.length) {
        return {
          possible: "Yes",
          report: "sets",
          condition: minimalSeparators,
          dontCondition: dontCondition,
          answer: "Bias requires resolution",
          code: 3
        };
      } else {
        var conditioned = false;
        dag.getVertices().each(function (v) {
          if (dag.isAdjustedNode(v)) {
            minimalSeparators.each(function (s) {
              s.each(function (n) {
                if (n.id === v.id) {
                  conditioned = true;
                }
              });
            });
          }
        });
        
        return {
          possible: "Yes",
          condition: "No",
          dontCondition: dontCondition,
          answer: (conditioned) ? "Disaggregated Data" : "Aggregated Data",
          code: 4
        };
      }
      
      // [TESTING] Default return
      return {
        possible: "N/A",
        condition: "N/A",
        code: -2
      };
    },

    displaySimpsonInfo = function () {
      var results = simpsonAnalysis(),
          infoSimpsonPossible = $("info_simpson_possible"),
          infoButton = jQuery("#simpson_info_button"),
          simpsonPopup = jQuery("#simpsonPopup"),
          popupBody = simpsonPopup.find(".modal-body"),
          
          // Holds the report info... could probably be cleaned up but... meh
          infoReport = 
            // --------------------------------------------------------------------
            // Nav tabs
            "<ul class='nav nav-tabs'>" +
              "<li class='active'><a href='#explanation' data-toggle='tab'>Explanation</a></li>" +
              "<li><a href='#simulation' data-toggle='tab'>Simulation</a></li>" +
              "<li><a href='#analysis' data-toggle='tab'>Analysis</a></li>" +
            "</ul>" +
            
            // --------------------------------------------------------------------
            // Nav panes
            "<div class='tab-content'>" +
            
              // Explanation nav pane
              "<div class='tab-pane active' id='explanation'>" +
              
                "<div class='table-responsive table-bordered'>" +
                  "<table class='table'>" +
                    "<thead>" +
                    "</thead>" +
                    "<tbody>" +
                    
                      "<tr class='" + ((results.code > 2) ? "success" : "danger") + "'>" +
                        "<td><strong>Is it possible?<strong></td>" +
                        "<td>" + results.possible + "</td>" +
                      "</tr>" +
                      
                      ((results.code > 2) ? 
                      (
                        "<tr class='" + ((results.code === 3) ? "warning" : "success") + "'>" +
                          "<td><strong>Unblocked backdoor?</strong></td>" +
                          "<td>" +
                            
                            // Messy way to display the minimal separating set(s)
                            (function () {
                              var report = results.condition;
                              if (results.code === 3) {
                                report = [];
                                for (var i = 0; i < results.condition.length; i++) {
                                  report.push(
                                    (function () {
                                      var subRepo = [];
                                      results.condition[i].each(function (j) {
                                        subRepo.push(j.id);
                                      });
                                      return "{" + subRepo.join(", ") + "}";
                                    })()
                                  );
                                }
                                report = "Yes, adjust for (at least one of):<br/>" + ((report.length) ? report.join(", ") : "{}");
                              }
                              return report;
                            })() +
                            
                          "</td>" +
                        "</tr>" +
                        
                        // Check for NOT conditioning along the causal path
                        ((results.dontCondition.length) 
                          ? 
                            "<tr class='danger'>" +
                              "<td><strong>Should NOT adjust for:</strong></td>" +
                              "<td>" + results.dontCondition + "</td>" +
                            "</tr>"
                          : "") +
                          
                        // If all green, report where answer is
                        ((!results.dontCondition.length && results.code === 4) 
                          ? 
                            "<tr class='success'>" +
                              "<td><strong>Correct TE of exposure on outcome in:</strong></td>" +
                              "<td>" + results.answer + "</td>" +
                            "</tr>"
                          : "")
                        
                      ) : "") +
                      
                    "</tbody>" +
                  "</table>" +
                "</div>" +
              
              "</div>" +
              
              // Simulation nav pane
              "<div class='tab-pane' id='simulation'>" +
              "</div>" +
              
              // Analysis nav pane
              "<div class='tab-pane' id='analysis'>" +
              "</div>" +
              
            "</div>";
          
      infoSimpsonPossible.innerHTML = results.possible;
      
      // Event handler for the explanation button
      infoButton
        .click(function () {
          popupBody
            .html(infoReport);
          simpsonPopup
            .modal("show");
        });
      
      /*
      infoSimpsonCondition.innerHTML = 
        "<p>" + 
        ((results.report === "sets") 
          ? (function () {
            var report = "<ul>";
            results.condition.each(function (s) {
              console.log(s);
              report += "<li>{";
              s.each(function (n) {
                report += n.id + ", ";
              });
              report = report.substring(0, report.length - 2);
              report += "}</li>";
            });
            report += "</ul>"
            return report;
          })()
          : results.condition) + 
        "</p>";
      */
      
      
      // Bool value for whether node is adjusted for or not
      // console.log(Model.dag.isAdjustedNode(Model.dag.getVertex("Z1")));
      
      // Bool value for whether or not graph contains a cycle
      // console.log(Model.dag.containsCycle());
      
      // Returns a new copy of the calling dag that can then be safely mutilated
      // console.log(Model.dag.clone());
      
      // List of outcome variables Y
      //console.log(Model.dag.getTargets());
      
      // List of exposure variables X
      // console.log(Model.dag.getSources());
      
      // Returns all nodes from X -> ... -> Y
      // console.log(Model.dag.nodesOnCausalPaths());
      
      // The graph with backdoor from exposure to effect alone; no causal path from X -> Y
      // console.log(Model.dag.backDoorGraph().toString());
      
      // Ordering from top node (fewest parents) to exposure and effect
      // console.log(Model.dag.topologicalOrdering());
    };
    
jQuery(function () {
  modalPopup(
    "body",
    "simpsonPopup",
    "Simpson's Paradox",
    "<p>Loading...</p>",
    "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>",
    {
      show: false
    },
    {
      image: true
    }
  );
});
