import { Request, Response } from 'express'
import User from '~/models/schemas/User.schma'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import UsersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { registerReqBody } from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email == 'no@thanks.com' && password == 'nothanks') {
    return res.json({
      message: 'Login successfully!',
      result: [
        { name: 'Peter', yob: 2003 },
        { name: 'Peter2', yob: 2003 },
        { name: 'Peter3', yob: 2003 }
      ]
    })
  } else {
    return res.status(400).json({
      error: 'Go fuck yourself!'
    })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, registerReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    res.json({
      message: 'Registed Successfully',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'Registed Failed!',
      error
    })
  }
}
