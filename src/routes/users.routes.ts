import { Router } from 'express'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  loginController,
  logoutController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
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

/*
des: resend email verify token
khi mail chưa được verify thì sẽ gửi lại email_verify_token
nhu cầu này sẽ được sử dụng khi người dùng quên mật khẩu

method: POST
path: /users/resend-email-verify-token
headers: {Authorization: "Bearer <access_token>"} //đăng nhập mới được resend
body: {}
*/

usersRoute.post('/resend-verify-email', accessTokenValidator, warpAsync(resendEmailVerifyController))

/*
des: khi người dùng quên mật khẩu, họ sẽ gửi email cho hệ thống yêu cầu reset password
//hệ thống sẽ tạo forgot_password_token và gửi email cho người dùng
//người dùng nhấn vào link trong email sẽ tạo ra một request gửi lên server
path: /users/reset-password
method: POST
body: {email: string}
*/
usersRoute.post('/forgot-password', forgotPasswordValidator, warpAsync(forgotPasswordController))

/*
des: khi người dùng nhấn vào link trong email sẽ tạo ra một request gửi lên server
họ sẽ gửi 1 request forgot_password_token lên server
server sẽ kiểm tra forgot_password_token có hợp lệ hay không
sau đó chuyển hướng người dùng đến trang reset password
path: /users/verify-forgot-password
method: POST
body: {forgot_password_token: string}
*/

usersRoute.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  warpAsync(verifyForgotPasswordTokenController)
)

export default usersRoute
