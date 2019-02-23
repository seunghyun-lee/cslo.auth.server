'use strict';

const error = require('../common/error');
const errorCode = require('../common/errorCode');
const commonFunc = require('../common/common.function');

const authGoogle = require('../modules/auth.google.module');

const request = require('request');
const googleApis = require('googleapis');
// const OAuth2 = googleApis.auth.OAuth2;
const google = require('../config/config.server').googleApi;
const googleApiKey = {
    client_id : google.client_id,
    client_secret: google.client_secret,
    redirect_uri:  'http://cektest.iptime.org:5050/auth/google/redirect'
}

// Google Api 중 접근해야할 서비스 목록. 복수 요청 가능.
const scopes = ['https://www.googleapis.com/auth/androidpublisher'];

let repeat_refresh = null; // access_token Refresh Timer
const min30 = 30*60*1000; // 40분.

const AuthGoogleController = {

    // google OAuth2
    googleOAuth2Req: function(req, res, next) {        

        if(!commonFunc.isNullCheck(googleApiKey)) {
            throw error(errorCode.NullGoogleApiKey, googleApiKey);
        }

        if(!commonFunc.isNullCheck(authGoogle.googleTokenStatus)) {
            let OAuth2Client = new googleApis.auth.OAuth2(googleApiKey.client_id, googleApiKey.client_secret, googleApiKey.redirect_uri);
            let url = OAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                approval_prompt: 'force'
            });
    
            res.redirect(url);
        } else {
            res.redirect('/auth/google/tokenStatus');
        }
        

    },

    googleOAuth2Res: function(req, res, next) {
        
        if(!commonFunc.isNullCheck(req.query.code)) {
            res.status(500);            
        }

        let url = 'https://www.googleapis.com/oauth2/v4/token';
        let payload = {
            grant_type: 'authorization_code',
            code: req.query.code,
            client_id: googleApiKey.client_id,
            client_secret: googleApiKey.client_secret,
            redirect_uri: googleApiKey.redirect_uri
        }

        request.post(url, { form: payload }, function(err, response, body) {
            
            let parsedBody = JSON.parse(body);
            let googleToken = {
                access_token: parsedBody.access_token,
                token_type: parsedBody.token_type,
                expires_in: parsedBody.expires_in,
                refresh_token: parsedBody.refresh_token
            }

            // refresh_token으로 access_token 재발급(access_token 유효시간: 1시간).            
            // if(repeat_refresh === null) {                
            //     repeat_refresh = setInterval(tokenRefresh, min30);
            // }
            authGoogle.UpdateGoogleTokenStatus(googleToken);
            res.send(googleToken);            
        });
    },

    googleTokenStatus: function(req, res, next) {
        res.send(authGoogle.googleTokenStatus);
    },

    googleTokenRefresh: function(req, res, next) {

        let url = 'https://www.googleapis.com/oauth2/v4/token';
        let payload = {
            refresh_token: authGoogle.googleTokenStatus.refresh_token,
            grant_type: 'refresh_token',
            client_id: googleApiKey.client_id,
            client_secret: googleApiKey.client_secret
        };

        request.post(url, { form:payload, 'Content-Type': 'application/x-www-form-urlencoded' }, function(err, response, body) {
            
            if(err) {
                repeat_refresh = null,
                clearInterval(repeat_refresh);
                return;
            }

            let parseBody = JSON.parse(body);
            
            let tokenInfo = {
                access_token: parseBody.access_token,
                token_type: parseBody.token_type,
                expires_in: parseBody.expires_in,
                refresh_token: payload.refresh_token
            }
            
            console.log("The token information has been updated.");
            authGoogle.UpdateGoogleTokenStatus(tokenInfo);
            res.send(tokenInfo);
        });

    }


}

module.exports = AuthGoogleController;

