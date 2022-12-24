import { NextFunction, Request, Response } from 'express-serve-static-core';

import deadlinesService from '../services/deadlines/deadlines.service';

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        await deadlinesService.UpdateDeadLinesComplete({
            studentId: req.body.studentId,
            deadlineId: req.params.id,
            status: false,
        });

        return res.status(204).json();
    }
    catch (e) {
        return next(e);
    }
}