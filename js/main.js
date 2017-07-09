$('#datetimepicker').datetimepicker();
var Time = (function () {
    function Time(dateOption, timeLocale, timeZone) {
        if (dateOption === void 0) { dateOption = ''; }
        this.w = 320; // Width of SVG element
        this.h = 320; // Height of SVG element
        this.cx = this.w / 2; // Center x
        this.cy = this.h / 2; // Center y
        this.margin = 4;
        this.r = this.w / 2 - this.margin; // Radius of clock face
        this.timeLocale = timeLocale;
        this.timeZone = timeZone;
        var rawTime = dateOption ? new Date(dateOption) : new Date();
        this.selectedTime = rawTime.valueOf();
        this.timeText = moment(this.selectedTime).locale(timeLocale).format('LTS');
        this.dateText = moment(this.selectedTime).locale(timeLocale).format('LL');
        this.initTime();
        this.updateTime();
    }
    Time.prototype.initTime = function () {
        var self = this;
        var content = {
            timelocale: this.timeLocale,
            timezone: this.timeZone,
            timetext: this.timeText,
            datetext: this.dateText
        };
        var source = $("#blocks").html();
        var template = Handlebars.compile(source);
        var html = template(content);
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
            .attr("class", function (d) { return d[0] + " hand"; })
            .attr("x1", self.cx)
            .attr("y1", function (d) { return self.cy + self.handBackLength(d, self); })
            .attr("x2", self.cx)
            .attr("y2", function (d) { return self.r - self.handLength(d, self); })
            .attr("transform", function (d) { return self.rotationTransform(d, self); });
    };
    Time.prototype.makeClockFace = function () {
        var hourTickLength = Math.round(this.r * 0.2);
        var minuteTickLength = Math.round(this.r * 0.075);
        for (var i_1 = 0; i_1 < 60; ++i_1) {
            var tickLength = void 0, tickClass = void 0;
            if ((i_1 % 5) == 0) {
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
                .attr("transform", "rotate(" + i_1 * 6 + "," + this.cx + "," + this.cy + ")");
        }
    };
    Time.prototype.getTimeOfDay = function (date) {
        date = new Date(date);
        var hr = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        return [
            ["hour", hr + (min / 60) + (sec / 3600)],
            ["minute", min + (sec / 60)],
            ["second", sec]
        ];
    };
    Time.prototype.handLength = function (d, self) {
        if (d[0] == "hour")
            return Math.round(0.45 * self.r);
        else
            return Math.round(0.90 * self.r);
    };
    Time.prototype.handBackLength = function (d, self) {
        if (d[0] == "second")
            return Math.round(0.25 * self.r);
        else
            return Math.round(0.10 * self.r);
    };
    Time.prototype.rotationTransform = function (d, self) {
        var angle;
        if (d[0] == "hour")
            angle = (d[1] % 12) * 30;
        else
            angle = d[1] * 6;
        return "rotate(" + angle + "," + self.cx + "," + self.cy + ")";
    };
    Time.prototype.updateHands = function (self) {
        self.selectedTime += 1000;
        self.timeText = moment(self.selectedTime).locale(self.timeLocale).format('LTS');
        $('#' + self.timeLocale + ' + .time-text').text(self.timeText);
        self.svg.selectAll("line.hand")
            .data(this.getTimeOfDay(self.selectedTime))
            .transition().ease("bounce")
            .attr("transform", function (d) { return self.rotationTransform(d, self); });
    };
    Time.prototype.updateTime = function () {
        var self = this;
        setInterval(function () { return self.updateHands(self); }, 1000);
    };
    Time.prototype.getSvg = function () {
        return this.svg;
    };
    return Time;
}());
var timeZones = [
    ['Africa/Cairo', 'af'],
    ['America/Chicago', 'en'],
    ['Europe/Paris', 'fr'],
    ['Japan', 'ja'],
    ['Europe/Kiev', 'uk']
];
//Create and append select list
var selectList = document.createElement("select");
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
    multiple: true
});
$('#time-zones').change(function () {
    $('#clock-holder').empty();
    var selectTime = $('#datetimepicker').val();
    var selectTimeZone = $(this).val();
    var currentOffset = new Date().getTimezoneOffset() * 60 * 1000;
    var svgs = [];
    var _loop_1 = function (zone) {
        var region = timeZones.filter(function (item, index) {
            return item[1] === selectTimeZone[zone];
        })[0];
        var timezone = moment.tz(selectTime, region[0]);
        var offset = timezone._offset * 60 * 1000 + currentOffset;
        timezone = new Date(+new Date(selectTime) + offset);
        svgs.push(new Time(timezone, region[1], region[0]).getSvg());
        console.log(region[0]);
        console.log(moment(selectTime).locale(selectTimeZone[zone]).format('LLLL'));
    };
    for (var zone = 0; zone < selectTimeZone.length; zone++) {
        _loop_1(zone);
    }
});
