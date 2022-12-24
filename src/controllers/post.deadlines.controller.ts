import { NextFunction, Request, Response } from 'express-serve-static-core';

import deadlinesService from '../services/deadlines/deadlines.service';

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        await deadlinesService.CreateDeadLines(req.body);

        return res.status(201).json();
    }
    catch (e) {
        return next(e);
    }
}