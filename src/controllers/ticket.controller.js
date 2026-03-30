import * as ticketService from '../services/ticket.service.js';

export const crearTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.crearTicket(req.body, req.user.id);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const obtenerMisTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.obtenerMisTickets(req.user.id);
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const obtenerTicketsPorPC = async (req, res, next) => {
  try {
    const tickets = await ticketService.obtenerTicketsPorPC(parseInt(req.params.id));
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const obtenerTodosLosTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.obtenerTodosLosTickets();
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const ticket = await ticketService.cambiarEstado(
      parseInt(req.params.id),
      req.body.estado,
      req.user.id
    );
    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const eliminarTicket = async (req, res, next) => {
  try {
    const resultado = await ticketService.eliminarTicket(
      parseInt(req.params.id),
      req.user.id
    );
    res.json({ success: true, data: resultado });
  } catch (error) {
    next(error);
  }
};