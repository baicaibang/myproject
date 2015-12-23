/**
 * Created by wlh on 15/12/9.
 */

var uuid = require("node-uuid");
var now = require("../../../common/utils").now;

module.exports = function (Db, DataType) {
    return Db.define("Account", {
        id               : {type: DataType.UUID,            defaultValue: uuid.v1, primaryKey: true},
        email            : {type: DataType.STRING(255) }, //邮箱
        pwd              : {type: DataType.STRING(50) }, //密码
        mobile           : {type: DataType.STRING(20) }, //手机
        status           : {type: DataType.INTEGER,         defaultValue: 0}, //状态
        createAt         : {type: "timestamp",              defaultValue: now, field: "create_at"}, //创建时间
        forbiddenExpireAt: {type: "timestamp",              field: "forbidden_expire_at"}, //禁用失效时间
        loginFailTimes   : {type: DataType.INTEGER,         defaultValue: 0, field: "login_fail_times"}, //连续错误次数
        lastLoginAt      : {type: "timestamp",              field: "last_login_at"}, //最近登录时间
        lastLoginIp      : {type: DataType.STRING(50),      field: "last_login_ip"}, //最近登录Ip
        activeToken      : {type: DataType.STRING(50),      field: "active_token"}
    }, {
        tableName : "accounts",
        timestamps: false,
        schema    : "auth"
    })
};

