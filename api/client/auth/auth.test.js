/**
 * Created by wlh on 15/12/9.
 */
var API = require('common/api');

var assert = require("assert");

describe("api/client/auth.js", function() {

    var ACCOUNT = {
        email: "lihui.wang@tulingdao.com",
        pwd: "123456"
    }

    describe("API.auth.newAccount", function() {
        var _account = {};
        it("API.auth.newAccount should be err without email", function(done) {
            API.auth.newAccount(ACCOUNT.pwd, function(err, result) {
                assert.notEqual(null, err);
                done();
            });
        })

        it("API.auth.newAccount should be err without pwd", function(done) {
            API.auth.newAccount({email: ACCOUNT.email}, function(err, result) {
                assert.notEqual(err, null);
                done();
            });
        });

        it("API.auth.newAccount should be ok with email and pwd", function(done) {
            API.auth.newAccount({email: ACCOUNT.email, pwd: ACCOUNT.pwd}, function(err, result) {
                assert.equal(null, err);
                assert.equal(result.code, 0);
                assert.notEqual(result.data, null);
                assert.equal(result.data.status, 0);
                _account.id = result.data.id;
                _account.status = result.data.status;
                done();
            })
        });

        after(function(done) {
            API.auth.remove({email: ACCOUNT.email}, function(err, result) {
                assert.equal(err, null);
                assert.equal(result.code, 0);
                done();
            })
        })
    })

    describe("#API.auth.login", function() {
        var _account;
        //登录之前激活账号
        before(function(done) {
            API.auth.newAccount({email: ACCOUNT.email, pwd: ACCOUNT.pwd})
                .then(function(result) {
                    _account = result.data;
                    return API.auth.active({accountId: _account.id})
                        .then(function(result) {
                            assert.equal(result.code, 0);
                            done();
                        })
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it("should be err with uncorrect email", function(done) {
            API.client.auth.login({email: "shalabaji#qq.com", pwd: ACCOUNT.pwd}, function(err, result) {
                assert.notEqual(err, null);
                done();
            });
        })

        it("should be ok with correct email and pwd", function(done) {
            API.client.auth.login({email:ACCOUNT.email, pwd: ACCOUNT.pwd}, function(err, result) {
                var hasErr = false;
                if (err) {
                    hasErr = true;
                }
                assert.equal(hasErr, false);
                assert.equal(result.code, 0);
                _account.id = result.data.user_id;
                done();
            })
        })

        after(function(done) {
            API.auth.remove({accountId: _account.id}, function(err, result) {
                assert.equal(err, null);
                assert.equal(result.code, 0);
                done();
            })
        })
    })

    describe("#auth.authentication", function() {

        var _account;
        var _tokens = {};

        before(function(done) {
            //创建账号,激活账号,登录
            API.auth.newAccount({email: ACCOUNT.email, pwd: ACCOUNT.pwd})
                .then(function(result) {
                    _account = result.data;
                    return _account;
                })
                .then(function(account) {
                    return API.auth.active({accountId: account.id})
                })
                .then(function() {
                    return API.client.auth.login({email: ACCOUNT.email, pwd: ACCOUNT.pwd})
                        .then(function(result) {
                            _tokens = result.data;
                            done();
                        })
                })
                .catch(function(err) {
                    throw err;
                })
        });

        it("should be unlogin response with uncorrect data", function(done) {
            API.client.auth.authentication("", "", "", "", function(err, result) {
                assert.notEqual(null, err);
                done();
            });
        })

        it("should be ok with correct token data", function(done) {
            API.client.auth.authentication(_tokens.user_id, _tokens.token_id, _tokens.timestamp, _tokens.token_sign, function(err, result) {
                assert.equal(err, null);
                assert.equal(result.code, 0);
                done();
            })
        })

        after(function(done) {
            API.auth.remove({email: ACCOUNT.email}, function(err, result) {
                assert.equal(err, null);
                assert.equal(result.code, 0);
                done();
            })
        })
    })
})