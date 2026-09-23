import { Router } from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { getOrders, 
    getOrdersFromDriver,
    getOrdersFromCustomer,
    getOrdersById, 

    getOrdersDriverLocation,

    cancelOrder,

    createOrder,

    updateOrdersDriverLocation,

    sendPayment,

    updateOrder,
    getUpCar,

    getCustomerRequest,
    getCustomerRequestByDriver,
    getCusReqByID,
    cancelCustomerRequest,

    getDriverRequest,
    getDriverRequestByCustomer,
    getDriverRequestByCusReqID,
    getDriReqByID,

    getReview,
    createReview,

    createCustomerRequest,
    createDriverRequest,
} from "../controllers/ordersController.js";

const ordersRouter = Router();

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


// .... API

// ต้องการให้ Order สามารถทำงานได้ดังนี้

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Retrieve all orders for a logged-in user
 *     description: |
 *                  การเรียก GET ข้อมูล Order ทั้งหมดจะมีรายละเอียดดังนี้:
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าก็จะสามารถเข้าถึง**ข้อมูล Order ทั้งหมด**ของ__ไอดีของลูกค้า__ได้
 *                      - Response Packet จะส่งกลับมาเป็นรายการ Order ทั้งหมด
 *                      - เปรียบหน้าแอพก็คือลูกค้าจะเรียกใช้ API ตัวนี้เพื่อดูรายการทั้งหมด
 *                  - **Driver**
 *                      - หากเป็นคนขับก็จะสามารถเข้าถึง**ข้อมูล Order ทั้งหมด**ของ__ไอดีของคนขับ__ได้
 *                      - Response Packet จะส่งกลับมาเป็นรายการ Order ทั้งหมด
 *                      - เปรียบหน้าแอพก็คือคนขับจะเรียกใช้ API ตัวนี้เพื่อดูรายการทั้งหมด
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the orders.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       404:
 *         description: Orders not found.
 *       409:
 *         description: Conflict error.
 */
