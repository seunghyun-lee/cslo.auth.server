'use strict';

const Redis = require('ioredis');
const redisConfig = require('./config.db').redis;
const commonFunc = require('../common/common.function');

const env = process.env.NODE_ENV || 'beta';


const redisConnector = {

    connect: function(redisInfo) {

        if(!commonFunc.isNullCheck(redisInfo)) {
            redisInfo = redisConfig[env];
        }
        // console.log(redisInfo);
        return new Redis(redisInfo);
    }
    
}
module.exports = redisConnector;