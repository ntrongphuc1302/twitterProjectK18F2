import { RequestHandler } from 'express'
import { Request, Response, NextFunction } from 'express'

export const warpAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
