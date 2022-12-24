import { Schema as MongoSchema, model } from 'mongoose';

const Scheme = new MongoSchema({
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
    },
}, {
    timestamps: true,
});

const Model = model('Student', Scheme, 'students');

export default { Model, Scheme };