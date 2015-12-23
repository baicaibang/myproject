/**
 * Created by YCXJ on 2014/5/6.
 */
'use strict';
//可以直接require服务器根目录下的模块
require('app-module-path').addPath(__dirname);

//服务器启动性能日志
//var perf = require('common/perf');
//perf.init('init');

var path = require('path');
var Q = require('q');
var fs = require("fs");

var config = require("./config");

var Logger = require('common/logger');
Logger.init(config.logger);
var logger = new Logger('main');

var model = require('common/model');
model.init(config.postgres.url);

var Server = require('common/server');
var server = new Server(config.appName, config.pid_file);

server.cluster = config.cluster;

server.http_logtype = config.logger.httptype;
server.http_port = config.port;
if(config.socket_file){
    server.http_port = config.socket_file;
}
server.http_root = path.join(__dirname, 'public');
server.http_favicon = path.join(server.http_root, 'favicon.ico');
//server.on('init.http_handler', require('./app'));

server.api_path = path.join(__dirname, 'api');
server.api_port = config.apiPort;
server.api_config = config.api;

server.on('init.http', function(server){
    if(config.debug){
        var shoe = require('shoe');
        var sock = shoe(function (stream) {
            var redis = require("redis");
            var client = redis.createClient(config.redis.url);
            client.subscribe('checkcode:msg');
            client.on("message", function (channel, message) {
                var message = JSON.parse(message);
                stream.write(message.mobile + " : " + message.code + " <br>\n");
                console.log("client channel " + channel + ": " + message);
            });
            stream.on('close', function(){
                console.log('client disconnected.');
                client.end();
            })
        });
        sock.install(server, '/checkcode.sub');
    }
});

server.start();

