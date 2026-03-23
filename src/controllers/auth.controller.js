import * as authService from '../services/auth.service.js';

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      ...result, // incluye user + token
    });
} catch (error) {
  next(error); // ✅ delega al errorHandler global
}
};

export const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
} catch (error) {
  next(error); // ✅ delega al errorHandler global
}
};
