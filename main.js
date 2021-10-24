import{degreesToRadians, GetCursorPosition} from './utilities.js';
import{Paddle, Ball, AI, Button} from './classes.js';
import{NeuralNetwork} from './neuralNetwork.js';
import './component.js'
export{Init};

		
// 2 - elements on the page
let canvasElement;

// 3 - our canvas Drawing context
let ctx;

let userID;

//gameplay objects
let playerPaddle, opponentPaddle;
let ball;
let score;
let enemyAI;

//UI
let playButton;
let instructions;

//Game State Manager
let GSM;
let mouseX, mouseY;

let finalScore;

//sounds
let hit;
let win;
let lose;

//Vue
let vue = new Vue({
  el: '#app',
  data: {
    items: []
  },
  methods: {
    LoadData(items) {
        this.items = [];
        let obj = items.val();
        for (let key in obj){   // use for..in to interate through object keys
            let row = obj[key];
            this.items.push(row);
        }
        this.items.sort(compare)
        this.Style();
    },
      
    Style(){
        for (let i = 0; i < this.items.length; i++){
            if (i==0)
                this.items[i]._rowVariant = 'warning';//gold
            else if (i==1)
                this.items[i]._rowVariant = 'info';//silver-ish
            else if (i==2)
                this.items[i]._rowVariant = 'danger';//bronze (Not really but bootstrap doesn't have a bronze variant)
            else
                this.items[i]._rowVariant = 'secondary';
        }
    }
  }
})

// FUNCTIONS
function Init(){
    SetupCanvas();
    SetupUI();
    GetUUID();
    SetupGame();
}

function SetupCanvas(){
    canvasElement = document.querySelector('canvas');
    ctx = canvasElement.getContext("2d");
    canvasElement.addEventListener('mousedown', function(e){
       if (playButton.isClicked(mouseX, mouseY)){
           GSM = 1;
           ResetGameObjects();
       }
    });
        canvasElement.addEventListener('mousemove', function(e){
            let mousePos = GetCursorPosition(canvasElement, e);
            mouseX = mousePos.x;
            mouseY = mousePos.y;
            if (playButton.isClicked(mouseX,mouseY)){
                playButton.active = true;
            }else playButton.active = false;
    });
}

function SetupUI(){
    playButton = new Button(canvasElement.width/2-50,canvasElement.height/2-25,100,50, "Play");
    instructions = "use W and S to move up and down";
    GSM = 0;
}

async function SetupGame(){
    enemyAI = new AI(new Paddle(0,0,0,0));//creates a random AI with a random paddle that'll be overwritten later
    document.addEventListener('keypress',function(e){
        KeyDown(e);
    });

    document.addEventListener('keyup',function(e){
        KeyUp(e);
    });
    score = 0;
    enemyAI.brain.model = await tf.loadLayersModel('./TrainedNetwork/my-model.json');
    
    hit = new Howl({
      src: ['src/PaddleHit2.wav'],
      volume: 0.5
    });
    
    win = new Howl({
      src: ['src/Win.wav'],
      volume: 0.5
    });
    
    lose = new Howl({
      src: ['src/Lose.wav'],
      volume: 0.5
    });
    
    Update();
}

function Update(){
    if (GSM == 0)
        MenuUpdate();
    else if (GSM == 1)
        GameUpdate();
    else if (GSM == 2){
        OverUpdate();
    }
}

