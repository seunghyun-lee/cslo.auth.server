const errorCode = {
    
    // common
    'ObjectKeyNotFound': {
        code: 10000,
        message: 'The object key does not found.'
    },
    'NullBodyData': {
        code: 10001,
        message: 'The body data is null.'
    },

    'InvalidToken': {
        code: 10002,
        message: 'The Token is invalid.'
    },

    'IncorrectIDPCodeForLocal': {
        code: 10003,
        message: 'IDPCode: dev, please'
    },
    'RedisConnectionError': {
        code: 1004,
        message: 'Redis Server failed to connect.'
    },
    'RedisQueryError': {
        code: 10005,
        message: 'Redis Server failed to query'
    },
    'NotFoundAvailableServer': {
        code: 10006,
        message: 'Cannot found available Game Server'
    },
    'IncorrectIDPCodeForKakao': {
        code: 10007,
        message: 'IDPCode: kakao/guest, please'
    },
    'NullReplayRedisKey': {
        code: 10008,
        message: 'REPLAY: RedisKey is Empty'
    },
    'NullReplayRedisData': {
        code: 10009,
        message: 'The redis result has null value.'
    },
    'NullReplayResult': {
        code: 10010,
        message: 'The Result is Null.'
    },
    'ErrorGetRemovedPlayer': {
        code: 10011,
        message: 'can not receive the list of target users to delete.'
    },
    'NullGoogleApiKey': {
        code: 10012,
        message: 'A google api keys is null.'
    },
    'NullGoogleToken': {
        code: 10012,
        message: 'A google token is null.'
    },
    'OrderIDalreadyUsed': {
        code: 10013, 
        message: 'This OrderID has already been used.'
    },
    'dbError': {
        code: 10014, 
        message: 'dbError'
    },
    'NullShardID': {
        code: 10015, 
        message: 'can not found shardId of accountDbid'
    },
    'NullParamData': {
        code: 10016,
        message: 'The parameter datas are null.'
    }



}

module.exports = errorCode;