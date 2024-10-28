import express from "express";
import TransactionController from '../controllers/TransactionController.js'; 
const transactionRouter = express.Router();


transactionRouter.get("/search/transaction", TransactionController.searchTransactions);
transactionRouter.get("/:id", TransactionController.getByUserId);


export default transactionRouter;
