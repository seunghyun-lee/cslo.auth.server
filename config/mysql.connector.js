'use strict';

const mysql = require('mysql2');
const dbConfig = require('./config.db.json').game;
const dbResult = require('../common/dbResult');

let dbPool = {
    pool: null
}

// dbShard Connection
exports.connect = (nodeEnv, callback)=> {

    dbPool.pool = mysql.createPoolCluster();

    Object.keys(dbConfig).forEach(dbType=> {
        Object.keys(dbConfig[dbType]).forEach(dbEnv=> {
            // mainDB
            if(dbType === 'main' && nodeEnv === dbEnv) {
                dbPool.pool.add('main', dbConfig[dbType][dbEnv]);
            }             
            // gameDB1
            if(dbType === 'gameShard1' && nodeEnv === dbEnv) {
                dbPool.pool.add('game1', dbConfig[dbType][dbEnv]);
            }
            // gameDB2
            if(dbType === 'gameShard2' && nodeEnv === dbEnv) {
                dbPool.pool.add('game2', dbConfig[dbType][dbEnv]);
            }
        }); 
    });
    callback(null, dbPool.pool);
}


function dbConn(dbShard, callback) {
    const pool = dbPool.pool;
    pool.getConnection(dbShard, function(error, connection) {
        if(error) return callback(new Error(error));        
        callback(null, connection);
    });
}

exports.dbQuery = (dbShard, proc, params, callback)=> {

    let paramsValue = [];
    for(let key in params) { paramsValue.push(params[key]); }

    dbConn(dbShard, (err, connection)=> {
        connection.query(proc, paramsValue, function(err, rows) {            
            connection.release();            
            if(err) {
                callback(err, dbResult.dbError(err));
            } else {
                callback(null,dbResult.dbSetResult(rows));
            }
        });
    });
}