// GET [/orders]/all
ordersRouter.get('/all', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถ GET ข้อมูล Order ทั้งหมดของผู้ใช้ที่ล็อคอินในฝั่งคนขับ หรือลูกค้า แล้วนำข้อมูลออกมาได้
    try{
        if (req.role === 'Driver') {
            const id = parseInt(req.user)
            const result = await getOrdersFromDriver({ id })

            return res.status(200).json({message: 'OK', result})
        }

        if (req.role === 'Customer') {
            const id = parseInt(req.user)
            const result = await getOrdersFromCustomer({ id })
            
            return res.status(200).json({message: 'OK', result})
        }

        return res.status(404).json({message: 'Not Found'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
})


/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Retrieve a specific order for a logged-in user
 *     description: |
 *                  การเรียก GET ข้อมูล Order จากไอดีจะมีรายละเอียดดังนี้:
 *                  - กรอก `id` ออเดอร์ซึ่งเป็น **parameter** ที่จะส่งเข้ามา
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าก็จะตรวจสอบว่า**ออเดอร์**ที่เลือกมี **ไอดีของลูกค้า** ที่เป็น FKตรงกับ **ไอดีของลูกค้า** ที่ล็อคอินหรือไม่
 *                      - หากมีสิทธิ์เข้าถึง **Response Packet** จะส่งกลับมาเป็นรายการ Order ดังกล่าว
 *                  - **Driver**
 *                      - หากเป็นคนขับก็จะตรวจสอบว่า**ออเดอร์**ที่เลือกมี **ไอดีของคนขับ** ที่เป็น FKตรงกับ **ไอดีของคนขับ** ที่ล็อคอินหรือไม่
 *                      - หากมีสิทธิ์เข้าถึง **Response Packet** จะส่งกลับมาเป็นรายการ Order ดังกล่าว
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ไอดีออเดอร์ดังกล่าวที่อยู่ในระบบ (โดยปกติแล้วในระบบแอพจะกรอกให้เมื่อเลือกจาก GET ALL)
 *         example: 1
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the order.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       403:   
 *         description: Forbidden.
 *       409:
 *         description: Conflict error.
 */
// GET [/orders]/:id
ordersRouter.get('/:id', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถ GET ข้อมูล Order ของผู้ใช้ที่ล็อคอินในฝั่งคนขับ หรือลูกค้า โดยเลือกตาม ID แล้วนำข้อมูลออกมาได้
    try{
        const orderId = parseInt(req.params.id)
        const id = parseInt(req.user)
        const role = req.role
        const result = await getOrdersById({ orderId, id, role })

        if (result[0].customerID === id && role === 'Customer') {
            return res.status(200).json({message: 'OK', result})
        }

        if (result[0].driverID === id && role === 'Driver') {
            return res.status(200).json({message: 'OK', result})
        }

        return res.status(403).json({message: 'Forbidden'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
})

/**
 * @swagger
 * /orders/{id}/driver-location:
 *   get:
 *     summary: Get driver's location for a specific order
 *     description: |
 *                  ใช้เพื่อดึงตำแหน่งของคนขับจากออเดอร์ที่เลือก
 *                  - ตรวจสอบ TOKEN และสิทธิ์ของผู้ใช้งาน
 *                  - คืนค่าตำแหน่ง (latitude, longitude) ของคนขับในออเดอร์ที่ระบุ
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ไอดีของออเดอร์ที่ต้องการดึงตำแหน่งคนขับ
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Success - Driver's location retrieved
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       409:
 *         description: Conflict - Error occurred
 */
ordersRouter.get('/:id/driver-location', jwtTokenMiddleware, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id)
        const id = parseInt(req.user)
        const result = await getOrdersDriverLocation({ orderId, id})

        return res.status(200).json({message: 'OK', result})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
})

/**
 * @swagger
 * /orders/driver-location:
 *   put:
 *     summary: Update the driver’s current location for an order
 *     description: |
 *                  ใช้เพื่ออัพเดทตำแหน่งของคนขับในแต่ละออเดอร์
 *                  - ต้องระบุ orderID, orderLatitude และ orderLongitude
 *                  - ใช้ได้เฉพาะฝั่ง Driver เท่านั้น
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderID
 *               - orderLatitude
 *               - orderLongitude
 *             properties:
 *               orderID:
 *                 type: integer
 *                 example: 1
 *               orderLatitude:
 *                 type: number
 *                 format: float
 *                 example: 13.7563
 *               orderLongitude:
 *                 type: number
 *                 format: float
 *                 example: 100.5018
 *     responses:
 *       200:
 *         description: Successfully updated the driver's location
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       409:
 *         description: Conflict - Error occurred
 */
ordersRouter.put('/driver-location', jwtTokenMiddleware, async (req, res) => {
    try {
        const {orderID, orderLatitude, orderLongitude} = req.body
        const id = parseInt(req.user)
        const result = await updateOrdersDriverLocation({ orderID, id, orderLatitude, orderLongitude})

        return res.status(200).json({message: 'OK', result})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
})

/**
 * @swagger
 * /orders/add:
 *   post:
 *     summary: Create a new order.
 *     description: |
 *                  การสร้าง Order จะมีรายละเอียดดังนี้:
 *                  - กรอก `cusReqID` และ `driReqID` ส่งให้ทาง **body** ของ request packet (จะได้รับไอดีเหล่านี้จาก API /orders/cusReq และ API /orders/driverReq ในส่วน Requests for Order)
 *                  - โดยแต่ละอันจะมีรายละเอียดดังนี้
 *                      - `cusReqID` คือ ไอดีคำร้องขอจากลูกค้า (ดูจาก cusReq)
 *                      - `driReqID` คือ ไอดีข้อเสนอจากคนขับที่ลูกค้าเลือก (ดูจาก driverReq)
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าก็จะตรวจสอบว่า**คำร้องขอลูกค้า**ที่เลือกมี **ไอดีของลูกค้า** ที่เป็น FKตรงกับ **ไอดีของลูกค้า** ที่ล็อคอินหรือไม่
 *                      - ระบบจะสร้าง**ออเดอร์ใหม่**จาก**ข้อมูลคำร้องขอ**ของลูกค้า และ**ข้อมูลข้อเสนอ**ของคนขับ**ที่เลือกใช้บริหาร** โดยจะปฏิเสธ**คนขับอื่นๆ**ที่ส่งข้อเสนอมาที่คำร้องของลูกค้า
 *                      - สถานะเริ่มต้นของ status คือ current และ isPay คือ 0
 *                      - **Response Packet** จะเก็บข้อมูลออเดอร์ใหม่ที่สร้างได้
 *                  - **Driver**
 *                      - หากเป็นคนขับจะไม่มีสิทธิ์เข้าถึง API ตัวนี้
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cusReqID
 *               - driReqID
 *             properties:
 *               cusReqID:
 *                 type: integer
 *                 example: 1
 *               driReqID:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully created the order.
 *       400:
 *         description: Bad request - User is not Customer.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       409:
 *         description: Conflict error.
 *
 */
// POST [/orders]/add
ordersRouter.post('/add', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถสร้างออเดอร์ใหม่ เมื่อมีการตอบรับจากลูกค้าได้ ซึ่งจะเมื่อมีการตอบรับแล้วจะปรับสถานะของ Request Customer และ Driver ที่ส่งคําขอมาเป็น 'accepted'
    // หากมี Request Driver ที่มากกว่า 1 อัน จะปฏิเสธข้อเสนอดังกล่าวเป็น 'cancel'
    // ผู้เข้าถึงส่วนนี้คือ Customer
    try{
        const { cusReqID, driReqID, orderLongitude, orderLatitude, orderDate } = req.body;
        const userID = parseInt(req.user)

        if (req.role !== 'Customer') {
            return res.status(400).json({message: 'Bad Request'})
        }

        const result = await createOrder({ userID, cusReqID, driReqID, orderLongitude, orderLatitude, orderDate })

        return res.status(200).json({ message: "Successfully created the order", result });
    }
    catch(error){
        return res.status(409).json({message: "Conflict"})
    }
})


/** 
 * @swagger
 * /orders/sendPayment:
 *   put:
 *     summary: Update Order (Customer Send Pay Evidence)
 *     description: |
 *                  การส่งหลักฐานยืนยันการชำระเพื่ออัพเดตออเดอร์ จะมีรายละเอียดดังนี้:
 *                  - กรอก `orderID` และ `evidence` ส่งให้ทาง **body** ของ request packet
 *                  - โดยแต่ละอันจะมีรายละเอียดดังนี้
 *                      - `orderID` คือ ไอดีของออเดอร์
 *                      - `evidence` คือ หลักฐานการชำระเงิน (ในอนาคตอาจเป็นสลิป ตอนนี้กรอกอะไรก็ได้)
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าก็จะตรวจสอบว่า**ออเดอร์**ที่เลือกมี **ไอดีของลูกค้า** ที่เป็น FKตรงกับ **ไอดีของลูกค้า** ที่ล็อคอินหรือไม่
 *                      - จะบันทึกหลักฐานการชำระเงินของลูกค้าเอาไว้ (ตอนนี้ API ทำเพียง console.log หลักฐานออกมาเท่านั้น)
 *                      - **Response Packet** จะอัพเดตข้อมูล**การจ่ายเงิน(isPay)**ของออเดอร์ดังกล่าว
 *                  - **Driver**
 *                      - หากเป็นคนขับจะไม่มีสิทธิ์เข้าถึง API ตัวนี้
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderID
 *               - evidence
 *             properties:
 *               orderID:
 *                 type: integer
 *                 example: 1
 *               evidence:
 *                 type: string
 *                 example: base 64 image
 *     responses:
 *       200:
 *         description: Successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Conflict error.
 */
// PUT [/orders]/sendPayment
ordersRouter.put('/sendPayment', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถอัพเดตออเดอร์เมื่อลูกค้าชำระเงินเป็นที่เรียบร้อยแล้ว
    // ผู้เข้าถึงส่วนนี้ได้คือ Customer
    try{
        const { orderID, evidence } = req.body;
        const userID = parseInt(req.user)

        if (!evidence) {
            return res.status(400).json({message: 'Bad Request'})
        }

        if (req.role !== 'Customer') {
            return res.status(403).json({message: 'Forbidden'})
        }

        console.log(`หลักฐานการชำระเงินของออเดอร์ ${orderID}: `, evidence)

        const result = await sendPayment({ userID, orderID })

        if (result === "Forbidden") {
            return res.status(403).json({message: 'Forbidden'})
        }
        if (result === "Already sent payment") {
            return res.status(400).json({message: 'Bad Request: Already Sent Payment'})
        }

        return res.status(200).json({ message: result });
    }
    catch(error){
        return res.status(409).json({message: "Conflict"})
    }
})

/**
 * @swagger
 * /orders/cancelOrder:
 *   put:
 *     summary: Cancel an order
 *     description: |
 *                  ใช้เพื่อยกเลิกออเดอร์ที่ระบุ โดยต้องระบุ orderID ใน request body
 *                  - ต้องมีการตรวจสอบ TOKEN ของผู้ใช้งานที่ยืนยันสิทธิ์การยกเลิก
 *                  - คำสั่งนี้สามารถทำได้เฉพาะในบางสถานะออเดอร์
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderID
 *             properties:
 *               orderID:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully canceled the order
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       409:
 *         description: Conflict - Error occurred
 */
ordersRouter.put('/cancelOrder', jwtTokenMiddleware, async (req, res) => {
    try{
        const { orderID } = req.body;

        const result = await cancelOrder({ orderID })
        return res.status(200).json({ message: result });
    }
    catch(error){
        return res.status(409).json({message: "Conflict"})
    }
})

/** 
 * @swagger
 * /orders/update:
 *   put:
 *     summary: Update Order (Driver Update Status)
 *     description: |
 *                  การอัพเดตสถานะออเดอร์ จะมีรายละเอียดดังนี้:
 *                  - กรอก `orderID` , `status` และ `evidence` ส่งให้ทาง **body** ของ request packet
 *                  - โดยแต่ละอันจะมีรายละเอียดดังนี้
 *                      - `orderID` คือ ไอดีของออเดอร์
 *                      - `status` คือ สถานะออเดอร์ (มีแค่ current, scheduled, history)
 *                      - `evidence` คือ หลักฐานการทำออเดอร์ (ในอนาคตอาจเป็นภาพ ตอนนี้กรอกอะไรก็ได้)
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าจะไม่มีสิทธิ์เข้าถึง API ตัวนี้
 *                  - **Driver**
 *                      - หากเป็นลูกค้าก็จะตรวจสอบว่า**ออเดอร์**ที่เลือกมี **ไอดีของคนขับ** ที่เป็น FKตรงกับ **ไอดีของคนขับ** ที่ล็อคอินหรือไม่
 *                      - จะบันทึกหลักฐานการทำงานของคนขับเอาไว้ (ตอนนี้ API ทำเพียง console.log หลักฐานออกมาเท่านั้น)
 *                      - **Response Packet** จะอัพเดตข้อมูล**สถานะ(status)**ของออเดอร์ดังกล่าว
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderID
 *               - status
 *               - evidence
 *             properties:
 *               orderID:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: current
 *               evidence:
 *                 type: string
 *                 example: base64 image link
 *     responses:
 *       200:
 *         description: Successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Conflict error.
 */
// PUT [/orders]/update
ordersRouter.put('/update', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถอัพเดตออเดอร์เมื่อมีการตอบรับจากลูกค้าได้
    // ผู้เข้าถึงส่วนนี้ได้คือ Driver
    try{
        const { orderID, status, description, evidence } = req.body;
        const driverID = parseInt(req.user)

        if (status !== 'current' && status !== 'scheduled' && status !== 'history') {
            return res.status(400).json({message: 'Bad Request'})
        }

        if (req.role !== 'Driver') {
            return res.status(403).json({message: 'Forbidden'})
        }

        if (!evidence) {
            return res.status(400).json({message: 'Bad Request'})
        }

        console.log(`หลักฐานการอัพสถานะของออเดอร์ ${orderID}: `,evidence)

        const result = await updateOrder({ driverID, orderID, description, evidence, status })

        if (result === "Forbidden") {
            return res.status(403).json({message: 'Forbidden'})
        }

        if (result === "Already updated") {
            return res.status(400).json({message: 'Bad Request: Already updated this status.'})
        }

        return res.status(200).json({ message: result });
    }
    catch(error){
        return res.status(409).json({message: "Conflict"})
    }
})

