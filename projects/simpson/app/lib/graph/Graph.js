/* DAGitty - a browser-based software for causal modelling and analysis
   Copyright (C) 2010-2012 Johannes Textor

   This program is free software; you can redistribute it and/or
   modify it under the terms of the GNU General Public License
   as published by the Free Software Foundation; either version 2
   of the License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA. */

/** This class provides a basic Graph datastructure. Graphs can contain 
	 both directed and undirected edges. 
	 
	 TODO there are still many algorithmic methods in this class, these should
	be moved to either GraphAnalyzer or GraphTransform in the future.
	*/

var Graph = Class.create({ 
	// additional getter and setter methods for these properties are mixed in below,
	// see code after definition of this class 
	managed_vertex_property_names : ["source","target","adjustedNode","latentNode"],
	initialize : function(){
		this.vertices = new Hash();
		this.edges = [];
		this.managed_vertex_properties = {};
		this.managed_vertex_property_names.each(function(p){
			this.managed_vertex_properties[p] = new Hash();
		},this);
   },
	getNumberOfVertices : function(){
		return this.vertices.size();
	},
	getNumberOfEdges : function(){
		return this.edges.size();
	},
	getVertices : function(){
		return this.vertices.values();
	},
	getVerticesWithProperty : function( p ){
		return this.managed_vertex_properties[p].values();
	},
	addVertexProperty : function( v, p ){
		var vv = this.getVertex( v );
		if( vv ){
			this.managed_vertex_properties[p].set( vv.id, vv );
		}
		return this;
	},
	removeVertexProperty : function( v, p ){
		var vv = this.getVertex( v );
		if( vv ){
			this.managed_vertex_properties[p].unset( vv.id );
		}
		return this;
	},
	removePropertyFromAllVertices : function( p ){
		this.managed_vertex_properties[p] = new Hash();
		return this;
	},
	vertexHasProperty : function( v, p ){
		var vv = this.getVertex( v );
		return vv && this.managed_vertex_properties[p].get( vv.id );
	},
	copyAllVertexPropertiesTo : function( g2 ){
		var g = this;
		g.managed_vertex_property_names.each( function( p ){
			g.getVerticesWithProperty( p ).each( function( v ){
				g2.addVertexProperty( v, p ); } );
		} );
	},

	getVertex : function( v ){
		if( typeof v === 'string' ){
			return this.vertices.get(v);
		} else if( v instanceof Graph.Vertex ){
			return this.vertices.get(v.id);
		} else {
			throw( "Illegal value passed to getVertex : " + v );
		}
	},
	
	addVertex : function( v ){
		if( ! (v instanceof Graph.Vertex) ){
			throw( "Type error! : " + v.constructor+ " , " );
		}
		this.vertices.set( v.id, v );
		return this;
	},
	
	renameVertex : function( id_old, id_new ){
		var v = this.getVertex( id_old );
		var properties = [];
		this.managed_vertex_property_names.each(function(p){
			var pcamel = p.substring(0,1).toUpperCase()+p.substring(1,p.length);
			if( this["is"+pcamel]( v ) ){
				properties.push(pcamel);
				this["remove"+pcamel]( v );
			}
		},this);
		this.vertices.unset( id_old );
		v.id = id_new;
		this.vertices.set( v.id, v );
		properties.each(function(p){ this["add"+p](v); },this);
		return this;
	},

	deleteVertex : function( v ){
		// first remove all edges adjacent to v 
		v = this.getVertex( v );

		v.adjacentUndirectedEdges.each( function( e ) {
			if( e.v1 === v ){
				e.v2.adjacentUndirectedEdges = e.v2.adjacentUndirectedEdges.without( e );
			} else {
				e.v1.adjacentUndirectedEdges = e.v1.adjacentUndirectedEdges.without( e );             
			}
		} );
		
		v.outgoingEdges.each( function( e ) {
			e.v2.incomingEdges = e.v2.incomingEdges.without( e );
		} );        
		v.incomingEdges.each( function( e ) {
			e.v1.outgoingEdges = e.v1.outgoingEdges.without( e );
		} );
		this.edges = this.edges.findAll( 
			function( e ){ return ! ( v.adjacentUndirectedEdges.include( e ) ||
			v.incomingEdges.include( e ) || v.outgoingEdges.include( e ) ); } );
		
		// remove the vertex from all propery list 
		this.managed_vertex_property_names.each(function(p){
			var pcamel = p.substring(0,1).toUpperCase()+p.substring(1,p.length);
			this["remove"+pcamel]( v );
		},this);
		
		// then remove the vertex itself
		this.vertices.unset( v.id );
		return this;
	},
	
	clone : function(){
		var g2 = new Graph();
		this.getVertices().each( function( v ){
			 g2.addVertex( v.cloneWithoutEdges() );
		} );

		this.edges.each( function( e ){
			if( e.directed ){
				g2.addEdge( new Graph.Edge.Directed( 
					{ v1 : g2.getVertex( e.v1.id ), v2 : g2.getVertex( e.v2.id ) } 
				) );
			} else {
				g2.addEdge( new Graph.Edge.Undirected( 
					{ v1 : g2.getVertex( e.v1.id ), v2 : g2.getVertex( e.v2.id ) } 
				) );
			}
		} );
		this.copyAllVertexPropertiesTo(g2);
		return g2;
	},

    /** 
         TODO for now, only works with directed graphs 
    */
    contractVertex : function( v ){
         var i,j;
         for( i = 0 ; i < v.incomingEdges.length ; i++ ){
             for( j = 0 ; j < v.outgoingEdges.length ; j++ ){
                this.addEdge( new Graph.Edge.Directed( { v1 : v.incomingEdges[i].v1, 
                   v2 : v.outgoingEdges[j].v2 } ) );
             }
         }
         this.deleteVertex( v );
    },

    clearVisited : function(){
        this.getVertices().each( function( v ){
            v.traversal_info.visited = false;
        } );
        return this;
    },

    clearTraversalInfo : function(){
        this.getVertices().each( function( v ){
            v.traversal_info = {};
        } );
        return this;
    },

    transitiveClosureOf : function( vertex_array, kinship_function, clear_visited_function ){
      if( clear_visited_function ){
        clear_visited_function()
      } else {
        this.clearVisited()
      }
      var q = vertex_array.slice().reject( Graph.Vertex.isVisited )
      q.each( Graph.Vertex.markAsVisited );
      var r = [];
      while( q.size() > 0 ){
        var v = q.pop()
        q = q.concat( v[kinship_function]().reject( Graph.Vertex.isVisited ).each( Graph.Vertex.markAsVisited ) )
        r.push(v)
      }
      return r;
    },

    ancestorsOf : function( vertex_array, clear_visited_function ){
      return this.transitiveClosureOf( vertex_array, "getDirectedParents", clear_visited_function );
    },

    descendantsOf : function( vertex_array, clear_visited_function ){
      return this.transitiveClosureOf( vertex_array, "getDirectedChildren", clear_visited_function );
    },

    childrenOf : function( vertex_array ){
	  var r = []
	  for( var i = 0 ; i < vertex_array.length ; i ++ ){
		 r = r.concat( vertex_array[i].getChildren() )
      }
      return r.uniq()
    },

    parentsOf : function( vertex_array ){
	  var r = []
	  for( var i = 0 ; i < vertex_array.length ; i ++ ){
		 r = r.concat( vertex_array[i].getParents() ).uniq()
      }
      return r.uniq()
    },

    /* 
	Generalizes "neighbours" to vertex sets. 
	Returns all vertices in G adjacent to any of the given vertices,
	except for those that are already in the input set.
     */ 
    neighboursOf : function( vertex_array ){
	var vh = new Hash();
        vertex_array.each( function(v){
		vh.set( v.id, v );
	} );
        var rh = new Hash();
        vertex_array.each( function(v){
            v.getNeighbours().each(function(w){
		if( !vh.get( w.id ) ){
			rh.set(w.id,w);
		}
            });
        });
        return rh.values();
    },    

    intermediates : function(){
		return this.descendantsOf( this.getSources() )
         .intersect( this.ancestorsOf( this.getTargets() ) )
		 .reject( function( v ){
			return this.isSource( v ) || this.isTarget( v )
		 }, this );
	 },
	 
	 nodesOnCausalPaths : function(){
		return (this.descendantsOf( this.getSources() ).
			intersect( this.ancestorsOf( this.getTargets() ) ))
	 },
	 
     w_nodes : function(){
	return (this.descendantsOf( this.getSources() ).
		intersect( this.ancestorsOf( this.getTargets() ) ).
		reject(this.isSource,this))
     },

    /** 
        returns an array of vertex arrays 
        only undirected edges are considered
      */
    connectedComponents : function(){
      this.clearVisited();
      var vv = this.vertices.values();
      var component = function( v ){
        Graph.Vertex.markAsVisited( v );
        var q = [v];
        var r = [];
        while( q.size() > 0 ){
          var v2 = q.pop();
          q = q.concat( v2.getNeighbours().reject( Graph.Vertex.isVisited ).each( Graph.Vertex.markAsVisited ) );
          r.push(v2);
        }
        return r;
      };
      var r = [];
      vv.each( function(v){
        if( !Graph.Vertex.isVisited(v) ){
          r.push( component(v) );
        }
      });
      return r;
    },

    /** 
        returns the connected component(s) of all vertices in "v" in the subgraph "G-U" without
        modifying the graph
      */
    connectedComponentAvoiding : function( q, U ){
      this.clearVisited();
	  q.each(function(v){
		Graph.Vertex.markAsVisited(v);
	  });
      U.each(function(u){
        Graph.Vertex.markAsVisited(u);
      });
      
      var mark_visited_and_push = function(w){
            if( !Graph.Vertex.isVisited( w ) ){
              Graph.Vertex.markAsVisited(w);
              q.push(w);
            }
         };

      while( q.size() > 0 ){
         q.pop().getNeighbours().each( mark_visited_and_push );
      }
      U.each(function(u){
        Graph.Vertex.markAsNotVisited(u);
      });
      return this.vertices.values().filter( Graph.Vertex.isVisited );
    },

    /** 
		This function lists all minimal vertex separators between 
		the source and the target in this graph. Remember that a 
		vertex separator with respect to source s and target t 
		(which can be swapped) is a set of *vertices* whose removal
		would result in a graph where s and t are no longer connected.
		
		The two optional parameters are two lists of vertices which 
		must or must not be included in each separator. Note that 
		
		(a) if _must contains any vertices, the resulting separators
			will be minimal only in the sense that no vertex can be
			removed unless one of those vertices is also removed; and
			
		(b) if _must_not contains any vertices, the output may be 
		    empty even if s-t-separators exist in the graph.
		
		No vertices other than those provided will automatically be
		inserted into _must and/or _must_not.
		
		This is a straightforward extension of Takata's algorithm. 
		See Takata K, Disc Appl Math 158:1660-1667, 2010.
	
		*/                         
    listMinimalSeparators: function( _must, _must_not, max_nr ){
        var g = this;
	if( g.getSources().length == 0 || g.getTargets().length == 0 ){
		return [];
	}
	var Uh = new Hash();
	g.getTargets().each( function( v ){ Uh.set(v.id,v) } );
	g.neighboursOf( g.getTargets() ).each( function( v ){ Uh.set(v.id,v) } );
	var U = Uh.values();
		
        var R = [];
        var must = [];
        if( _must ){
          _must.each(function(v){must.push(g.getVertex(v.id));});
        }
        must_not = [];
        if( _must_not ){
          _must_not.each(function(v){must_not.push(g.getVertex(v.id));});
        }
        var realN = function( V ){
          g.clearVisited();
          V.concat(must).each( function(v){
              Graph.Vertex.markAsVisited(v);
          } );
          var r = [];
          var q = V.clone();
          var mark_visited_and_push = function(w){
                if( !Graph.Vertex.isVisited( w ) ){
                    Graph.Vertex.markAsVisited(w);
                    if( must_not.include(w) ){
                       q.push( w );
                    } else {
                       r.push( w );                      
                    }
                }
              }; 
          while( q.length > 0 ){
              q.pop().getNeighbours().each( mark_visited_and_push );
          }
          return r;
        };
        
        var closeSeparator =  function( A, b ){
          var NA = realN( A );
          var C = g.connectedComponentAvoiding( b, NA.concat(must) );
          C.reject( function(n){ return must_not.include(n); } );
          return realN( C );
        };
        
        var listMinSep = function( A, U ){
           if( R.length >= max_nr ) return;
           var SA = closeSeparator( A, g.getTargets() );
           var Astar = g.connectedComponentAvoiding( g.getSources(), SA.concat(must) );
           Astar.reject( function(n){ return must_not.include(n); } );
           if( Astar.intersect( U ).length == 0 ){
              var NA = realN(Astar);
              NA = NA.reject( function(n){ return U.include(n); } );
              if( NA.length > 0 ){
                 var v = NA[0];
                 Astar.push(v);
                 listMinSep( Astar, U );
                 Astar.pop();
                 U.push(v);
                 listMinSep( Astar, U );
                 U.pop();
              } else {
                 R.push( SA.concat(must) );
              }
           }
        };
        listMinSep( g.getSources(), U );
        return R;
    },

    /**
      Returns the number of biconnected components 
      */
    biconnectedComponents : function(){
        var q = [];
        var r = [];
        var time = 0;
        var vv = this.vertices.values();
        vv.each(function(v){
            v.traversal_info.parent = 0;
            v.traversal_info.dtime = 0;
            v.traversal_info.lowlink = vv.length + 1;
        });
        var component_index = 0;
        var visit = function(v){
            v.traversal_info.dtime = ++time;
            v.traversal_info.lowlink = time;
            var children_of_root = 0;
            v.adjacentUndirectedEdges.each(function(e){
                var w = (e.v1 == v ? e.v2 : e.v1);
                if( w.traversal_info.dtime == 0 ){
                  q.push(e);
                  w.traversal_info.parent = v;
                  if( v.traversal_info.dtime == 1 ){
                     children_of_root ++;
                  }
                  visit( w );
                  if( w.traversal_info.lowlink >= v.traversal_info.dtime ){
                     if( v.traversal_info.dtime > 1 ){
                        v.is_articulation_point = true;
                     }
                     // new component discovered 
                     component_index ++;
                     var component = [];
                     do {
                        var ce = q.pop();
                        ce.component_index = component_index;
                        component.push( ce );
                     } while( ce != e );
                     r.push( component );
                  } else {
                    if( w.traversal_info.lowlink < v.traversal_info.lowlink ){
                      v.traversal_info.lowlink = w.traversal_info.lowlink;
                    }                    
                  }
                } else {
                  if(  (w.traversal_info.dtime < v.traversal_info.dtime)
                    && (w != v.traversal_info.parent) ){ // (v,w) is a back edge
                    q.push( e );
                    if( w.traversal_info.dtime < v.traversal_info.lowlink ){
                      v.traversal_info.lowlink = w.traversal_info.dtime;
                    }
                  }
                }
            });
            // special case for root
            if( children_of_root > 1 ){
               v.is_articulation_point = true;
            }
        };
        vv.each(function(v){
            if( v.traversal_info.dtime == 0 ){
                visit(v);
            }
        });
        return r;
    },
        
    /**
      Graph is assumed to be a tree (not a forest), only
      undirected edges are considered. */
    visitAllPathsBetweenVisitedNodesInTree : function(){
        // this gets a random vertex 
        var root = this.vertices.find( function(){return true;} ).value;
        if( !root ) return; 
        // calculate the depth of all nodes in the tree 
        var q = [root];
        this.vertices.values().each( function(v){
            v.traversal_info.depth = 0;
        });
        root.traversal_info.parent = null;        
        var max_depth = 0;
        while( q.size() > 0 ){
            var v = q.pop();
            var children = v.getNeighbours().reject( 
              function(v2){ return (v2 === root) || (v2.traversal_info.depth > 0) });
            children.each( function(v2){
                v2.traversal_info.depth = v.traversal_info.depth + 1;
                if(  Graph.Vertex.isVisited(v2) && 
                    v2.traversal_info.depth > max_depth ){
                  max_depth = v2.traversal_info.depth;
                }
                v2.traversal_info.parent = v;
                q.push(v2);
            });
        }
        // layer the tree
        var tokens = new Array( max_depth + 1 );
        for( var i = 0 ; i <= max_depth ; i ++ ){
            tokens[i] = [];
        }
        var nr_tokens = 0;
        this.vertices.values().filter(Graph.Vertex.isVisited).each(function(v){
            tokens[v.traversal_info.depth].push(v);
            nr_tokens ++;
        });
        while( nr_tokens > 1 ){
            var v = tokens[max_depth].pop();
            if( v.traversal_info.parent && !Graph.Vertex.isVisited( v.traversal_info.parent ) ){
              Graph.Vertex.markAsVisited( v.traversal_info.parent );
              tokens[max_depth-1].push( v.traversal_info.parent );
            } else {
              nr_tokens --;
            }
            while( (nr_tokens > 0) && (tokens[max_depth].size() == 0) ){
                max_depth --; 
            }
        }
    },

		getEdges: function(){
		return this.edges;
    },
    
    getEdge: function(){
        var v1, v2;
        if( arguments.length == 2 ){
            v1 = this.getVertex( arguments[0] );
            v2 = this.getVertex( arguments[1] );
        } else {
            v1 = this.getVertex( arguments[0].v1 );
            v2 = this.getVertex( arguments[0].v2 );
        }
        if( !(v1 && v2) ){ return undefined; }
        var e = v1.adjacentUndirectedEdges.find( function( e ){
               return e.v2.id === v2.id || e.v1.id == v2.id } ); 
        if( e !== undefined ){ return e; }
        return v1.outgoingEdges.find( function( e ){
               return e.v2.id === v2.id } ); 
    },

    addEdge: function( e ){
      var ee = this.getEdge( e.v1, e.v2 );
      if( ee === undefined ){
         e.v1 = this.getVertex( e.v1.id );
         e.v2 = this.getVertex( e.v2.id );
         if( !e.directed ){
         e.v1.adjacentUndirectedEdges.push( e );
         e.v2.adjacentUndirectedEdges.push( e );
         } else {
         e.v1.outgoingEdges.push( e );
         e.v2.incomingEdges.push( e );            
         }
         this.edges.push( e );
      } else {
         for( var i in ee ){
         if( i == 'v1' || i == 'v2' ){
            ee[i] = this.getVertex( e[i].id );
         } else {
            ee[i] = e[i];
         }
         }
      }
      return this;
    },
    
    /** does not perform any sanity checks and does
        not call the constructor - good for 
        tight loops */ 
    quickAddDirectedEdge: function( _v1, _v2 ){
      var e = { v1: _v1, v2: _v2, directed : true };
      e.v1.outgoingEdges.push( e );
      e.v2.incomingEdges.push( e );
      this.edges.push( e );
    },

    deleteEdge : function() {
		var e;
		if( arguments.length === 1 && typeof arguments[0] === 'object' ){
			e = this.getEdge( arguments[0].v1, arguments[0].v2 );
		} else if( arguments.length === 2 ){
			e = this.getEdge( arguments[0], arguments[1] );
		}
		if( e.directed ){
			e.v1.outgoingEdges = e.v1.outgoingEdges.without( e );
			e.v2.incomingEdges = e.v2.incomingEdges.without( e );
		} else {
			e.v1.adjacentUndirectedEdges = e.v1.adjacentUndirectedEdges.without( e );
			e.v2.adjacentUndirectedEdges = e.v2.adjacentUndirectedEdges.without( e );
		}
		this.edges = this.edges.without( e );
		return this;
    },

    containsCycle: function(){
        var vv = this.vertices.values();
        for( var i = 0 ; i < vv.length ; i ++ ){
         var v = vv[i];
         this.clearVisited();
         var c = this.searchCycleFrom( v );
         if( c !== undefined ){
			var v_count = []
			for( var j = 0 ; j < c.length ; j ++ ){
				v_count[c[j]]?v_count[c[j]]++:v_count[c[j]]=1
			}
			for( j = 0 ; j < c.length ; j ++ ){
				if( v_count[c[j]] > 1 ){
					return c.slice( c.indexOf( c[j] ),  c.lastIndexOf( c[j] )+1 ).join("&rarr;")
				}
			}
         }
        }
    },

    searchCycleFrom: function( v, p ){
        if( p === undefined ){ p = []; }
        if( Graph.Vertex.isVisited( v ) ){ return p.concat(v.id) } 
        Graph.Vertex.markAsVisited( v );
        var children = v.getChildren(); 
        for( var i = 0 ; i < children.length ; i ++ ){
            var pp = this.searchCycleFrom( children[i], p.concat(v.id) );
            if( pp !== undefined ){
               return pp;
            }
        }
        Graph.Vertex.markAsNotVisited( v );
        return undefined;
    },

   bottleneckNumbers : function() {
      this.topologicalOrdering();
	  // TODO this needs to be generalized! ___ no, this should work.
      var s0 = this.getSources()[0];
      var t0 = this.getTargets()[0];
      this.ancestorsOf( this.getSources() ).each(function(v){
         v.traversal_info.reaches_source = true;
      });
      this.ancestorsOf( this.getTargets() ).each(function(v){
         v.traversal_info.reaches_target = true;
      });
      var vv = this.vertices.values();
      var bn_s = s0.topological_index;
      var bn_t = t0.topological_index;
      vv.each(function(v){
         if( v.traversal_info.reaches_source && 
            !v.traversal_info.reaches_target ){
               v.bottleneck_number = bn_s;
         }
         else if(!v.traversal_info.reaches_source && 
               v.traversal_info.reaches_target ){
               v.bottleneck_number = bn_t;
         } else {
               v.bottleneck_number = undefined;
         }
      });
      this.clearVisited();
		this.getSources().each(function(s){
			s.topological_index = s0.topological_index;
			s.bottleneck_number = s0.topological_index;
			Graph.Vertex.markAsVisited( s );
		});
		this.getTargets().each(function(t){
			t.bottleneck_number = t0.topological_index;
			t.topological_index = t0.topological_index;
			Graph.Vertex.markAsVisited( t );
		});
	  var g = this
      var visit = function( v ){
         if( !v.traversal_info.visited && 
               (v.traversal_info.reaches_source ||
               v.traversal_info.reaches_target) ){
            Graph.Vertex.markAsVisited( v );
            var children = v.getDirectedChildren().filter(function(v){
               return v.traversal_info.reaches_source ||
               v.traversal_info.reaches_target;
            });

			children.each(visit);
			if( children.length > 1 && children.any(
				function(v2){ return v2.bottleneck_number != 
					children[0].bottleneck_number } ) ){
				v.bottleneck_number = v.topological_index;
			} else {
				v.bottleneck_number = children[0].bottleneck_number;
			}
         }
      }
      vv.each( visit, this );
   },

   /** Computes a topological ordering of this graph, which 
       is only meaningful if this graph is a DAG (in mixed
       graphs, undirected edges are not used in the traversal). 

       Every vertex will be assigned a property "topological_index"
       containing a number that is lower than that of any of
       its children. 

       Furthermore, an array is returned containing the 
       vertex IDs ordered by this topological index. 
    */
   topologicalOrdering: function() {
      this.clearTraversalInfo();
      var ind = { i : this.getVertices().length };
      var g = this;
      var visit = function( v ){
         if( !v.traversal_info.visited ){
            v.traversal_info.visited = true;
            var children = v.getDirectedChildren();
            if( g.isSource(v) || g.isTarget(v) || children.length > 0 ||
                  v.getDirectedParents().length > 0 ){      
               children.each( visit );
               v.topological_index = ind.i--;               
            }
         }
      };
      var vv = this.vertices.values();
      vv.each( visit );
      var topoSort = [];
      vv.each( function( v ){
         topoSort[v.topological_index-1] = v.id;
      } );
      return topoSort;
   },

   toAdjacencyList: function(){
        var ra = [];
        var g = this;
        g.vertices.values().each( function( v ){
            var children = v.getChildren();
            var r = "";
            if( children.length > 0 ){
               r += encodeURIComponent(v.id);
               v.getChildren().each( function( v2 ){
					var e = g.getEdge( v, v2 );
					r += " "+encodeURIComponent(v2.id);
					if( e.layout_pos_x ){
						r += " @"+e.layout_pos_x.toFixed(3)+","
							+e.layout_pos_y.toFixed(3);
					}
               } );
               r += "\n";
            }
            ra.push(r);
        } );
        ra.sort();
        return ra.join("");
    },

    toVertexLabels: function(){
      var expandLabel = function( v, g ){
		 var property_string = (g.isSource(v) ? "E" : "")
				+ (g.isTarget(v) ? "O" : "")
				+ (g.isAdjustedNode(v) ? "A" : "")
				+ (g.isLatentNode(v) ? "U" : "");
				//+ (v.weight !== undefined ? v.weight : "");
		 if( !property_string ){ property_string = 1; }
         return encodeURIComponent(v.id) + " " + property_string + (v.layout_pos_x !== undefined ? 
					" @"+v.layout_pos_x.toFixed( 3 ) +","
						+v.layout_pos_y.toFixed( 3 ) : "");
      };
      var r = "";
      var g = this;
      var ra = [];
      this.vertices.values().each( function( v ){
			ra.push(expandLabel( v, g )+"\n");
      } );
      ra.sort();
      return r + ra.join('');
    },

    toString : function(){
      return this.toVertexLabels() + "\n" + this.toAdjacencyList();
    },

	hasCompleteLayout : function(){
	  return this.vertices.values().all(function(v){
			return v.layout_pos_x !== undefined && v.layout_pos_y !== undefined});
	},

   /*
	Counts the different causal paths from any source to any target.
	TODO currently does so by iterating over all pairs of sources and targets,
	which is quite dumb.
	*/
   countPaths: function(){
      if( this.getSources().length == 0 || this.getTargets().length == 0 ){
         return 0;
         //throw( "Source and/or target not set!" ); 
      }

	var visit = function( v, t ){
	 if( !Graph.Vertex.isVisited( v ) ){
	    Graph.Vertex.markAsVisited( v );
	    if( v === t ){
	       v.traversal_info.paths_to_sink = 1;
	    } else { 
	       v.traversal_info.paths_to_sink = 0;
	       v.getDirectedChildren().each( function( vc ){
			v.traversal_info.paths_to_sink += visit( vc, t );
	       } );
	    }
	 }
	 return v.traversal_info.paths_to_sink;
	};
	var r = 0;
	this.getSources().each( function( s ){
		this.getTargets().each( function( t ){
			this.clearTraversalInfo();
			r = r + visit( s, t );
		}, this );
	 }, this );
	 return r;
   },
   
   sourceConnectedToTarget: function(){
      if( !this.getSource() || !this.getTarget() ){
         return false;
      }
      if( arguments.length == 0 ){
         return this.sourceConnectedToTarget( this.getSource(), this.getTarget() );
      } else if( arguments.length == 1 ){
         var avoid_nodes = arguments[0];      
         this.clearTraversalInfo();
         avoid_nodes.each( function(v){ 
            this.getVertex(v) && (this.getVertex(v).traversal_info.visited = true);
         }, this );
         return this.sourceConnectedToTarget( this.getSource(), this.getTarget() );
      }
      else {
         var s = arguments[0], t = arguments[1];
   if( !s.traversal_info ){ clearTraversalInfo(); } 
         if( s == t ){
            return true;
         }
         s.traversal_info.visited = true;
         if( s.getChildren().any( function( n ){
            return !n.traversal_info.visited && !n.traversal_info.adjusted_for 
               && this.sourceConnectedToTarget( n, t ) }, this ) ){
            return true;
         }
         s.traversal_info.visited = false;
         return false;
      }
   },

   listClosedPaths: function(){
      if( arguments.length == 0 ){
         this.clearTraversalInfo();
         if( !this.getSource() || !this.getTarget() ){ throw( "Source and/or target not set!" ); }
         var r = { paths : "", prefix: "", count:0, limit: 100 };
         try{ 
            this.listClosedPaths( this.getSource(), this.getTarget(), r, undefined, false );
         } catch( e ){
            r.paths += "...";
         }
         return r.paths.strip();
      } 
      
      else{
         var s = arguments[0], t = arguments[1], r = arguments[2], 
            in_edge_inverted = arguments[3],            
            contains_collider = arguments[4];
         
         if( s.traversal_info.visited ){
            return;
         }
         
         if( s == t ){
            if( contains_collider ){
               r.paths = r.paths+r.prefix+s.id+"\n";
               r.count ++;
               if( r.count > r.limit ){
                  throw( "Too many paths!" );
               }
            }
            return;            
         }
         
         else {
            s.traversal_info.visited = true;
            var oldprefix = r.prefix;
            r.prefix = oldprefix+s.id+"->";
            s.getChildren().each( function( n ){
               this.listClosedPaths( n, t, r, false, contains_collider );
            }, this );
            r.prefix = oldprefix+s.id+"<-";
            s.getParents().each( function( n ){
               this.listClosedPaths( n, t, r, true, contains_collider || (in_edge_inverted===false) );
            }, this );
            r.prefix = oldprefix;
            s.traversal_info.visited = false;
            return;
         }
      }
   }
   
} );


