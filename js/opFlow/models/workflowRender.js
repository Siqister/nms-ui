// books.js
define(['jquery', 'underscoreM', 'backbone', 'vent', 'config'], function( $, _, Backbone, vent, config) {
    var workflowSync = function(method,model,options) {
        //options.url = model.urlRoot + model.id + "?username=" + config.user.get("id");
        options.url = model.urlRoot + model.id;
        return Backbone.sync(method, model, options);
    };


    var operatorSyncUrl = function(method,model,options) {
        if (method == 'delete') {
            options.url = model.urlRoot + config.workflow.get("workflowId") + '/node/'+ model.id
        } else {
            options.url = model.urlRoot + config.workflow.get("workflowId") + '/operators/';
        }

        return Backbone.sync(method, model, options);
    };


    var NodeFlowItem = Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: operatorSyncUrl,
        idAttribute: "uniqueID",
        initialize: function() {
            var self = this;

            this.on("change", function() {
                self.previousModel = self.previousAttributes();
            })

        }
    });

    var datasetSyncUrl = function(method,model,options) {
        if (method == 'delete') {
            options.url = model.urlRoot + config.workflow.get("workflowId") + '/node/'+ model.id;
        } else {
            options.url = model.urlRoot + config.workflow.get("workflowId") + '/datasets/';
        }
        return Backbone.sync(method, model, options)
    };

	//TODO: this is no longer used, correct?
    var DatasetFlowItem = Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: datasetSyncUrl,
        idAttribute: "uniqueID"
    });

    var WorkflowTimeItem = Backbone.Model.extend({});
    var VizSettings = Backbone.Model.extend({
        initialize: function() {
            var self = this;


        }
    });

    var WorkflowCollection = Backbone.Collection.extend({

        initialize: function() {
            var self = this;
            this.options || (this.options = {});
            //_.bindAll(this, "addOperatorItem", "addDatasetItem", "removeOperatorItem", "syncOperator");

            //FIXME: this was dangerous, keeping add events in a collection declaration
            // I unbind the event before calling it again, preventing repetitive binding
            // there must be a better way to do this

            vent
                .off("add:operator")
                .on("add:operator", function(operatorModel, inputModels, renderPreview) {
                	self.addOperatorItem(operatorModel, inputModels, renderPreview);
            	});
            vent
                .off("add:precursor")
                .on("add:precursor", function(operatorModel, inputModels, renderPreview, precursorModel) {
                    self.addPrecursorItem(operatorModel, inputModels, renderPreview, precursorModel);
                });
            vent
                .off("edit:operator")
                .on("edit:operator", function(operatorModel,renderPreview) {
                	self.editOperatorItem(operatorModel, renderPreview);
            	});
            vent.off("remove:operator")
                .on("remove:operator", function(operatorModel) {
                	self.removeOperatorItem(operatorModel)
            	});

            //add datasets to a workflow when a user adds one
            vent.off("add:dataset")
                .on("add:dataset", function(dataset) {
                	self.addDatasetItem(dataset);
            	});
            vent.off("remove:dataset")
                .on("remove:dataset", function(operatorModel) {
                	self.removeDatasetItem(operatorModel)
            	});
        },
        syncOperator: function(operatorModel, renderPreview) {

            var self = this;
            var clonedAttr = _.clone(operatorModel.attributes)

            var parameters = operatorModel.get("parameterDescriptions").toJSON()
            var filteredParams = parameters.map(function(d){
                var obj = _.pick(d, "key", "value", "predecessorNodeId");
                //FIXME: this is a discrepency in the API
                obj.valueType = d.datatype;
                return obj
            });

            clonedAttr.parameters = filteredParams;

            //create operator instance
            var pickedAttr = _.pick(clonedAttr, "parameters", "predecessorID", "dataset", "version", "opId");
            var reducedModel = new NodeFlowItem(pickedAttr);

            reducedModel.save({}, {
                //by not forcing a POST, this will handle adding and editing operators
                wait: true,
                success: function (model, response) {
                    //assign callback data to operatorModel
                    // FIXME: (this seems unnecessary because only new model stores uniqueId thats used as precessor)
                    // FIXME: is it used for deletion or just an artifact?
                    operatorModel.set("uniqueID", response.uniqueID);

                    //reassign the system operator data
                    reducedModel.attributes = clonedAttr;

                    //assign callback data to instance
                    reducedModel.set("uniqueID", response.uniqueID);

                    //add operator to workflow collection
                    self.set(reducedModel, {remove:false});

                    //allow other modules to use new operator success
                    vent.trigger("success:operator", reducedModel, renderPreview);

                    console.log('operator:success');
                },
                error: function (model, response) {
                    console.log('operator:fail');
                }
            })
        },

        addOperatorItem: function(operatorModel, inputModels, renderPreview) {

            //TODO: MAYBE UNNECESSARY
            var inputIDs = inputModels.map(function(d) { if (d.type !== "dataset") {return d.get("uniqueID")}});

            operatorModel.set("predecessorID", inputIDs);
            operatorModel.set("type", "operator");

            this.syncOperator(operatorModel, renderPreview)

        },

        editOperatorItem: function(operatorModel, renderPreview) {
            this.syncOperator(operatorModel, renderPreview);
        },

        removeOperatorItem: function(operatorModel) {
            var self = this;
            var currModel = this.get(operatorModel.get("uniqueID"));
            currModel.destroy({
                wait:true,
                success: function(response){
                    console.log("OPERATOR: REMOVED")
                },
                error: function(response) {
                    console.log("OPERATOR: REMOVE FAIL")
                }
            });
        },


        addPrecursorItem: function(operatorModel, inputModels, renderPreview, precursorModel) {
            //when
            var self = this;

            var joinFields = operatorModel.get("parameterDescriptions").findWhere({key:"fields.to.add"});
            var joinKey1 = operatorModel.get("parameterDescriptions").findWhere({key:"join.field.dataset"});
            var joinKey2 = operatorModel.get("parameterDescriptions").findWhere({key:"join.field.metadata"});

            //this creates the deferred object
            this.addDatasetItem(precursorModel);

            $.when(self.reducedModel.deferred)



                .then(function(response) {



//                    var originalNodeSelection = _.pluck(this.options.nodeSelection,"id");
//
//                    var originalNodeArray = [];
//                    self.options.nodeSelection.forEach(function(d){
//                        if (_.contains(originalNodeSelection, d.id)) {
//                            originalNodeArray.push(d);
//                        }
//                    })
//                    originalNodeArray.push(newDatasetModel);
//                    self.options.nodeSelection = originalNodeArray;

//
//                    inputModels.push(precursorModel);
//                        console.log(precursorModel, inputModels)


                    var joinNodeId = self.reducedModel.get("uniqueID");

                    joinFields.set("predecessorNodeId", joinNodeId);
                    joinKey2.set("predecessorNodeId", joinNodeId);
                    //fixme: this is sensitive to branched nodes
                    joinKey1.set("predecessorNodeId", inputModels[0].get("uniqueID"));

                    inputModels.push(self.reducedModel)
                    self.addOperatorItem(operatorModel, inputModels, renderPreview);
                });
            //then
            //apply response items to model



        },

        addDatasetItem: function(dataset) {
            var self = this;

            var clonedAttr = _.clone(dataset.attributes);
            //create dataset instance
            this.reducedModel = new DatasetFlowItem({id:clonedAttr.id});  //_.clone(dataset.attributes)

            this.reducedModel.deferred = this.reducedModel.save({},{
                //force post
                type: 'POST',
                error : function(model, response){
                    console.log('DATASET:FAIL');
                },
                success: function(model, response){
                    //assign system operator data to instance
                    self.reducedModel.attributes = clonedAttr;
                    //unique id from server
                    self.reducedModel.set("uniqueID", response.uniqueID);
                    //add to to dataset workflow collection
                    self.set(self.reducedModel, {remove:false});
                    console.log(self, config.workflow)
                    console.log('DATASET:SUCCESS');
                }
            });
        },

        removeDatasetItem: function(datasetModel) {
            var self = this;
            var currModel = this.get(datasetModel.get("uniqueID"));
            currModel.destroy({
                wait: true,

                success: function(model,response, options){
//                    console.log(model,response,options)
//                    console.log(self)
//                    console.log(response)
                },
                error: function(response) {
                    console.log(response)
                }
            })
        }



    });

    return Backbone.Model.extend({
        urlRoot: config.apiRoot + '/workflows/',
        sync: workflowSync,
        initialize: function() {
            var self = this;
            _.bindAll(this, "getWorkflow");
            self.getWorkflow();
        },
        getWorkflow: function () {

            var self = this;
            this.deferred = this.fetch({
                error : function(model, response){
                    console.log('workflow:error');
                },
                success: function(model, response){
                    console.log('workflow:success');
                    vent.trigger('workflow:success', self);
                },
                operators: self.options
            });
        },
        parse: function(data, options) {

            //FIXME: only run this if this is first load. i'm doing this so i can update time representations without affecting events for workflow rendering
            if (!config.workflow.get("mergedRepresentations")) {
                var operators = data.operatorRepresentations;
                var datasets = data.datasetRepresentations;

                operators.forEach(function(m,i){
                    //merging operator representation with corresponding system operator
                    operators[i] = new NodeFlowItem(m)
                    operators[i].set(config.systemOperators.findWhere({opId: m.opId}).attributes)
                    operators[i].set("type", "operator");

                })

                datasets.forEach(function(m,i) {
                	//merging dataset representation with corresponding system dataset
                    datasets[i] = new NodeFlowItem(m);
                    datasets[i].set(config.systemDatasets.get("datasets").findWhere({datasetName: m.datasetName}).attributes)
                    datasets[i].set("type", "dataset");
                });

                //create a merged representation list for rendering
                var representations = datasets.concat(operators);

                data.mergedRepresentations = new WorkflowCollection(representations)

            }

            //create time models
            data.workflowRangeRepresentation = new WorkflowTimeItem(data.workflowRangeRepresentation);
            if (!_.isNull(data.workflowRangeRepresentation.get("startTime"))) {
                data.workflowRangeRepresentation.set("startTime", new Date(data.workflowRangeRepresentation.get("startTime")));
                data.workflowRangeRepresentation.set("endTime", new Date(data.workflowRangeRepresentation.get("endTime")));
            }

            //create time models
            data.timeAggregationRepresentation = new WorkflowTimeItem(data.timeAggregationRepresentation)
            if (!_.isNull(data.timeAggregationRepresentation.get("startTime"))) {
                data.timeAggregationRepresentation.set("startTime", new Date(data.timeAggregationRepresentation.get("startTime")));
            }

            if (!_.isNull(data.vizSettings)) {
                data.vizSettings = new VizSettings(JSON.parse(data.vizSettings));
                data.vizSettings.set("active", true)
            }

            return data;
        }

    });

});