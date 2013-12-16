/**
 * simpson.js
 * Includes DAGitty-mediated functionality for Simpson's Paradox operations
 */



var $sim = {
      cpts: {},
      population: [],
      
      
      // Adds a CPT to the given simulation 
      addCPT: function (cptName, cptParents, mappedCProbs) {
        if (this.cpts[cptName]) {
          console.warn("[!] Warning: Attempting to overwrite CPT values");
        }
        this.cpts[cptName] = {
          variables: [cptName],
          params: [],
          name: cptName + ((cptParents.length) ? " | " + cptParents.join(", ") : "")
        };
        // Sometimes, may not have parent to push
        if (cptParents.length) {
          this.cpts[cptName].variables = this.cpts[cptName].variables.concat(cptParents);
        }
        
        this.cpts[cptName].params = mappedCProbs;
      },
      
      
      // Returns the given CPT parameter given the instantiation over variables
      getParameter: function (cptName, instantiation) {
        var currentCPT = this.cpts[cptName],
            ordering = [],
            count = 0;
            
        for (var i in instantiation) {
          count++;
          for (var j = 0; j < currentCPT.variables.length; j++) {
            if (i === currentCPT.variables[j]) {
              ordering[j] = instantiation[i];
              break;
            }
          }
        }
        
        if (count !== currentCPT.variables.length) {
          console.error("[X] Request for undefined parameter");
        }
        
        return (currentCPT.params[parseInt(ordering.join(""), 2)]);
      },
      
      
      // Runs the simulation parameter calculation on a causal diagram with the given
      // Simpson's reversal order
      simulateSimpson: function (dag, order, n) {
        // Clear any previous sim
        this.population = [];
        
        var covariates = dag.getVertices(),
            source = dag.getSources()[0].id,
            target = dag.getTargets()[0].id,
            orderFollowed = [],
            splitAttempt = 0,
            
            randomChance = function (UB, LB, noAbs) {
              var result;
              do {
                result = Math.random();
              } while (Math.abs((result - ((noAbs) ? 0 : 0.5))) > UB || Math.abs((result - ((noAbs) ? 0 : 0.5))) < LB);
              return result;
            },
            
            // Determines whether or not the given split is valid (has values that are positive or zero and
            // that are not greater than the original amounts) and if not, where the problem is in the table
            // We also check that the directionality is valid compared to the previous step so as to perform
            // the reversal
            isValidSplit = function (original, tabs, previousDir) {
              var directions = [[0, 0], [0, 0]],
                  result;
              for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 2; j++) {
                  if (tabs[i][j][0] < 0 || tabs[i][j][1] < 0) {
                    return {problem: -1, solution: -1};
                  }
                  if (tabs[i][j][0] > original[j][0] || tabs[i][j][1] > original[j][1]) {
                    return {problem: -2, solution: 1};
                  }
                  directions[i][j] += tabs[i][j][0] + tabs[i][j][1];
                }
              }
              
              // If we previously had a negative direction...
              if (previousDir < 0) {
                if (directions[0][0] - directions[0][1] < 0) {
                  return {problem: [0, 0], solution: 1};
                }
                if (directions[1][0] - directions[1][1] < 0) {
                  return {problem: [1, 0], solution: 1};
                }
                
              // If we previously had a positive direction...
              } else {
                if (directions[0][0] - directions[0][1] > 0) {
                  return {problem: [0, 0], solution: -1};
                }
                if (directions[1][0] - directions[1][1] > 0) {
                  return {problem: [1, 0], solution: -1};
                }
              }
              return {problem: false, solution: false};
            },
            
            tryMigration = function (distribution, migration) {
              for (var j = 0; j < 2; j++) {
                for (var k = 0; k < 2; k++) {
                  distribution[0][j][k] += migration[0][j][k];
                  distribution[1][j][k] += migration[1][j][k];
                }
              }
            },
            
            // Used to split tables for simulating Simpson's paradox
            // tabs is a 2x2 array input containing the exposure by outcome combos
            // in the current conditioning; previousDir indicates the correlative
            // direction of the previous step in the conditioning chain, which must be
            // reversed in this step
            splitTable = function (tabs, previousDir) {
              var split = [
                    [[0, 0], [0, 0]],
                    [[0, 0], [0, 0]]
                  ],
                  originalSplit = [
                    [[0, 0], [0, 0]],
                    [[0, 0], [0, 0]]
                  ],
                  splitRequest = [
                    [[0, 0], [0, 0]],
                    [[0, 0], [0, 0]]
                  ],
                  originalRequest = [
                    [[0, 0], [0, 0]],
                    [[0, 0], [0, 0]]
                  ],
                  randomSplit = randomChance(0.6, 0.4, true);
                  
              for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 2; j++) {
                  for (var k = 0; k < 2; k++) {
                    if (i === 0) {
                      split[i][j][k] = ((k % 2) ? Math.floor(tabs[j][k] * randomSplit) : Math.ceil(tabs[j][k] * (1 - randomSplit)));
                    } else {
                      split[i][j][k] = tabs[j][k] - split[0][j][k];
                    }
                    
                    // Save in case we need to retry
                    originalSplit[i][j][k] = split[i][j][k];
                    
                    // Now deal with the split request
                    splitRequest[i][j][k] = 
                      ((j === 0) ? -1 : 1) *
                      ((previousDir < 0) 
                        ? ((i === 0) ? 1 : -1)
                        : ((i === 0) ? -1 : 1));
                        
                    originalRequest[i][j][k] = splitRequest[i][j][k];
                  }
                }
              }
              
              // TODO: Find a way to split the tables; try using a "difference matrix"
              // that is equivalent in dimension to split, but instead has the differences for
              // each cell that could be used to achieve the correct reversal direction
              
              // Meaning we must flip to the positive direction  
              while (true) {
                var isValid = isValidSplit(tabs, split, previousDir);
                if (isValid.problem === false) {
                  return split;
                } else if(isValid.problem <= -1) {
                  if (splitAttempt >= 2) {
                    console.warn("[!] Warning, unable to split");
                    return split;
                  }
                  // Reset to the next attempt schema
                  for (var i = 0; i < 2; i++) {
                    for (var j = 0; j < 2; j++) {
                      split[i][j][0] = originalSplit[i][j][0];
                      split[i][j][1] = originalSplit[i][j][1];
                      splitRequest[i][j][splitAttempt] = 0;
                      splitRequest[i][j][(splitAttempt) ? 0 : 1] = originalRequest[i][j][(splitAttempt) ? 0 : 1];
                    }
                  }
                  
                  console.log(splitRequest);
                  splitAttempt++;
                } else {
                  // We need to transfer some values around the tables
                  tryMigration(split, splitRequest);
                }
              }
            },
            
            chanceUB = 0.4,
            chanceLB = 0.15,
            chanceTake = randomChance(chanceUB, chanceLB),
            chanceRecover = [randomChance(chanceUB, chanceLB), randomChance(chanceUB, chanceLB)];
            
        splitTable([[25, 25], [25, 25]], -1);
        splitTable([[100, 20], [30, 90]], -1);
        
        var x = [[[25, 25], [25, 25]], [[25, 25], [25, 25]]],
            y = [[[1, 1], [-1, -1]], [[-1, -1], [1, 1]]];
        tryMigration(x, y);
        console.log(x);
            
        // Seed the population with n samples of the cause on effect (aggregate)
        for (var i = 0; i < n; i++) {
          var take = Math.random(),
              recover = Math.random();
              
          this.population[i] = {};
          this.population[i][source] = (take < chanceTake) ? 0 : 1;
          this.population[i][target] = (recover < chanceRecover[this.population[i][source]]) ? 0 : 1;
        }
        
        // At this point, we have our distribution over X and Y aggregated... now
        // it's time to examine the conditioning on covariates
        for (var cov = 0; cov < order.length; cov++) {
          // Determine the proper reversal at this step
          var counts = this.countFromPopulation(source, target, orderFollowed);
              
          for (var i = 0; i < n; i++) {
            var currentSubject = this.population[i];
          }
          
          orderFollowed.push(order[cov]);
        }
      },
      
      
      // Takes the population and returns the Y | X, Z counts
      countFromPopulation: function (source, target, covariates) {
        var matches = [[0, 0], [0, 0]],
            currentSubject,
            targetRates = [0, 0],
            targetDifference;
            
        for (var i = 0; i < this.population.length; i++) {
          currentSubject = this.population[i];
          var instantiationMatches = true;
          for (var c in covariates) {
            if (currentSubject[c] !== covariates[c]) {
              instantiationMatches = false;
              break;
            }
          }
          if (instantiationMatches) {
            matches[currentSubject[source]][currentSubject[target]]++;
          }
        }
        
        targetRates[0] = matches[0][1] / (matches[0][0] + matches[0][1]);
        targetRates[1] = matches[1][1] / (matches[1][0] + matches[1][1]);
        targetDifference = targetRates[0] - targetRates[1];
        
        return {
          tabs: matches,
          rates: targetRates,
          difference: targetDifference
        };
      },
      
      
      // Reports a table with exposure and recovery rates
      ratesToTable: function (source, target, covariates) {
        // Covariates represents the filtering, otherwise, we'll
        // use a 2D array to count the matches
        var rateColoring,
            covariateString = "",
            counts = this.countFromPopulation(source, target, covariates),
            matches = counts.tabs,
            targetRates = counts.rates;
            
        for (var c in covariates) {
          covariateString += c + " = " + covariates[c] + ", ";
        }
        if (covariateString) {
          covariateString = covariateString.substring(0, covariateString.length - 2);
        }
        
        rateColoring = (targetRates[0] > targetRates[1]) ? "danger" : "success";
        
        return "<table class='table table-bordered table-compressed'>" +
                 // TODO: List covariates
                 "<caption>" + target + " | " + source + ((covariateString) ? ", " + covariateString : "") + "</caption>" +
                 "<thead>" +
                   "<tr>" +
                     "<th></th>" +
                     "<th>" + target + " = 0</th>" +
                     "<th>" + target + " = 1</th>" +
                     "<th>Total " + source + "</th>" +
                     "<th class='" + rateColoring + "'>Rate</th>" +
                   "</tr>" +
                 "</thead>" +
                 "<tbody>" +
                   "<tr>" +
                     "<th>" + source + " = 0</th>" +
                     "<td>" + matches[0][0] + "</td>" +
                     "<td>" + matches[0][1] + "</td>" +
                     "<td>" + (matches[0][0] + matches[0][1]) + "</td>" +
                     "<td class='" + rateColoring + "'>" + targetRates[0].toFixed(2) + "</td>" +
                   "</tr>" +
                   "<tr>" +
                     "<th>" + source + " = 1</th>" +
                     "<td>" + matches[1][0] + "</td>" +
                     "<td>" + matches[1][1] + "</td>" +
                     "<td>" + (matches[1][0] + matches[1][1]) + "</td>" +
                     "<td class='" + rateColoring + "'>" + targetRates[1].toFixed(2) + "</td>" +
                   "</tr>" +
                   "<tr>" +
                     "<th>Total " + target + "</th>" +
                     "<td>" + (matches[0][0] + matches[1][0]) + "</td>" +
                     "<td>" + (matches[0][1] + matches[1][1]) + "</td>" +
                     "<td>" + (matches[0][0] + matches[0][1] + matches[1][0] + matches[1][1]) + "</td>" +
                     "<td class='" + rateColoring + "'></td>" +
                   "</tr>" +
                 "</tbody>" +
               "</table>";
      },
      
      
      // Provides a table print-out of the given CPT
      cptToTable: function (cptName) {
        if (!this.cpts[cptName]) {
          console.error("[X] No CPT with that variable name found!");
          return "";
        }
        var currentCPT = this.cpts[cptName],
            rows = Math.pow(2, currentCPT.variables.length),
            rowDisplays = [],
            result = 
              "<table class='table table-bordered table-compressed'>" +
                "<caption>CPT for: " + currentCPT.name + "</caption>" +
                "<thead>" +
                  "<tr>";
            
        // Add headings
        for (var i = 0; i < currentCPT.variables.length; i++) {
          result += "<th>" + currentCPT.variables[i] + "</th>";
          // Set row displays of binary values
          rowDisplays.push(Math.pow(2, (currentCPT.variables.length - i - 1)));
        }
        result += "<th>Pr</th></tr></thead><tbody><tr>";
        
        
        // Add parameters
        for (var i = 0; i < rows; i++) {
          // Add variable values
          for (var j = 0; j < currentCPT.variables.length; j++) {
            // 0 or 1 depending on which row for the variable
            result += "<td>" + Math.floor(i / rowDisplays[j]) % (rowDisplays[j] * 2) + "</td>"
          }
          result += "<td>" + currentCPT.params[i] + "</td></tr>";
        }
        result += "</tbody></table>";
        
        return result;
      }
    },
    
    simpsonAnalysis = function () {
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
      $sim.simulateSimpson(Model.dag, ["Z1"], 1000);
      
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
              "<li><a href='#sim-analysis' data-toggle='tab'>Analysis</a></li>" +
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
              "<div class='tab-pane' id='sim-analysis'>" +
                $sim.ratesToTable(Model.dag.getSources()[0].id, Model.dag.getTargets()[0].id, {}) +
                $sim.ratesToTable(Model.dag.getSources()[0].id, Model.dag.getTargets()[0].id, {"Z1": 0}) +
                $sim.ratesToTable(Model.dag.getSources()[0].id, Model.dag.getTargets()[0].id, {"Z1": 1}) +
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
