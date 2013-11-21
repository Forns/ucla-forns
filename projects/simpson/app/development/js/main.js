/* DAGitty - a browser-based software for causal modelling and analysis
   Copyright (C) 2010,2011 Johannes Textor

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

/* some convenience functions */

function log(a) {
   if( console && console.log  ){
      console.log(a);
   }
}

function displayArrow( id, on ){
    if( $("a_"+id) ){
      $("a_"+id).src =  "images/arrow-" + (on?"down":"right") + ".png";
    }
}
function displayShow( id ){
    var e = $(id);
    if( e.tagName == "SPAN" ){
      $(id).style.display = "inline";    
    } else {
      $(id).style.display = "block";
    }
    displayArrow( id, true );
}
function displayHide( id ){
    $(id).style.display = "none";
    displayArrow( id, false );
}
function toggleDisplay( id ){
    var on = true;
    if( $(id).style.display == "block" ){
      $(id).style.display = "none";
      on = false;
    } else {
      $(id).style.display = "block";
    }
    displayArrow( id, on );
}

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

/* now to the real stuff */

/** updates the 
    "adjustment" UI component */
function displayAdjustmentInfo(){
   var msasToHtml = function( msas ){
      if( msas.length > 0 ){
         var msas_html = [];
         for( var i = 0 ; i < msas.length ; i ++ ){
            msas_html[i] = "{";
            var ids = msas[i].pluck('id').sort();
            for( var j = 0 ; j < ids.length ; j ++ ){
               if( j > 0 ){
                  msas_html[i] += ", ";
               }
               if( Model.dag.isAdjustedNode( ids[j] ) ){
                  msas_html[i] += "<strong>"+ids[j]+"</strong>";
               } else {
                  msas_html[i] += ids[j];
               }
            }
            msas_html[i] += "}";
         } 
         return "<ul><li>"+msas_html.sort().join("</li><li>")+"</li></ul>";
      } else {
         return "";
      }
   }

   var adjusted_nodes = Model.dag
      .vertices.values()
      .findAll(Model.dag.isAdjustedNode, Model.dag);
	var html_adjustment = "";

   if( adjusted_nodes.length > 0 ){
      html_adjustment = " containing {"+adjusted_nodes.pluck('id').sort().join(", ")+"}";
   }

   var showMsas = function( t, msas, html_a ){
      var msas_html = msasToHtml( msas );
      if( msas_html ){
         $("adjustmentsets_"+t).innerHTML = 
			"<p>Minimal sufficient adjustment sets "+html_a+" for estimating the "+t+" effect of "
			+ Model.dag.getSources().pluck('id').join(",") 
			+ " on " + Model.dag.getTargets().pluck('id').join(",") + ": " + msas_html;
      } else {
         $("adjustmentsets_"+t).innerHTML 
            = "<p>It is impossible to estimate the "+t+" effect by covariate adjustment.</p>";
      }
   };

	if( GraphAnalyzer.violatesAdjustmentCriterion( Model.dag ) ){
		$("adjustmentsets_total").innerHTML 
            = "<p>The total effect cannot be estimated due to adjustment for an intermediate or a descendant of an intermediate.</p>";
	} else {
      showMsas( "total",
         GraphAnalyzer.listMsasTotalEffect( Model.dag ), html_adjustment );
   }

   if( GraphAnalyzer.directEffectEqualsTotalEffect( Model.dag ) ){
      $("adjustmentsets_direct").innerHTML 
         = "<p>Total and direct effects are equal in this model.</p>";
   } else {
      showMsas( "direct",
         GraphAnalyzer.listMsasDirectEffect( Model.dag ), html_adjustment );
   }
}

function displayImplicationInfo( full ){
	var imp;
	var more_link = false;
	if( full ){
		imp = GraphAnalyzer.listMinimalImplications( Model.dag );
	}
	else{
		imp = GraphAnalyzer.listMinimalImplications( Model.dag , 10 );
	}
   if( imp.length > 0 ){
      var imp_html = "<p>The model implies the following conditional independences: </p><ul><li>";
         var n = 0;
      for( var i = 0 ; i < imp.length ; i ++ ){
            for( j = 0 ; j < imp[i][2].length ; j ++ ){
               if( full || ++n < 10 ){
                  if( i > 0 || j > 0 ) imp_html += "</li><li>";
                  imp_html += imp[i][0]+" &perp; "+imp[i][1];
                  if( imp[i][2][j].length > 0 ){
                           imp_html += " | "+imp[i][2][j].pluck('id').sort().join(", ");
                  } 
               }  else {
                  more_link = true;
               }
            }
      }
      imp_html += "</ul>";
      $("testable_implications_list").innerHTML = imp_html
                  + (more_link?'<p><a href="javascript:void(0)" onclick="displayImplicationInfo( true )">Show all ...</a></p>':'');
   } else {
         $("testable_implications_list").innerHTML = 
            "<p>Either the model does not imply any conditional independencies "
            +" or the implied ones are untestable due to unobserved variables.</p>";
   }
}

