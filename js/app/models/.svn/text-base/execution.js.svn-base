// books.js
define(['jquery', 'underscoreM', 'backbone', 'vent', 'config', 'atmosphere'], function( $, _, Backbone, vent, config, atmosphere) {


    var executionModels = {};
    var scheduledOperatorInstance;

    function webSocketsSync(method, model, options){

        var workflowID = config.workflow.get("workflowId");
        var exeType = options.exeType;

        var detectedTransport = null;
        var socket = $.atmosphere;
        var subSocket;

        function subscribe() {
            var request = { url : model.urlRoot + workflowID + "/execute/"+ exeType +"/updates",
                transport: 'websocket',
                contentType : "text/html;charset=ISO-8859-1"};


            request.onMessage = function (response) {
                detectedTransport = response.transport;
                if (response.status == 200) {
                    var data = response.responseBody;
                    if (data.length > 0) {
                        var dataObj = $.parseJSON(data);
                        options.success(dataObj);
                    }
                }
            };



            subSocket = socket.subscribe(request);
        }

        function unsubscribe(){
            socket.unsubscribe();
        }

        function connect() {
            unsubscribe();
            subscribe();
            console.log('atmosphere connected');
        }

        connect();

    };


    function statusSync(method,model,options) {
        var exeType = options.exeType;
        var workflowID = config.workflow.get("workflowId");
        options.url = model.urlRoot + workflowID + "/execute/" + exeType + "/status";

        return Backbone.sync(method, model, options);
    };

    function stopSync(method,model,options) {
        var exeType = options.exeType;
        var workflowID = config.workflow.get("workflowId");
        options.url = model.urlRoot + workflowID + "/execute/" + exeType + "/stop";

        return Backbone.sync(method, model, options);
    };

    function executionSync(method,model,options) {

        var exeType = options.exeType;
        var workflowID = config.workflow.get("workflowId");

        if (options.node) {
            var nodeID = options.node.get("uniqueID");
            options.url = model.urlRoot + workflowID + "/operators/" + nodeID + "/execute/" + exeType;
        } else if (options.exeAction) {
            var action = options.exeAction;
            options.url = model.urlRoot + workflowID + "/execute/" + exeType + "/" + action;
        } else {
            options.url = model.urlRoot + workflowID + "/execute/" + exeType
        }
        return Backbone.sync(method, model, options);
    };

    executionModels.getUpdates = Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: webSocketsSync,
        initialize: function(models,options) {
            var self = this;
            this.options = options;

        },
        openConnection: function() {

            var self = this;

            // make this deferred. progress is not waiting for this to fetch
            this.deferred = this.fetch({
                reset:true,
                success: function(model,response) {
                    vent.trigger("progress:update:"+self.options.exeType, response);

                    //single operator finished
                    if (scheduledOperatorInstance && (response.operatorInstanceId != scheduledOperatorInstance)) {
                        vent.trigger("progress:done:"+self.options.exeType, scheduledOperatorInstance);
                        console.log("PROGRESS DONE:", scheduledOperatorInstance);
                    }

                    //execution all finished
                    if (response.done) {
                        $.atmosphere.unsubscribe();
                        vent.trigger("execute:done:"+self.options.exeType, self.options.operator, self.options.renderType);

                    //execution is queued
                    } else if (response.err) {
                        vent.trigger('app.show.error', response)
                    }

                    scheduledOperatorInstance = response.operatorInstanceId;


                },
                error: function(model, response) {
                    console.log("ERROR:" + response)
                },
                node: self.options.operator,
                renderType: self.options.renderType,
                exeType: self.options.exeType
            });
        }

    });

    executionModels.stopExecution = Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: stopSync,
        initialize: function() {
            this.stopExecution();
        },
        stopExecution: function() {
            this.deferred = this.fetch();
        }

    });

    executionModels.executionStatus = Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: statusSync,
        initialize: function(models, options) {
            var self = this;
            this.options = options;

            this.off("sync")
            this.on("sync", function(d) {
                var validity = self.checkValidity();

                if (validity === "scheduled") {
                    vent.trigger("execution:scheduled:"+self.options.exeType);
                } else if
                    (validity === "running") {
                    vent.trigger("execution:running:"+self.options.exeType);

                } else if
                        (validity === false) {
                    vent.trigger("execution:waiting:"+self.options.exeType);
                } else if
                        (validity === true) {
                    vent.trigger("execution:ready:"+self.options.exeType);
                } else if
                        (validity == "empty") {
                }

            });

            //reload the status when full execution finishes
//            vent.off("execute:done:full")
            vent.on("execute:done:full", function() {
                self.getStatus();
            });

            //reload the status when the workflow time is changed
//            vent.off("workflow:setWorkflowRange:success")
            vent.on("workflow:setWorkflowRange:success", function() {
                self.getStatus();
            });

//            vent.off("workflow:modify")
            vent.on("workflow:modify", function() {
                self.getStatus();
            });

//            vent.on("workflow:sync")
            vent.on("workflow:sync", function() {
                self.getStatus();
            });

            this.getStatus();

        },
        getStatus: function() {
            var self = this;
            this.deferred = this.fetch({
                exeType: self.options.exeType
            });
        },
        checkValidity: function() {
            var validityArr = _.pluck(this.attributes, "upToDate");
            if (!_.isEmpty(validityArr)) {
                if (_.contains(validityArr, "scheduled")) {
                //some scheduled
                    //queue number will be the same in each obj
                    return "scheduled";
                } else if
                    (_.contains(validityArr, "running")) {
                        return "running";
                } else if
                   (_.contains(validityArr, false)) {
                //some false
                    return false;
                } else if
                   (_.every(validityArr, _.identity())) {
                //all true
                    return true;
                }
            } else {
                return "empty";
            }
        }

    });

    executionModels.execute = Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: executionSync,
        initialize: function(models,options) {
            var self = this;
            this.options = options;

            if (!options.wait) {
                this.execution();
            }

        },
        execution: function() {
            var self = this;
            this.deferred = this.fetch({
                reset:true,
                node: self.options.operator,
                exeType: self.options.exeType,
                exeAction: self.options.exeAction,
                renderType: self.options.renderType,
                success: function(model,response) {
                    vent.trigger("execution:running:"+self.options.exeType)
                },
                error: function(model, response) {
                    console.log("FAIL", response)
                }
            });
        },
        stop: function() {
            var self = this;
            this.deferred = this.fetch({
                reset:true,
                exeType: self.options.exeType,
                exeAction: "stop",
                success: function(model,response) {
                    vent.trigger("execution:waiting:"+self.options.exeType)
                },
                error: function(model, response) {
                    console.log("FAIL", response)
                }
            });
        }

        });

    return executionModels;


});