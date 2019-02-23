'use strict';

const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const receipt = require('../modules/receipt.module');
const receiptPlatform = require('../common/type.data.json').ReceiptPlatform;

const google = require('../config/config.server').googleApi;
const models = require('../models');

const tokenStatus = require('../modules/auth.google.module').googleTokenStatus;


const googleApiKey = {
    client_id : google.client_id,
    client_secret: google.client_secret,
    redirect_uri:  google.redirect_uri

}

const receiptController = {

    receiptValidation: function(req, res, next) {

        let bodyData = req.body;
        
        // Body Obejct 체크
        if(!commonFunc.ObjectKeyCheck(bodyData, ['rawReceipt', 'productName', 'accountDbid' ])) {
            throw error(errorCode.ObjectKeyNotFound, bodyData);
        }
        let rawReceiptJson = JSON.parse(bodyData.rawReceipt);        
        
        let payload = rawReceiptJson.Payload;
        // urlencode 문제로 based64에 +를 공백으로 치환해버리는 문제가 있었음. 해결 : replace " "->+;
        payload = JSON.parse(JSON.stringify(payload).replace(/\s/gi, "+"));        
        let market = receiptPlatform[req.params.market];


        Promise.resolve()
        .then(()=> {            
            return receipt.logCheck(rawReceiptJson.TransactionID);
        })
        .catch(error=> next(error))
        .then(()=> {
            switch(market) {
                case receiptPlatform.google:
                    if(tokenStatus.init === false) {
                        throw error(errorCode.NullGoogleToken, tokenStatus);
                    }
                    return receipt.checkGoogleReceipt(payload);
                    break;
                // appli receipt
                case receiptPlatform.apple:                    
                    return receipt.checkAppleReceipt(payload);
                    break;
            }
        })
        .catch(error=> next(error))
        .then(result=> {            
            return models.receiptLog.create({
                orderId: result.orderId,
                accountDbid: bodyData.accountDbid,
                receiptType: market, 
                State: result.code,
                ProductName : result.ProductName,
                Receipt: JSON.stringify(result.data),
                TimeStamp:  Date.now()
            });
        })
        .then(receiptLog=> {
            res.send({ result: receiptLog.State, data: receiptLog.dataValues, message: 'OK' })
        })
        .catch(error=> next(error));
    }

}

module.exports = receiptController;