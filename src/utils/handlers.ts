import { RequestHandler } from 'express'
import { Request, Response, NextFunction } from 'express'

export const wrapAsync = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
