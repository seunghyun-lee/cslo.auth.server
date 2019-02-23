'use strict';
const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const moment = require('moment');
const models = require('../models');
const google = require('../config/config.server').googleApi;

let googleTokenStatus = {
    init: false,
    access_token: null,
    token_type: null,
    expires_in: null,
    refresh_token: null
}

exports.googleTokenStatus = googleTokenStatus;

function InitGoogleToken() {
    
    
    models.googleToken.findOne({ where: {expireTimeStamp: {$gte: moment()}}})
    .then(googleToken=> {
        if(!commonFunc.isNullCheck(googleToken)) {            
            googleTokenStatus.init = false;
            console.log(`googleTokenStatus init : ${googleTokenStatus}`);
        } else {
            googleTokenStatus.init = true;
            googleTokenStatus.access_token = googleToken.access_token;
            googleTokenStatus.token_type = googleToken.token_type;
            googleTokenStatus.expires_in = googleToken.expires_in;
            googleTokenStatus.refresh_token = googleToken.refresh_token;
        }
        
        console.log(`googleTokenStatus init : ${googleTokenStatus}`);
    });
}

InitGoogleToken();

exports.UpdateGoogleTokenStatus = (paramObj)=> {
    
    if(!commonFunc.isNullCheck(paramObj)) {
        throw error(errorCode.NullGoogleToken, paramObj);
        return;
    }
    const date = moment();    
    const timeStamp = date.add(paramObj.expires_in, 'seconds');
    console.log(timeStamp.valueOf);
    
    let tokenInfo = {
        access_token    : paramObj.access_token,
        token_type      : paramObj.token_type,
        expires_in      : paramObj.expires_in,
        expireTimeStamp : timeStamp
    }
    // IAP Status Update
    googleTokenStatus.access_token = tokenInfo.access_token;
    googleTokenStatus.token_type = tokenInfo.token_type;
    googleTokenStatus.expires_in = tokenInfo.expires_in;

    if(commonFunc.isNullCheck(paramObj.refresh_token)) {
        tokenInfo.refresh_token = paramObj.refresh_token;
        googleTokenStatus.refresh_token = tokenInfo.refresh_token;
    }

    googleTokenStatus.init = true;
    
    // DB Update
    return models.googleToken.findOne()
    .then((googleToken)=>{        
        if(!commonFunc.isNullCheck(googleToken)) {
            return models.googleToken.create(tokenInfo); // 기존 토큰 데이터가 없으면 Insert
        } else {            
            return models.googleToken.update(tokenInfo, { where:{ dbid:googleToken.dataValues.dbid } }); // 있으면 Update
        }
    });
}