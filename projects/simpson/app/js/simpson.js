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
          allLatentReport = "";
      
      // Let's make sure we can even run the rest of our algorithm before continuing
      if (dag.containsCycle()) {
        return {
          possible: "No; Cycle in graph",
          condition: "N/A"
        };
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
          condition: "N/A"
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
            condition: "N/A"
          };
        }
      });
      
      if (allLatentReport) {
        return allLatentReport;
      }
      
      // Otherwise, it's possible and we should report where the correct answer is!
      if (dag.activeBiasGraph().edges.length) {
        return {
          possible: "Yes",
          report: "sets",
          condition: GraphAnalyzer.listMsasTotalEffect(dag)
        };
      } else {
        return {
          possible: "Yes",
          condition: "No"
        };
      }
      
      // [TESTING] Default return
      return {
        possible: "N/A",
        condition: "N/A"
      };
    },

    displaySimpsonInfo = function () {
      console.log(Model.dag.activeBiasGraph());
      var results = simpsonAnalysis(),
          infoSimpsonPossible = $("info_simpson_possible"),
          infoSimpsonCondition = $("info_simpson_condition");
      
      infoSimpsonPossible.innerHTML = "<p>" + results.possible + "</p>";
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
