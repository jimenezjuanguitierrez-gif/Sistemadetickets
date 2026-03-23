export const isAdmin = (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: requiere rol admin',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verificando rol',
    });
  }
};
