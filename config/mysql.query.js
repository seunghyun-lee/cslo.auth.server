module.exports = {

   // auth
   "accountSetToken"           :   "CALL p_main_accountSetToken(@result, @msg, ?, ?); SELECT @result as errno, @msg as code;",    
   "accountSetUserAuth"        :   "CALL p_main_accountSetUserAuth(@result, @msg, ?, ?); SELECT @result as errno, @msg as code;",
   "accountSetUserAuthKakao"   :   "CALL p_main_accountSetUserAuthKakao(@result, @msg, ?, ?, ?, ?, ?, ?); SELECT @result as errno, @msg as code;",
   "shardInfoGetList"          :   "CALL p_main_shardInfoGetList(@result, @msg); SELECT @result as errno, @msg as code;",
   "accountSetUserInfo"        :   "CALL p_main_accountSetUserInfo(@result, @msg, ?, ?, ?, ?); SELECT @result as errno, @msg as code;",

   "gameServerSetUser"         :   "CALL p_main_gameServerSetUser(@result, @msg, ?, ?, ?); SELECT @result as errno, @msg as code;",
   "gameServerGetUser"         :   "CALL p_main_gameServerGetUser(@result, @msg, ?); SELECT @result as errno, @msg as code;"
   
}