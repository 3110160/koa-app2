module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: "user",
      // 以下两个属性是针对createAt、updateAt这两个默认属性的，timestamps是不使用，而underscored
      // 则是将createAt转化为create_at
      // timestamps: false,
      underscored: true
    }
  );
