define(['jquery', 'underscoreM', 'backbone', 'vent', 'config'], function( $, _, Backbone, vent, config) {

    var models = {}

    // public API for this module return a collection
    models.timeRange = Backbone.Model.extend({
        initialize: function() {
            var self = this;

            this.url = config.apiRoot + "/workflows/" + config.workflow.get("workflowId") + "/wfr/",

            vent
               .off("workflow:setWorkflowRange")
               .on("workflow:setWorkflowRange", function(timeConfig) {
               self.submitTime();
            })
        },

        parse: function(response) {
            return _.pick(response, "startTime", "endTime")
        },

        submitTime: function(){

            var time = config.workflow.get("workflowRangeRepresentation");

            var apiConfig = {
                startTime: time.get("startTime").toISOString(),
                endTime: time.get("endTime").toISOString()
            }

            this.save(apiConfig, {
                wait:true,
                patch:true,
                method: 'POST',
                success: function(collection,response) {
                    console.log("workflowTime:success")
                    config.workflow.get("timeAggregationRepresentation").set(response);
                    //get a new exeuction status
                    vent.trigger("workflow:setWorkflowRange:success")
                },
                error: function(collection,response) {
                    console.log("workflowTime:error", response)

                }
            });

        }
    });

    models.timeAggregation = Backbone.Model.extend({
        initialize: function() {
            var self = this;

            this.url = config.apiRoot + "/workflows/" + config.workflow.get("workflowId") + "/ta/",

            vent
                .off("workflow:timeAgg:change")
                .on("workflow:timeAgg:change", function(timeConfig) {
                self.submitTime(timeConfig); // console.log("does it work?")
            })
        },

        parse: function(response) {
            return _.pick(response, "startTime", "aggregationInterval", "shiftPeriod")
        },

        submitTime: function(changeObj){
            var self = this;
            var mergedConfig = _.extend(config.workflow.get("timeAggregationRepresentation").toJSON(), changeObj );
            var apiConfig = _.pick(mergedConfig, "startTime", "aggregationInterval", "shiftPeriod")

            this.save(apiConfig, {
                wait:true,
                patch:true,
                method: 'POST',
                success: function(collection,response) {
                    vent.trigger("workflow:timeAgg:success", changeObj)
                    console.log("workflowTime:success")
                },
                error: function(collection,response) {
                    console.log("workflowTime:error", response)

                }
            });

        }
    });

    return models;

});