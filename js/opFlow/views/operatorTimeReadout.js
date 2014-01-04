// operator list
define([
    'd3',
    'underscoreM',
    'marionette',
    'templates',
    'vent',
    'config'
], function (
        d3,
        _,
        Marionette,
        templates,
        vent,
        config
        ) {
    //
    var OperatorTime = {};

    // private module level var

    var OperatorTimeView = Marionette.ItemView.extend({
        template: _.template(templates.operatorTime),
        initialize: function () {

           var self = this;
           var time = config.workflow.get("workflowRangeRepresentation");
           var format = d3.time.format("%a, %b %e %Y, %I:%M%p")

           if (time.get("startTime")) {
               this.model.set("startTime",format(time.get("startTime")))
               this.model.set("endTime",format(time.get("endTime")))
           } else {
               this.model.set("startTime",'')
               this.model.set("endTime",'')
           }


            config.workflow.get("timeAggregationRepresentation").on("change", function(){
               self.model.set("startTime", format(time.get("startTime")))
               self.model.set("endTime", format(time.get("endTime")))
               self.render();
            })

        }
    })

    OperatorTime.renderOperatorTime = function (model) {

        var operatorTimeView = new OperatorTimeView({
            model: model
        });
        vent.trigger('show:operatorTime', operatorTimeView);

        //render the graph after the view is rendered
        //operatorFlowView.initGraph()
    };


    return OperatorTime;

});

