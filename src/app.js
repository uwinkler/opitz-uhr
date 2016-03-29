/**
 * Created by uw on 28/03/16.
 */

$(function () {
    var paper = Snap('#clock');
    Snap.load('Uhr.svg', function (uhr) {
        paper.append(uhr);

        var minutenZeiger = Snap.select("#KleinerZeiger");
        var stundenZeiger = Snap.select("#GrosserZeiger");

        var ClockFace = Snap.select('#ClockFace');
        var bb = ClockFace.getBBox();

        ziffernblatt(paper, bb, stundenZeiger, minutenZeiger);
        uhrStellen(stundenZeiger, minutenZeiger, bb);
    });

    var currentStunde = null;
    var currentMin = null;


    function uhrStellen(stundenZeiger, minutenZeiger, bb) {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();


        var hh = hours > 12 ? hours - 12 : hours;
        var stundenZeigerRotate = (hh + minutes / 60) / 12 * 365 - 3;
        var minutenZeigerRotate = minutes / 60 * 365 - 3;

        stundenZeiger.animate({transform: "r" + stundenZeigerRotate + ", " + bb.cx + ',' + bb.cy}, 900);
        minutenZeiger.animate({transform: "r" + minutenZeigerRotate + "," + bb.cx + ',' + bb.cy}, 900);

        if (currentMin) {
            currentMin.remove();
        }
        currentMin = drawMinute(minutes, paper, bb.cx, bb.cy, 'minute-current');

        if (currentStunde) {
            currentStunde.remove();
        }

        currentStunde = drawStunde(hh + minutes / 60, paper, bb.cx, bb.cy, 'stunde-current');

        setTimeout(function () {
            uhrStellen(stundenZeiger, minutenZeiger, bb)
        }, 1000);

    }


    function drawStunde(hh, paper, x, y, clazz) {
        var group = paper.group();
        var stunde = paper.text(x, y - 140, Math.floor(hh));
        group.append(stunde);


        group.attr({transform: "r" + 360.0 / 12.0 * hh + ", " + x + ',' + y, 'text-anchor': 'middle'});
        var groupBBox = group.getBBox();

        stunde.attr({transform: "r" + 360.0 / 12.0 * -hh, 'text-anchor': 'middle'});

        stunde.addClass(clazz ? clazz : 'stunde');

        return group;
    }

    function drawMinute(min, paper, x, y, clazz) {
        var group = paper.group();
        var minute = paper.text(x, y - 192, min);
        group.append(minute);

        group.attr({transform: "r" + 360.0 / 60.0 * min + ", " + x + ',' + y, 'text-anchor': 'middle'});
        minute.attr({transform: "r" + 360.0 / 60.0 * -min, 'text-anchor': 'middle'});
        minute.addClass(clazz ? clazz : 'minute');
        return group;
    }

    function drawIcon(hh, iconUrl) {

        var ClockFace = Snap.select('#ClockFace');
        var bb = ClockFace.getBBox();

        var group = paper.group();
        var img = paper.image(iconUrl, bb.cx, bb.cy - 320, 64, 64);
        group.append(img);

        group.attr({transform: "r" + 360.0 / 12.0 * (hh +.3) + ", " + bb.cx + ',' + bb.cy});
        var groupBBox = group.getBBox();

        img.attr({transform: "r" + 360.0 / 12.0 * -(hh +.3)});

        return group;
    }


    function ziffernblatt(paper, bb, stundenZeiger, minutenZeiger) {


        for (var hh = 1; hh < 13; hh++) {
            drawStunde(hh, paper, bb.cx, bb.cy);
        }

        for (var i = 0; i < 65; i = i + 5) {
            drawMinute(i, paper, bb.cx, bb.cy);
        }

        paper.append(minutenZeiger);
        paper.append(stundenZeiger);

    }

    /*-----------------------------------------------------------------------------------------------------------------
     *
     * Weather
     *
     *-----------------------------------------------------------------------------------------------------------------*/

    var tempHigh = null;
    var tenpMax = null;
    var currentWeatherIcon = null;

    function getCurrentWeather() {
        $.get('http://api.apixu.com/v1/forecast.json?key=6b408ba9ac9e463a86e51350162903&q=Dresden&days=1', function (data) {
            console.log(data);
            var weather = data;
            // Current temp
            tempHigh = paper.text(125, 350, Math.round(weather.current.temp_c));
            tempHigh.addClass('tempHigh');
            tempHigh.attr({'text-anchor': 'middle'});

            var day = weather.forecast.forecastday[0].day;
            var hours = weather.forecast.forecastday[0].hour;

            var maxTemp = Math.round(day.maxtemp_c);
            var icon = day.condition.icon;


            //
            // Max Temperatur
            //
            tempMax = paper.text(125, 450, maxTemp);
            tempMax.addClass('tempHigh');
            tempMax.attr({'text-anchor': 'middle'});

            //
            // Current Weather Icon
            //
            currentWeatherIcon = paper.image(icon, 60, 150, 128, 128);


            for (var i = 0; i < 13; i++) {
                var iconUrl = hours[i + 6].condition.icon;
                drawIcon(i + 6, iconUrl);
            }

        });
    }


    getCurrentWeather();

    console.log(paper);
});