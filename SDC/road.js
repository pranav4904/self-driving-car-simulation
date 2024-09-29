class Road 
{
    constructor(x, w, lc = 3) {
        this.x = x;
        this.w = w;
        this.lc = lc;

        this.left = x - this.w / 2;
        this.right = x + this.w / 2;

        const infinity = 10000000;
        this.top = -infinity;
        this.bottom = infinity;

        const tl={x:this.left, y:this.top};
        const bl={x:this.left, y:this.bottom};
        const tr={x:this.right, y:this.top};
        const br={x:this.right, y:this.bottom};

        this.borders=
        [
            [tl,bl],
            [tr,br]
        ];
    }

    getLaneCentre(laneIndex)
    {
        const laneWidth=this.w/this.lc;
        return this.left+laneWidth/2+Math.min(laneIndex,this.lc-1)*laneWidth;
    }

    draw(ctx) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#444";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Subtle shadow for depth
        ctx.shadowBlur = 5;
 
        ctx.beginPath();
        ctx.moveTo(this.left, this.top);
        ctx.lineTo(this.left, this.bottom);
        ctx.moveTo(this.right, this.top);
        ctx.lineTo(this.right, this.bottom);
        ctx.stroke();

        ctx.strokeStyle = "#B8860B"; // Dark goldenrod for lane lines
        ctx.shadowBlur = 0;
        ctx.setLineDash([20, 20]); 
        for (let i = 1; i < this.lc; i++) {
            const x = lerp(this.left, this.right, i / this.lc);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        ctx.setLineDash([]); 

        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        })
    }
}