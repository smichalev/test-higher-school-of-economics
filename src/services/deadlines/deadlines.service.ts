import mongoose from 'mongoose';
import httpErrors from 'http-errors';

import deadline from '../../models/deadline.model';
import student from "../../models/student.model";

import IStudent from './../students/students.interface';
import IDeadline from './deadlines.interface';

import studentsService from '../students/students.service';

type CreateDeadLinesParams = Record<'studentId' | 'title' | 'description', string>;
interface UpdateDeadLinesCompleteParams {
    studentId: string;
    deadlineId: string;
    status: boolean;
}

class DeadlinesService {
    public async GetAllDeadLines(): Promise<IDeadline[]> {
        const deadlines: IDeadline[] = await deadline.Model
            .find()
            .populate({
                path: 'studentId',
            }).populate({
                path: 'detail.studentId',
            });

        if (!deadlines.length) {
            return [];
        }
        
        if (!Array.isArray(deadlines)) {
            throw httpErrors(400, 'Not correct format deadlines collection');
        }

        const emails = new Set();

        for (const itemDeadline of deadlines) {
            if (itemDeadline?.studentId?.email) {
                emails.add(itemDeadline.studentId.email);
            }

            if (itemDeadline?.detail) {
                for (const detailItemDeadline of itemDeadline?.detail) {
                    if (detailItemDeadline?.studentId?.email) {
                        emails.add(detailItemDeadline?.studentId?.email);
                    }
                }
            }
        }

        const detailStudents = await studentsService.GetStudentsByEmail([...emails] as string[]) || [];
        const detailMap: Map<string, IStudent> = new Map(detailStudents.map(student => [student.email, student]));

        return deadlines.map((item) => {
            return {
                _id: item._id,
                title: item.title,
                description: item.description,
                date: item.date,
                studentId: {
                    _id: item.studentId._id,
                    email: item.studentId.email,
                    ...(item?.studentId?.email &&
                        detailMap.has(item.studentId.email) &&
                        detailMap.get(item.studentId.email)
                    )
                },
                detail: item.detail.map((itemDetail) => ({
                    character: itemDetail.character,
                    studentId: {
                        _id: itemDetail.studentId._id,
                        email: itemDetail.studentId.email,
                        ...(itemDetail?.studentId?.email &&
                            detailMap.has(itemDetail.studentId.email) &&
                            detailMap.get(itemDetail.studentId.email)
                        )
                    },
                    date: itemDetail.date,
                }))
            } as IDeadline;
        });
    }

    public async CreateDeadLines(
        { studentId, title, description }: CreateDeadLinesParams
    ): Promise<void> {
        if (!studentId) {
            throw httpErrors(400, 'Body param studentId is required');
        }

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw httpErrors(400, 'Body param studentId must be MongoID');
        }

        if (!title) {
            throw httpErrors(400, 'Body param title is required');
        }

        if (!description) {
            throw httpErrors(400, 'Body param description is required');
        }

        const studentEntry = await student.Model.findById(studentId);

        if (!studentEntry) {
            throw httpErrors(404, 'Student not found');
        }

        await deadline.Model.create({
            title,
            description,
            date: new Date(),
            studentId,
            detail: [{
                studentId,
                character: 'create',
                date: new Date(),
            }]
        });
    }

    public async UpdateDeadLinesComplete({ studentId, deadlineId, status }: UpdateDeadLinesCompleteParams): Promise<void> {
        if (!studentId) {
            throw httpErrors(400, 'Body param studentId is required');
        }

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw httpErrors(400, 'Body param studentId must be MongoID');
        }

        if (typeof status !== 'boolean') {
            throw httpErrors(400, 'Body param status is required and must be boolean type');
        }

        if (!deadlineId) {
            throw httpErrors(400, 'Param deadlineId is required');
        }

        if (!mongoose.Types.ObjectId.isValid(deadlineId)) {
            throw httpErrors(400, 'Param deadlineId must be MongoID');
        }

        const studentEntry = await student.Model.findById(studentId);

        if (!studentEntry) {
            throw httpErrors(404, 'Student not found');
        };

        const deadlineEntry = await deadline.Model.findById(deadlineId);

        if (!deadlineEntry) {
            throw httpErrors(404, 'Deadline not found');
        };

        deadlineEntry.detail.push({
            character: status ? 'checked' : 'uncheked',
            studentId: String(studentId),
            date: new Date(),
        } as any);

        await deadlineEntry.save();
    }
}

const deadlinesService: DeadlinesService = new DeadlinesService();

export default deadlinesService;