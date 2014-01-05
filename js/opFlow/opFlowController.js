// note for brevity this controller also contains the definition of the router for this sub-app/module
define([
    'underscoreM',
    'marionette',
    'vent',
    'templates',

    'opFlow/models/workflowRender',
    'opFlow/models/systemOperator',
    'opFlow/models/workflowTime',
    'app/models/execution',
    'app/models/user',

    'opFlow/views/operatorList',
    'opFlow/views/operatorFlow',
    
    'app/models/systemDataset',

    'config'
    ], 
function(
    _,
    Marionette,
    vent,
    templates,
    
    WorkflowRenderModel,
    SystemOperatorModel,
   	WorkflowTimeModel,
    ExecutionModel,
    UserModel,

    OperatorListView,
    OperatorFlowView,

    SystemDatasetModel,

    config
) {

    var Controller = {};

    Controller.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "workflow/:workflowID":"loadWorkFlow"
        }
    });

   // private: render layout
    var Layout = Marionette.Layout.extend({
        template: _.template(templates.opVizActions),
        id: "workflow-container",
        regions: {
            menu: "#operator-actions",
            operatorFlow: "#operator-flow",
            operatorTime: "#operator-time"
        }
    });

    var _initializeLayout = function() {
        //instance of layout
        Controller.layout = new Layout();
        Controller.layout.on("show", function() {
            //vent.trigger("opVizLayout:rendered");
        });
        vent.trigger('app:show:opFlow', Controller.layout);
    };
    
    
    vent.on('show:operatorFlowItems', function(operatorFlowView){
    	//triggered by operatorFlowView after the view has been created
    	Controller.layout.operatorFlow.show(operatorFlowView);
    });
    

    //public api for routers etc    
    Controller.loadWorkFlow = function(workflowId) {
        //TODO: where is this set?
        //config.user = config.user || new UserModel();

        //initialize datamodels
        config.systemOperators = new SystemOperatorModel();
        config.systemDatasets = new SystemDatasetModel();

        //workflow needs system datasets and system operators first
        $.when(config.systemOperators.deferred, config.systemDatasets.deferred).then(function() {
			
            config.workflow = new WorkflowRenderModel({id:workflowId});

            //FIXME: this should not be nested deferreds. stupid.
            $.when(
                config.user,
                config.workflow.deferred
            )
            .then(function() {
				//new WorkflowTimeModel.timeRange();
				//new WorkflowTimeModel.timeAggregation();

				//vizBuilderController.loadManager(config.workflow);
				//Add datasets to conveyor after systemDatasets have fetched
				vent.trigger('conveyor:add:datasets');

				OperatorFlowView.renderFlowItems(config.workflow);
                //TODO: OperatorListView is now obselete
				//OperatorListView.showOperatorItems(config.systemOperators);
            });
        });
        
        this.renderOperatorFlow();
    };
    
    Controller.renderOperatorFlow = function() {
        _initializeLayout();
    };

    return Controller;
});