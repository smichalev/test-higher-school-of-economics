import { Request, Response, NextFunction } from 'express-serve-static-core';
import httpErrors from 'http-errors';

export default (req: Request, res: Response, next: NextFunction): Response => {
    const { status, message } = httpErrors(404, 'Endpoint not found');

    return res
        .status(status)
        .json({
            message
        });
}