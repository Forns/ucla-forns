//written by Morris Alper -- January 2013
//you may copy with attribution

//Navigation.js: provides functionality for multi-page surveys

var current = 1; //the current page

var moved = []; //pages which have been moved by the randomization
var movedto = [];

//takes randomization into account
function effectivePage(pagenum) {
  var index = moved.indexOf(pagenum);
  if(index == -1) {
    return pagenum;
  }else{
    return movedto[index];
  }
}

var numberText = []; //stores divs which need to be updated when the page changes
var pntexts = []; //texts in them
function makePageNumber(text) { //text: something like "Page 1 / 4"
  var temp = text.split(1);
  var texts = [temp[0], temp[1]];
  //the following is needed if there are more 1's (e.g. if the total # of pages contains the digit 1)
  if(temp.length > 2) {
    for(var i = 2; i < temp.length; i++) {
      texts[1] += 1 + temp[i];
    }
  }
  document.writeln("<p><div id='pagenumberdiv" + numberText.length + "'></div></p>");
  loadPageNumber(("pagenumberdiv" + numberText.length), texts);
}
function loadPageNumber(id, texts) {
  var newone = document.getElementById(id);
  numberText.push(newone);
  pntexts.push(texts);
  updatePageNumbers();
}
function updatePageNumbers() {
  for(var i = 0; i < numberText.length; i++) {
    numberText[i].innerHTML = pntexts[i][0] + current + pntexts[i][1];
  }
}

//make one vanish and the other appear
function swap(vanish, appear) {
  document.getElementById(vanish).style.display = "none";
  //document.getElementById(appear).style.display = "inline";
  document.getElementById(appear).style.display = "";
  updatePageNumbers();
}

//go to the next page
function next() {
  current++;
  if (current >= Quiz.startIndex && current < (Quiz.startIndex + Quiz.questions.length)) {
    nextQuestion();
  }
  swap(effectivePage(current - 1), effectivePage(current));
}

function back() {
  current--;
  swap(effectivePage(current + 1), effectivePage(current));
}

//shuffles the array
//taken from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
Array.prototype.shuffle = function () {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = this[i];
        this[i] = this[j];
        this[j] = tmp;
    }

    return this;
};

//randomize the order of trials i through j
//note: don't call this on the same index twice!
function randomize(i, j) {
  ar = [];
  ar2 = [];
  for(var k = i; k <= j; k++) {
    ar.push(k);
    ar2.push(k);
  }
  ar2.shuffle();
  for(var k = 0; k < ar.length; k++) {
    if(moved.indexOf(ar[k]) != -1) {
      alert("Error: same index randomized twice.");
    }else{
      moved.push(ar[k]);
      movedto.push(ar2[k]);
    }
  }
}