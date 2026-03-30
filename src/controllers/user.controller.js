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

export const eliminarUsuario = async (req, res, next) => {
  try {
    const resultado = await userService.eliminarUsuario(
      parseInt(req.params.id),
      req.user  // requestingUser (id + rol)
    );
    res.json({ success: true, data: resultado });
  } catch (error) {
    next(error);
  }
};