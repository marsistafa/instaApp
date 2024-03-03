'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init({
    SettingID: DataTypes.INTEGER,
    UserID: DataTypes.INTEGER,
    MaxPostsPerDay: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    PageID: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'Setting',
  });
  return Setting;
};