/**
 * @swagger
 * /orders/getUpCar:
 *   get:
 *     summary: Get the driver's car details for an order
 *     description: |
 *                  ใช้เพื่อดึงข้อมูลรถของคนขับในออเดอร์
 *                  - ต้องระบุ orderID ผ่าน query parameters
 *                  - จะได้รับข้อมูลที่เกี่ยวข้องกับยานพาหนะของคนขับ
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: orderID
 *         in: query
 *         required: true
 *         description: ไอดีของออเดอร์ที่ต้องการดึงข้อมูลรถ
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Success - Car details retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       409:
 *         description: Conflict - Error occurred
 */
ordersRouter.put('/getCar', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถอัพเดตออเดอร์เมื่อมีการตอบรับจากลูกค้าได้
    // ผู้เข้าถึงส่วนนี้ได้คือ Driver
    try{
        const { orderID, description, evidence } = req.body;
        const driverID = parseInt(req.user)

        if (req.role !== 'Driver') {
            return res.status(403).json({message: 'Forbidden'})
        }

        if (!evidence) {
            return res.status(400).json({message: 'Bad Request'})
        }

        console.log(`หลักฐานการยกรถของออเดอร์ ${orderID}: `,evidence)

        const result = await getUpCar({ driverID, orderID, description, evidence })

        if (result === "Forbidden") {
            return res.status(403).json({message: 'Forbidden'})
        }

        if (result === "Already updated") {
            return res.status(400).json({message: 'Bad Request: Already updated this status.'})
        }

        return res.status(200).json({ message: result });
    }
    catch(error){
        return res.status(409).json({message: "Conflict"})
    }
})

