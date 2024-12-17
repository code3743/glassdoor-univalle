import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import Teacher from './teacher.model';
import Subject from './subject.model';

class TeacherSubject extends Model {
  public id!: string;
  public teacher_id!: string;
  public subject_id!: string;
}

TeacherSubject.init(
  {
    id: {
      type: DataTypes.STRING(14),
      primaryKey: true,
    },
    teacher_id: {
      type: DataTypes.STRING(14),
      references: {
        model: Teacher,
        key: 'id',
      },
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.STRING(14),
      references: {
        model: Subject,
        key: 'id',
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TeacherSubject',
    tableName: 'teacher_subject',
    timestamps: false,
  }
);

export default TeacherSubject;
