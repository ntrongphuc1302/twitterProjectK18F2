import { Router } from 'express'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { registerController } from '~/controllers/users.controllers'
import { wrapAsync } from '~/utils/handlers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
const usersRouter = Router()

/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/
usersRouter.get('/login', loginValidator, wrapAsync(loginController))

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
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
des: đăng xuất
path: /users/logout
method: POST
headers: {Authorization: 'Bearer <accessToken>'}
body: {refreshToken}
*/
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

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
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
des: resend email verify token
khi mail chưa được verify thì sẽ gửi lại email_verify_token
nhu cầu này sẽ được sử dụng khi người dùng quên mật khẩu

method: POST
path: /users/resend-email-verify-token
headers: {Authorization: "Bearer <access_token>"} //đăng nhập mới được resend
body: {}
*/

usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
des: khi người dùng quên mật khẩu, họ sẽ gửi email cho hệ thống yêu cầu reset password
//hệ thống sẽ tạo forgot_password_token và gửi email cho người dùng
//người dùng nhấn vào link trong email sẽ tạo ra một request gửi lên server
path: /users/reset-password
method: POST
body: {email: string}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
des: khi người dùng nhấn vào link trong email sẽ tạo ra một request gửi lên server
họ sẽ gửi 1 request forgot_password_token lên server
server sẽ kiểm tra forgot_password_token có hợp lệ hay không
sau đó chuyển hướng người dùng đến trang reset password
path: /users/verify-forgot-password
method: POST
body: {forgot_password_token: string}
*/

usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/*
des: khi người dùng đã nhận được email với link reset password
họ sẽ gửi 1 request reset_password lên server
server sẽ kiểm tra reset_password có hợp lệ hay không
sau đó update lại password mới cho user
path: /users/reset-password
method: POST
body: {forgot_password_token: string, password: string, confirm_password: string}
*/

usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des:: get profile của user
path: '/me'
method: GET
Header: {Authorization}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)
//truyền khác key là nó báo lỗi ngay

/*
des: get profile của user
path: '/:username'
method: GET
Header: {}
body: {}
*/
usersRouter.get('/:username', wrapAsync(getProfileController))

export default usersRouter
