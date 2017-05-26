/**
 * Created by yangyxu on 9/17/14.
 */
zn.define([
    '../mysql/MySqlCommand',
    '../sql/Transaction',
    'node:mysql'
],function (MySqlCommand, Transaction, mysql) {

    var Store = zn.Class('zn.db.data.Store', {
        statics: {
            getStore: function (config) {
                return new this(config);
            }
        },
        properties: {
            command: {
                readonly: true,
                get: function (){
                    return new this._commandClass(this._pool);
                }
            }
        },
        methods: {
            init: {
                auto: true,
                value: function (inConfig){
                    this._config = inConfig || {};
                    switch (inConfig.type.toLowerCase()) {
                        case 'mysql':
                            this._pool = mysql.createPool(zn.extend({
                                "dateStrings": true,
                                "multipleStatements": true
                            }, inConfig));
                            this._commandClass = MySqlCommand;
                            break;
                        case 'mongo':

                            break;
                    }
                }
            },
            beginTransaction: function (){
                return (new Transaction(this._pool)).begin();
            },
            setDataBase: function (value){
                this._config.database = value;
            },
            setup: function (){
                var _defer = zn.async.defer();
                var _sql = 'drop database if exists ' + this._config.database + ';'
                _sql += 'create database if not exists ' + this._config.database + ';';
                var _config = zn.extend({}, this._config);
                _config.database = null;
                delete _config.database;
                _config.dateStrings = true;
                _config.multipleStatements = true;
                zn.info(_sql);
                var connection = mysql.createConnection(_config).query(_sql, function (err, rows){
                    if(err){
                        _defer.reject(err);
                    }else {
                        _defer.resolve(rows);
                    }
                });
                return _defer.promise;
            },
            create: function (){

            },
            drop: function (){
                return this.query('DROP DATABASE ' + name);
            },
            show: function (){
                return this.query('SHOW DATABASES;');
            },
            query: function (sql){
                return this.command.query.apply(this, arguments);
            },
            paging: function (){
                return this.command.paging.apply(this, arguments);
            },
            createModel: function (inModelClass) {
                var _defer = zn.async.defer();
                this.command.query(inModelClass.getCreateSql())
                    .then(function (data, command){
                        _defer.resolve(data);
                        command.release();
                    });

                return _defer.promise;
            },
            createModels: function (models){
                var _tran = this.beginTransaction(),
                    _defer = zn.async.defer(),
                    _table = null,
                    _model = null;
                for(var key in models){
                    _model = models[key];
                    _table = _model.getMeta('table');
                    if (_table&&!models[_table]){
                        _tran.query(_model.getCreateSql());
                    }
                }

                _tran.on('error', function (sender, err){
                    _defer.reject(err);
                }).on('finally', function (sender, data){
                    _defer.reject(data);
                }).commit();

                return _defer.promise;
            }
        }
    });

    zn.Store = Store;

    return Store;

});