/** updates the "summary" component */ 
function displayGeneralInfo(){
   var cycle = Model.dag.containsCycle();
   if( cycle ){
      displayShow("info_cycle");
      displayHide("info_summary");
      $("info_cycle").innerHTML = "<p><b>Model contains cycle: "+cycle+"</b></p>";
   } else { 
      displayHide("info_cycle");
      displayShow("info_summary");
      $("info_exposure").innerHTML = Model.dag.getSources().pluck('id').join(",");
      $("info_outcome").innerHTML = Model.dag.getTargets().pluck('id').join(",");
      $("info_covariates").innerHTML = Model.dag.getNumberOfVertices()-Model.dag.getSources().length
		-Model.dag.getTargets().length;
      $("info_frontdoor").innerHTML = Model.dag.countPaths();
      // $("info_backdoor").innerHTML = dag_ancestor_pair_graph.countPaths();      
   }     
   /*$("path_information").innerHTML = nl2br("Closed paths:<br/>"+dag_ancestor_graph.listClosedPaths()
         + "<br/><br/>Open paths:<br/>"+dag_ancestor_pair_graph.listPathPairs(),true);*/
}

function loadDAGFromTextData(){
  Model.dag = GraphParser.parseGuess( $("adj_matrix").value );
  if( !Model.dag.hasCompleteLayout() ){
	var layouter = new GraphLayouter.Spring( Model.dag );
	layouter.layout();
  }
  DAGittyControl.setGraph( Model.dag  );
  displayHide("model_refresh");
  $("adj_matrix").style.backgroundColor="#fff";
}

function generateSpringLayout(){
	var layouter = new GraphLayouter.Spring( Model.dag );
	Model.dag.edges.each(function(e){delete e["layout_pos_x"];delete e["layout_pos_y"]})
	layouter.layout();
	DAGittyControl.setGraph( Model.dag ); // trigges to refresh the rendering
};

function loadExample( nr ){
    $("adj_matrix").value = examples[parseInt(nr)].v+"\n\n"+examples[parseInt(nr)].e;
    loadDAGFromTextData();
}

function newModel(){
    var ename = prompt("Please enter name of exposure variable","");
    if( ename === null || ename.strip() === "" ){ return false; }
    var oname = prompt("Please enter name of outcome variable","");
    if( oname === null || oname.strip() === "" ){ return false; }
    ename = ename.strip();
    oname = oname.strip();
    $("adj_matrix").value = ename+" E @0,0\n"+oname+" O @1,1\n\n"+ename+" "+oname;
    loadDAGFromTextData();
}

function supportsSVG() {
   return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ||
		document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.0");
	// return true;
};

function exportPDF(){
   if( supportsSVG() ){
      $("exportformsvg").value = $("canvas").innerHTML;
      $("exportform").action = "http://www.dagitty.net/pdf/batik-pdf.php";
      $("exportform").submit();
      // uriContent = "data:image/svg+xml," + encodeURIComponent($("canvas").innerHTML);
      // newWindow=window.open(uriContent, '_blank');
   }
}

function exportJPEG(){
   if( supportsSVG() ){
      $("exportformsvg").value = $("canvas").innerHTML;
      $("exportform").action = "http://www.dagitty.net/pdf/batik-jpeg.php";
      $("exportform").submit();
      // uriContent = "data:image/svg+xml," + encodeURIComponent($("canvas").innerHTML);
      // newWindow=window.open(uriContent, '_blank');
   }
}

function exportPNG(){
   if( supportsSVG() ){
      $("exportformsvg").value = $("canvas").innerHTML;
      $("exportform").action = "http://www.dagitty.net/pdf/batik-png.php";
      $("exportform").submit();
      // uriContent = "data:image/svg+xml," + encodeURIComponent($("canvas").innerHTML);
      // newWindow=window.open(uriContent, '_blank');
   }
}

function exportSVG(){
   if( supportsSVG() ){
      $("exportformsvg").value = $("canvas").innerHTML;
      $("exportform").action = "http://www.dagitty.net/pdf/svg.php";
      $("exportform").submit();
      // uriContent = "data:image/svg+xml," + encodeURIComponent($("canvas").innerHTML);
      // newWindow=window.open(uriContent, '_blank');
   }
}

