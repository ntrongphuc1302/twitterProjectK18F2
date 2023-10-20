import { Router } from 'express'
import { loginController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
const usersRoute = Router()

usersRoute.get('/login', loginValidator, loginController)

/**
 * registerValidator
 * Path: /register
 * Method: POST
 * Body:{
 *      name: string,
 *      email: string,
 *      password: string,
 *      confirm_password: string
 *      date_of_birth: string theo chuẩn ISO 8601
 * }
 */
usersRoute.post('/register', registerValidator, registerController)

export default usersRoute
