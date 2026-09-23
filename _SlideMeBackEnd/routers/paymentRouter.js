import { Router } from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import {
  getPaymentDriver,getPaymentCustomer,getPaymentCustomerByUserID,getPaymentDriverByDriverID,
  addPaymentDriver,addPaymentCustomer,
  deletePaymentDriver,deletePaymentCustomer,
  updatePaymentDriver,updatePaymentCustomer,
} from "../controllers/paymentController.js";

const paymentRouter = Router();


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
 * /payment:
 *   get:
 *     summary: Retrieve all payments for drivers and customers
 *     description: |
 *       Retrieve a list of all payments for both drivers and customers.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved payments
 *       500:
 *         description: Error fetching payments
 */
paymentRouter.get("/", jwtTokenMiddleware, async (req, res) => {
  try {
    // เรียกฟังก์ชัน getPayments จาก controller
    const paymentsDriver = await getPaymentDriver();
    const paymentsCustomer = await getPaymentCustomer();

    // ส่งผลลัพธ์ในรูปแบบที่เหมาะสม
    res.json({
      paymentDriver: paymentsDriver,
      paymentCustomer: paymentsCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});

/**
 * @swagger
 * /payments/customer:
 *   get:
 *     summary: Retrieve payments for the current customer
 *     description: |
 *       Retrieve the list of payments for the customer who is currently logged in.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved customer payments
 *       500:
 *         description: Error fetching customer payments
 */
paymentRouter.get("/customer/", jwtTokenMiddleware, async (req, res) => {
  try {
    const userID = parseInt(req.user)
    const payments = await getPaymentCustomerByUserID(userID);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});

/**
 * @swagger
 * /payments/driver:
 *   get:
 *     summary: Retrieve payments for the current driver
 *     description: |
 *       Retrieve the list of payments for the driver who is currently logged in.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved driver payments
 *       500:
 *         description: Error fetching driver payments
 */
paymentRouter.get("/driver/", jwtTokenMiddleware, async (req, res) => {
  try {
    const driverID = parseInt(req.user)
    const payments = await getPaymentDriverByDriverID(driverID);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});

/**
 * @swagger
 * /payments/driver:
 *   post:
 *     summary: Add a payment method for a driver
 *     description: |
 *       Add a new payment method for a driver.
 *       Only a logged-in driver can use this API.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               description: The type of the payment method (e.g., Bank, Credit Card)
 *             name:
 *               type: string
 *               description: Name of the account holder
 *             accountNumber:
 *               type: string
 *               description: Account number for payment
 *     responses:
 *       201:
 *         description: Successfully added payment method for driver
 *       400:
 *         description: Invalid card number or missing required fields
 *       500:
 *         description: Error adding driver payment method
 */
paymentRouter.post("/driver", jwtTokenMiddleware, async (req, res) => {
  const { type, name, accountNumber } = req.body;
  const driverID = parseInt(req.user);

  if (isNaN(driverID)) {
    return res
      .status(400)
      .json({ message: "Invalid card number. It must be numeric." });
  }
  
  try {
    // เรียกฟังก์ชัน addPayment จาก controller และส่ง newId
    const result = await addPaymentDriver(
      driverID,
      type,
      name,
      accountNumber
    );
    res.status(201).json({ message: "Driver Payment added successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding Driver Payment", error: error.message });
  }
});

/**
 * @swagger
 * /payments/customer:
 *   post:
 *     summary: Add a payment method for a customer
 *     description: |
 *       Add a new payment method for a customer.
 *       Only a logged-in customer can use this API.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               description: The type of the payment method (e.g., Credit Card)
 *             cardNum:
 *               type: string
 *               description: The card number for payment
 *             CCV:
 *               type: string
 *               description: The CCV for the card
 *             expiredDate:
 *               type: string
 *               description: Expiration date of the card
 *     responses:
 *       201:
 *         description: Successfully added payment method for customer
 *       400:
 *         description: Invalid card number or missing required fields
 *       500:
 *         description: Error adding customer payment method
 */
paymentRouter.post("/customer", jwtTokenMiddleware, async (req, res) => {
  const { type, cardNum, CCV, expiredDate } = req.body;
  const userID = parseInt(req.user);

  if (isNaN(userID)) {
    return res
      .status(400)
      .json({ message: "Invalid card number. It must be numeric." });
  }

  try {
    // เรียกฟังก์ชัน addPayment จาก controller
    const result = await addPaymentCustomer(
      userID,
      type,
      cardNum,
      CCV,
      expiredDate
    );
    res.status(201).json({ message: "Customer Payment added successfully", result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding Customer payment", error: error.message });
  }
});

/**
 * @swagger
 * /payments/driver/{cpmID}:
 *   delete:
 *     summary: Delete a payment method for a driver
 *     description: |
 *       Delete a payment method for a driver using the `cpmID` parameter.
 *       Only a logged-in driver can delete their payment method.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: cpmID
 *         required: true
 *         description: The ID of the payment method to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted driver payment method
 *       404:
 *         description: Payment method not found for the given cpmID
 *       500:
 *         description: Error deleting driver payment method
 */
paymentRouter.delete("/driver/:cpmID", async (req, res) => {
  const { cpmID } = req.params;
  try {
    // เรียกฟังก์ชัน deletePayment จาก controller
    const result = await deletePaymentDriver(cpmID);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Driver Payment not found for the given cpmID" });
    }
    res.status(200).json({ message: "Driver Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Driver Payment", error: error.message });
  }
});

/**
 * @swagger
 * /payments/customer/{cpmID}:
 *   delete:
 *     summary: Delete a payment method for a customer
 *     description: |
 *       Delete a payment method for a customer using the `cpmID` parameter.
 *       Only a logged-in customer can delete their payment method.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: cpmID
 *         required: true
 *         description: The ID of the payment method to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted customer payment method
 *       404:
 *         description: Payment method not found for the given cpmID
 *       500:
 *         description: Error deleting customer payment method
 */
paymentRouter.delete("/customer/:cpmID", async (req, res) => {
  const { cpmID } = req.params;
  try {
    // เรียกฟังก์ชัน deletePayment จาก controller
    const result = await deletePaymentCustomer(cpmID);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer Payment not found for the given cpmID" });
    }
    res.status(200).json({ message: "Customer Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Customer Payment", error: error.message });
  }
});

/**
 * @swagger
 * /payments/customer:
 *   put:
 *     summary: Update the default payment method for a customer
 *     description: |
 *       Update the default payment method for a customer using the `cpmID` parameter.
 *       Only a logged-in customer can update their payment method.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             cpmID:
 *               type: string
 *               description: The ID of the payment method to update as default
 *     responses:
 *       200:
 *         description: Successfully updated default payment method for customer
 *       400:
 *         description: Missing userID or cpmID
 *       500:
 *         description: Error updating customer payment method
 */
paymentRouter.put("/customer", jwtTokenMiddleware, async (req, res) => {
  const { cpmID } = req.body;
  const userID = parseInt(req.user);

  if (!userID || !cpmID) {
    return res.status(400).json({ success: false, message: "Missing userID or cpmID" });
  }

  const result = await updatePaymentCustomer(userID, cpmID);

  if (result.success) {
    res.status(200).json("Customer Payment default updated successfully");
  } else {
    res.status(500).json("Error updating Customer Payment default");
  }
});

/**
 * @swagger
 * /payments/driver:
 *   put:
 *     summary: Update the default payment method for a driver
 *     description: |
 *       Update the default payment method for a driver using the `cpmID` parameter.
 *       Only a logged-in driver can update their payment method.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             cpmID:
 *               type: string
 *               description: The ID of the payment method to update as default
 *     responses:
 *       200:
 *         description: Successfully updated default payment method for driver
 *       400:
 *         description: Missing driverID or cpmID
 *       500:
 *         description: Error updating driver payment method
 */
paymentRouter.put("/driver", jwtTokenMiddleware, async (req, res) => {
  const { cpmID } = req.body;
  const driverID = parseInt(req.user);

  if (!driverID || !cpmID) {
    return res.status(400).json({ success: false, message: "Missing driverID or cpmID" });
  }

  const result = await updatePaymentDriver(driverID, cpmID);

  if (result.success) {
    res.status(200).json("Driver Payment default updated successfully");
  } else {
    res.status(500).json("Error updating driver payment default");
  }
});
export default paymentRouter;
