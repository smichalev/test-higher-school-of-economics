import mongoose, { Schema as MongoSchema, model } from 'mongoose';
import student from './student.model'

const Scheme = new MongoSchema({
    title: String,
    description: String,
    date: {
        type: Date,
        required: true
    },
    studentId: {
        type: MongoSchema.Types.ObjectId,
        ref: mongoose.model('Student', student.Scheme),
    },
    detail: [{
        studentId: {
            type: MongoSchema.Types.ObjectId,
            ref: mongoose.model('Student', student.Scheme),
        },
        character: String,
        date: Date,
    }]
}, { timestamps: true });

const Model = model('Deadline', Scheme, 'deadlines');

export default { Model, Scheme };