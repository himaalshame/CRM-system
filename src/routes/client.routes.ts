import { Router } from "express";
import { getClients , getClientById , createClient , updateClient , getInactiveClients , deleteClient , restoreClient } from "../controllers/client.controller";

const router = Router();

router.get("/", getClients);

router.get("/inactive" , getInactiveClients);

router.get('/:id' , getClientById);

router.post("/" , createClient);

router.patch("/:id" , updateClient);

router.delete("/:id", deleteClient);

router.patch("/:id/restore", restoreClient);

export default router;