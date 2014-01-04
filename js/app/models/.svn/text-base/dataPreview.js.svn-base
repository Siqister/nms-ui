define(['jquery', 'underscoreM', 'backbone', 'vent', 'config'], function( $, _, Backbone, vent, config) {


    var customSyncUrl = function(method, model, options){
        //TODO: change sync url based on before or after request
        var nodeID = options.node.get("uniqueID");
        var workflowID = config.workflow.get("workflowId");

        if (options.node.get("type") == "dataset" && options.renderType != "join") {
            options.url = config.apiRoot + /workflows/ + workflowID + '/datasets/' + nodeID + '/data/preview/';
        } else if (options.node.get("type") == "dataset" && options.renderType == "join") {
            options.url = config.apiRoot + '/datasets/' + options.node.id + '/data?username=' + config.user.get("id");
        } else if (options.node.get("type") == "operator") {
            options.url = config.apiRoot + /workflows/ + workflowID + '/operators/' + nodeID + '/data/preview/';
        }

      return Backbone.sync(method, model, options);
    }

    var DataItem = Backbone.Model.extend({
            initialize: function() {
                //this.getPreview();

            }
        });

    return Backbone.Collection.extend({
            model: DataItem,
            sync: customSyncUrl,
            initialize: function(models,options) {
                //this.on("reset",this.getPreview(options));
                this.getPreview(options)


            },
            parse: function(response, options) {
                var self = this;
                if (response.output === false) {
                    vent.trigger("execute:scheduled", options.node, options.renderType);
                    return false;
                } else {
                    vent.trigger("preview:ready", options.node, options.renderType);
                    return response;
                }


            },
             getPreview: function(options) {
                var self = this;
                this.deferred = this.fetch({
                    //reset:true,
                    success: function(model, response, ops) {

                    },
                    error: function(model, response, options) {},
                    node: options.operator,
                    renderType: options.renderType
                });
            }
        });

});


