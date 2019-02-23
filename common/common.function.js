'use strict';


// null check
exports.isNullCheck = (values)=> {
    if(values === undefined || values === null || values === '') return false;    
    return true;
}

// object key check
exports.ObjectKeyCheck = (object, keyArr)=> {
    keyArr.map(key=> {
        if(object[key] === undefined || object[key] === null) {
            return false;
        }
    });
    return true;
}
