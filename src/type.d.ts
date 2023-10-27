//file này dùng để định nghĩa lại Req truyền lên từ client
import { Request } from 'express'

declare module 'express' {
  export interface Request {
    user?: User //trong 1 cái req có thể có hoặc không có user
  }
}
