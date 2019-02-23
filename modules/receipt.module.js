'use strict';

const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const request = require('request');
const models = require('../models');
const tokenStatus = require('./auth.google.module').googleTokenStatus;


exports.logCheck = (orderID) => {
    
    return new Promise(function(resolve, reject) {
        models.receiptLog.findOne({ where: { orderId: orderID }})
        .then(receiptLog=> {            
            if(!commonFunc.isNullCheck(receiptLog)) {
                resolve();
            } else {                
                reject({ code: -3, data: receiptLog, message: 'This receipt orderID used already.' });
                return;
            }
        });
    });
}


exports.checkGoogleReceipt = (receipt)=> {

    let jsonStr = receipt;    
    if(typeof jsonStr === 'string') {
        jsonStr = receipt
            .replace(/\\"/g, '"')
            .replace('"{', '{')
            .replace('}"', '}');
    }

    let parseRawRecipt = jsonStr;    
    if(typeof jsonStr === 'string') {
        try {
            parseRawRecipt = JSON.parse(jsonStr);            
        }
        catch(e) {
            return Promise.reject(e);
        }
    }
    else if(receipt.hasOwnProperty('json')) {
        jsonStr = receipt['json']
            .replace(/\\"/g, '"')
            .replace('"{', '{')
            .replace('}"', '}');
        parseRawRecipt = jsonStr;
    }    
    
    let packageName = parseRawRecipt.json.packageName;
    let productId = parseRawRecipt.json.productId;
    let token = parseRawRecipt.json.purchaseToken;
    

    return new Promise(function(resolve, reject) {
        
        let getUrl = `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/products/${productId}/tokens/${token}?access_token=${tokenStatus.access_token}`;
        request.get(getUrl, function(error, response, body) {
            
            let result = JSON.parse(body);
            if (!(result.error === null || result.error === undefined)) {
                reject({code: result.error.code, data: result.error.errors, message: result.error.message});
            }
            else if(result.purchaseState === 0) {                
                // purchaseState - 0: 구매 완료, 1: 취소
                resolve({code: result.purchaseState, data: result, orderId: result.orderId, message: result.kind, ProductName: productId});
            } else {                
                // consumptionState: - 0: 컨슘 안됨, 1: 컨슘 (0; 개발자 실수 또는 앱 크래쉬등 결제 과정에서 오류 발생!! )
                reject({code: result.consumptionState, data: result, orderId: result.orderId, message: result.kind, ProductName: productId});
            }
        });
    });
}

exports.checkAppleReceipt = (receipt)=> {
    
    return new Promise((resolve, reject)=> {
        request.post({ url:'https://buy.itunes.apple.com/verifyReceipt', body:{ "Content-type":"application/json"}, json:{"receipt-data": receipt}}, (error, response, data)=> {
            if(error) {                
                let status = data ? data.status:1;
                reject({ return:-1, err: error })
            }
            console.log(data);
            if(data.status === 21007) {
                request.post({ url:'https://sandbox.itunes.apple.com/verifyReceipt', body:{"Content-type":"application/json"}, json:{"receipt-data":receipt}}, (error, response, data)=> {                    
                    if(error) {
                        status = data ? data.status:1;
                        reject({ code: status, data: error});
                    }
                     
                    console.log(data);
                    let productName = data.receipt.in_app.length > 0 ? data.receipt.in_app[0]['product_id'] : null;
                    resolve({ code:data.status, data: data.receipt.in_app[0], orderId: data.receipt.in_app[0]['transaction_id'], ProductName: productName});
                });
                return;
            } else {
                reject({ code: -2, data: data });
                return;
            }


            
            let productName = data.receipt.in_app.length>0 ? data.receipt.in_app[0]['product_id'] : null;
            resolve({ result:0, store: 'production', orderId: transaction_id, ProductName: productName });
        });
    });
}




