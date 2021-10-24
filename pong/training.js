import{degreesToRadians, Distance, getRandom} from './utilities.js';
import{Paddle, Ball, AI, TrainingAI} from './classes.js';
import{NeuralNetwork} from './neuralNetwork.js';
export{Init};

		
// 2 - elements on the page
let canvasElement;

// 3 - our canvas Drawing context
let ctx;

let userID;

//gameplay objects
let playerPaddle, opponentPaddle;
let ball;
const GEN_SIZE = 100;
let enemyAI;
let playerAI;
let genAlive;
let totalFitness;
let gen = 1;

// FUNCTIONS
function Init(){
    SetupCanvas();
    //SetupUI();
    SetupGame();
    Update();
}

function SetupCanvas(){
    canvasElement = document.querySelector('canvas');
    ctx = canvasElement.getContext("2d");
}

function SetupUI(){

}

function SetupGame(){
    tf.setBackend('cpu');
    playerPaddle = [];
    opponentPaddle = [];
    ball = [];
    enemyAI = [];
    playerAI = [];
    genAlive = GEN_SIZE;
    totalFitness = GEN_SIZE;
    ResetGameObjects();
}

function Update() { 
    // this schedules a call to the Update() method in 1/60 seconds
    requestAnimationFrame(Update);
    if (genAlive > 0){
        for (let i = 0; i < GEN_SIZE; i++){
            if(enemyAI[i].alive){
                if (Intersects(playerPaddle[i], ball[i])){
                        ball[i].Rebound(playerPaddle[i],-1);
                    }
                if (Intersects(opponentPaddle[i], ball[i])){
                    playerAI[i].SetPoint();
                    let thisFit = Distance(ball[i].center, opponentPaddle[i].center);
                    enemyAI[i].fitness += thisFit;
                    totalFitness += thisFit;
                    ball[i].Rebound(opponentPaddle[i],1);
                }
                else if(ball[i].x > canvasElement.width || ball[i].x < 0){
                    enemyAI[i].alive = false;
                    genAlive--;
                }
                if (ball[i].y < 0){
                    ball[i].y = 0;
                    ball[i].ReflectY();
                }
                if (ball[i].y > canvasElement.height){
                    ball[i].y = canvasElement.height;
                    ball[i].ReflectY();
                }
                if (playerPaddle[i].movePaddleUp)
                    playerPaddle[i].MoveUp();
                else if (playerPaddle[i].movePaddleDown)
                    playerPaddle[i].MoveDown();
                let inputs = [];
                inputs[0] = ball[i].x;
                inputs[1] = ball[i].y;
                inputs[2] = ball[i].lastX;
                inputs[3] = ball[i].lastY;
                inputs[4] = opponentPaddle[i].x;
                inputs[5] = opponentPaddle[i].y;
                enemyAI[i].Update(inputs);
                playerAI[i].Update(ball[i]);
                ball[i].Update();
            }
        }
    }
    else NewGeneration();
    Draw();
}

function Draw(){
    ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < GEN_SIZE; i++){
        if(enemyAI[i].alive){
            playerPaddle[i].Draw(ctx);
            opponentPaddle[i].Draw(ctx);
            ball[i].Draw(ctx);
        }
    }
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillText(gen, canvasElement.width/2,30);

}

function Intersects(paddle, ball)
{
    return paddle.x < ball.x + ball.radius && paddle.y < ball.y + ball.radius && ball.x < paddle.x + paddle.width && ball.y < paddle.y + paddle.height
}

function ResetGameObjects()
{
    for (let i = 0; i < GEN_SIZE; i++){
        playerPaddle[i] = new Paddle(50,canvasElement.height/2 -50);
        opponentPaddle[i] = new Paddle(canvasElement.width - 50,canvasElement.height/2 -50);
        ball[i] = new Ball(10,canvasElement.width/2,(canvasElement.height/2)-5);//offset height so the center of the ball is in the center of the screen
        enemyAI[i] = new AI(opponentPaddle[i]);
        playerAI[i] = new TrainingAI(playerPaddle[i]);
    }
}

function NewGeneration(){
    let newGen = [];
    let currentFitness = 0;
    let bestPaddle;
    let bestFit = 0;
    for (let i = 0; i < GEN_SIZE; i++){
        if (enemyAI[i].fitness > bestFit){
            bestPaddle = enemyAI[i];
        }
    }
    opponentPaddle[0] = new Paddle(canvasElement.width - 50,canvasElement.height/2 -50);
    newGen[0] = new AI(opponentPaddle[0]);
    newGen[0].brain = bestPaddle.brain.Copy();//adds the best ai back into the pool, to reduce regression
    for (let i = 1; i < GEN_SIZE; i++){
        let chosenAI = getRandom(0, totalFitness);
        opponentPaddle[i] = new Paddle(canvasElement.width - 50,canvasElement.height/2 -50);
        let index = 0;
        while (currentFitness + enemyAI[index].fitness < chosenAI){//This AI got chosen to move into the next round
            currentFitness += enemyAI[index].fitness;
            index++;
        }
            newGen[i] = new AI(opponentPaddle[i]);
            newGen[i].brain = enemyAI[index].brain.Copy();
            newGen[i].brain.Mutate(0.01);
            newGen[i].alive = true;
            currentFitness = 0;
        ball[i] = new Ball(10,canvasElement.width/2,(canvasElement.height/2)-5);
    }
    totalFitness = GEN_SIZE;
    enemyAI = newGen;
    genAlive = GEN_SIZE;
    enemyAI[0].brain.model.save('localstorage://my-model');
    gen++;
}