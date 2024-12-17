import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';

class Subject extends Model {
  public id!: string;
  public name!: string;
}

Subject.init(
  {
    id: {
      type: DataTypes.STRING(14),
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: false,
  }
);

export default Subject;

