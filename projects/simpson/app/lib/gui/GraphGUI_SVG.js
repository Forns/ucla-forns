
var svgns = "http://www.w3.org/2000/svg";

var GraphGUI_SVG = Class.create({
	createEdgeShape : function( edge_type, el ){
		el.dom = document.createElementNS( svgns, 'g' );
		var e = document.createElementNS( svgns, 'path' );
		e.setAttribute( 'stroke-width', 2 );
		e.setAttribute( 'fill', 'none' );

		e.setAttribute( 'stroke', 
			DAGitty.style[edge_type+"path"].stroke );		

		el.dom.appendChild( e );
		e = document.createElementNS( svgns, 'path' );
		if( edge_type !== 'undirected' ){
			e.setAttribute( 'stroke-width', 1 );
			e.setAttribute( 'stroke', "#000000" );
			e.setAttribute( 'fill', "#ffffff" );
			e.setAttribute( 'class', "arrowfront" );
			e.setAttribute( 'd', "M-3,0L15,5L15,-5Z" );
			el.dom.appendChild( e );
		}
		this.anchorEdgeShape( el );
		el.dom.style.cursor = "move";
		var myself = this;
		
		Event.observe( el.dom, 'mouseover', function(e){ myself.element_in_focus=el; } );
		Event.observe( el.dom, 'mouseout', function(e){ myself.element_in_focus=undefined; } );
	},
	anchorEdgeShape : function( el ){
		var anchor = DAGitty.Math.ellipseAnchorPoint( 
			el.v1.x, el.v1.y, 1.25*20, 1.25*15, el.cx || el.v2.x, el.cy || el.v2.y );
		el.x1 = anchor[0]; el.y1 = anchor[1];
		
		anchor = DAGitty.Math.ellipseAnchorPoint( 
			el.v2.x, el.v2.y, 1.5*20, 1.5*15, el.cx || el.v1.x, el.cy || el.v1.y );
		el.x2 = anchor[0]; el.y2 = anchor[1];
		
		if( el.cx ){
			el.dom.firstChild.setAttribute( 'd', 'M'+el.x1.toFixed(2)+','+el.y1.toFixed(2)
				+'Q'+el.cx.toFixed(2)+','+el.cy.toFixed(2)
				+' '+el.x2.toFixed(2)+","+el.y2.toFixed(2) );
		} else {
			el.dom.firstChild.setAttribute( 'd', 'M'+el.x1.toFixed(2)+','+el.y1.toFixed(2)
				+'L'+el.x2.toFixed(2)+','+el.y2.toFixed(2) );
		}
		var sx = el.cx||el.x1, sy = el.cy||el.y1;
		var a = 360*Math.atan( (el.y2-sy)/(el.x2-sx) )/2/Math.PI;
		if( sx<el.x2 ) a = 180+a;
		if( sx == el.x2 ) a = el.y2 > sy ? -90 : 90;
		for( var i = 0 ; i < el.dom.childNodes.length ; i ++ ){
			if( el.dom.childNodes.item(i).getAttribute("class") == "arrowfront" ){
				el.dom.childNodes.item(i).setAttribute( 'transform', 'translate('+el.x2+','+el.y2+') rotate('+a+')' );
			}
		}
	},
	createVertexShape : function( vertex_type, el ){
		// create an example circle and append it to SVG root element
		el.dom = document.createElementNS( svgns, 'g' );
		var e = document.createElementNS( svgns, 'ellipse' );
		e.setAttribute( 'fill-opacity', 0.7 );
		e.setAttribute( 'stroke-width', 2 );
		e.setAttribute( 'z-index', 1 );
		for( f in DAGitty.style[vertex_type+"node"] ){
			e.setAttribute( f, DAGitty.style[vertex_type+"node"][f]);
		}
		e.setAttribute( 'rx', 20 );
		e.setAttribute( 'ry', 15 );
		el.dom.appendChild( e );
		e = document.createElementNS( svgns, 'text' );
		e.setAttribute('y', 35 );
		e.setAttribute('text-anchor', 'middle' );
		e.appendChild( document.createTextNode(el.id, true) );
		el.dom.appendChild( e );
		if( vertex_type == "exposure" ){
			e = document.createElementNS( svgns, 'path' );
			e.setAttribute("d", "M-4,-6L7,0L-4,6Z");
			e.setAttribute("fill", "#000000");
			el.dom.appendChild( e );
		}
		if( vertex_type == "outcome" ){
			e = document.createElementNS( svgns, 'path' );
			e.setAttribute("d", "M-2,-6L2,-6L2,6L-2,6Z");
			e.setAttribute("fill", "#000000");
			el.dom.appendChild( e );
		}
		el.dom.style.cursor = "move";
		var myself = this;

		Event.observe( el.dom, 'mouseover', function(e){ myself.element_in_focus=el; } );
		Event.observe( el.dom, 'mouseout', function(e){ myself.element_in_focus=undefined; } );
		
		this.moveVertexShape( el );
	},
	markVertexShape : function( el ){
		el.dom.firstChild.setAttribute( 'stroke-width', 5 );
	},
	unmarkVertexShape : function( el ){
		el.dom.firstChild.setAttribute( 'stroke-width', 2 );
	},
	moveVertexShape : function( el ){
		el.dom.setAttribute( 'transform', 'translate('+el.x+','+el.y+')' );
	},
	appendShapes : function( shape_array ){
		var frag = document.createDocumentFragment( true );
		for( var i = 0 ; i < shape_array.length ; i ++ ){
			frag.appendChild( shape_array[i].dom );
		}
		this.svg.appendChild( frag );
	},
	appendTextBackgrounds : function( shape_array ){
		for( var i = 0 ; i < shape_array.length ; i ++ ){
			var texts = shape_array[i].dom.getElementsByTagNameNS( svgns, "text" );
			for( var j = 0 ; j < texts.length ; j ++ ){
				var prevsib = texts.item(j).previousSibling;
				if( !prevsib || prevsib.getAttribute("class") != "textbg" ){
					var bb = texts.item(j).getBBox();
					var rect = document.createElementNS( svgns, "rect" );
					rect.setAttribute("width", bb.width );
					rect.setAttribute("height", bb.height );
					rect.setAttribute("class", "textbg" );
					rect.setAttribute("fill", "#FFFFFF" );
					rect.setAttribute("x", bb.x);
					rect.setAttribute("y", bb.y);
					shape_array[i].dom.insertBefore( rect, texts.item(j) );
				}
			}
		}
	},
	removeShapes : function( els ){
		for( var i = 0 ; i < els.length ; i ++ ){
			this.removeShape( els[i] );
		}
	},
	removeShape : function( el ){
		//el.dom.style.display="none";
		this.svg.removeChild( el.dom );
	},
	suspendRedraw : function( time ){
		this.unsuspend_id = this.svg.suspendRedraw( time );
	},
	unsuspendRedraw : function(){
		this.svg.unsuspendRedraw( this.unsuspend_id );
	},
	initialize : function( canvas_element, width, height ){
		// create SVG root element
		var svg = document.createElementNS( svgns, 'svg' ); // don't need to pass in 'true'
		svg.setAttribute( 'width', width );
		svg.setAttribute( 'height', height );
		svg.setAttribute( 'style', 'font-family: Arial, sans-serif;' );
		canvas_element.appendChild( svg );
		this.svg = svg;
	},
	resize : function( w, h ){
		var svg = this.svg;
		svg.style.width = w+"px";
		svg.style.height = h+"px";
		svg.setAttribute("width", w);
		svg.setAttribute("height", w);
	}
});
