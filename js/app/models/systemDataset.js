define(['jquery', 'underscoreM', 'backbone', 'vent', 'config', 'moment'], function( $, _, Backbone, vent, config) {

    var customSyncUrl = function(method, model, options){
        options.url = config.apiRoot + "/datasets/"
        return Backbone.sync(method, model, options);
    }

    var WorkflowTimeItem = Backbone.Model.extend({});

    // public API for this module return a collection
    var DatasetList = Backbone.Collection.extend({ });

    return Backbone.Model.extend({
        //FIXME: hardcoding user call
        sync: customSyncUrl,
        initialize: function() {
            this.deferred = this.fetch()
        },
        parse: function(data, options) {

            data.forEach(function(d){
                d.type = "dataset"
                //FIXME: api inconsistency
                d.datasetName = d.name;

            });


            //TODO: make the server do this
            //calculate min/max time of all temporal datasets
            var temporalData = _.where(data, {datasetType:"default"});

            temporalData.sort(function(a, b) {
                return a.actualMaximumTimestamp - b.actualMaximumTimestamp;
            });
            var endTime = temporalData[temporalData.length - 1].actualMaximumTimestamp;

            temporalData.sort(function(a, b) {
                return a.actualMinimumTimestamp - b.actualMinimumTimestamp;
            });

            // switch to data[0]
            var startTime = temporalData[0].actualMinimumTimestamp;

            //TODO: handle the storage of this better
            //Ideally:  the server provides this value in teh dataset represetnation
            var dataRange = new WorkflowTimeItem({
                startTime: startTime,
                endTime: endTime
            });

            var datasetList = new DatasetList(data);

            return {
                datasets: datasetList,
                dataRange: dataRange
            };


        }
    });


});