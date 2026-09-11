import { Router } from "express";

import { 
    createOrder, 
    getOrders, 
    getOrderById, 
    updateOrder,
    cancelOrder,
    approveOrder, } from "../controllers/order.controller";


import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

import { validate } from "../middleware/validate.middleware";
import { createOrderSchema , updateOrderSchema, } from "../validators/order.validators";

const router = Router();


router.get("/", authenticate , getOrders);

router.get("/:id", authenticate , getOrderById);       

router.post("/",authenticate, authorize("ADMIN", "CLIENT") ,validate(createOrderSchema),createOrder);

router.patch("/:id",authenticate,authorize("ADMIN", "CLIENT") , validate(updateOrderSchema),updateOrder);

router.patch("/:id/approve", authenticate, authorize("ADMIN" ) , approveOrder);

router.patch("/:id/cancel",authenticate,authorize("ADMIN", "CLIENT"),cancelOrder);







export default router;