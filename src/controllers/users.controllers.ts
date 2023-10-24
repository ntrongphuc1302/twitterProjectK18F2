import { Request, Response } from 'express'
import User from '~/models/schemas/User.schma'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import UsersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { registerReqBody } from '~/models/requests/User.requests'

export const loginController = async (req: Request, res: Response) => {
  // lấy user_id từ req.user
  const { user }: any = req
  const user_id = user._id
  // dùng user_id tạo access_token và refresh_token
  const result = await usersService.login(user_id.toString())
  // trả về access_token và refresh_token
  res.json({
    message: 'Login successfully',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, registerReqBody>, res: Response) => {
  // throw new Error('test error')
  const result = await usersService.register(req.body)
  res.json({
    message: 'Regitered successfully',
    result
  })
}
