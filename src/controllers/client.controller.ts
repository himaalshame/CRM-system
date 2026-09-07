import {prisma} from '../config/prisma'
import { Request, Response } from "express";
import {
  getClients as getClientsService,
  getClientById as getClientByIdService,
  createClient as createClientService,
  updateClient as updateClientService,
  getInactiveClients as getInactiveClientsService,
  deleteClient as deleteClientService,
  restoreClient as restoreClientService,
} from "../services/client.service";
import { Client } from 'pg';


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




export const getClientById = async (req: Request<{id:string}>, res: Response) => {
  try {
    const client = await getClientByIdService(req.params.id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json(client);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch client",
    });
  }
};


export const createClient = async (
  req: Request,
  res: Response
) => {
  try {
    const client = await createClientService(req.body);

    res.status(201).json(client);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create client",
    });
  }
};

export const  updateClient = async (
  req: Request<{ id: string }>,
  res: Response
)=>{
  try{
    const client = await updateClientService (
      req.params.id ,
      req.body
    );
    res.json(client);
  }catch(error){
    console.error(error);

    res.status(500).json({
      message: "Failed to update client"
    })
  }
  
}


export const getInactiveClients = async (
  req: Request,
  res: Response
) => {
  try {
    const clients = await getInactiveClientsService();

    res.json(clients);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch inactive clients",
    });
  }
};


export const deleteClient = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const client = await deleteClientService(req.params.id);

    res.json({
      message: "Client deleted successfully",
      client,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete client",
    });
  }
};


export const restoreClient = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const client = await restoreClientService(req.params.id);

    res.json({
      message: "Client restored successfully",
      client,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to restore client",
    });
  }
};





