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
      
    dist: [
      {
        covariate: null,
        conditionOn: null,
        previous: {},
        freq: [[31400, 17210], [8080, 4590]]
      },
      {
        covariate: "Z1",
        conditionOn: 1,
        previous: {},
        freq: [[740, 1160], [380, 580]]
      },
      {
        covariate: "Z1",
        conditionOn: 0,
        previous: {},
        freq: [[30660, 16050], [7700, 4010]]
      },
      
      
        // Z1 = 1
        {
          covariate: "Z2",
          conditionOn: 1,
          previous: {"Z1": 1},
          freq: [[240, 160], [200, 200]]
        },
        {
          covariate: "Z2",
          conditionOn: 0,
          previous: {"Z1": 1},
          freq: [[500, 1000], [180, 380]]
        },
        
        // Z1 = 0
        {
          covariate: "Z2",
          conditionOn: 1,
          previous: {"Z1": 0},
          freq: [[10060, 5550], [700, 410]]
        },
        {
          covariate: "Z2",
          conditionOn: 0,
          previous: {"Z1": 0},
          freq: [[20600, 10500], [7000, 3600]]
        },
      
          // Z1 = 1, Z2 = 1
          {
            covariate: "Z3",
            conditionOn: 1,
            previous: {"Z1": 1, "Z2": 1},
            freq: [[30, 70], [120, 180]]
          },
          {
            covariate: "Z3",
            conditionOn: 0,
            previous: {"Z1": 1, "Z2": 1},
            freq: [[210, 90], [80, 20]]
          },
        
          // Z1 = 1, Z2 = 0
          {
            covariate: "Z3",
            conditionOn: 1,
            previous: {"Z1": 1, "Z2": 0},
            freq: [[100, 500], [80, 320]]
          },
          {
            covariate: "Z3",
            conditionOn: 0,
            previous: {"Z1": 1, "Z2": 0},
            freq: [[400, 500], [100, 60]]
          },
          
          // Z1 = 0, Z2 = 1
          {
            covariate: "Z3",
            conditionOn: 1,
            previous: {"Z1": 0, "Z2": 1},
            freq: [[1000, 5500], [200, 10]]
          },
          {
            covariate: "Z3",
            conditionOn: 0,
            previous: {"Z1": 0, "Z2": 1},
            freq: [[60, 50], [500, 400]]
          },
        
          // Z1 = 0, Z2 = 0
          {
            covariate: "Z3",
            conditionOn: 1,
            previous: {"Z1": 0, "Z2": 0},
            freq: [[20000, 8000], [2000, 100]]
          },
          {
            covariate: "Z3",
            conditionOn: 0,
            previous: {"Z1": 0, "Z2": 0},
            freq: [[600, 2500], [5000, 3500]]
          }
    ],
    
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
      
    dist: [
      {
        covariate: null,
        conditionOn: null,
        previous: {},
        freq: [[740, 1160], [380, 580]]
      },
      {
        covariate: "Z0",
        conditionOn: 0,
        previous: {},
        freq: [[240, 160], [200, 200]]
      },
        {
        covariate: "Z0",
        conditionOn: 1,
        previous: {},
        freq: [[500, 1000], [180, 380]]
      },
      
      // Z0 = 0
      {
        covariate: "Z1",
        conditionOn: 0,
        previous: {"Z0": 0},
        freq: [[210, 90], [80, 20]]
      },
        {
        covariate: "Z1",
        conditionOn: 1,
        previous: {"Z0": 0},
        freq: [[30, 70], [120, 180]]
      },
      
      // Z0 = 1
      {
        covariate: "Z1",
        conditionOn: 0,
        previous: {"Z0": 1},
        freq: [[400, 500], [100, 60]]
      },
        {
        covariate: "Z1",
        conditionOn: 1,
        previous: {"Z0": 1},
        freq: [[100, 500], [80, 320]]
      },
    ],

    l: "The M-bias graph"
},

{
    e: 
      "X Y\n" +
      "Z X Y\n",
      
    v:   
      "X E @-2.200,1.000\n" +
      "Y O @1.400,1.000\n" +
      "Z 1 @-0.400,0.700\n",
      
    dist: [
      {
        covariate: null,
        conditionOn: null,
        previous: {},
        freq: [[24, 16], [20, 20]]
      },
      {
        covariate: "Z",
        conditionOn: 0,
        previous: {},
        freq: [[3, 7], [12, 18]]
      },
        {
        covariate: "Z",
        conditionOn: 1,
        previous: {},
        freq: [[21, 9], [8, 2]]
      }
    ],

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
      
    dist: [
      {
        covariate: null,
        conditionOn: null,
        previous: {},
        freq: [[24, 16], [20, 20]]
      },
      {
        covariate: "Z",
        conditionOn: 0,
        previous: {},
        freq: [[3, 7], [12, 18]]
      },
        {
        covariate: "Z",
        conditionOn: 1,
        previous: {},
        freq: [[21, 9], [8, 2]]
      }
    ],

    l: "Covariates on causal path"
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
      
    dist: [
      {
        covariate: null,
        conditionOn: null,
        previous: {},
        freq: [[740, 1160], [380, 580]]
      },
      {
        covariate: "Z",
        conditionOn: 0,
        previous: {},
        freq: [[240, 160], [200, 200]]
      },
        {
        covariate: "Z",
        conditionOn: 1,
        previous: {},
        freq: [[500, 1000], [180, 380]]
      }
    ],

    l: "Zig-zag"
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
