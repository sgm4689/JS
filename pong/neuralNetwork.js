//This is the neural network model I used for this project.  It is my attempt at implementing NEAT using Tensorflow.js.  Neat is essentially neuroeveloution, a machine learning algorithm where rather than training a neural network you give the neural network a fitness function based on its performance in the batch, then randomly choose the best AI to be added to the next pool, These chosen AI are modified slightly to (hopefully) improve their performance.  This is repeated until the AI learns to stop dying.
import{getRandomUnitVector, getRandom} from "./utilities.js";
export class NeuralNetwork{
    constructor(x,y,z,w = 3){
        if (x instanceof tf.Sequential){//Attempting to make a copy constructor in JS
            this.model = x;
            this.inputNodes = y;
            this.hiddenNodes = z;
            this.outputNodes = w;
        }else{
        this.inputNodes = x;
        this.hiddenNodes = y;
        this.outputNodes = z;
        this.model = this.CreateModel();
        }
    }
    
    CreateModel(){
        // initial model definition
        
        const model = tf.sequential();
        const hidden = tf.layers.dense({
            units: this.hiddenNodes,
            inputShape: [this.inputNodes],
            activation: 'sigmoid'
        });
        model.add(hidden);
        const output = tf.layers.dense({
            units: this.outputNodes,
            activation: 'softmax'
        })
        model.add(output);
        return model;
    }
    
    Predict(inputs){
        return tf.tidy(() =>{
            let xs = tf.tensor2d([inputs]);
            let ys = this.model.predict(xs);
            const outputs = ys.dataSync();
            return outputs;
         });
    }
    
    Copy(){
        return tf.tidy(() =>{
            let modelCopy = this.CreateModel();
            let weights = this.model.getWeights();
            let weightCopies = [];
            for (let i = 0; i < weights.length;i++){
                weightCopies[i] = weights[i].clone();
            }
            modelCopy.setWeights(weightCopies);
            return new NeuralNetwork(
                modelCopy,
                this.inputNodes,
                this.hiddenNodes,
                this.outputNodes
            );
        });
    }
    
    Mutate(rate){
        tf.tidy(() =>{
            let weights = this.model.getWeights();
            let mutatedWeights = [];
            for (let i = 0; i < weights.length;i++){
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                for (let j = 0; j < values.length; j++){
                    if(getRandom(0,1) < rate){
                        let w = values[j];
                        values[j] = w + getRandom(-0.25,0.25);
                    }
                }
                let secondTensor = tf.tensor(values,shape);
                mutatedWeights[i] = secondTensor;
            }
            this.model.setWeights(mutatedWeights);
        });
    }
    
    Dispose(){
        this.model.dispose();
    }
}

//original model, cleaned up a little above
//model.add(tf.layers.dense({units: 256, inputShape: [6]})); //1x6, representing: ball X, ball Y, previous ball X, previous ball Y, AI paddle X, player paddle X, 
//        model.add(tf.layers.dense({units: 512, inputShape: [256]}));
//        model.add(tf.layers.dense({units: 256, inputShape: [512]}));
//        model.add(tf.layers.dense({units: 3, inputShape: [256]})); //1x3, output can be move up, move down, or stay still.
//        const learningRate = 0.001;
//        const optimizer = tf.train.adam(learningRate);
//        model.compile({loss: 'meanSquaredError', optimizer: optimizer});