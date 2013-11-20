Graph.addMethods( { 

/**
   Forms the subgraph of this graph consisting of the vertices in "vertex_array" 
   and the edges between them, directed or undirected.
   
   If "vertex_array" contains source and/or target, source and/or target of the
   returned graph are set accordingly. */
   
inducedSubgraph : function( vertex_array ){
   var g = this;
   var gn = new Graph();
  
   for( var i = 0 ; i < vertex_array.length ; i++ ){
      gn.addVertex( new Graph.Vertex( vertex_array[i] ) );
   }
   
   var other_vertex_ids = vertex_array.pluck('id');
   
   for( var i = 0 ; i < g.edges.length ; i++ ){
      var e = g.edges[i];
      if( other_vertex_ids.include( e.v1.id ) && other_vertex_ids.include( e.v2.id ) ){
         var en = e.directed ? new Graph.Edge.Directed( e ) : new Graph.Edge.Undirected( e );
         en.v1 = gn.getVertex( e.v1.id );
         en.v2 = gn.getVertex( e.v2.id );
         gn.addEdge( en );
      }
   }
   
   this.copyAllVertexPropertiesTo( gn );
   return gn;
}, 

/**
	The sugraph of this graph induced by the edges in edge_array.
	*/
edgeInducedSubgraph : function( edge_array ){
   var g = this;
   var gn = new Graph();
  
   for( var i = 0 ; i < edge_array.length ; i++ ){
      var edge_other = edge_array[i];
      var edge_my = g.getEdge( edge_other.v1.id, edge_other.v2.id );
      
      if( edge_my ){
        if( !gn.getVertex( edge_my.v1.id ) )
          gn.addVertex( new Graph.Vertex( edge_my.v1 ) );
        if( !gn.getVertex( edge_my.v2.id ) )
          gn.addVertex( new Graph.Vertex( edge_my.v2 ) );
        if( edge_my.directed ){
            gn.addEdge( new Graph.Edge.Directed( { v1 : gn.getVertex( edge_my.v1.id ), 
           v2: gn.getVertex( edge_my.v2.id ) } ) );
          } else {
            gn.addEdge( new Graph.Edge.Unirected( { v1 : gn.getVertex( edge_my.v1.id ), 
           v2: gn.getVertex( edge_my.v2.id ) } ) );
          }
      }
   }

   this.copyAllVertexPropertiesTo( gn );   
   return gn;  
},

/** 
	Fuse this graph G1=(V_1,E_1) with otherGraph G2=(V_2,E_2) by
	performing V_1 := V_1 \cup V_2; E_1 := E_1 \cup E_2. */
merge : function( otherGraph ){
   var g = this;
   
   otherGraph.vertices.each( function( p ){
      if( !g.getVertex( p.value.id ) ){
         g.addVertex( p.value.cloneWithoutEdges() );
      }
   } );
   
   otherGraph.edges.each( function( e ){
      var en = e.directed ? new Graph.Edge.Directed( e ) : new Graph.Edge.Undirected( e );
      en.v1 = g.getVertex( e.v1.id );
      en.v2 = g.getVertex( e.v2.id );
      g.addEdge( en );
   } );
   
   return this;
},

/**
	Constructs and returns the subgraph of this graph consisting of 
		(a) the source s and its ancestors
		(b) the target t and its ancestors
		(c) all adjusted nodes Z and their ancestors
		
	This graph is left unmodified in the process. 
	*/
ancestorGraph : function(){ 
   var g_an = this.inducedSubgraph( this.ancestorsOf( 
      this.getSources().concat(this.getTargets()).concat( this.getAdjustedNodes() ) ) );
   return g_an;
},


/***
	This is a slightly different version of Judea Pearl's BackDoor
	construction. Only such edges are deleted that are actually
	causal ancestors of some outcome. Moreover, all edges between
	two sources are deleted.
	**/

backDoorGraph : function(){
	var gback = this.clone();
	if( this.getSources().length == 0 || this.getTargets().length == 0 ){
		return gback;
	}
	
	var g = this;
	g.clearTraversalInfo();
	
	var visit = function( v ){
		if( !v.traversal_info.visited ){
			v.traversal_info.visited = true;
			if( g.isTarget( v ) ){
				v.traversal_info.reaches_target = true;
			} else {
				var children = v.getDirectedChildren();
				children.each( visit );
				v.traversal_info.reaches_target = children
					.pluck('traversal_info')
					.pluck('reaches_target')
					.any();
			}
		}
	};
	
   g.getSources().each( function(s){
		visit( s );
		s.getDirectedChildren().each( function( c ){
			if( g.isSource(c) || c.traversal_info.reaches_target ){
				gback.deleteEdge( s, c );
			}
		});
   });
   return gback;
},

indirectGraph : function(){
   var gback = this.clone();
   var ee = [];
   gback.getSources().each( function( s ){
	gback.getTargets().each( function( t ){
		var e = gback.getEdge( s, t );
		if( e ) ee.push( e );
	});
   });
   ee.each(function(e){gback.deleteEdge(e);});
   return gback;
},

	/** TODO
		this is such a minor change from the usual descendants/ancestors
		that there should be a nice generalization of both to avoid duplicating
		the code here. */
	causalFlowGraph : function(){
		var g = this;
		var clearVisitedWhereNotAdjusted = function(){
		g.vertices.values().each(function(v){
			if( g.isAdjustedNode( v ) ) 
			Graph.Vertex.markAsVisited( v );
			else 
			Graph.Vertex.markAsNotVisited( v );
		});
		};
	return this.inducedSubgraph( 
		this.ancestorsOf( this.getTargets(), clearVisitedWhereNotAdjusted ).intersect( 
			this.descendantsOf( this.getSources(), clearVisitedWhereNotAdjusted ) ) );
	},

	/**
		This function returns the subgraph of this graph that is induced
		by all open simple non-causal routes from s to t. 
		*/
	activeBiasGraph : function(){
		var g = this;
		if( g.getSources().length == 0 || g.getTargets().length == 0 ){
			return new Graph();
		}
		var g_chain = this.clone().inducedSubgraph( this.ancestorsOf( 
			this.getSources().concat(this.getTargets()).concat( this.getAdjustedNodes() ) ) )

	   // the purpose of the following line is to set the visited information ...
	   g.ancestorsOf(GraphAnalyzer.nodesThatViolateAdjustmentCriterion(g))
	   var preserve_previous_visited_information = function(){}
	   // ..for this line, such that "pure causal paths" are traced backwards 
	   var target_ancestors_except_ancestors_of_violators = g.ancestorsOf( g.getTargets(), preserve_previous_visited_information )
	   var intermediates_after_source = g.childrenOf( g.getSources() ).intersect(target_ancestors_except_ancestors_of_violators)
	   g.clearTraversalInfo()
 
	   // Delete edges emitting from source that are only on causal routes
	   g.getSources().each(function(s){
			s.outgoingEdges.each(function(e){
				if( g.isSource(e.v2 ) || intermediates_after_source.include( e.v2 ) ){
					g_chain.deleteEdge(e);
				}
			});
		});

		// Delete edges emitting from adjusted nodes
		g_chain.getAdjustedNodes().each( function( v ){
		  v.getChildren().each( function( v2 ){   
			 g_chain.deleteEdge( v, v2 );
		  } );
	   } );

	   var ancestors_of_adjusted_nodes = g_chain.ancestorsOf( g_chain.getAdjustedNodes() );
	   ancestors_of_adjusted_nodes.each( function(v){
		  v.traversal_info.reaches_adjusted_node = true;
	   });

		// clone because we shoulnd't modify an array while traversing it
	   g_chain.edges.clone().each( function(e){
		  if(   e.v1.traversal_info.reaches_adjusted_node 
			 && e.v2.traversal_info.reaches_adjusted_node ){
			 g_chain.deleteEdge( e );
			 g_chain.addEdge( new Graph.Edge.Undirected( { v1: e.v1, v2: e.v2 } ) );
		  }
	   } );

	   
	   
	   g_chain.bottleneckNumbers()
	   var comps = g_chain.connectedComponents()

	   ancestors_of_adjusted_nodes.each( function(v){
		  v.traversal_info.reaches_adjusted_node = true;
	   });
	   var is_bridge_node = function(v){ return v.traversal_info.reaches_adjusted_node && 
		v.topological_index !== undefined; };

	   var vv = g_chain.getVertices()
	   for( var comp_i = 0 ; comp_i < comps.length ; comp_i ++ ){
		  var comp = comps[comp_i];
		  if( comp.length > 1 ){
			 var bridge_nodes = comp.filter( is_bridge_node ).each(function(v){
				v.traversal_info.is_bridge_node = true;
			 });

			 var current_component = g_chain.inducedSubgraph( comp );

			 var bridge_node_edges = [];
			 bridge_nodes.pluck('bottleneck_number').uniq().each( function( i ){
				current_component.addVertex( new Graph.Vertex( { id : '__START'+i } ) );
				current_component.addVertex( new Graph.Vertex( { id : '__END'+i } ) );

				current_component.addEdge( new Graph.Edge.Undirected( 
				   { v1 : current_component.getVertex( '__START'+i ), 
					 v2 :  current_component.getVertex( '__END'+i ) } ) );

				bridge_node_edges.push( current_component.getEdge( '__START'+i, '__END'+i ) );
			 } );

			 bridge_nodes.each( function( bridge ) {
				current_component.addEdge( new Graph.Edge.Undirected( {
					 v1: current_component.getVertex( '__END'+bridge.bottleneck_number ),
					 v2: current_component.getVertex( bridge.id ) }
				   ) );
			 } );

			 var bicomps = current_component.biconnectedComponents();

			 var current_block_tree = current_component.blockTree( bicomps );
			 bridge_node_edges.each( function( e ){
				Graph.Vertex.markAsVisited( current_block_tree.getVertex( 'C'+e.component_index ) );
			 } );
			 current_block_tree.visitAllPathsBetweenVisitedNodesInTree();

			 var visited_components = current_block_tree.vertices.values().filter(function(v){
				return v.id.charAt(0) == 'C' && v.traversal_info.visited 
			 } );

			 /** TODO is in O(|E|) - can this be accelerated? */
			 visited_components.each( function( vc ){
				var component_index = parseInt(vc.id.substring(1));
				var component = bicomps[component_index-1];
				if( component.size() > 1 || 
					component[0].v1.id.indexOf("__") !== 0 || 
					component[0].v2.id.indexOf("__") !== 0
				  ){
				  bicomps[component_index-1].each( function( e ){
					var cv1 = g_chain.getVertex( e.v1.id );
					if( cv1 ) cv1.traversal_info.retain = true;
					var cv2 = g_chain.getVertex( e.v2.id );
					if( cv2 ) cv2.traversal_info.retain = true;
				  } );
				}
			 } );
		  }
	   }
	   
	   // after the above loop, all vertices that have two disjoint paths to a source and a target
	   // have been labeled for retention
	   
	   // now, retain all vertices that are "between" the labeled vertices and sources/targets
	   // to this end, descend from the labeled vertices but avoid descending further than a source/target
	   vv.each( function(v){
	   			//console.log( v.id, v.traversal_info.retain, v.topological_index, v.bottleneck_number )
				if( g_chain.isSource(v) ){
					Graph.Vertex.markAsVisited(v); v.traversal_info.retain = true
				} else if( g_chain.isTarget(v) ){
					if( v.traversal_info.reaches_source ){
						Graph.Vertex.markAsNotVisited(v)
					} else {
						Graph.Vertex.markAsVisited(v)
					}
					v.traversal_info.retain = true
				}
				else{
					Graph.Vertex.markAsNotVisited(v)
				}
			}
		);
	   var nodes_to_be_retained = g_chain.descendantsOf( 
		  vv.filter( function(v){ return v.traversal_info.retain 
			 || (v.topological_index !== undefined &&
				 v.topological_index === v.bottleneck_number ) } )
				 , preserve_previous_visited_information );
	   nodes_to_be_retained.each( function( v ){
		  v.traversal_info.retain = true;
	   } )
	   
	   // All vetices "back-door" biasing paths (starting with a x <- ) and all "front-door" biasing paths
	   // have been labeled for retention now. 
	   
	   // To finish, add the vertices on biasing non-backdoor routes whose simple versions are causal paths.
	   var w_nodes = g.w_nodes(). // See Shpitser et al, UAI 2010
		reject(function(w){return !g_chain.getVertex(w.id).traversal_info.retain})
	   var paths_to_violators = g.ancestorsOf(GraphAnalyzer.nodesThatViolateAdjustmentCriterionWithoutIntermediates(g))
	   g.clearTraversalInfo(); w_nodes.each(Graph.Vertex.markAsVisited)
	   w_nodes.each(function(w){
		Graph.Vertex.markAsNotVisited(w)
		paths_to_violators.intersect(g.descendantsOf([w],preserve_previous_visited_information)).
				each(function(v){g_chain.getVertex(v.id).traversal_info.retain=true})
		Graph.Vertex.markAsVisited(w)
	   },g)

		// Delete edges between targets as long as they are not on a biasing route
		g.getTargets().each(function(v){
			v.outgoingEdges.each(function(e){
				if( g.isTarget(e.v2) && ! paths_to_violators.include(e.v2) ){
					g_chain.deleteEdge(e);
				}
			})
		})

	   vv.each( function(v){
		  if( !v.traversal_info.retain ){
			 g_chain.deleteVertex(v)
		  }
	   } )
	   return g_chain;
}, // end of activeBiasGraph

pathPairGraph : function(){
   // store topological_index at all vertices 
   var topoSort = this.topologicalOrdering(); 
   
   // create a new vertex (x,y) for each vertex pair where index(x) \leq index(y) 
   // (in particular, for every (x,x)   
   var gp = new Graph();
   gp.addVertex( new Graph.Vertex( { id : "s" } ) );
   gp.setSource( gp.getVertex( "s" ) );
   
   for( var i = 0 ; i < topoSort.length ; i ++ ){
      var id_p = topoSort[i]+":";
      for( var j = 0 ; j < topoSort.length ; j ++ ){
         gp.addVertex( new Graph.Vertex( { id : id_p+topoSort[j] } ) );
      }
      gp.addEdge( new Graph.Edge.Directed( { v1 : gp.getVertex( "s" ), 
         v2 : gp.getVertex( id_p+topoSort[i] ) }  ) );
   }
   
   for( var ei = 0 ; ei < this.edges.length ; ei ++ ){
      var e = this.edges[ei];
      for( var i = 0 ; i < e.v2.topological_index-1; i ++ ){
         gp.quickAddDirectedEdge( 
            gp.getVertex( topoSort[i]+":"+e.v1.id ),
            gp.getVertex( topoSort[i] +":"+e.v2.id ) );
         gp.quickAddDirectedEdge( 
            gp.getVertex( e.v1.id+":"+topoSort[i] ),
            gp.getVertex( e.v2.id+":"+topoSort[i] ) );
      }
   }
   
   if( this.getSource().topological_index < this.getTarget().topological_index ){
      gp.setTarget( this.getSource().id + ":" + this.getTarget().id );
   } else {
      gp.setTarget( this.getTarget().id + ":" + this.getSource().id );
   }
   
   return gp;
},

addInverseEdges : function() {
   for( var ei in this.edges ){
      var e = this.edges[ei];
      if( e.directed ){
         var e2 = new Graph.Edge.Directed( e );
         e2.v1 = e.v2;
         e2.v2 = e.v1;
         this.addEdge( e2 );
      }
   }
},

blockTree : function( bicomps ) {
   if( !bicomps ){
      bicomps = this.biconnectedComponents();
   }
   var bt = new Graph();
   bicomps.each( function( edge_list ){
      bt.addVertex( new Graph.Vertex( { id : "C"+edge_list[0].component_index } ) );
   } );
   this.vertices.values().each( function( v ){
       if( v.is_articulation_point ){
          bt.addVertex( new Graph.Vertex( { id : "A"+v.id } ) );
          var vn = bt.getVertex("A"+v.id);
          vn.is_articulation_point = true;
          v.adjacentUndirectedEdges.each( function( e ){
            bt.addEdge( new Graph.Edge.Undirected( { v1: vn, v2 : 
               bt.getVertex("C"+e.component_index) } ) );
          } );
       }
   } );
   return bt;
},

/**
	Returns a "moralized" version of this graph, i.e.: 
	
	(1) for each pair of edges (u,v), (w,v) a new
		undirected edge {u,w} is inserted
		
	(2) all directed edges are converted to undirected
		edges
	*/
moralGraph : function(){
   var mg = new Graph();

   this.getVertices().each( function( v ){
      if( !mg.getVertex( v.id ) ){
         mg.addVertex( v.cloneWithoutEdges() );
      }
   } );

   this.edges.each( function( e ){
      mg.addEdge( new Graph.Edge.Undirected( 
	{ v1 : mg.getVertex( e.v1.id ),
	  v2 : mg.getVertex( e.v2.id ) } 
      ) );
   } );

   this.getVertices().each( function( v ){ 
      for( var i = 0 ; i < v.incomingEdges.length ; i ++ ){
         for( var j = i+1 ; j < v.incomingEdges.length ; j ++ ){
            mg.addEdge( new Graph.Edge.Undirected( { 
               v1 : mg.getVertex( v.incomingEdges[i].v1.id ), 
               v2 : mg.getVertex( v.incomingEdges[j].v1.id ) } ) );
         }
      }
   } );

   this.copyAllVertexPropertiesTo( mg );
   return mg;
},

listPathPairs : function(){
   var paths = this.listPaths().split('\n');
   var r = "";
   paths.each( function( p ){
      if( p == "..." ){
         r += "\n...";
      } else {
         var p_arr = p.split("->").slice(1).map( function(s){ return s.split(':'); } );
         var left_side = p_arr.pluck('0').uniq().slice(1).join('->');
         var right_side = p_arr.pluck('1').uniq().reverse().join('<-');
         r += ( r == "" ? "" : "\n" ) + right_side + "->" + left_side;
      }
   } );
   return r;
}

} ); // addMethods 


