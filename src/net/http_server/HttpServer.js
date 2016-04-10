/**
 * Created by yangyxu on 8/20/14.
 */
zn.define([
    './config/server',
    './RequestAcceptor',
    './Controller',
    'node:http',
    'node:url',
],function (config, RequestAcceptor, Controller, http, url) {

    return zn.class('HttpServer', {
        statics: {
            createServer: function (inArgs) {
                return new this(inArgs);
            }
        },
        events: ['request','connection','close'],
        properties: {
            config: {}
        },
        methods: {
            init: function (args){
                var _config = zn.overwrite(args, config),
                    _uuid = zn.uuid(),
                    _root = 'http://' + _config.host + ":" + _config.port,
                    _global_var_prefix = '@';

                _config.__context__ = {
                    'prefix': _global_var_prefix,
                    'uuid': _uuid,
                    'root': _root
                };
                _config.webRoot = _config.__dirname + (_config.catalog||'');
                _config.serverPath = __dirname;

                zn.SERVER_PATH = __dirname;
                this.config = _config;
                RequestAcceptor.initHandlerManager(_config);
                this.__createServer(_config);
            },
            __createServer: function (config){
                var _httpServer = new http.Server();
                _httpServer.addListener('request', this.__onRequest.bind(this));
                _httpServer.addListener("connection", this.__onConnection.bind(this));
                _httpServer.addListener("close", this.__onClose.bind(this));
                _httpServer.listen(config.port, config.host);

                return _httpServer;
            },
            __onRequest: function(request, response){
                this.fire('request',request, response);
                try{
                    RequestAcceptor.accept(request, response);
                } catch (e){
                    zn.error('HttpServer.js  Line - 61 ' + e.message);
                }
            },
            __onConnection: function (socket) {
                //zn.debug("NEW HTTP Connection[ idleStart ]: " + socket._idleStart);
            },
            __onClose: function(){
                this.fire('close', this);
                Logger.info("close zeanium-server");
            }
        }
    });

});
