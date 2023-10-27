import jwt from 'jsonwebtoken'

// làm hàm nhận vào payload, private key, và options từ đó ký tên

export const signToken = ({
  payLoad,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  payLoad: string | object | Buffer
  privateKey?: string
  options: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payLoad, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}

// làm hàm nhận vào token, và secretOrPublicKey?
export const verifyToken = ({
  token,
  secreteOrPublicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secreteOrPublicKey?: string
}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secreteOrPublicKey, (error, decoded) => {
      if (error) throw reject(error)
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
