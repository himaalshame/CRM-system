import { Router } from "express";
import { getClients } from "../controllers/client.controller";

const router = Router();

router.get("/", getClients);

router.get("/inactive", (req, res) => {
    res.json({ message: "Get inactive clients" });
});

router.get("/:id", (req, res) => {
    res.json({ message: `Get client ${req.params.id}` });
});

router.post("/", (req, res) => {
    res.json({ message: "Create client" });
});

router.patch("/:id", (req, res) => {
    res.json({ message: `Update client ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
    res.json({ message: `Delete client ${req.params.id}` });
});

router.patch("/:id/restore", (req, res) => {
    res.json({ message: `Restore client ${req.params.id}` });
});

export default router;