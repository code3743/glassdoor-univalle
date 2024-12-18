import Teacher from './teacher.model';
import Subject from './subject.model';
import Student from './student.model';
import TeacherSubject from './teacherSubject.model';
import Rating from './rating.model';

Teacher.hasMany(TeacherSubject, { foreignKey: 'teacher_id' });
Subject.hasMany(TeacherSubject, { foreignKey: 'subject_id' });

TeacherSubject.belongsTo(Teacher, { foreignKey: 'teacher_id' });
TeacherSubject.belongsTo(Subject, { foreignKey: 'subject_id' });

TeacherSubject.hasMany(Rating, { foreignKey: 'teacher_subject_id' });  
Student.hasMany(Rating, { foreignKey: 'student_id' });

Rating.belongsTo(TeacherSubject, { foreignKey: 'teacher_subject_id' });  
Rating.belongsTo(Student, { foreignKey: 'student_id' });

export { Teacher, Subject, Student, TeacherSubject, Rating };
