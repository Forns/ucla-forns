/**
 * simpson.js
 * Includes Daggity-mediated functionality for Simpson's Paradox operations
 */



var simpsonAnalysis = function () {
      var dag = Model.dag,
          allPaths = [],
          sources = dag.getSources(),
          targets = dag.getTargets();
      
      // Let's make sure we can even run the rest of our algorithm before continuing
      if (dag.containsCycle()) {
        return {
          possible: "No; Cycle in graph",
          condition: 
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
    },

    displaySimpsonInfo = function () {
      var results = simpsonAnalysis();
      console.log(allPaths);
      
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
