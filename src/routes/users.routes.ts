import { Router } from 'express'
import { emailVerifyTokenController, loginController, logoutController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
import { warpAsync } from '~/utils/handlers'
const usersRoute = Router()

/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/
usersRoute.get('/login', loginValidator, warpAsync(loginController))

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
usersRoute.post('/register', registerValidator, warpAsync(registerController))

/*
des: đăng xuất
path: /users/logout
method: POST
headers: {Authorization: 'Bearer <accessToken>'}
body: {refreshToken}
*/
usersRoute.post('/logout', accessTokenValidator, refreshTokenValidator, warpAsync(logoutController))

/*
des: verify email
khi người dùng đăng ký thành công, hệ thống sẽ gửi email cho người dùng có link dạng như sau:
http://localhost:3000/users/verify-email?token=<email_verify_token>
nếu nhấn vào link thì sẽ tạo ra một request guwri lên email_verify_token lên server
server sẽ kiểm tra email_verify_token có hợp lệ hay không
thì từ decode email_verify_token sẽ lấy được user_id
và vào user_id sẽ update lại trường email_verified thành true, verify 1, update_at
path: /users/verify-email
method: POST
body: {email_verify_token: string}
*/
usersRoute.post('/verify-email', emailVerifyTokenValidator, warpAsync(emailVerifyTokenController))

export default usersRoute
