var GraphParser = {
    parseVertexLabelsAndWeights : function( vertexLabelsAndWeights ){
        var g = new Graph();      
        var txt = vertexLabelsAndWeights.strip();
        var lines = txt.split(/\n/);
        var i,j,weight,posn;
			for( i = 0 ; i < lines.length ; i ++ ){
				var l = lines[i];
				var a = l.strip().split(/\s+/);
				lines[i]=[];
				if( a.length >= 2 && l.indexOf("@") >= 0 ){
					lines[i][2]=a.pop();
					lines[i][1]=a.pop();
					lines[i][0]=a.join(" ");
				} 
				else if( a.length >= 2 ){
					lines[i][1]=a.pop();
					lines[i][0]=a.join(" ");
				}
				else if( a.length == 1 ){
					lines[i][1]="1";
					lines[i][0]=a.pop();
				}
			}
			for( i = 0 ; i<lines.length ; i ++ ){
				var vid = decodeURIComponent(lines[i][0]);
				var props = lines[i][1];
				// TODO weights do not currently work!
				weight = parseInt(props,10)||1;
				g.addVertex( new Graph.Vertex( 
					{ id : vid, weight : weight } ) );
				if( props.indexOf("E")>=0 ){
					g.addSource( vid );
				}
				if( props.indexOf("O")>=0 ){
					g.addTarget( vid );
				}
				if( props.indexOf("A")>=0 ){
					g.addAdjustedNode( vid );
				}
				if( props.indexOf("U")>=0 ){
					g.addLatentNode( vid );
				}
				if( lines[i].length == 3 ){
					posn = lines[i][2].substring(1).split(",");
					g.getVertex( vid ).layout_pos_x = parseFloat(posn[0]);
					g.getVertex( vid ).layout_pos_y = parseFloat(posn[1]);
				}
		  }
		return g;
    },
  
    parseAdjacencyList : function( adjacencyList, vertexLabelsAndWeights ){
			var g = this.parseVertexLabelsAndWeights( vertexLabelsAndWeights );
			var adj_list = adjacencyList.split("\n");
			var i,j,s,adj;
			for( i = 0 ; i < adj_list.length ; i ++ ){
				adj = adj_list[i].strip().split(/\s+/);
				var v1 = undefined, v1id = ""; 
				while( adj.length > 0 && !v1 ){
					v1id += adj.shift();
					v1 = g.getVertex( decodeURIComponent(v1id) );
					v1id += " ";
				}
				while( adj.length > 0 ){
					var v2 = undefined, v2id = ""; 
					while( adj.length > 0 && !v2 ){
						v2id += adj.shift();
						v2 = g.getVertex( decodeURIComponent(v2id) );
						v2id += " ";
					}
					if( v2 ){
						g.addEdge( new Graph.Edge.Directed( { v1 : v1 , v2 : v2 } ) );
						if( adj.length > 0 && adj[0].charAt(0) == "@" ){
							var e = g.getEdge( v1, v2 );
							var coord_a = adj.shift().substring(1).split(",");
							if( coord_a.length >= 2 ){
								e.layout_pos_x = parseFloat( coord_a[0] );
								e.layout_pos_y = parseFloat( coord_a[1] );
							}
						}
					}
				}
			}
			return g;
    },

    parseAdjacencyMatrix : function( adjacencyMatrix, vertexLabelsAndWeights ){
        var g = this.parseVertexLabelsAndWeights( vertexLabelsAndWeights );

        var m = adjacencyMatrix.strip();       
        var m_arr = m.split(/\s+/);
        var n = Math.sqrt( m.split(/\s+/).length );
        var l, l_arr, i, j ;

        if( parseInt( n, 10 ) !== n || n !== g.getNumberOfVertices()){
          console.log( "Error loading data: Adjacency matrix is not square or does not match number of vertices: "+n+" , " +g.getNumberOfVertices() );
          return false;
        }

        l = vertexLabelsAndWeights.strip();
        l_arr = l.split("\n");
         for( i = 0 ; i < l_arr.length ; i++ ){
         l_arr[i] = l_arr[i].strip().split(/\s+/);
         }
  
        for( i = 0 ; i <n ; i ++ ){
          for( j = 0 ; j <n ; j ++ ){
              if( parseInt( m_arr[i*n+j], 10 ) > 0 ){
                g.addEdge( new Graph.Edge.Directed( 
                  { v1: g.getVertex( l_arr[i][0] ), 
                     v2: g.getVertex( l_arr[j][0] ) } ) );
              }
          }
        }
		
        return g;
    },

    parseGuess : function( adjacencyListOrMatrix, vertexLabelsAndWeights ){
    var first_blank;
         if( !vertexLabelsAndWeights ){
            first_blank = adjacencyListOrMatrix.search( /\r?\n[ \t]*\r?\n/ );
            vertexLabelsAndWeights = adjacencyListOrMatrix.substr( 0, first_blank ).strip();
            adjacencyListOrMatrix = adjacencyListOrMatrix.substr( first_blank ).strip();
         }
         if( adjacencyListOrMatrix.match( /^[\s01]+$/ ) !== null ){
            return this.parseAdjacencyMatrix( adjacencyListOrMatrix, vertexLabelsAndWeights );
         } else {
            return this.parseAdjacencyList( adjacencyListOrMatrix, vertexLabelsAndWeights );  
         } 
    }
};