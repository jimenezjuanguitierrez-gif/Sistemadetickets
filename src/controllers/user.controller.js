import * as userService from '../services/user.service.js';

export const obtenerUsuarios = async (req, res, next) => {
  try {
    const users = await userService.obtenerTodosLosUsuarios();
    res.json({
      success: true,
      userLogged: req.user,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};