define(['jquery', 'underscoreM', 'backbone', 'vent', 'config'], function( $, _, Backbone, vent, config) {

    var LoginModel = Backbone.Model.extend({
        sync: function(method, model, options){
            method = "create";
            options.url = config.apiRoot + '/security-login';
            options.data = $.param(model.attributes);
            options.statusCode = {
                403: function() {
                    // overwrite main 403 handler to do nothing
                }
            };

            return Backbone.sync(method, model, options);
        },
        defaults: {
            username: 'siqi', //TODO: hardcoded for development
            password: 'siqi', //TODO: hardcoded for development
            _spring_security_remember_me: false,
            ajax: true
        },
        validation: {
            username: {
                required: true
            },
            password: {
                required: true
            }
        }
    });

    var LogoutModel = Backbone.Model.extend({
        sync: function(method, model, options){
            method = "read";
            options.url = config.apiRoot + '/security-logout';
            options.dataType = "text";
            return Backbone.sync(method, model, options);
        }
    });

    return {
        Login: LoginModel,
        Logout: LogoutModel
    }
});


