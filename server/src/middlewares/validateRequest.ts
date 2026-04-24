import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

export const validateRequest = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = (error as any).errors.map((issue: any) => `${issue.path.join('.')} is ${issue.message}`);
        next(new AppError(`Invalid input data. ${errorMessages.join('. ')}`, 400));
      } else {
        next(error);
      }
    }
  };
};
