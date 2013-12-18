/* DAGitty - a browser-based software for causal modelling and analysis
   Copyright (C) 2010 Johannes Textor

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


var examples = [
{
  e: 
    "A0 X Z4\n" +
    "A1 A0 Z2\n" +
    "X Y\n" +
    "Z1 A1 Z3\n" +
    "Z3 Z2 Z5\n" +
    "Z5 Y Z4\n",
    
  v:
    "A0 1 @-2.200,0.400\n" +
    "A1 1 @-2.200,-0.800\n" +
    "X E @-2.200,1.500\n" +
    "Y O @1.400,1.500\n" +
    "Z1 1 @-0.400,-1.400\n" +
    "Z2 1 @-0.400,-0.400\n" +
    "Z3 1 @1.400,-0.800\n" +
    "Z4 1 @-0.400,0.800\n" +
    "Z5 1 @1.400,0.400",
    
  l: "Multi-stage Simpson's Paradox Machine"

},

{
    e: 
      "A0 X Z0\n" +
      "X Y\n" +
      "Z1 Y Z0\n",
      
    v:
      "A0 1 @-2.200,0.400\n" +
      "X E @-2.200,1.000\n" +
      "Y O @1.400,1.000\n" +
      "Z0 1 @-0.400,0.800\n" +
      "Z1 1 @1.400,0.400\n",

    l: "The M-bias graph"
},

{
    e: 
      "L X Y\n" +
      "X Y\n" +
      "Z X\n",

    v:
      "L U @-0.400,0.700\n" +
      "X E @-2.200,1.000\n" +
      "Y O @1.400,1.000\n" +
      "Z 1 @-2.200,0.400\n",

    l: "Unobserved confound"
},

{
    e: 
      "X Y\n" +
      "Z X Y\n",
      
    v:   
      "X E @-2.200,1.000\n" +
      "Y O @1.400,1.000\n" +
      "Z 1 @-0.400,0.700\n",
      
    dist: {
      "X|Y": [[24, 16], [20, 20]],
      "X|Y,Z=0": [[3, 7], [12, 18]],
      "X|Y,Z=1": [[21, 9], [8, 2]]
    },

    l: "Common cause"
},

{
    e:
      "X Y Z\n" +
      "Z Y\n",

    v:
      "X E @-2.200,0.700\n" +
      "Y O @1.400,0.700\n" +
      "Z 1 @-0.400,1.000\n",

   l: "Covariates on causal path"
},

{
    e:
      "Z X\n" +
      "X Y\n",
      
    v:
      "Z 1 @-2.200,0.000\n" +
      "Y O @1.400,0.000\n" +
      "X E @-0.400,0.000\n",


   l: "Sequence"
},

{
    e:
      "L Z Y\n" +
      "X Y Z\n",

    v:
      "L U @0.800,-1.000\n" +
      "X E @-2.000,0.000\n" +
      "Y O @2.000,0.000\n" +
      "Z 1 @-0.800,1.000\n",

   l: "Zig-zag"
},

{
    e:
      "L X Z\n" +
      "X Y\n" +
      "Z Y\n",
      
    v:
      "L U @0.500,0.000\n" +
      "X E @0.250,0.300\n" +
      "Y O @0.500,1.000\n" +
      "Z 1 @0.750,0.300\n",

   l: "Latent Bridge"
}

]; 
