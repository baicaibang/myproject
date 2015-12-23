/**
 * Created by wlh on 15/12/10.
 */

var uuid = require("node-uuid");
var utils = require("../../../common/utils");

module.exports = function(Db, DataType) {
    return Db.define("Token", {
        id: { type: DataType.UUID, primaryKey: true, defaultValue: uuid.v1 },
        accountId: { type: DataType.UUID, field: "account_id"  },
        token: { type: DataType.STRING(50)   },
        createAt: { type: "timestamp", field: "create_at", defaultValue: utils.now },
        refreshAt: { type: "timestamp", field: "refresh_at", defaultValue: utils.now },
        expireAt: { field: "expire_at", type: "timestamp"  }
    }, {
        tableName: "tokens",
        schema: "auth",
        timestamps: false
    })
}