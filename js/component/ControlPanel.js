air.define("air.component.ControlPanel", function() {
    
    "use strict";
    
    var BehaviorManager = air.require("air.management.BehaviorManager");
    var Events = air.require("air.event.Events");
    
    function translateLongitude(value) {
        value = Number(value);
        if (value >= 180) {
            return (value - 180) + 'W';
        } else {
            return (180 - value) + 'E';
        }
    }

    function translateLatitude(value) {
        value = Number(value);
        if (value > 0) {
            return value + "N";
        } else {
            return Math.abs(value) + "S";
        }
    }

    function showValue(value, displayId) {
        document.getElementById(displayId).innerHTML = value;
    }

    function addConsole(message, additionalValue, isSelect) {

        var consoleDiv = document.getElementById("console");

        var itemDiv = document.createElement("div");

        itemDiv.className = "display-item";
        itemDiv.title = "Click and select air line"
        itemDiv.key = message;

        if (isSelect == true) {
            itemDiv.style.backgroundColor = "#BCD";
        }

        var messageDiv = document.createElement("div");
        if (additionalValue != null) {
            messageDiv.innerHTML = message + " " + additionalValue;
        } else {
            messageDiv.innerHTML = message;
        }

        messageDiv.className = "message-item";

        var btnDiv = document.createElement("div");

        btnDiv.innerHTML = "×";
        btnDiv.className = "close-button";
        btnDiv.title = "Delete air line";

        itemDiv.appendChild(btnDiv);
        itemDiv.appendChild(messageDiv);

        consoleDiv.appendChild(itemDiv);
    }

    var behaviorHandlers = [ {
        target : "message-item",
        eventType : "click",
        callback : function(target) {
            var displayItem = target.parentNode;
            var container = displayItem.parentNode;

            var itemList = container.getElementsByTagName("div");

            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].className != "display-item") {
                    continue;
                }

                itemList[i].style.backgroundColor = "";
            }

            displayItem.style.backgroundColor = "#BCD";

            this.dispatcher.fire(Events.ITEM_SELECT, {key: displayItem.key});
        }
    }, {
        target : "close-button",
        eventType : "click",
        callback : function(target) {
            var displayItem = target.parentNode;
            var container = displayItem.parentNode;
            container.removeChild(displayItem);
            this.dispatcher.fire(Events.ITEM_REMOVE, {key: displayItem.key});
        }
    }, {
        target : "start-longitude",
        eventType : "change",
        callback : function(target) {
            showValue(translateLongitude(target.value), 'displayStartLongitude');
        }
    }, {
        target: "start-latitude",
        eventType : "change",
        callback : function(target) {
            showValue(translateLatitude(target.value), 'displayStartLatitude');
        }
    }, {
        target: "end-longitude",
        eventType: "change",
        callback : function(target) {
            showValue(translateLongitude(target.value), 'displayEndLongitude');
        }
    }, {
        target: "end-latitude",
        eventType: "change",
        callback : function(target) {
            showValue(translateLatitude(target.value), 'displayEndLatitude');
        }
    }, {
        target: "add-airline-path",
        eventType: "click",
        callback: function() {
            this.addAirLinePathFromControl();
        }
    } ];
    
    function ControlPanel(dispatcher) {
        
        this.dispatcher = dispatcher;
        
        var panel = this;
        
        behaviorHandlers.forEach(function(handler) {
            handler.callback = handler.callback.bind(panel);
            BehaviorManager.register("controlPanel", handler);
        });
    }
    
    ControlPanel.prototype = {
        
        render: function() {
            showValue(translateLongitude(document.getElementById("startLongitude").value), "displayStartLongitude");
            showValue(translateLatitude(document.getElementById("startLatitude").value), "displayStartLatitude");
            showValue(translateLongitude(document.getElementById("endLongitude").value), "displayEndLongitude");
            showValue(translateLatitude(document.getElementById("endLatitude").value), "displayEndLatitude");

            // add init path
            this.addAirLinePath(58, 31, 42, 36, "Shanghai", "Tokyo", true, true);

            this.addAirLinePath(58, 31, 30, -34, "Shanghai", "Sydney", true);

            this.addAirLinePath(58, 31, 143, 55, "Shanghai", "Moscow", true);

            this.addAirLinePath(58, 31, 103, 28, "Shanghai", "New Delhi", true);

            this.addAirLinePath(42, 36, 255, 40, "Tokyo", "NewYork", true);

            this.addAirLinePath(143, 55, 180, 53, "Moscow", "London", false);

            this.addAirLinePath(52, 38, 42, 36, "Seoul", "Tokyo", true);

            this.addAirLinePath(149, 30, 103, 28, "Cairo", "New Delhi", true);

            this.addAirLinePath(162, -33, 149, 30, "Cape Down", "Cairo", true);

            this.addAirLinePath(149, 30, 175, 53, "Cairo", "Amsterdam", false);
        },
        
        addAirLinePath: function(startLongitudeValue, startLatitudeValue,
                endLongitudeValue, endLatitudeValue, startCity, endCity,
                isCreateCityLabel, isSelect) {

            var key = "Start[" + translateLongitude(startLongitudeValue) + ":"
                    + translateLatitude(startLatitudeValue) + "] End["
                    + translateLongitude(endLongitudeValue) + ":"
                    + translateLatitude(endLatitudeValue) + "]";

            var additionalValue = "";

            if (startCity && endCity) {
                additionalValue = startCity + "->" + endCity;
            }
            var startKey = startLongitudeValue + ":" + startLatitudeValue;
            var endKey = endLongitudeValue + ":" + endLatitudeValue;
            
            addConsole(key, additionalValue, isSelect);
            
            this.dispatcher.fire(Events.ITEM_ADD, {
                startKey: startKey,
                endKey: endKey,
                key: key,
                startCity: startCity,
                endCity: endCity,
                isSelect: isSelect,
                isCreateCityLabel: isCreateCityLabel
            });
        },
        addAirLinePathFromControl: function() {

            var startLongitude = document.getElementById("startLongitude");
            var startLatitude = document.getElementById("startLatitude");
            var endLongitude = document.getElementById("endLongitude");
            var endLatitude = document.getElementById("endLatitude");

            this.addAirLinePath(startLongitude.value, startLatitude.value, endLongitude.value, endLatitude.value);
        }
    };
    
    return ControlPanel;
});