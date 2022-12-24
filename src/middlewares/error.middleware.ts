import { Request, Response, NextFunction } from 'express-serve-static-core';

export default (err: any, req: Request, res: Response, next: NextFunction): Response | void => {
    if (!err) {
        return next();
    }

    return res
        .status(err.status || 400)
        .json({
            message: err.message || 'Unknown error'
        });
}