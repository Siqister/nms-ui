define(['jquery', 'vent'], function($, vent) {

    //TODO These are subject to revisions
    var $horzFlow = $('#container'),
    	$horzPanes = $horzFlow.find('.pane'),
    	containerWidth = $horzFlow.width();

    var ui =  {
        pos: {
            init: function() {
                var currPos = 'dataManager';
                this.status = currPos;
            },
            dataManager: function(){
                var currPos = 'dataManager';

                $horzFlow.animate({
                    left: 0
                });
                this.status = currPos;
            },
            vizBuilder: function() {
                var currPos = 'vizBuilder';

                $horzFlow.animate({
                    left: -1 * containerWidth/2
                });
                this.status = currPos;
            },
            refresh: function() {
                this[this.status]();
            },
            status: false

        },
        vizBuilderCalc: function() {
        	//??
        }

    }

    vent.on('app:modal:rendered', function(el) {
        ui.modal(el);

        $(window).resize(function(){
            ui.modal(el);
        })
    })

    vent.on('app:pos:data', function() {
        ui.pos.dataManager();
    });

    vent.on('app:pos:viz', function() {
        ui.pos.vizBuilder();
    });

    return ui;
});