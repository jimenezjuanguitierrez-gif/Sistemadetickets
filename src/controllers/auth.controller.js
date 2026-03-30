import * as authService from '../services/auth.service.js'

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)

    res.status(201).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const result = await authService.login(email, password)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}