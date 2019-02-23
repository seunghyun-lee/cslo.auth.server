'use strict'

module.exports = function(sequelize, DataTypes) {
    let receiptLog = sequelize.define('receiptLog', {
        orderId: { type: DataTypes.STRING(24), primaryKey: true },
        accountDbid: { type: DataTypes.INTEGER, allowNull:false },
        receiptType: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue:0},
        State : { type : DataTypes.INTEGER, allowNull: false, defaultValue:0 },
        ProductName : { type : DataTypes.STRING(32), allowNull: false },
        Receipt : { type : DataTypes.TEXT, allowNull: false },
        TimeStamp : { type : DataTypes.DATE, allowNull: false, defaultValue: sequelize.NOW}
    },
    { 
        timestamps: false,
        tableName: 'tbReceiptLog'
    });

    return receiptLog;
}