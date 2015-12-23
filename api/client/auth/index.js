/**
 * @module API
 */

var Q = require("q");
var L = require("common/language");
var Logger = require("common/logger");
var validate = require("common/validate");
var md5 = require("common/utils").md5;
var uuid = require('node-uuid');
var logger = new Logger("auth");
var errorHandle = require("common/errorHandle");
/**
 * @class auth 用户认证
 */
var auth = {
    /**
     * @property __public 是否公共模块
     * @type {Boolean}
     */
    __public: true
};

var API = require("common/api");

/**
 * @method activeByEmail
 *
 * 通过邮件激活账号
 *
 * @param {object} data
 * @param {String} data.sign
 * @param {String} data.accountId
 * @param {String} data.timestamp
 * @param {Function} callback
 * @return {promise}
 * @public
 */
auth.activeByEmail = API.auth.activeByEmail;

/**
 * @method login
 *
 * 登录
 *
 * @param {Object} data 参数
 * @param {String} data.email 邮箱 (可选,如果email提供优先使用)
 * @param {String} data.pwd 密码
 * @param {String} [data.mobile] 手机号(可选,如果email提供则优先使用email)
 * @param {Callback} [callback] 可选回调函数
 * @return {Promise} {code:0, msg: "ok", data: {user_id: "账号ID", token_sign: "签名", token_id: "TOKEN_ID", timestamp:"时间戳"}
 */
auth.login = API.auth.login;

/**
 * @method bindMobile
 *
 * 绑定手机号
 *
 * @param {Object} data
 * @param {UUID} data.accountId 操作人
 * @param {String} data.mobile 要绑定的手机号
 * @param {String} data.code 手机验证码
 * @param {String} data.pwd 登录密码
 * @param {Callback} callback
 * @return {Promise} {code: 0, msg: "ok};
 */
auth.bindMobile =API.auth.bindMobile;


///**
// * @method isBlackDomain
// *
// * 是否黑名单
// *
// * @param {Object} params
// * @param {String} params.domain 域名
// * @param {Function} callback
// * @return {Promise} {code: 0}, {code: -1, msg: "域名已占用或者不合法"}
// */
//auth.isBlackDomain = API.company.isBlackDomain;

/**
 * @method registryCompany
 *
 * 注册企业账号
 *
 * @param {Object} params
 * @param {String} params.companyName 企业名称
 * @param {String} params.name 注册人姓名
 * @param {String} params.email 企业邮箱
 * @param {String} params.mobile 手机号
 * @param {String} params.pwd 密码
 * @param {String} params.msgCode 短信验证码
 * @param {String} params.msgTicket 验证码凭证
 * @param {String} params.picCode 图片验证码
 * @param {String} params.picTicket 图片验证码凭证
 * @param {Function} callback
 * @return {Promise}
 */
auth.registryCompany = function(params, callback) {
    var defer = Q.defer();
    //先创建登录账号
    if (!params) {
        params = {};
    }
    var companyName = params.companyName;
    var name = params.name;
    var email = params.email;
    var mobile = params.mobile;
    var msgCode = params.msgCode;
    var msgTicket = params.msgTicket;
    var picCode = params.picCode;
    var picTicket = params.picTicket;
    var pwd = params.pwd;

    if (!picCode || !picTicket) {
        defer.reject({code: -1, msg: "验证码错误"});
        return defer.promise.nodeify(callback);
    }

    if (!msgCode || !msgTicket) {
        defer.reject({code: -1, msg: "短信验证码错误"});
        return defer.promise.nodeify(callback);
    }

    if (!mobile || !validate.isMobile(mobile)) {
        defer.reject(L.ERR.MOBILE_FORMAT_ERROR);
        return defer.promise.nodeify(callback);
    }

    if (!name) {
        defer.reject({code: -1, msg: "联系人姓名为空"});
        return defer.promise.nodeify(callback);
    }

    if (!companyName) {
        defer.reject({code: -1, msg: "公司名称为空"});
        return defer.promise.nodeify(callback);
    }

    if (!pwd) {
        defer.reject({code: -1, msg: "密码不能为空"});
        return defer.promise.nodeify(callback);
    }

    var validatePicCheckCode = Q.denodeify(API.checkcode.validatePicCheckCode);
    var validateMsgCheckCode = Q.denodeify(API.checkcode.validateMsgCheckCode);
    var createCompany = Q.denodeify(API.company.createCompany);
    var createStaff = Q.denodeify(API.staff.createStaff);
    return validatePicCheckCode({code: picCode, ticket: picTicket})
        .then(function(result) {
            if (result.code) {
                throw result;
            }
            return true;
        })
        .then(function() {
            return validateMsgCheckCode({code: msgCode, ticket: msgTicket, mobile: mobile})
                .then(function(result) {
                    if (result.code) {
                        throw result;
                    }
                    return true;
                })
        })
        .then(function(){
            var domain = email.split(/@/)[1];
            return API.company.isBlackDomain({domain: domain})
                .then(function(result) {
                    if (result.code) {
                        throw result;
                    } else {
                        return true;
                    }
                })
                .then(function() {
                    return API.auth.newAccount({mobile: mobile, email: email, pwd: pwd})
                        .then(function(result) {
                            if (result.code) {
                                throw result;
                            }

                            var account = result.data;
                            var companyId = uuid.v1();
                            var staffId = account.id;
                            return Q.all([
                                createCompany({id: companyId, createUser: account.id, name: companyName, domainName: domain}),
                                createStaff({email: email, mobile: mobile, name: name, companyId: companyId, accountId: account.id, roleId: 0})
                            ])
                                .then(function(ret){
                                    return {code: 0, msg: 'ok'};
                                })
                                .catch(function(err){
                                    logger.info(err);
                                    API.company.deleteCompany({companyId: companyId, userId: account.id});
                                    API.staff.deleteStaff({id: staffId});
                                    defer.reject(L.ERR.SYSTEM_ERROR);
                                    return defer.promise;
                                })
                        })
                        .then(function(result) {
                            return result;
                        })
                })
        })
        .catch(errorHandle)
        .nodeify(callback);
}

/**
 * @method sendActiveEmail
 *
 * 发送激活邮件
 *
 * @param {Object} params
 * @param {String} params.email 邮件账号
 * @param {Function} callback
 * @return {Promise} {code: 0, msg: "OK"}
 */
auth.sendActiveEmail = function(params, callback) {
    return API.auth.sendActiveEmail(params, callback);
}

/**
 * @method logout
 *
 * 退出登录
 *
 * @param [callback] 可选回调函数
 * @return {Promise} {code: 0}, {code: -1}
 */
auth.logout = function(callback) {
    var self = this;
    var accountId = self.accountId;
    var tokenId = self.tokenId;
    return API.auth.logout({accountId: accountId, tokenId: tokenId}, callback);
}

/**
 * @method needPermissionMiddleware
 *
 * 权限控制
 *
 * @param fn
 * @param needPowers
 * @return {Function}
 */
auth.needPermissionMiddleware = function(fn, needPowers) {
    return function(params, callback) {
        var self = this;
        var accountId = self.accountId;
        return API.power.checkPower({accountId: accountId, powers: needPowers})
            .then(function(result) {
                if (result.code) {
                    throw result;
                }
                return fn.call(self, params);
            })
            .catch(errorHandle)
            .nodeify(callback);
    }
}

module.exports = auth;
