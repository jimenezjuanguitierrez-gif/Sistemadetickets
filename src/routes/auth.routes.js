import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)

// ruta protegida
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
})

export default router