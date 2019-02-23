const express = require('express');
const router = express.Router();

const AuthLocal = require('../controllers/auth.local.controller');
const AuthKakao = require('../controllers/auth.kakao.controller');
const AuthGoogle = require('../controllers/auth.google.controller');
const Receipt = require('../controllers/receipt.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/auth', AuthKakao.authSetKakao);
router.post('/auth/local', AuthLocal.authSetLocal);


// google Auth
router.get('/auth/google', AuthGoogle.googleOAuth2Req);
router.get('/auth/google/redirect', AuthGoogle.googleOAuth2Res);
router.get('/auth/google/tokenStatus', AuthGoogle.googleTokenStatus);
router.get('/auth/google/tokenRefresh', AuthGoogle.googleTokenRefresh);



// receipt
router.post('/receipt/validCheck/:market', Receipt.receiptValidation);

module.exports = router;