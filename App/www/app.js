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


        paper.rect(50, 375, 150, 5, 2.5).addClass('tempHigh')
    });

    var currentStunde = null;
    var currentMin = null;


    function uhrStellen(stundenZeiger, minutenZeiger, bb) {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();

        var hh = hours > 12 ? hours - 12 : hours;
        var stundenZeigerRotate = (hh + minutes / 60) / 12 * 365;
        var minutenZeigerRotate = minutes / 60 * 365;

        stundenZeiger.animate({transform: "r" + stundenZeigerRotate + ", " + bb.cx + ',' + bb.cy}, 900);
        minutenZeiger.animate({transform: "r" + minutenZeigerRotate + "," + bb.cx + ',' + bb.cy}, 900);

        if (currentMin) {
            currentMin.remove();
        }


        if (currentStunde) {
            currentStunde.remove();
        }


        setTimeout(function () {
            uhrStellen(stundenZeiger, minutenZeiger, bb)
        }, 1000);

    }


    function drawStunde(hh, paper, x, y, clazz) {
        var group = paper.group();
        var stunde = paper.text(x, y - 195, Math.floor(hh));
        group.append(stunde);


        group.attr({transform: "r" + 360.0 / 12.0 * hh + ", " + x + ',' + y, 'text-anchor': 'middle'});
        var groupBBox = group.getBBox();

        stunde.attr({transform: "r" + 360.0 / 12.0 * -hh, 'text-anchor': 'middle'});
        stunde.attr({'alignment-baseline': 'central'});
        //stunde.attr({transform:'t20,140'});
        stunde.addClass(clazz ? clazz : 'stunde');

        return group;
    }

    function drawMinute(min, paper, x, y, clazz) {
        var group = paper.group();
        var minute = paper.text(x, y - 192, min);
        group.append(minute);

        group.attr({transform: "r" + 360.0 / 60.0 * min + ", " + x + ',' + y, 'text-anchor': 'middle'});
        minute.attr({transform: "r" + 360.0 / 60.0 * -min, 'text-anchor': 'middle'});

        return group;
    }

    function drawIcon(hh, iconUrl) {

        var ClockFace = Snap.select('#ClockFace');
        var bb = ClockFace.getBBox();

        var group = paper.group();
        var img = paper.image(iconUrl, bb.cx, bb.cy - 330, 80, 80);
        group.append(img);

        group.attr({transform: "r" + 360.0 / 12.0 * (hh + .2) + ", " + bb.cx + ',' + bb.cy});
        var groupBBox = group.getBBox();

        img.attr({transform: "r" + 360.0 / 12.0 * -(hh + .2)});

        return group;
    }

    function drawAbfahrt(mm) {

        var ClockFace = Snap.select('#ClockFace');
        var bb = ClockFace.getBBox();

        var group = paper.group();
        var img = paper.image('Haltestelle.png', bb.cx, bb.cy - 260, 40, 40);
        group.append(img);

        group.attr({transform: "r" + 360.0 / 60.0 * mm + ", " + bb.cx + ',' + bb.cy});
        var groupBBox = group.getBBox();

        img.attr({transform: "r" + 360.0 / 60.0 * mm * -1});

        return group;
    }


    function ziffernblatt(paper, bb, stundenZeiger, minutenZeiger) {


        for (var hh = 1; hh < 13; hh++) {
            drawStunde(hh, paper, bb.cx, bb.cy);
        }

        //for (var i = 0; i < 65; i = i + 5) {
        //    drawMinute(i, paper, bb.cx, bb.cy);
        //}

        paper.append(minutenZeiger);
        paper.append(stundenZeiger);

    }


    var datum = null;
    function drawDatum() {
        moment.locale('de'); // 'en'
        var now = moment();
        var clazz = now.format('dddd');
        if (datum) datum.remove();
        //var str = now.format('dddd, D. MMMM YYYY')
        var DD = now.format('D');
        var MM = now.format('MM');


        var datum1 = paper.text(50, 50, DD).addClass('datum');
        var datum2 = paper.text(150, 50, MM).addClass('datum');

        paper.rect(125, 10,  5, 50,  2.5).addClass('tempHigh');


        setTimeout(function () {
            drawDatum();
        }, 1000);
    }

    //drawDatum();

    /*-----------------------------------------------------------------------------------------------------------------
     *
     * Weather
     *
     *-----------------------------------------------------------------------------------------------------------------*/

    var weatherGroup = null;

    function getCurrentWeather() {
        $.get('http://api.apixu.com/v1/forecast.json?key=6b408ba9ac9e463a86e51350162903&q=Dresden&days=2', function (data) {
            console.log(data);
            var weather = data;
            if (weatherGroup) weatherGroup.remove();
            // Current temp
            weatherGroup = paper.g();
            var tempHigh = paper.text(125, 350, Math.round(weather.current.temp_c));
            tempHigh.addClass('tempHigh');
            tempHigh.attr({'text-anchor': 'middle'});
            weatherGroup.add(tempHigh);

            var day = weather.forecast.forecastday[0].day;
            var hours = weather.forecast.forecastday[0].hour;
            hours = hours.concat(weather.forecast.forecastday[1].hour);

            var maxTemp = Math.round(day.maxtemp_c);
            var icon = url(day.condition.icon);


            //
            // Max Temperatur
            //
            var tempMax = paper.text(125, 450, maxTemp);
            tempMax.addClass('tempHigh');
            tempMax.attr({'text-anchor': 'middle'});
            weatherGroup.add(tempMax);
            //
            // Current Weather Icon
            //
            var currentWeatherIcon = paper.image(icon, 60, 150, 128, 128);
            weatherGroup.add(currentWeatherIcon);

            var now = new Date();
            var hh = now.getHours();

            for (var i = 0; i < 12; i++) {
                var iconUrl = hours[i + hh].condition.icon;
                weatherGroup.add(drawIcon(i + hh, url(iconUrl)));
            }

        });

        setTimeout(function () {
            getCurrentWeather()
        }, 1000 * 60);
    }

    function url(cdnUrl) {
        return 'http:' + cdnUrl;
    }

    getCurrentWeather();


    /***
     *
     * Abfahrtsmonitor
     *
     * http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=33000012
     *
     */

    var abfhartsIcons = [];

    function naechste6() {
        $.get('http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=33000012', function (data) {
            console.log(data);
            var abfahrten = JSON.parse(data);

            for (var j = 0; j < abfhartsIcons.length; j++) {
                abfhartsIcons[j].remove();
            }

            for (var i = 0; i < abfahrten.length; i++) {
                var abfahrt = abfahrten[i];
                if (abfahrt[0] === "6" && abfahrt[1] === "Niedersedlitz") {



                    //naecheste6Min = paper.text(125, 650, 'Line 6: ' + abfahrt[2] + ' Min');

                    if (abfahrt[2] === "") abfahrt[2] = "0";
                    var abfahrtInMinuten = Number(abfahrt[2]);

                    var now = new Date();
                    now.setMinutes(now.getMinutes() + abfahrtInMinuten);

                    abfhartsIcons.push(drawAbfahrt(now.getMinutes()));

                }
            }
        });

        setTimeout(function () {
            naechste6();
        }, 30 * 1000);
    }

    naechste6();

});