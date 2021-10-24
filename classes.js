import{getRandomUnitVector, getRandom} from "./utilities.js";
import{NeuralNetwork} from "./neuralNetwork.js";
class Paddle{
    constructor(x=0,y=0, width = 10, height=100, color= '#FFF', canvasHeight = 400){
        this.speed = 5;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.center = {x:this.x + this.width/2,y:this.y + this.height/2};
        this.color = color;
        //Key input is choppy in HTML.  These flags should fix that
        this.movePaddleUp = false;
        this.movePaddleDown = false;
        this.canvasHeight = canvasHeight;
    }
    
    MoveUp(){
        if (this.y > 0){
            this.y -= this.speed;
            this.center = {x:this.x + this.width/2,y:this.y + this.height/2};
        }
    }
    
    MoveDown(){
        if (this.y + this.height < 400){
            this.y += this.speed;
            this.center = {x:this.x + this.width/2,y:this.y + this.height/2};
        }
        
    }
    
    Draw(ctx){
        ctx.beginPath();
        ctx.moveTo(this.x,this.y);
        ctx.rect(this.x,this.y,this.width,this.height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(this.center.x,this.center.y);
        ctx.rect(this.center.x,this.center.y,1,1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFF";
    }
}
    
class Ball
{
    constructor(radius, x=0, y=0, color = '#FFF'){
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.radius = radius;
        this.center = {x:this.x + this.radius/2,y:this.y + this.radius/2};
        
        this.fwd = {x:1,y:0};
        
        this.speed = 8;
        this.isAlive = true;
        this.color = color;
    }
    
    Update(){
        this.lastX = this.x;
        this.lastY = this.y;
        this.x += this.fwd.x * this.speed;
        this.y += this.fwd.y * this.speed;
        this.center = {x:this.x + this.radius/2, y:this.y + this.radius/2};
    }
    
    Draw(ctx){
        ctx.beginPath();
        ctx.moveTo(this.x,this.y);
        ctx.rect(this.x,this.y,this.radius,this.radius);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(this.center.x,this.center.y);
        ctx.rect(this.center.x,this.center.y,1,1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFF";
    }
    
    ReflectX(){
        this.fwd.x *= -1;
    }
    
    ReflectY(){
        this.fwd.y *= -1;
    }
    
    //if the ball hits a paddle
    Rebound(paddle, reflect){
        this.fwd.x = this.center.x - paddle.center.x - (paddle.height*reflect);
        this.fwd.y = this.center.y - paddle.center.y;
        
        //normalize the vector
        let length = Math.sqrt(this.fwd.x*this.fwd.x+this.fwd.y*this.fwd.y); //calculating length
        this.fwd.x = this.fwd.x/length; //assigning new value to x (dividing x by lenght of the vector)
        this.fwd.y= this.fwd.y/length; //assigning new value to y
    }
}

class AI{
    constructor(paddle){//give the AI a paddle for it to control
        this.brain = new NeuralNetwork(6,8,2);
        this.paddle = paddle;
        this.fitness = 1;//If every paddle misses its first hit, then they all have an equal shot of being chosen
        this.alive = true;
    }
    
    Update(input){
        let output = this.brain.Predict(input);
        //process the AI output.  1 of the 3 outputs will be greated than 1/3
        if (output[0] > 1/2){//
            this.paddle.MoveUp();
        }else if (output[1] > 1/2){
            this.paddle.MoveDown();
        }
        
    }
}

class Button{
    constructor(x,y,width,height,label)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = false;
        this.label = label;
        this.fontSize = height/2;
    }

    draw(context)
    {
        context.save();
        context.strokeStyle = "#FFF";
        context.strokeWidth = '2px';
        if(this.active)
            {
                context.fillStyle = '#222';
            }
        else
            {
                context.fillStyle = '#FFF';
            }
        context.beginPath();
        context.moveTo(this.x,this.y);
        context.lineTo(this.x+this.width,this.y);
        context.lineTo(this.x+this.width,this.y+this.height);
        context.lineTo(this.x,this.y+this.height);
        context.closePath();
        context.stroke();
        context.fill();
        if(!this.active)
            {
                context.fillStyle = '#222';
            }
        else
            {
                context.fillStyle = '#FFF';
            }
        context.textAlign = "center";
        context.font = this.fontSize + "px Times New Roman";
        context.fillText(this.label, this.x + this.width/2, this.y + (3*this.height)/5,this.width);
        context.closePath();
        context.restore();
    }


    isClicked(x,y)
    {
        if (this.x < x && this.y < y && this.x + this.width > x && this.y + this.height > y)
            {
                this.active = !this.active;
                return true;
            }
        return false;
    }
}


//Rudimentary AI to train the real one
class TrainingAI{
    constructor(paddle){//give the AI a paddle for it to control
        this.paddle = paddle;
        this.point = 0;
    }
    
    Update(ball){
        if (this.paddle.y + this.point != ball.y){
            this.paddle.y = ball.y - this.point;
            this.paddle.center = {x:this.paddle.x + this.paddle.width/2,y:this.paddle.y + this.paddle.height/2};
        }
    }
    
    SetPoint(){
        if (this.y > 200)
            this.point = getRandom(0, this.paddle.height/2)
        else
            this.point = getRandom(this.paddle.height/2, this.paddle.height-10)
    }
}


export {Ball,Paddle, AI, TrainingAI, Button}