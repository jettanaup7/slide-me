import { Router } from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { getAllChats,
        getAllChatsByUser,
        getAllChatsByDriver,

        addNewChatByUser,
        addNewChatByDriver
      } 
from "../controllers/chatsController.js";

const chatsRouter = Router();

const JWT_SECRET = 'secret'

const jwtTokenMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.user = payload.id;
        req.role = payload.role;
        next(); // Move to the next middleware or route handler
    });
};

/**
 * @swagger
 * /chats/all:
 *   get:
 *     summary: Get all chat messages by user or driver
 *     description: |
 *                  - หากผู้ใช้เป็นลูกค้า (Customer) จะสามารถดึงข้อมูลการแชททั้งหมดที่เกี่ยวข้องกับคำสั่งซื้อที่ระบุ
 *                  - หากผู้ใช้เป็นคนขับ (Driver) จะสามารถดึงข้อมูลการแชททั้งหมดที่เกี่ยวข้องกับคำสั่งซื้อที่ระบุ
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  orderID:
 *                      type: integer
 *                      description: The order ID for which the chat message is being added
 *                      example: 1
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched chat messages
 *       400:
 *         description: Bad Request - Missing orderID
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// .... API
chatsRouter.get("/all", jwtTokenMiddleware, async (req, res) => {
  const { orderID } = req.body
    try {
        if (orderID === undefined) {
            return res.status(400).json({ message: "Bad Request: Missing orderID" });
        }

        if (req.role === 'Customer') {
            const userID = parseInt(req.user)
            const result = await getAllChatsByUser({ userID, orderID });

            return res.status(200).json({ message: "OK", result });
        }

        if (req.role === 'Driver') {
            const driverID = parseInt(req.user)
            const result = await getAllChatsByDriver({ driverID, orderID });

            return res.status(200).json({ message: "OK", result });
        }

        return res.status(400).json({ message: "Bad Request" });
    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
});

/**
 * @swagger
 * /chats/{orderID}:
 *   get:
 *     summary: Get all chat messages for a specific order
 *     description: Fetches all the chat messages related to a given order.
 *     tags: [Chats]
 *     parameters:
 *       - name: orderID
 *         in: path
 *         required: true
 *         description: The order ID for the chat messages
 *         schema:
 *           type: integer
 *           example: 12345
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched chat messages for the order
 *       400:
 *         description: Bad Request - Missing orderID
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
chatsRouter.get("/:orderID", jwtTokenMiddleware, async (req, res) => {
  const { orderID } = req.params
    try {
        if (orderID === undefined) {
            return res.status(400).json({ message: "Bad Request: Missing orderID" });
        }

        const result = await getAllChats({ orderID });
        return res.status(200).json({ message: "OK", result });

    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
});

/**
 * @swagger
 * /chats/add:
 *   post:
 *     summary: Add a new chat message for a specific order
 *     description: Adds a new message to the chat for the specified order.
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  orderID:
 *                      type: integer
 *                      description: The order ID for which the chat message is being added
 *                      example: 12345
 *                  message:
 *                      type: string
 *                      description: The message content to be sent
 *                      example: "I am ready to pick up the order."
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully added the chat message
 *       400:
 *         description: Bad Request - Missing orderID or message
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
chatsRouter.post("/add", jwtTokenMiddleware, async (req, res) => {
    const { orderID, message } = req.body
    try {
        if (orderID === undefined) {
          return res.status(400).json({ message: "Bad Request: Missing orderID" });
        }

        if (message === undefined) {
          return res.status(400).json({ message: "Bad Request: Missing message" });
        }

        if (req.role === 'Customer') {
            const userID = parseInt(req.user)
            const result = await addNewChatByUser({ userID, orderID, message });

            return res.status(200).json({ message: "OK", result });
        }

        if (req.role === 'Driver') {
            const driverID = parseInt(req.user)
            const result = await addNewChatByDriver({ driverID, orderID, message });

            return res.status(200).json({ message: "OK", result });
        }

        return res.status(400).json({ message: "Bad Request" });
    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
});

export default chatsRouter