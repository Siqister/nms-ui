define([], function () {
    return {
        //apiRoot: 'http://10.25.180.74:8182', // mohit
        //apiRoot: 'http://10.25.180.56:8182' // oliver
        //GLOBAL DATA STORAGE OBJECTS
        time: {},
        datasets: {},
        operators: {},


        apiRoot: 'https://localhost:8182',
        dynCalc: {
            width: function() {
                return $(window).width();
            }
        },
        messages: {
            noData: 'Sorry, there is no data available',
            error404: 'Your actions was not successful. The server is not available',
            errorGeneric: 'Your action was not successful',
            deleteWorkflow: 'Are you sure you want to delete this workflow and all associated operations? You cannot undo this action'
        },

        // icons
        icons_datasets: {
            "default": {path: "/assets/icon_dataset_default.png", width: 37, height:37},
            "Bus stops": {path: "/assets/icon_dataset_bus.png", width: 37, height:37},
            "Singapore Outline (Geo-JSON)": {path: "/assets/icon_dataset_default.png", width: 37, height:37},
            "Bus/MRT rides (LTA)": {path: "/assets/icon_dataset_ezlink.png", width: 37, height:37},
            "Singtel call records": {path: "/assets/icon_dataset_cell.png", width: 37, height:37},
        },
        icons_operations: {
            "default": {path: "/assets/icon_small_gear.png", width: 20, height:20},
            "METADATA_JOIN": {path: "/assets/icon_oper_join.png", width: 20, height:19},
            "LIMIT": {path: "/assets/icon_oper_limit.png", width: 20, height:19},
            "SORT": {path: "/assets/icon_oper_sortasc.png", width: 24, height:10},
            "GROUPBY": {path: "/assets/icon_oper_group.png", width: 20, height:19},
            "SELECT": {path: "/assets/icon_oper_select.png", width: 21, height:20},
        },
        getIconByDataset : function(dataset) {
            if (this.icons_datasets[dataset]) {
                return this.icons_datasets[dataset];
            } else {
                return this.icons_datasets["default"];
            }
        },
        getIconByOperation : function(operation) {
            if (this.icons_operations[operation]) {
                return this.icons_operations[operation];
            } else {
                return this.icons_operations["default"];
            }
        }
    };
})

