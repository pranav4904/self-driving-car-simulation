const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const nwCanvas=document.getElementById("nwCanvas");
nwCanvas.width=300;

const carCtx=carCanvas.getContext("2d");
const nwCtx=nwCanvas.getContext("2d");
const road= new Road(carCanvas.width/2, carCanvas.width*0.9);

const N=1;                      // Increase the N value for model training (mostly start from 300)
const cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++)
    {
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain")
        );
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);    // Increase or decrease the 0.1 value accordingly to train the model (change by 0.1 for each training)
        }
    }
}


const traffic=[
    new Car(road.getLaneCentre(1),-100,30,50,"dummy",2),
    new Car(road.getLaneCentre(0),-300,30,50,"dummy",2),
    new Car(road.getLaneCentre(2),-300,30,50,"dummy",2),
    new Car(road.getLaneCentre(0),-500,30,50,"dummy",2),
    new Car(road.getLaneCentre(1),-500,30,50,"dummy",2),
    new Car(road.getLaneCentre(1),-700,30,50,"dummy",2),
    new Car(road.getLaneCentre(2),-700,30,50,"dummy",2)
];

animate();

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCentre(1),100,30,50,"ai"));
    }
    return cars;
}

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain)
    );
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function animate(time)
{
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    );

    carCanvas.height=window.innerHeight;
    nwCanvas.height=window.innerHeight;
    
    carCtx.save();
    carCtx.translate(0, -bestCar.y+carCanvas.height*0.75);
    
    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"#F8FFDB");  //traffic cars
    }

    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx,"#FF6500"); //driver car
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,"#FF6500",true);

    carCtx.restore();

    nwCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(nwCtx, bestCar.brain);
    requestAnimationFrame(animate);
}

