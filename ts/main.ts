$('#datetimepicker').datetimepicker();

class Time {
    w = 320;             // Width of SVG element
    h = 320;             // Height of SVG element

    cx = this.w / 2;          // Center x
    cy = this.h / 2;          // Center y
    margin = 4;
    r = this.w / 2 - this.margin;  // Radius of clock face
    svg: any;
    selectedTime: any;
    timeLocale: string;
    timeZone: string;
    timeText: string;
    dateText: string;

    constructor(dateOption: any = '', timeLocale: string, timeZone: string){
        this.timeLocale = timeLocale;
        this.timeZone = timeZone;
        let rawTime = dateOption ? new Date(dateOption) : new Date();
        this.selectedTime = rawTime.valueOf();
        this.timeText = moment(this.selectedTime).locale(timeLocale).format('LTS');
        this.dateText = moment(this.selectedTime).locale(timeLocale).format('LL');
        this.initTime();
        this.updateTime();
    }

    initTime(){
        let self = this;
        let content = {
            timelocale: this.timeLocale,
            timezone: this.timeZone,
            timetext: this.timeText,
            datetext: this.dateText,
        }

        var source   = $("#blocks").html();
        var template = Handlebars.compile(source);
        var html    = template(content);

        $('#clock-holder').append(html);

        this.svg = d3.select('#' + this.timeLocale).append('svg')
            .attr('class', 'clock')
            .attr('width', this.w)
            .attr('height', this.h);

        this.makeClockFace();

        this.svg.selectAll("line.hand")
            .data(self.getTimeOfDay(self.selectedTime))
            .enter()
            .append("line")
            .attr("class", function (d: any) { return d[0] + " hand"})
            .attr("x1", self.cx)
            .attr("y1", function (d: any) { return self.cy + self.handBackLength(d, self) })
            .attr("x2", self.cx)
            .attr("y2", function (d: any) { return self.r - self.handLength(d, self)})
            .attr("transform", function (d: any) { return self.rotationTransform(d, self)});
    }

    makeClockFace() {
        let hourTickLength = Math.round(this.r * 0.2);
        let minuteTickLength = Math.round(this.r * 0.075);
        for (let i = 0; i < 60; ++i) {
            let tickLength, tickClass;
            if ((i % 5) == 0) {
                tickLength = hourTickLength;
                tickClass = "hourtick";
            }
            else {
                tickLength = minuteTickLength;
                tickClass = "minutetick";
            }
            this.svg.append("line")
                .attr("class", tickClass + " face")
                .attr("x1", this.cx)
                .attr("y1", this.margin)
                .attr("x2", this.cx)
                .attr("y2", this.margin + tickLength)
                .attr("transform", "rotate(" + i * 6 + "," + this.cx + "," + this.cy + ")");
        }
    }

    getTimeOfDay(date: any) {
        date = new Date(date);
        let hr = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        return [
            [ "hour",   hr + (min / 60) + (sec / 3600) ],
            [ "minute", min + (sec / 60) ],
            [ "second", sec ]
        ]
    }

    handLength(d: any, self: any) {
        if (d[0] == "hour")
            return Math.round(0.45 * self.r);
        else
            return Math.round(0.90 * self.r);
    }

    handBackLength(d: any, self: any) {
        if (d[0] == "second")
            return Math.round(0.25 * self.r);
        else
            return Math.round(0.10 * self.r);
    }

    rotationTransform(d: any, self: any) {
        let angle;
        if (d[0] == "hour")
            angle = (d[1] % 12) * 30;
        else
            angle = d[1] * 6;
        return "rotate(" + angle + "," + self.cx + "," + self.cy + ")"
    }

    updateHands(self: any) {
        self.selectedTime += 1000;
        self.timeText = moment(self.selectedTime).locale(self.timeLocale).format('LTS');
        $('#'+self.timeLocale + '+ .time-text').text(self.timeText);
        self.svg.selectAll("line.hand")
            .data(this.getTimeOfDay(self.selectedTime))
            .transition().ease("bounce")
            .attr("transform", function (d: any) { return self.rotationTransform(d, self)});
    }

    updateTime(){
        let self = this;
        setInterval(function() { return self.updateHands(self) } , 1000);
    }

    getSvg(){
        return this.svg;
    }
}

const timeZones: any[] = [
    ['Africa/Cairo', 'af'],
    ['America/Chicago', 'en'],
    ['Europe/Paris', 'fr'],
    ['Japan', 'ja'],
    ['Europe/Kiev', 'uk']
];

//Create and append select list
let selectList = document.createElement("select");
selectList.id = "time-zones";
selectList.multiple = true;
$('#select-holder').append(selectList);

//Create and append the options
for (var i = 0; i < timeZones.length; i++) {
    var option = document.createElement("option");
    option.value = timeZones[i][1];
    option.text = timeZones[i][0];
    selectList.appendChild(option);
}

$('body').find('select').multipleSelect({
    width: 460,
    placeholder: "Select Time Zone",
    multiple: true,
});

$('#time-zones').change(function(){
    $('#clock-holder').empty();
    const selectTime = $('#datetimepicker').val();
    const selectTimeZone: any[] = $(this).val();
    let currentOffset = new Date().getTimezoneOffset() * 60 * 1000;

    let svgs: any[] = [];
    for (let zone = 0; zone < selectTimeZone.length; zone++) {
        let region = timeZones.filter(function (item, index) {
            return item[1] === selectTimeZone[zone];
        })[0];
        let timezone = moment.tz(selectTime, region[0]);
        let offset = timezone._offset * 60 * 1000 + currentOffset;
        timezone = new Date(+new Date(selectTime) + offset);
        svgs.push(new Time(timezone, region[1], region[0]).getSvg());
        console.log(region[0]);
        console.log(moment(selectTime).locale(selectTimeZone[zone]).format('LLLL'));
    }
});



