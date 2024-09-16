'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paste extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Paste.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    expiry: DataTypes.STRING,
    exposure: DataTypes.STRING,
    slug: DataTypes.STRING,
    editSlug: DataTypes.STRING,
    hits: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Paste',
  });
  return Paste;
};