// mixin getters & setters for managed vertex properties
(function(c){
	c.prototype.managed_vertex_property_names.each( function(p){
		var pcamel = p.substring(0,1).toUpperCase()+p.substring(1,p.length);
		var methods = {};
		methods["is"+pcamel] = function( v ){ return this.vertexHasProperty( v, p ); };
		methods["add"+pcamel] = function( v ){ return this.addVertexProperty( v, p ); };
		methods["remove"+pcamel] = function( v ){ return this.removeVertexProperty( v, p ); };
		methods["get"+pcamel+"s"] = function(){ return this.getVerticesWithProperty( p ); };
		methods["removeAll"+pcamel+"s"] = function(){ return this.removePropertyFromAllVertices( p ); };
		c.addMethods( methods );
	} );
})(Graph);


Graph.Vertex = Class.create({
    initialize : function( spec ){
      this.id = spec.id;
      this.weight = spec.weight !== undefined ? spec.weight : 1;
      if( spec.layout_pos_x !== undefined ){
         this.layout_pos_x = spec.layout_pos_x;
         this.layout_pos_y = spec.layout_pos_y;
      } 
      this.adjacentUndirectedEdges = [];
      this.incomingEdges = [];
      this.outgoingEdges = [];
      this.traversal_info = {};
    }, 
    getNeighbours : function(){
        var r = [];
        var n = this;
        n.adjacentUndirectedEdges.each( function( e ){
            var v2 = e.v1 === n ? e.v2 : e.v1;
            r.push( v2 );
        } );
        return r;
    },
    /**
      see below for meaning of this generic function 
      */
    getKinship : function( inverse_direction, consider_undirected_edges ){
        var r = [];
        var n = this;
         if( consider_undirected_edges ){
            n.adjacentUndirectedEdges.each( function( e ){
               var v2 = e.v1 === n ? e.v2 : e.v1;
               r.push( v2 );
            } ); 
         }
        if( !inverse_direction ){
            n.outgoingEdges.each( function( e ){
               r.push( e.v2 );
            } );
        } else {
            n.incomingEdges.each( function( e ){
               r.push( e.v1 );
            } );
        }
        return r;
    },
    getDirectedChildren : function(){
        return this.getKinship( false, false );
    },
    getChildren : function(){
        return this.getKinship( false, true );
    },
    getDirectedParents : function(){
        return this.getKinship( true, false );
    },
    getParents : function(){
         return this.getKinship( true, true );
    },
    cloneWithoutEdges : function(){
         var r = new Graph.Vertex( this );
         return r;
    }
} );

Graph.Vertex.isVisited = function( v ){
   return v.traversal_info.visited;
};
Graph.Vertex.markAsVisited = function( v ){
      v.traversal_info.visited = true;
};
Graph.Vertex.markAsNotVisited = function( v ){
      v.traversal_info.visited = false;
};

Graph.Edge = Class.create( {
   initialize : function( spec ){
      this.v1 = spec.v1;
      this.v2 = spec.v2;
      this.capacity = spec.capacity;
      this.is_backedge = spec.is_backedge;
      this.directed = spec.directed;
      this.style = spec.style;
   } } );

Graph.Edge.Directed = Class.create( Graph.Edge, {
   initialize : function( $super, spec ){
      spec.directed = true;
      $super( spec );
   }
   } );

Graph.Edge.Undirected = Class.create( Graph.Edge, {
   initialize : function( $super, spec ){
      spec.directed = false;
      $super( spec );
   }
   } );
