'use strict'

module.exports = function(sequelize, DataTypes) {
    
    let googleToken = sequelize.define('googleToken', {
        dbid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        access_token: { type: DataTypes.STRING(256), allowNull: false },
        token_type: { type: DataTypes.STRING(32), allowNull: false },
        expires_in: { type: DataTypes.INTEGER, allowNull: false },
        refresh_token: { type: DataTypes.STRING(128), allowNull: false },
        expireTimeStamp: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.NOW }
    }, {
        timestamps: false,
        tableName: 'tbGoogleToken'
    });

    return googleToken;
};