
var DAGittyController = Class.create({

	getGraph : function(){
		return this.graph;
	},

	setGraph : function( graph ){
		this.graph = graph;
		this.observed_graph = new ObservedGraph( graph );
		var myself = this;
		this.observed_graph.observe( 'change', 
			function(){ myself.graphChanged() } );
		if( this.view ){
			this.view.setGraph( graph );
		}
		this.graphChanged();
	},
	getObservedGraph : function(){
		return this.observed_graph;
	},

	getView : function(){
		return this.view;
	},
	setView : function( view ){
		this.view = view;
	},
	
	graphChanged : function(){
		if( this.view ){
			this.view.drawGraph();
		}
		var g = this.getGraph();
		this.event_listeners['graphchange'].each(
			function(l){ l( g ); });		
	},
	graphLayoutChanged : function(){
		if( this.view ){
			this.view.drawGraph();
		}
		var g = this.getGraph();
		this.event_listeners['graphlayoutchange'].each(
			function(l){ l( g ); });	
	},
	observe : function( event, listener ){
		this.event_listeners[event].push(listener);
	},
	initialize : function( obj ){
		this.event_listeners = {
			'graphchange' : [],
			'graphlayoutchange' : []
		};
	
		// the controller initializes the model ... 
		if( !obj.canvas ) return;
		if( obj.graph ){
			this.setGraph( obj.graph );
		} else {
			this.setGraph( GraphParser.parseGuess( 
				(obj.canvas.textContent||obj.canvas.innerText).strip() 
			) );
		}

		// ... creates the view ...
		this.view = new DAGittyGraphView( obj.canvas, this.getGraph(), this,
			{ autofocus : true } );
		
		// ... and wires all the event listening ...
		
		// graph change event listeners are wired in the
		// function "setGraph" (because they might need to be 
		// changed when a completely new graph is loaded)
	},
	toggleEdge : function( v1,v2 ){
		var e = this.getGraph().getEdge( v1, v2 );
		if( e ){
			this.getObservedGraph().deleteEdge( v1, v2 );
		} else {
			var e_reverse = this.graph.getEdge( v2, v1 );
			if( e_reverse ){
				this.getObservedGraph().deleteEdge( v2, v1 );
			}
			this.getObservedGraph()
				.addEdge( new Graph.Edge.Directed( { v1 : v1 , v2 : v2 } ) );
		}
	},
	deleteVertex : function( v ){
		if( this.getGraph().getVertex(v) ){
			this.getObservedGraph().deleteVertex( v );
		}
	},
	renameVertex : function( vold, vnew ){
		if(  this.getGraph().getVertex(vold) &&
			 !this.getGraph().getVertex(vnew) ){
			this.getObservedGraph().renameVertex( vold, vnew );
		}
	},
	newVertex : function( id, x, y ){
		this.getObservedGraph().addVertex( 
			new Graph.Vertex( { id : id, 
				layout_pos_x : x, 
				layout_pos_y : y } ) );
	},
	toggleVertexProperty : function( _v, p ){
		var v = this.graph.getVertex(_v);
		if( v ){
			var pcamel = p.substring(0,1).toUpperCase()+p.substring(1,p.length); 
			if( this.getGraph()["is"+pcamel](v) ){
				this.getObservedGraph()["remove"+pcamel](v);
			} else {
				// at the moment, just one property add a time
				["Source","Target","AdjustedNode","LatentNode"].each(function(pc){
					this.getGraph()["remove"+pc](v);
				},this);
				this.getObservedGraph()["add"+pcamel](v);
			}
		}
	}
});

var DAGitty = {
	setup : function(){
		if( !DAGitty.style ){
			DAGitty.style = {};
			for( var i in DAGitty.DefaultStyle ){
				DAGitty.style[i] = {};
				for( var j in DAGitty.DefaultStyle[i] ){
					DAGitty.style[i][j] = DAGitty.DefaultStyle[i][j];
				}
			}
		}
		DAGitty.controllers = [];
		var tags = ["div", "pre"];
		for( var j = 0 ; j < tags.length ; j ++ ){
			var divs = document.getElementsByTagName( tags[j] );
			var re = new RegExp('\\bdagitty\\b');
			for( var i = 0 ; i < divs.length ; i ++ ){
				if( re.test(divs.item(i).className) ){
					DAGitty.controllers.push( 
						new DAGittyController( {canvas : divs.item(i)} )
					);
				}
			}
		}
	},
	resize : function(){
		for( var i = 0 ; i < DAGitty.controllers.length ; i ++ ){
			DAGitty.controllers[i].getView().resize();
		}
	},
	Math : {
		distance : function( x1, y1, x2, y2 ){
			return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		},
		anglerad : function( x1, y1, x2, y2 ){
			if( x1 < x2 ){
				return Math.asin((y2-y1)/DagittyGraphGUI_Math.distance(x1, y1, x2, y2));
			} else {
				return Math.PI - Math.asin((y2-y1)/DagittyGraphGUI_Math.distance(x1, y1, x2, y2));
			}
		},
		angle : function( x1, y1, x2, y2 ){
			return DagittyGraphGUI_Math.anglerad( x1, y1, x2, y2 )*360./(Math.PI * 2.);
		},
		ellipseAnchorPoint : function( cx, cy, rx, ry, tx, ty ){
			var tanth = (cy-ty)/(cx==tx ? 0.00001 : cx-tx);
			var x = rx * ry / Math.sqrt( ry * ry + rx * rx * tanth * tanth );
			if( tx > cx ){
				x = -x;
			}
			y = tanth * x;
			return [cx-x, cy-y];
		}
	},
	DefaultStyle : {
		exposurenode : { fill : "#bed403", stroke : "#000000" },
		outcomenode : { fill : "#00a2e0", stroke : "#000000" },
		adjustednode : { fill : "#ffffff", stroke : "#000000" },
		latentnode : { fill : "#eeeeee", stroke : "#cccccc" },
		confoundernode : { fill : "#ff7777", stroke : "#ff7777" },
		anexposurenode: { fill : "#bed403", stroke : "#bed403" },
		anoutcomenode: { fill : "#00a2e0", stroke : "#00a2e0" },
		node : { fill : "#aaaaaa", stroke : "#666666" },
		
		
		causalpath : { stroke : "#77ff77" },
		biasingpath : { stroke : "#ff7777" },
		path : { stroke : "#666666" },
		undirectedpath : { stroke : "#666666" }
	}
};

