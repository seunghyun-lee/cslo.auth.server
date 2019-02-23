// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const debug = require('debug')('cslo.auth:server');

const jwtSecret = require('./config/config.server.json').jwtSecret;
const models = require('./models/');
const nodeEnv = process.env.NODE_ENV || "beta";
const mysql = require('./config/mysql.connector');


// const redis = require('./server/lib/redis.connector');

// Get our API routes
const route = require('./routes/route');

const app = express();

// set the secret key variable for jwt
app.set('jwt-secret', jwtSecret);

app.use(bodyParser.json()); // Parsers for POST data
app.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(morgan('dev')); // print the request log on console
app.use('/', route); // Set our api routes


// Get port from environment and store in Express.
// 10080 kakao 로그인 포트
const port = normalizePort(process.env.PORT || '5050'); 
app.set('port', port);

// Create HTTP server. 
const server = http.createServer(app);
console.log(`Server Environment: ${nodeEnv}`)
server.listen(port, () =>  console.log(`Auth server started on  ${port} at  ${Date(new Date())}`));
server.on('error', onError);
server.on('listening', onListening);


// mysql create cluster pool.
mysql.connect(nodeEnv, function(err, result) {
	if(err) {
		console.log('Unable to connect to MySQL');
		process.exit();
	} else {
		console.log('MySQL cluster pool has been added ');
		console.log('+-----------------+-----------------+');
		console.log('| DB connection   | IP              |');
		console.log('+-----------------+-----------------+');
		Object.keys(result._nodes).forEach(key=> {						
			console.log(`|	${ key }           | `.concat(result._nodes[key].pool.config.connectionConfig.host) + `  |`);
			console.log('+-----------------+-----------------+');			
		});
		
	}
});

// Listen on provided port, on all network interfaces.
models.sequelize.sync().then(function() {	
	debug("complete rdb sync");
	debug("NODE_ENV", process.env.NODE_ENV || "beta");	
});

// Normalize a port into a number, string, or false.
function normalizePort(val) {
		
	const port = parseInt(val, 10);
	if (isNaN(port)) { // named pipe
	  return val;
	}

	if (port >= 0) { // port number
	  return port;
	}
	
	return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
	if (error.syscall !== 'listen') {
			throw error;
	}  
	const bind = typeof port === 'string'
			? 'Pipe ' + port
			: 'Port ' + port;
			
	// handle specific listen errors with friendly messages
	switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
			break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
			break;
				default:
			throw error;
	}
}  
  
// Event listener for HTTP server "listening" event.
function onListening() {
	let addr = server.address();
	let bind = typeof addr === 'string'? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});
  
// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};  
	// render the error page
	res.status(err.status || 500).send({
		
		code: err.code || -9999,    
		data: err.data,
		message: err.message,
		error: err.stack
		
	});
});