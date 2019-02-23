'use strict';
const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const mysql = require('../config/mysql.connector');
const query = require('../config/mysql.query');
const redisConnector = require('../config/redis.connector');


// 유저가 접속 가능한 게임서버 리스트를 Redis에서 조회한다.
exports.getValidServer = (redisInfo, userInfo)=> {
    
    let serverList=[];    
    const redis = redisConnector.connect(JSON.parse(redisInfo));
    console.log(redisInfo);
    return new Promise((resolve, reject)=> {
        redis.smembers('gameServer', function(err, gameServers) {            
            if(err) throw error(errorCode.RedisConnectionError, JSON.parse(redisInfo));

            if(gameServers.length === 0) {                
                throw error(errorCode.NotFoundAvailableServer, (redisInfo));
            }

            let pendingCount = gameServers.length;
            gameServers.forEach(gameServer=> {
                redis.hgetall(gameServer, function(err, serverInfo) {                    
                    --pendingCount;
                    if(err) {
                        reject(err);
                        return;
                    } else {
                        // console.log(userInfo.shardId, serverInfo )
                        if(userInfo.shardId === parseInt(serverInfo.dbShardIndex)) {
                            serverList.push(serverInfo);
                        }
                    }
                    
                    if (pendingCount == 0) {
                        redis.disconnect();                        
                        resolve(serverList.sort((x,y)=> x.port < y.port));
                    }
                });
            });
        });
    });
}


exports.setGameServer = (userInfo)=> {
    
    if(!commonFunc.isNullCheck(userInfo)) {
        throw error(errorCode.NullRequest, userInfo);
    }

    let params = {
        accountDbid: userInfo.accountDbid,
        serverIP: userInfo.serverIP,
        port: userInfo.port
    }

    return new Promise((resolve, reject)=> {
        mysql.dbQuery('main',query.gameServerSetUser, params, function(err, result) {
            if(err || result.code !== 0) {
                reject(result);
            } else {
                resolve(result);
            }
        });
    });

}