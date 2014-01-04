define(['jquery', 'underscoreM', 'backbone', 'vent', 'config'], function( $, _, Backbone, vent, config) {
    'use strict';


    var parameterItem = Backbone.Model.extend({

            initialize: function() {

                //TODO: populate fields with fake values for now
                var key = this.get("key");
                this.set("value", "");

//                if (key == "field1") {
//                    this.set("value", "alighting_stn");
//                }
//                if (key == "field2") {
//                    this.set("value", "stop_code");
//                }
//                if (key == "expression") {
//                    this.set("value", "Srvc_Number==80");
//                }
//                if (key == "fieldsToBeGroupedBy") {
//                    this.set("value", "alighting_stn");
//                }
//                if (key == "fieldsToBeSelected") {
//                    this.set("value", "JOURNEY_ID,CARD_ID,PassengerType,TRAVEL_MODE,Srvc_Number,Direction,BUS_REG_NUM,BOARDING_STOP_STN,ALIGHTING_STOP_STN,RIDE_Start_Date,RIDE_Start_Time,Ride_Distance,Ride_Time,FarePaid,Transfer_Number, ride_start_timestamp");
//                }

                //apply validation objects according to server models
                var key = this.get("key");
                this.validation = {};
                this.validation.value = {};
                this.validation.value["required"] = this.get("mandatory");
                this.validation.value["msg"] = 'this field is required'
            }
    });

    var parameterDescriptions = Backbone.Collection.extend({
            model: parameterItem,

    })


    // private
    var OperatorItem = Backbone.Model.extend({

        });


    // public API for this module return a collection
    return Backbone.Collection.extend({
        model: OperatorItem,
        url: config.apiRoot + '/operators',
        initialize: function() {
            this.deferred = this.fetch({
                reset: true,
                success: function(collection,response) {
                    console.log("systemOperators:success")
                    console.log(response);
                },
                error: function(collection,response) {
                    console.log("SYSTEMOPERATORS:error", response)
                }
            });
        },

        parse: function(collection){

           collection.forEach(function(d){
               var parsedCollection = new parameterDescriptions(d.parameterDescriptions);
                d.parameterDescriptions = parsedCollection;
            })

            return collection

        }
    });

});