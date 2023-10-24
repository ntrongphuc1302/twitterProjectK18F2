import express from 'express'
import { NextFunction, Request, Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    //xử lí error object
    for (const key in errorObject) {
      //lấy message của từng lỗi
      const { msg } = errorObject[key]
      //nếu msg có dạng ErrorWithStatus và status !== 422 thì ném về error handler
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }

      //lưu các lỗi 422 vào entityError từ errorObject
      entityError.errors[key] = msg
    }
    //ở đây nó xử lý lỗi luôn chứ ko ném về error handler
    next(entityError)
  }
}
