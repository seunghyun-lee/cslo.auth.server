'use strict'

class CustomError extends Error {
    constructor(code, data, error, message) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;

        if(code !== 0) {
            this.error = data;
            this.data = data;
        } else {
            this.data = data;
        }        
        this.message = message;        

        if(typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

class UserThrowError extends CustomError {
    constructor(errNo, errData, errMsg) {
        let code = errNo;
        let data = errData;
        let error = errData;
        let message = errMsg;        
        super(code, data, error, message);
    }
}

// error 내용 전달.
module.exports = function(errData, errDataObj) {
    let error = new UserThrowError(errData.code, errDataObj, errData.message);
    return error;
}