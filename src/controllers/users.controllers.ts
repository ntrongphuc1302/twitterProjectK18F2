import { Request, Response } from 'express'
import User from '~/models/schemas/User.schma'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import UsersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  LogoutReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  GetProfileReqParams,
  loginReqBody,
  registerReqBody
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Verify } from 'crypto'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, loginReqBody>, res: Response) => {
  // lấy user_id từ req.user
  const user = req.user as User
  const user_id = user._id as ObjectId
  // dùng user_id tạo access_token và refresh_token
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  // trả về access_token và refresh_token
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, registerReqBody>, res: Response) => {
  // throw new Error('test error')
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const refresh_token = req.body.refreshToken
  //logout sẽ nhận vào refresh_token tìm và xoá
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  //nếu code vào được đây thì email_verify_token đã được verify
  //và đã được decode thành user_id
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  //dựa vào user_id tìm user và xem thử nó đã verify email chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  //nếu mà k khớp email_verify_token thì throw error
  if (user.email_verify_token !== (req.body.email_verify_token as string)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //nếu mà user đã verify email rồi thì throw error
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu mà xuống được đây có nghĩa là user chưa verify email
  //mình sẽ update lại user đó
  const result = await usersService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  //nếu vào được đây thì access_token đã được verify
  //và mình đã lấy được decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  //dựa vào user_id tìm user và xem thử nó đã verify email chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED, //user bị banned
      status: HTTP_STATUS.FORBIDDEN //403
    })
  }
  //user này thật sự chưa verify email
  //email_verify_token sẽ được tạo lại
  //cập nhật lại user
  const result = await usersService.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  //lấy user_id từ user của req
  const { _id, verify } = req.user as User
  //dùng _id tìm và cập nhật user thêm vào forgot_password_token
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  //muốn đổi password thì cần user_id và password mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  //cập nhật
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  //muốn lấy profile của user thì cần user_id
  const { user_id } = req.decoded_authorization as TokenPayload
  //tìm user
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  //muốn update profile của user thì cần user_id và các thông tin mới
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  //update
  const result = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  //tìm user theo username
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}