// Customer Request Side


/** 
 * @swagger
 * /orders/cusReq/all:
 *  get:
 *      summary: Retrieve All Customer Request
 *      description: |
 *                   การเรียก GET ข้อมูลคำร้องขอใช้บริการของลูกค้า จะมีรายละเอียดดังนี้:
 *                      - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                      - **Customer**
 *                      - หากเป็นลูกค้าก็จะสามารถเข้าถึง**ข้อมูลคำร้องขอทั้งหมด**ของ__ไอดีของลูกค้า__ได้
 *                      - Response Packet จะส่งกลับมาเป็นรายการคำร้องขอทั้งหมด
 *                   - **Driver**
 *                      - หากเป็นคนขับก็จะสามารถเข้าถึง**ข้อมูลคำร้องขอ**__ที่ยังไม่ถูกตอบรับ__หรือมีค่าเป็น__waited__ทั้งหมดได้
 *                      - Response Packet จะส่งกลับมาเป็นรายการคำร้องขอทั้งหมด
 *      tags: 
 *          - Requests for Order
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Successfully.
 *          400:
 *              description: Bad request.
 *          401:
 *              description: Unauthorized, missing or invalid token.
 *          403:
 *              description: Forbidden.
 */
// GET [/orders]/cusReq/all
ordersRouter.get('/cusReq/all', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ที่ล็อคอินในฝั่งลูกค้า สามารถ GET ข้อมูลการส่งคำขอทั้งหมดของเขา แล้วนำข้อมูลออกมาได้
    // หากผู้ใช้ API นี้เป็นฝั่งคนขับก็จะดึงคำขอในระบบทั้งหมดที่มีค่าเป็น 'waited' ออกมา
    try{
        const id = parseInt(req.user)
        if (req.role === 'Driver') {
            const result = await getCustomerRequestByDriver()

            if (result.length === 0) {
                return res.status(200).json({message: 'No Request'})
            }

            return res.status(200).json({message: 'OK', result})
        }

        if (req.role === 'Customer') {
            const result = await getCustomerRequest({ id })

            if (result.length === 0) {
                return res.status(200).json({message: 'No Request from Driver'})
            }
            
            return res.status(200).json({message: 'OK', result})
        }

        return res.status(403).json({message: 'Forbidden'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/cusReq/{id}:
 *  get:
 *      summary: Retrieve Customer Request
 *      description: |
 *                  การเรียก GET ข้อมูลคำร้องขอใช้บริการของลูกค้าที่เลือก จะมีรายละเอียดดังนี้:
 *                  - กรอก `id` คำร้องขอซึ่งเป็น **parameter** ที่จะส่งเข้ามา
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าก็จะตรวจสอบว่า**คำร้องขอ**ที่เลือกมี **ไอดีของลูกค้า** ที่เป็น FKตรงกับ **ไอดีของลูกค้า** ที่ล็อคอินหรือไม่
 *                      - หากมีสิทธิ์เข้าถึง **Response Packet** จะส่งกลับมาเป็นคำร้องขอดังกล่าว
 *                  - **Driver**
 *                      - หากเป็นคนขับก็จะไม่มีสิทธิ์เข้าถึง API ส่วนนี้
 *      tags:
 *          - Requests for Order
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Successfully.
 *          400:
 *              description: Bad request.
 *          401:
 *              description: Unauthorized, missing or invalid token.
 *          403:
 *              description: Forbidden.
 *          404:
 *              description: Not Found
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: integer
 *            description: ไอดีของคำร้องขอ
 *            example: 1
 */
// GET [/orders]/cusReq/:id
ordersRouter.get('/cusReq/:id', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ที่ล็อคอินในฝั่งลูกค้า สามารถ GET ข้อมูลการส่งคำขอ โดยเลือกตาม ID แล้วนำข้อมูลออกมาได้
    try{
        const cusReqID = parseInt(req.params.id)
        const id = parseInt(req.user)
        const role = req.role
        const result = await getCusReqByID({ cusReqID, id, role })

        if (result[0].customerID === id && role === 'Customer') {
            return res.status(200).json({message: 'OK', result})
        }

        if (role === 'Driver') {
            return res.status(403).json({message: 'Forbidden'})
        }

        return res.status(403).json({message: 'Forbidden'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/cusReq/add:
 *  post:
 *      summary: Create Customer Request
 *      description: |
 *                   การสร้างคำร้องขอใช้บริการของลูกค้า จะมีรายละเอียดดังนี้:
 *                   - กรอก `orderDate`, `address1`, `address2`, `carType`, `carDetails`, `payment` และ `orderPictures` ส่งให้ทาง **body** ของ request packet
 *                   - โดยแต่ละอันจะมีรายละเอียดดังนี้
 *                      - `orderDate` คือ วันที่ของคำขอ
 *                      - `address1` คือ ต้นทาง
 *                      - `address2` คือ ปลายทาง
 *                      - `carType` คือ ประเภทรถ
 *                      - `carDetails` คือ รายละเอียดรถ
 *                      - `payment` คือ วิธีการชําระเงิน (พร้อมเพย์/บัตรเครดิต)
 *                      - `orderPictures` คือ รูปภาพของรถ
 *                   - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                   - **Customer**
 *                       - หากเป็นลูกค้าก็จะดำเนินขั้นตอนในการสร้างคำร้องขอ
 *                       - **Response Packet** จะเก็บข้อมูลคำร้องขอใหม่ที่สร้างได้
 *                   - **Driver**
 *                       - หากเป็นคนขับจะไม่มีสิทธิ์เข้าถึง API ตัวนี้
 *      tags:
 *          - Requests for Order
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - orderDate
 *                          - address1
 *                          - address2
 *                          - carType
 *                          - carDetails
 *                          - payment
 *                          - orderPictures
 *                      properties:
 *                          orderDate:
 *                              type: string
 *                              format: date-time
 *                              example: "2025-03-23 16:49:00"
 *                          address1:
 *                              type: string
 *                              example: "123 ถนนสุขุมวิท ซอย 10 แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
 *                          address2:
 *                              type: string
 *                              example: "456 ถนนสุขุมวิท ซอย 22 แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
 *                          carType:
 *                              type: string
 *                              example: "SUV"
 *                          carDetails:
 *                              type: string
 *                              example: "รถยนต์ 2 คน"
 *                          payment:
 *                              type: string
 *                              example: "พร้อมเพย์"
 *                          orderPictures:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  format: url
 *                              example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *      responses:
 *          200:
 *              description: Successfully.
 *          400:
 *              description: Bad request.
 *          401:
 *              description: Unauthorized, missing or invalid token.
 *          403:
 *              description: Forbidden.
 *          404:
 *              description: Not Found
 */
// POST [/orders]/cusReq/add
ordersRouter.post('/cusReq/add', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ที่ล็อคอินในฝั่งลูกค้า สามารถสร้างคำขอใหม่จากลูกค้าได้

    // SELECT cr.cusReqID, cr.userID As customerID, cp.name AS customerName, c.user AS customerUsername, cr.orderDate, cr.status AS requestStatus, cr.address1 AS pickupLocation, cr.address2 AS dropoffLocation, cr.carType, cr.carDetails, cr.payment,IFNULL(GROUP_CONCAT(DISTINCT op.picURL ORDER BY op.picURL ASC SEPARATOR ','), '') AS orderPictures FROM customerRequest cr JOIN customers c ON cr.userID = c.userID JOIN customerProfile cp ON c.userID = cp.userID LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID WHERE cr.userID = ? GROUP BY cr.cusReqID ORDER BY cr.orderDate DESC
    try{
        const id = parseInt(req.user)
        const { orderDate, address1, address2, carType, otherCarType, carDetails, orderPictures, callType } = req.body

        if (req.role !== 'Customer') {
            return res.status(403).json({message: 'Forbidden'})
        }

        if (carType == 'other') {
            const result = await createCustomerRequest({ id, orderDate, address1, address2, carType: otherCarType, carDetails, orderPictures, callType })
            return res.status(200).json({message: result})
        }

        const result = await createCustomerRequest({ id, orderDate, address1, address2, carType, carDetails, orderPictures, callType })
        return res.status(200).json({message: result})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/cusReq/cancel:
 *   put:
 *     summary: Cancel a customer request
 *     description: |
 *                  ใช้เพื่อยกเลิกคำขอที่ลูกค้าส่งไปแล้ว
 *                  - ลูกค้าต้องล็อกอินและมีสิทธิ์ในการยกเลิกคำขอที่เป็นของตนเอง
 *                  - การเข้าถึงส่วนนี้จะต้องมีบทบาทเป็น "Customer"
 *                  - หากคำขอถูกยกเลิกไปแล้วจะได้รับข้อความว่า "Already cancelled"
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cusReqID
 *             properties:
 *               cusReqID:
 *                 type: integer
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Successfully canceled the customer request
 *       400:
 *         description: Bad Request - Already cancelled this request
 *       403:
 *         description: Forbidden - Access denied for non-customer roles
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
ordersRouter.put('/cusReq/cancel', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ที่ล็อคอินในฝั่งลูกค้า สามารถยกเลิกคำขอที่ส่งไปแล้วได้
    // ผู้เข้าถึงส่วนนี้ได้คือ Customer
    try{
        const cusReqID = parseInt(req.body.cusReqID)
        const id = parseInt(req.user)

        console.log(`ยกเลิกคำร้องขอ ${cusReqID} ของลูกค้า ${id}`)

        if (req.role !== 'Customer') {
            return res.status(403).json({message: 'Forbidden'})
        }

        const result = await cancelCustomerRequest({ id, cusReqID })

        if (result === "Already cancelled") {
            return res.status(400).json({message: 'Bad Request: Already cancelled this request.'})
        }

        return res.status(200).json({ message: result });
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
})

// Driver Request Side

/** 
 * @swagger
 * /orders/driverReq/all:
 *  get:
 *      summary: Retrieve All Driver Request
 *      description: |
 *                   การเรียก GET ข้อมูลข้อเสนอของคนขับ จะมีรายละเอียดดังนี้:
 *                      - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                   - **Customer**
 *                      - หากเป็นลูกค้าก็จะสามารถเข้าถึง**ข้อมูลข้อเสนอ**ที่ส่งมาที่__คำร้องขอของลูกค้า__ทั้งหมดได้
 *                      - Response Packet จะส่งกลับมาเป็นรายการคำร้องขอทั้งหมด
 *                   - **Driver**
 *                      - หากเป็นคนขับก็จะสามารถเข้าถึง**ข้อมูลข้อเสนอทั้งหมด**ของ__ไอดีของคนขับ__ได้
 *                      - Response Packet จะส่งกลับมาเป็นรายการคำร้องขอทั้งหมด
 *      tags: 
 *          - Requests for Order
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Successfully.
 *          400:
 *              description: Bad request.
 *          401:
 *              description: Unauthorized, missing or invalid token.
 *          403:
 *              description: Forbidden.
 */
// GET [/orders]/driverReq/all
ordersRouter.get('/driverReq/all', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ใช้ที่ล็อคอินในฝั่งคนขับ สามารถ GET ข้อมูลการส่งคำขอทั้งหมดของเขา แล้วนำข้อมูลออกมาได้
    // หากผู้ใช้ API นี้เป็นฝั่งลูกค้าก็จะดึงคำขอในระบบทั้งหมดที่มีค่าเป็น 'waited' และ มี customerID ที่ตรงกับผู้ใช้ที่ล็อคออกมา
    try{
        const id = parseInt(req.user)
        if (req.role === 'Driver') {
            const result = await getDriverRequest({ id })

            if (result.length === 0) {
                return res.status(200).json({message: 'No Request from Customer'})
            }

            return res.status(200).json({message: 'OK', result})
        }
        
        if (req.role === 'Customer') {
            const result = await getDriverRequestByCustomer({ id })

            if (result.length === 0) {
                return res.status(200).json({message: 'No Request'})
            }

            return res.status(200).json({message: 'OK', result})
        }

        return res.status(403).json({message: 'Forbidden'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/driverReq/byCusID/{cusReqID}:
 *   get:
 *     summary: Get driver requests by customer request ID
 *     description: |
 *                  ใช้เพื่อดึงข้อมูลคำขอการขับขี่ของผู้ขับรถทั้งหมดที่ตรงกับคำขอของลูกค้า
 *                  - หากผู้ใช้ล็อกอินเป็น "Customer" ระบบจะดึงข้อมูลคำขอที่มีสถานะเป็น "waited" และตรงกับ customerID
 *                  - หากผู้ใช้ล็อกอินเป็น "Driver" จะดึงข้อมูลคำขอที่ส่งมาจากตัวผู้ขับขี่นั้น
 *     tags: [Requests for Order]
 *     parameters:
 *       - in: path
 *         name: cusReqID
 *         required: true
 *         description: The customer request ID to retrieve driver requests by
 *         schema:
 *           type: integer
 *           example: 12345
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the driver requests
 *         content:
 *           application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: OK
 *               result:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     requestID:
 *                       type: integer
 *                       example: 67890
 *                     driverID:
 *                       type: integer
 *                       example: 101
 *                     status:
 *                       type: string
 *                       example: 'waited'
 *       403:
 *         description: Forbidden - Access denied for non-customer or non-driver roles
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
ordersRouter.get('/driverReq/byCusID/:cusReqID', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ใช้ที่ล็อคอินในฝั่งคนขับ สามารถ GET ข้อมูลการส่งคำขอทั้งหมดของเขา แล้วนำข้อมูลออกมาได้
    // หากผู้ใช้ API นี้เป็นฝั่งลูกค้าก็จะดึงคำขอในระบบทั้งหมดที่มีค่าเป็น 'waited' และ มี customerID ที่ตรงกับผู้ใช้ที่ล็อคออกมา
    try{
        const id = parseInt(req.user)
        const cusReqID = parseInt(req.params.cusReqID)
        if (req.role === 'Customer') {
            const result = await getDriverRequestByCusReqID({ id, cusReqID })

            if (result.length === 0) {
                return res.status(200).json({message: 'No Request'})
            }

            return res.status(200).json({message: 'OK', result})
        }

        return res.status(403).json({message: 'Forbidden'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/driverReq/{id}:
 *  get:
 *      summary: Retrieve Driver Request
 *      description: |
 *                  การเรียก GET ข้อมูลข้อเสนอของคนขับ จะมีรายละเอียดดังนี้:
 *                  - กรอก `id` คำร้องขอซึ่งเป็น **parameter** ที่จะส่งเข้ามา
 *                  - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                  - **Customer**
 *                      - หากเป็นลูกค้าก็จะไม่มีสิทธิ์เข้าถึง API ส่วนนี้
 *                  - **Driver**
 *                      - หากเป็นคนขับก็จะตรวจสอบว่า**คำร้องขอ**ที่เลือกมี **ไอดีของคนขับ** ที่เป็น FKตรงกับ **ไอดีของคนขับ** ที่ล็อคอินหรือไม่
 *                      - หากมีสิทธิ์เข้าถึง **Response Packet** จะส่งกลับมาเป็นคำร้องขอดังกล่าว
 *      tags:
 *          - Requests for Order
 *      security:
 *          - BearerAuth: []
 *      responses:
 *          200:
 *              description: Successfully.
 *          400:
 *              description: Bad request.
 *          401:
 *              description: Unauthorized, missing or invalid token.
 *          403:
 *              description: Forbidden.
 *          404:
 *              description: Not Found
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: integer
 *            description: ไอดีของข้อเสนอ
 *            example: 1
 */
// GET [/orders]/driverReq/:id
ordersRouter.get('/driverReq/:id', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้สามารถ GET ข้อมูลการส่งคำขอของผู้ใช้ที่ล็อคอินในฝั่งคนขับ โดยเลือกตาม ID แล้วนำข้อมูลออกมาได้
    try{
        const driverReqID = parseInt(req.params.id)
        const id = parseInt(req.user)
        const role = req.role
        const result = await getDriReqByID({ driverReqID, id, role })

        if (result[0].driverID === id && role === 'Driver') {
            return res.status(200).json({message: 'OK', result})
        }

        return res.status(403).json({message: 'Forbidden'})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
})


/**
 * @swagger
 * /orders/driverReq/add:
 *  post:
 *      summary: Create Driver Request
 *      description: |
 *                   การยื่นข้อเสนอของคนขับให้กับคำร้องขอ จะมีรายละเอียดดังนี้:
 *                   - กรอก `cusReqID`, `requestDate`, `amount` และ `recievedPay` ส่งให้ทาง **body** ของ request packet
 *                   - โดยแต่ละอันจะมีรายละเอียดดังนี้
 *                      - `cusReqID` คือ ไอดีของคำร้องขอ (ดูได้ที่ /orders/cusReq/all)
 *                      - `requestDate` คือ วันที่ที่คนขับยื่นข้อเสนอ
 *                      - `amount` คือ จํานวนเงินที่คนขับยื่นข้อเสนอ
 *                      - `recievedPay` คือ เงินจะเข้าคนขับทางไหน? (ธนาคารอะไร/เงินสด)
 *                   - มีการตรวจสอบ **TOKEN** ของผู้ที่ส่ง API เข้ามา โดยแบ่งด้วยกันเป็น **2 ฝั่ง** หลักๆ ก็คือ
 *                   - **Customer**
 *                       - หากเป็นลูกค้าจะไม่มีสิทธิ์เข้าถึง API ตัวนี้
 *                       - **Response Packet** จะเก็บข้อมูลคำร้องขอใหม่ที่สร้างได้
 *                   - **Driver**
 *                       - หากเป็นคนขับก็จะตรวจสอบว่า**คำร้องขอลูกค้า**ที่เลือกนั้นกำลังรอรับข้อเสนอใช่หรือไม่?
 *                       - หากมีสิทธิ์เข้าถึง **Response Packet** จะเก็บข้อมูลคำร้องขอใหม่ที่สร้างได้
 *      tags:
 *          - Requests for Order
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - cusReqID
 *                          - requestDate
 *                          - amount
 *                          - recievedPay
 *                      properties:
 *                          cusReqID:
 *                              type: integer
 *                              description: ไอดีของคำขอลูกค้า (ดูได้ที่ /orders/cusReq/all)
 *                              example: 1
 *                          requestDate:
 *                              type: string
 *                              format: date-time
 *                              description: วันที่ของคำขอ
 *                              example: "2025-03-23 16:49:00"
 *                          amount:
 *                              type: integer
 *                              description: จํานวนเงินที่เสนอ
 *                              example: 1000
 *                          receivedPay:
 *                              type: string
 *                              example: "เงินสด"
 *      responses:
 *          200:
 *              description: Successfully.
 *          400:
 *              description: Bad request.
 *          401:
 *              description: Unauthorized, missing or invalid token.
 *          403:
 *              description: Forbidden.
 *          404:
 *              description: Not Found
 */
// POST [/orders]/driverReq/add
ordersRouter.post('/driverReq/add', jwtTokenMiddleware, async (req, res) => {
    // ต้องการให้ผู้ใช้ที่ล็อคอินในฝั่งคนขับ สามารถส่งคำขอใหม่ได้
    try{
        const id = parseInt(req.user)
        const { cusReqID, requestDate, amount, receivedPay } = req.body

        const amountInt = parseInt(amount)

        const CheckResult = await getCusReqByID({ cusReqID })

        if (CheckResult[0].requestStatus !== 'waited') {
            return res.status(403).json({message: 'Forbidden: Request is not waiting'})
        }

        const result = await createDriverRequest({ id, cusReqID, requestDate, amountInt, receivedPay })
        return res.status(200).json({message: result})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/review/{orderID}:
 *   get:
 *     summary: Get review for a specific order
 *     description: |
 *                  ใช้เพื่อดึงข้อมูลรีวิวที่เกี่ยวข้องกับคำสั่งซื้อที่ระบุโดย orderID
 *                  - หากมีรีวิวที่เกี่ยวข้องกับคำสั่งซื้อนี้ ระบบจะดึงข้อมูลรีวิวที่มีอยู่
 *                  - หากไม่พบรีวิว จะตอบกลับข้อความว่า "No Review"
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         description: The order ID to retrieve the review for
 *         schema:
 *           type: integer
 *           example: 98765
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the review for the specified order
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
ordersRouter.get('/review/:orderID', jwtTokenMiddleware, async (req, res) => {
    try{
        const orderID = parseInt(req.params.orderID)
        const id = parseInt(req.user)
        const result = await getReview({ id, orderID })

        if (result.length === 0) {
            return res.status(200).json({message: 'No Review'})
        }

        return res.status(200).json({message: 'OK', result})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

/**
 * @swagger
 * /orders/review:
 *   put:
 *     summary: Create or update a review for a specific order
 *     description: |
 *                  ใช้เพื่อสร้างหรืออัปเดตรีวิวสำหรับคำสั่งซื้อที่ระบุ
 *                  - ผู้ใช้สามารถสร้างรีวิวใหม่สำหรับคำสั่งซื้อที่ไม่ได้รับการรีวิวมาก่อน
 *                  - หากมีรีวิวอยู่แล้ว ระบบจะอัปเดตรีวิวที่มีอยู่
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             orderID:
 *               type: integer
 *               description: The ID of the order being reviewed
 *               example: 98765
 *             reviewRate:
 *               type: integer
 *               description: Rating score (e.g. 1-5)
 *               example: 5
 *             reviewText:
 *               type: string
 *               description: The content of the review
 *               example: "Excellent service, fast delivery!"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully created or updated the review
 *       409:
 *         description: Conflict - Error occurred while processing the request
 *       400:
 *         description: Bad Request - Missing or invalid data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
ordersRouter.put('/review', jwtTokenMiddleware, async (req, res) => {
    try{
        const {orderID, reviewRate, reviewText} = req.body
        const id = parseInt(req.user)

        console.log({orderID, reviewRate, reviewText})

        const result = await createReview({ id, orderID, reviewRate, reviewText })
        return res.status(200).json({message: result})
    }
    catch(error){
        return res.status(409).json({ message: 'Conflict' })
    }
});

export default ordersRouter