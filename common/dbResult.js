
'use strict';

exports.dbError = (err)=> {

    const dbError = {};
    dbError.code = err.errno;
    dbError.data = err;
    dbError.message = err.sqlMessage;

    return dbError;
}

exports.dbSetResult = (rows)=> {

    let err, output;
    let dbResult = {};
    
    let result = rows.filter(r=> r.length>0).map(prop=> prop[0]);
    let dbSelected = rows[0];
            
    for(let value of result) {
        Object.keys(value).forEach(key=> {
            if(key === 'errno') {
                err = { errno: value.errno, code: value.code }
            } else if(key === 'Output') {
                output = value.Output;
            }
        });
    }

    if(dbSelected.errno) {
        dbSelected = [];
    }

    dbResult.code = err.errno;
    dbResult.data = dbSelected;
    if(output) {
        dbResult.output = output;
    }    
    dbResult.message = err.code;

    return dbResult;
}