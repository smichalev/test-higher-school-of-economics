import { Request, Response, NextFunction } from 'express-serve-static-core';

import IDeadline from '../services/deadlines/deadlines.interface';

import deadlinesService from '../services/deadlines/deadlines.service';

export default async (req: Request, res: Response, next: NextFunction): Promise<Response<IDeadline[]> | void> => {
    try {
        const deadlines: IDeadline[] = await deadlinesService.GetAllDeadLines();

        return res.json(deadlines);
    } catch (e: any) {
        return next(e);
    }
}