function GetUUID()
{
    userID = localStorage.getItem("UUID");//gets ID from local storage.  If none exists, makes a new one.
    if (!userID)
    {
        userID = UUID(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
        localStorage.setItem("UUID",userID);
    }
}

function GameUpdate() { 
    // this schedules a call to the Update() method in 1/60 seconds
    requestAnimationFrame(Update);
    if (Intersects(playerPaddle, ball)){
            ball.Rebound(playerPaddle,-1);
            hit.play();
        }
    if (Intersects(opponentPaddle, ball)){
        score++;
        ball.Rebound(opponentPaddle,1);
        hit.play();
    }
    else if(ball.x < 0){
        ball.fwd = {x:-1,y:0};
        SaveScore();
        lose.play();
        score=0;
        playButton.label = "Play Again?";
        GSM = 2;
    }
    else if(ball.x > canvasElement.width){
        score+= 50;//in case the AI fails, give the player a score boost
        win.play();
        SaveScore();
        score=0;
        playButton.label = "Play Again?";
        GSM = 2
    }
    if (ball.y < 0 || ball.y > canvasElement.height)
            ball.ReflectY();
    if (playerPaddle.movePaddleUp)
        playerPaddle.MoveUp();
    else if (playerPaddle.movePaddleDown)
        playerPaddle.MoveDown();
    let inputs = [];
    inputs[0] = ball.x;
    inputs[1] = ball.y;
    inputs[2] = ball.lastX;
    inputs[3] = ball.lastY;
    inputs[4] = opponentPaddle.x;
    inputs[5] = opponentPaddle.y;

    enemyAI.Update(inputs);
    ball.Update();
    GameDraw();
}

function GameDraw(){
    ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
    ctx.fillStyle = '#FFF';
    playerPaddle.Draw(ctx);
    opponentPaddle.Draw(ctx);
    ball.Draw(ctx);
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillText(score, canvasElement.width/2,30);
}

function MenuUpdate() { 
    // this schedules a call to the Update() method in 1/60 seconds
    requestAnimationFrame(Update);
    //Not much to update here
    MenuDraw();
}

function MenuDraw(){
    ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
    ctx.fillStyle = '#FFF';
    playButton.draw(ctx);
    ctx.font = "20px Arial";
    ctx.fillText(instructions, canvasElement.width/2-150, canvasElement.height/2+100);
    ctx.beginPath();
}

function OverUpdate() { 
    // this schedules a call to the Update() method in 1/60 seconds
    requestAnimationFrame(Update);
    OverDraw();
}

function OverDraw(){
    ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
    ctx.fillStyle = '#FFF';
    playButton.draw(ctx);
    ctx.fillText(finalScore, 100, 100);
    ctx.beginPath();
}

function KeyDown(e)
{
    if (e.keyCode == 87 || e.charCode == 119){//W
        playerPaddle.movePaddleUp = true;
        playerPaddle.movePaddleDown = false;
    }   
    else if (e.keyCode == 83 || e.charCode == 115){//S
        playerPaddle.movePaddleDown = true;
        playerPaddle.movePaddleUp = false;
    }
    else if (e.keyCode == 73 || e.charCode == 105){//W
        opponentPaddle.movePaddleUp = true;
        opponentPaddle.movePaddleDown = false;
    }   
    else if (e.keyCode == 75 || e.charCode == 107){//S
        opponentPaddle.movePaddleDown = true;
        opponentPaddle.movePaddleUp = false;
    }
    else if (e.keyCode == 96 || e.charCode == 96){
        GSM = 0;
        playButton.label = "Play"
    }
}
function KeyUp(e)
{
    if (e.keyCode == 87 || e.charCode == 119)//W
        playerPaddle.movePaddleUp = false; 
    else if (e.keyCode == 83 || e.charCode == 115)//S
        playerPaddle.movePaddleDown = false;
    else if (e.keyCode == 73 || e.charCode == 105){//W
        opponentPaddle.movePaddleUp = false;
    }   
    else if (e.keyCode == 75 || e.charCode == 107){//S
        opponentPaddle.movePaddleDown = false;
    }
}


function Intersects(paddle, ball)
{
    return paddle.x < ball.x + ball.radius && paddle.y < ball.y + ball.radius && ball.x < paddle.x + paddle.width && ball.y < paddle.y + paddle.height
}

function ResetGameObjects()
{
    playerPaddle = new Paddle(50,canvasElement.height/2 -50);
    opponentPaddle = new Paddle(canvasElement.width - 50,canvasElement.height/2 -50);
    ball = new Ball(10,canvasElement.width/2,(canvasElement.height/2)-5);//offset height so the center of the ball is in the center of the screen
    enemyAI.paddle = opponentPaddle;
    finalScore = "Game Over.  Your score was: ";//Reset this every round
}

function SaveScore()
{
    finalScore += score;
    let localScore = localStorage.getItem("localScore");
    let localName = localStorage.getItem("localName");
    if (!localName || localName == ""){
        localName = GetName();
        localStorage.setItem("localName", localName);
    }
    if (!localScore || localScore < score)
    {
        let path = 'scores/' + userID;
        firebase.database().ref(path).set({ // over-writes old values
            name: localName,
            score: score
        });
        
        localStorage.setItem("localScore", score);
    }
}

function GetName(){
    let name = prompt("Good Job.  Please enter your name: ", "Anonymous");
    if (!name|| name == "")
        name = "Anonymous";
    return name;
}

//From the StackOverflow link on UUID in notes: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

firebase.database().ref("scores").on("value", dataChanged, firebaseError);

function dataChanged(data){
    vue.LoadData(data);
}
function firebaseError(error){
    console.log(error);
}

function compare(scoreA, scoreB){
    return scoreB.score - scoreA.score;
}