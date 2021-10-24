export {degreesToRadians, getRandomUnitVector, getRandom, Distance, GetCursorPosition}
//import {tintRed, invert, noise, sepia} from './main.js'

// HELPER FUNCTIONS
function makeColor(red, green, blue, alpha){
    var color='rgba('+red+','+green+','+blue+', '+alpha+')';
    return color;
}
function degreesToRadians(deg)
{
    return deg * (Math.PI/180);
}



// these 2 helpers are used by classes.js
function getRandomUnitVector(){
    let x = getRandom(-1,1);
    let y = getRandom(-1,1);
    let length = Math.sqrt(x*x + y*y);
    if(length == 0){ // very unlikely
        x=1; // point right
        y=0;
        length = 1;
    } else{
        x /= length;
        y /= length;
    }

    return {x:x, y:y};
}


function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function Distance(p1, p2){
    let a = p1.x - p2.x;
    let b = p2.y - p2.y;

    return Math.sqrt( a*a + b*b );
}

function GetCursorPosition(canvas, event) 
{
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return {x,y};
    
}