import * as computadoraService from '../services/computadora.service.js';

export const obtenerComputadoras = async (req, res, next) => {
  try {
    const pcs = await computadoraService.obtenerComputadoras();
    res.json({ success: true, data: pcs });
  } catch (e) { next(e); }
};

export const obtenerComputadora = async (req, res, next) => {
  try {
    const pc = await computadoraService.obtenerComputadora(parseInt(req.params.id));
    res.json({ success: true, data: pc });
  } catch (e) { next(e); }
};

export const crearComputadora = async (req, res, next) => {
  try {
    const pc = await computadoraService.crearComputadora(req.body);
    res.status(201).json({ success: true, data: pc });
  } catch (e) { next(e); }
};

export const actualizarComputadora = async (req, res, next) => {
  try {
    const pc = await computadoraService.actualizarComputadora(parseInt(req.params.id), req.body);
    res.json({ success: true, data: pc });
  } catch (e) { next(e); }
};

// PATCH /computadoras/:id/descripcion-danio
// Accesible por PROFESOR, ADMIN y USER (alumnos también pueden editar)
export const actualizarDescripcionDanio = async (req, res, next) => {
  try {
    const pc = await computadoraService.actualizarDescripcionDanio(
      parseInt(req.params.id),
      req.body.descripcionDanio
    );
    res.json({ success: true, data: pc });
  } catch (e) { next(e); }
};

export const eliminarComputadora = async (req, res, next) => {
  try {
    const result = await computadoraService.eliminarComputadora(parseInt(req.params.id));
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};