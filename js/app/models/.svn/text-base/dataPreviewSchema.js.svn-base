define(['jquery', 'underscoreM', 'backbone', 'vent', 'config'], function( $, _, Backbone, vent, config) {

    var customSyncUrl = function(method, model, options){
        var nodeID = options.node.get("uniqueID");
        var workflowID = config.workflow.get("workflowId");

        if (options.renderType && options.renderType == "join") {
            options.url = config.apiRoot + '/datasets/' + options.node.id;
        } else {
            options.url = config.apiRoot + '/workflows/' + workflowID + '/node/' + nodeID + '/schema/';
        }
        return Backbone.sync(method, model, options);
    }

    return Backbone.Model.extend({
        sync: customSyncUrl,
        initialize: function(models,options) {
            this.deferred = this.fetch({
                node: options.operator,
                renderType: options.renderType
            });
        }
    });

});


