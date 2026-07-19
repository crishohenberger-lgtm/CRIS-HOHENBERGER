import { Router, type IRouter } from "express";
import healthRouter from "./health";
import perguntarRouter from "./perguntar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(perguntarRouter);

export default router;
