//file này dùng để định nghĩa lại Req truyền lên từ client
import { Request } from 'express'
import { TokenPayload } from './models/requests/User.requests'

declare module 'express' {
  export interface Request {
    user?: User //trong 1 cái req có thể có hoặc không có user
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
