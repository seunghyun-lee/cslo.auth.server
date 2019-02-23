'use strict';

const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const jwt = require('jsonwebtoken');
const EXPIRES = '7d';

const mysql = require('../config/mysql.connector');
const query = require('../config/mysql.query');
const redisConfig = require('../config/redis.connector');



const dbType = require('../common/type.data.json').DBType;

// jwt 토큰 생성
function jwtTokenSign(tokenData, SECRET) {
    return jwt.sign(tokenData, SECRET, { expiresIn: EXPIRES }); // HS256
}
exports.jwtTokenSign = jwtTokenSign;


// 계정 생성 및 유저 데이터 조회
exports.accountSetUserAuth = (userData)=> {

    if(!commonFunc.isNullCheck(userData)) {
        throw error(errorCode.NullParamData, userData);
    }

    const params = {
        playerId: userData.playerId,
        userType: userData.IDPCode
    }    
    return new Promise((resolve, reject)=> {
        mysql.dbQuery('main', query.accountSetUserAuth, params, (err, result)=> {           
            if(err) reject(err);
           
            if(result.code !== 0) {
                reject(result);
            } else {
                resolve(result);
            }
        });
    });
    
}

// 유저 ShardId 조회
exports.shardInfoGetList = (accountDbid)=> {

    if(!commonFunc.isNullCheck(accountDbid)) {
        throw error(errorCode.NullParamData, accountDbid);
    }

    let params = {};    
    return new Promise((resolve, reject)=> {
        mysql.dbQuery('main', query.shardInfoGetList, params, function(err, result) {
            if(err) {
                reject(err);
            } else {
                let shardInfo = result.data.filter(x=> accountDbid >= x.accountMin && accountDbid <= x.accountMax);
                resolve(shardInfo);
            }
        });
    });
}

// 토큰 업데이트
exports.accountSetUserInfo = (userInfo)=> {
    
    if(!commonFunc.isNullCheck(userInfo)) {
        throw error(errorCode.NullRequest, { userInfo: userInfo});
    }

    let params = {
        accountDbid: userInfo.accountDbid,
        serverIp: userInfo.serverIP,
        port: userInfo.port,
        token: userInfo.token
    }

    return new Promise((resolve, reject)=> {
        mysql.dbQuery('main', query.accountSetUserInfo, params, function(err, result) {
            if(err || result.code !== 0) {
                reject(result);
            } else {    
                resolve(result);
            }
        });
    });
}