'use strict';

const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');
const typeData = require('../common/type.data.json');
const aliveSec = require('../config/config.server.json').aliveSec;

const authModule = require('../modules/auth.module');
const gameServerModule = require('../modules/game.server.module');

const AuthLocalController = {

    authSetLocal: function(req, res, next) {

        const bodyData = req.body;
        const SECRET = req.app.get('jwt-secret');                
        let userInfo = {};

        if(!commonFunc.isNullCheck(bodyData)) {
            throw error(errorCode.NullBodyData, bodyData);
        }

        if(!commonFunc.ObjectKeyCheck(bodyData, ['playerId', 'IDPCode', 'redis' ])) {
            throw error(errorCode.ObjectKeyNotFound, bodyData);
        }

        // playerId, IDPCode = cslomain.tbaccount.account, userType
        bodyData.playerId = bodyData.playerId.trim();        
        bodyData.IDPCode = typeData.UserType[bodyData.IDPCode.toLowerCase()];

        // 계정 조회 및 생성
        authModule.accountSetUserAuth(bodyData)
        .then(userData=> {
            userInfo = userData.data[0];
            return authModule.shardInfoGetList(userInfo.accountDbid);
        })
        .then(shardInfo=> {
            userInfo.shardId = shardInfo[0].shardId;
            return gameServerModule.getValidServer(bodyData.redis, userInfo); // 접속 가능한 서버 목록.
        })
        .then(gameServers=> {
            // 서버 리스트 중, 30초 이내 Alive Update된 서버 검색.
            const serverInfo = gameServers.filter(server=> {
                let now = Math.floor(Date.now()/1000);
                let serverTime = now - parseInt(server.time, 10);
                if(serverTime < aliveSec) {
                    return server;
                }
            });

            if(serverInfo.length === 0) {
                throw error(errorCode.NotFoundAvailableServer, serverInfo);
            }

            let server = serverInfo.find(server=> server.ip === userInfo.serverIP && parseInt(server.port) === userInfo.port);            
            if(!server) {
                // 서버리스트에 유저가 이미 접속했던 서버가 없을 경우, 접속수가 가장 적은 서버를 할당한다.
                if(serverInfo.length>1) {
                    let availServer =  serverInfo.reduce((pre, cur)=> {
                        let server = parseInt(pre.userCount) > parseInt(cur.userCount) ? cur:pre
                        return server
                    });

                    userInfo.serverIP = availServer.ip;
                    userInfo.port = availServer.port;
                } else {
                    // 이전에 접속한 게임서버가 alive 상태 이면 그대로 배정.
                    userInfo.serverIP = serverInfo[0].ip;
                    userInfo.port = serverInfo[0].port;
                }
            }
            return gameServerModule.setGameServer(userInfo);
        })
        .then(()=> {
            const tokenPayload = { accountDbid: userInfo.accountDbid, key: userInfo.serverIP };
            return authModule.jwtTokenSign(tokenPayload, SECRET); 
        })
        .then(jwtToken=> {
            userInfo.token = jwtToken;
            return authModule.accountSetUserInfo(userInfo);
        })
        .then(result=> {
            result.data = userInfo;
            res.send(result);
        })
        .catch(error=> {
            console.log(error);
            next(error);
        });
    }

}

module.exports = AuthLocalController;
