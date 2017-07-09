class Time {

    w = 320;             // Width of SVG element
    h = 320;             // Height of SVG element
    cx = this.w / 2;          // Center x
    cy = this.h / 2;          // Center y
    margin = 4;
    r = this.w / 2 - this.margin;  // Radius of clock face
    selectedTime: number;

    svg: any;

    constructor(dateOption: any = '', timeZone: string) {
        let rawTime: any = dateOption ? new Date(dateOption) : new Date();
        this.selectedTime = rawTime.valueOf();
        this.initClock();
        this.updateClock()
    }

    initClock() {
        this.svg = d3.select('body').append('svg')
            .attr('class', 'clock')
            .attr('width', this.w)
            .attr('height', this.h);

        let hourTickLength = Math.round(this.r * 0.2);
        let minuteTickLength = Math.round(this.r * 0.075);
        for (let i = 0; i < 60; ++i) {
            let tickLength, tickClass;
            if ((i % 5) == 0) {
                tickLength = hourTickLength;
                tickClass = 'hourtick';
            }
            else {
                tickLength = minuteTickLength;
                tickClass = 'minutetick';
            }
            this.svg.append('line')
                .attr('class', tickClass + ' face')
                .attr('x1', this.cx)
                .attr('y1', this.margin)
                .attr('x2', this.cx)
                .attr('y2', this.margin + tickLength)
                .attr('transform', 'rotate(' + i * 6 + ',' + this.cx + ',' + this.cy + ')');
        }


        // Create hands from dataset
        this.svg.selectAll('line.hand')
            .data(this.getTimeOfDay(this.selectedTime))
            .enter()
            .append('line')
            .attr('class', function (d: any) {
                return d[0] + ' hand'
            })
            .attr('x1', this.cx)
            .attr('y1', function (d: any) {
                return this.cy + this.handBackLength(d)
            })
            .attr('x2', this.cx)
            .attr('y2', function (d: any) {
                return this.r - this.handLength(d)
            })
            .attr('transform', this.rotationTransform);
    }

    getTimeOfDay(date: any) {
        date = new Date(date);
        let hr = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        return [
            ['hour', hr + (min / 60) + (sec / 3600)],
            ['minute', min + (sec / 60)],
            ['second', sec]
        ]
    }

    handLength(d: any) {
        if (d[0] == 'hour')
            return Math.round(0.45 * this.r);
        else
            return Math.round(0.90 * this.r);
    }

    handBackLength(d: any) {
        if (d[0] == 'second')
            return Math.round(0.25 * this.r);
        else
            return Math.round(0.10 * this.r);
    }

    rotationTransform(d: any) {
        let angle;
        if (d[0] == 'hour')
            angle = (d[1] % 12) * 30;
        else
            angle = d[1] * 6;
        return 'rotate(' + angle + ',' + this.cx + ',' + this.cy + ')'
    }

    updateHands() {
        this.selectedTime += 1000;
        this.svg.selectAll("line.hand")
            .data(this.getTimeOfDay(this.selectedTime))
            .transition().ease("bounce")
            .attr("transform", this.rotationTransform);
    }

    updateClock(){
        setInterval(this.updateHands, 1000);
    }

}