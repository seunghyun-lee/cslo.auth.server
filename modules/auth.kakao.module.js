'use strict';

const request = require('request');
const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const mysql = require('../config/mysql.connector');
const query = require('../config/mysql.query');

const kakaoApi = require('../config/config.server.json').kakaoApi;

// 카카오 AccessToken 검증.
exports.accessTokenValidate = (bodyData)=> {
    
    const options = {
        url: kakaoApi.urls.BetaUrl,
        headers: kakaoApi.headers,
        json: true
    }

    options.url  = options.url.concat('/zat/validate');
    options.headers.playerId = bodyData.playerId;
    options.body = { zat: bodyData.accessToken };

    return new Promise((resolve, reject)=> {
        request.post(options, function(err, response, result) {
            if(err) {                
                reject(err);
            } else {                
                resolve(result);
            }
        });
    });
}

// new server
exports.accountSetUserAuthKakao = (userData)=> {
    
    if(!commonFunc.isNullCheck(userData)) {
        throw error(errorCode.NullRequest, userData);
    }

    let params = {
        playerId: userData.playerId,
        userType: userData.IDPCode,
        market: userData.tokenValidated.market,
        country: userData.tokenValidated.country,
        lang: userData.tokenValidated.lang,
        kakaoToken: userData.accessToken
    }

    return new Promise((resolve, reject)=> {
        mysql.dbQuery('main', query.accountSetUserAuthKakao, params, function(err, result) {
            if(err || result.code !== 0) {
                reject(result);
            } else {       
                resolve(result);
            }
        });
    });
}