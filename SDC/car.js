class Car
{
    constructor(x,y,w,h,controlType,maxspeed=3)
    {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.speed=0;
        this.accelaration=0.2;
        this.maxspeed=maxspeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged=false;
        this.useBrain=controlType=="ai";

        if(controlType!="dummy"){
            this.sensor=new Sensor(this);
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls=new Controls(controlType);
    }
    
    update(roadBorders,traffic)
    {
        if(!this.damaged){
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);
            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }

    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polyIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        for(let i=0;i<traffic.length;i++){
            if(polyIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.w,this.h)/2;
        const alpha=Math.atan2(this.w,this.h);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });

        return points;
    }

    #move()
    {
        if(this.controls.forward)
            {
                this.speed+=this.accelaration;
            }
            if(this.controls.reverse)
            {
                this.speed-=this.accelaration;
            }
            if(this.speed>this.maxspeed)
            {
                this.speed=this.maxspeed;
            }
            if(this.speed<-this.maxspeed/2)
            {
                this.speed=-this.maxspeed/2;
            }
            if(this.speed>0)
            {
                this.speed-=this.friction;
            }
            if(this.speed<0)
            {
                this.speed+=this.friction;
            }
            if(Math.abs(this.speed)<this.friction)
            {
                this.speed=0;
            }
    
            if(this.speed!=0)
            {
                const flip=this.speed>0?1:-1;
                if(this.controls.right)
                {
                    this.angle-=0.02*flip;
                }
                if(this.controls.left)
                {
                    this.angle+=0.02*flip;
                }
            }
            this.x-=Math.sin(this.angle)*this.speed;
            this.y-=Math.cos(this.angle)*this.speed;
    }

    draw(ctx, color, drawSensors=false)   
    {
        if (!this.polygon) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
            return;
        }
        if(this.damaged){
            ctx.fillStyle="gray";
        }
        else{
            ctx.fillStyle=color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i=1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        // ctx.fillStyle = "blue";
        ctx.fill();
        if(this.sensor && drawSensors){
            this.sensor.draw(ctx);
        }
    }
}