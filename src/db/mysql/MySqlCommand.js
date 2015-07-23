/**
 * Created by yangyxu on 8/20/14.
 */
zn.define([
    './Select',
    './Insert',
    './Update',
    './Delete'
],function (Select, Insert, Update, Delete) {

    var Async = zn.async;
    var String = zn.format.String;
    var __slice = Array.prototype.slice;

    return zn.class('MySqlCommand', {
        properties: {
            connection: null
        },
        methods: {
            init: function (inArgs){
                this.sets(inArgs);
            },
            select: function (){
                return Select.getInstance(null, this).fields(__slice.call(arguments));
            },
            insert: function (table){
                return Insert.getInstance(null, this).into(table);
            },
            update: function (table){
                return Update.getInstance(null, this).table(table);
            },
            delete: function (table){
                return Delete.getInstance(null, this).from(table);
            },
            query: function (queryString) {
                var _defer = Async.defer(),
                    _query = String.formatString.apply(String, arguments);

                zn.debug(_query);
                this.get('connection').query(_query, function(err, rows, fields) {
                    if (err){
                        zn.error(err.message);
                        _defer.reject(err);
                        Async.catch(err);
                    }else {
                        _defer.resolve({rows: rows, fields: fields});
                    }
                });

                return _defer.promise;
            }
        }
    });

});