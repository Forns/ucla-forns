/**
 * simpson.js
 * Includes Daggity-mediated functionality for Simpson's Paradox operations
 */



var simpsonInit = function () {
      // console.log(Model.dag);
      
      console.log(Model.dag.listPathsBetween(Model.dag.getSources()[0], Model.dag.getTargets()[0]));
      
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
