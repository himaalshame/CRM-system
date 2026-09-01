import { Request, Response } from "express";
import { getClients as getClientsService } from "../services/client.service";


export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await getClientsService();

    res.json(clients);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch clients",
    });
  }
};