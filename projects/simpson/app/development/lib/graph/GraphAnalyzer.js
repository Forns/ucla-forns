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

/* This is a namespace containing various methods that analyze a given
	graph. These methods to not change the graph. */

var GraphAnalyzer = {
	listMsasTotalEffect : function( g, must, must_not ){
		if(GraphAnalyzer.nodesThatViolateAdjustmentCriterion(g).length > 0){ return [] }
		var adjusted_nodes = g.getAdjustedNodes();
		var latent_nodes = g.getLatentNodes().concat( 
			g.descendantsOf( g.w_nodes() ) )

		var gam =  g.backDoorGraph().ancestorGraph().moralGraph()
		
		if( must )
			adjusted_nodes = adjusted_nodes.concat( must )
		if( must_not )
			latent_nodes = latent_nodes.concat( must_not )
			
		return gam.listMinimalSeparators( adjusted_nodes, latent_nodes )
	},
	
	listMsasDirectEffect : function( g, must, must_not ){
		var dangerous_nodes = g.descendantsOf(g.w_nodes().filter(g.isTarget,g))
		if(dangerous_nodes.any(g.isAdjustedNode,g)){ return [] }
		var adjusted_nodes = g.getAdjustedNodes()
		var latent_nodes = g.getLatentNodes().concat( dangerous_nodes )
		var gam =  g.indirectGraph().ancestorGraph().moralGraph()
		
		if( must )
			adjusted_nodes = adjusted_nodes.concat( must )
		if( must_not )
			latent_nodes = latent_nodes.concat( must_not )
			
		return gam.listMinimalSeparators( adjusted_nodes, latent_nodes )
	},
	
	listDseparators : function( g, must, must_not, max_nr ){
		var adjusted_nodes = g.getAdjustedNodes();
		var latent_nodes = g.getLatentNodes();
		
		var gam =  g.ancestorGraph().moralGraph();
		
		if( must )
			adjusted_nodes = adjusted_nodes.concat( must );
		if( must_not )
			latent_nodes = latent_nodes.concat( must_not );
		
		
		return gam.listMinimalSeparators( adjusted_nodes, latent_nodes, max_nr );
	},
	
	listMinimalImplications : function( g, max_nr ){
		var r = [];
		var g2 = g.clone();
		var vv = g2.vertices.values();
		// this ignores adjusted vertices for now 
		for( var i = 0 ; i < vv.length ; i ++ ){
			g2.removeAllAdjustedNodes();
		}
		var n = 0;
		for( var i = 0 ; i < vv.length ; i ++ ){
			for( var j = i+1 ; j < vv.length ; j ++ ){
				if( !g2.isLatentNode( vv[i] ) && !g2.isLatentNode( vv[j] ) 
					&& !g2.getEdge( vv[i].id, vv[j].id ) && !g2.getEdge( vv[j].id, vv[i].id ) ){
					g2.removeAllSources().addSource( g2.getVertex( vv[i].id ) );
					g2.removeAllTargets().addTarget( g2.getVertex( vv[j].id ) );
					var seps = GraphAnalyzer.listDseparators( g2, [], [], max_nr-n );
               if( seps.length > 0 ){
                  r.push( [vv[i].id, vv[j].id, seps] );
                  n += seps.length;
                  if( n >= max_nr ){
                     return r;
                  }
               }
				}
			}
		}
		return r;
	},
	
	directEffectEqualsTotalEffect : function( g ){
		var source_or_target = function(v){return g.isSource(v) || g.isTarget(v)}
		return g.childrenOf(g.getSources()).all(source_or_target)
	},
	
	violatesAdjustmentCriterion : function( g ){
		var vv = g.descendantsOf( g.nodesOnCausalPaths().reject( 
			function(v){ return g.isSource(v); } ) );
		for( var i = 0 ; i < vv.length ; i ++ ){
			if( g.isAdjustedNode( vv[i] ) ) return true;
		}
		return false;
	},

	nodesThatViolateAdjustmentCriterion : function( g ){
		return g.descendantsOf( g.nodesOnCausalPaths().reject( g.isSource, g ) ).findAll( g.isAdjustedNode, g )
	},

	nodesThatViolateAdjustmentCriterionWithoutIntermediates : function( g ){
		var is_on_causal_path = [];
		var set_causal =  function(v){ is_on_causal_path[v.id]=true }
		g.nodesOnCausalPaths().each( set_causal )
		var is_violator = function(v){ return g.isAdjustedNode( v ) && !is_on_causal_path[v.id] }
		return g.descendantsOf( g.nodesOnCausalPaths().reject( g.isSource, g ) ).findAll( is_violator )
	},

	listPaths: function( g ){
		if( arguments.length == 1 ){
			if( g.getSources().length == 0 || g.getTargets().length == 0 ){
				return "";
			}
			var r = { paths: "", prefix: "", count : 0, limit: 100 };
			var myself = this;
			g.getSources().each(function(u){
				g.getTargets().each(function(v){
					myself.listPaths( g, u, v, r );
				});
			});

			try{
				this.listPaths( this.getSource(), this.getTarget(), r );
			} catch( e ){
				r.paths += "\n...";
			}
			return r.paths;
		} else {
			var s = arguments[0], t = arguments[1], r = arguments[2];
			if( s == t ){
				r.paths += (r.paths!=""?"\n":"")+r.prefix+s.id;
				r.count ++;
				if( r.count > r.limit ){
					throw( "limit "+r.limit+" exceeded!" );
				}
				return;
			} else {
				var p = "";
				s.getChildren().each( function( n ){
					var oldpref = r.prefix;
					r.prefix += s.id + "->";
					this.listPaths( n, t, r );
					r.prefix = oldpref;
				}, this );
				return;
			}
		}
	}

};

