import { prisma } from '../config/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AppError } from '../middlewares/AppError.js'

export const register = async (data) => {
  const { nombre, email, password, rol } = data

  const existe = await prisma.user.findUnique({ where: { email } })
  if (existe) throw AppError.badRequest('El email ya está registrado')

  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { nombre, email, password: hash, rol }
  })

  const { password: _, ...userSinPassword } = user
  return userSinPassword
}

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw AppError.unauthorized('Credenciales incorrectas')

  const coincide = await bcrypt.compare(password, user.password)
  if (!coincide) throw AppError.unauthorized('Credenciales incorrectas')

  const token = jwt.sign(
    { userId: user.id, role: user.rol }, // 🔥 mejor así
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  return { token, rol: user.rol, nombre: user.nombre }
}