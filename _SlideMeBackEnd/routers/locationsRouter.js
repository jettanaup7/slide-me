import { Router } from "express";
import jwt from 'jsonwebtoken'

import { getAllLocations,
        getLocationByID,

        addNewLocation,
        updateLocation,

        deleteLocation
 } from "../controllers/locationsController.js";

const locationsRouter = Router();

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

// ต้องการให้ Location สามารถทำงานได้ดังนี้

/**
 * @swagger
 * /locations/all:
 *   get:
 *     summary: Get all locations for the logged-in customer
 *     description: |
 *                  ใช้เพื่อดึงข้อมูล Location ทั้งหมดของลูกค้าที่ล็อคอินในระบบ
 *                  ระบบจะดึงข้อมูลของลูกค้าเท่านั้น
 *     tags: [Locations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the locations for the customer
 *       403:
 *         description: Forbidden for driver users
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// GET [/locations]/all
// ต้องการให้สามารถ GET ข้อมูล Location ทั้งหมดของ User ที่ล็อคอินในระบบ โดยมีการเลือกระบุว่าเป็น Customer หรือ Driver แล้วนำข้อมูลของ User ออกมาได้ทั้งหมด
locationsRouter.get("/all", jwtTokenMiddleware, async (req, res) => {
    try {
        if (req.role === 'Customer') {
            const userID = parseInt(req.user)
            const result = await getAllLocations({ userID });

            return res.status(200).json({ message: "OK", result });
        }
        
        return res.status(403).json({ message: "Driver is Forbidden" })
    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
});

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a specific location by its ID for the logged-in customer
 *     description: |
 *                  ใช้เพื่อดึงข้อมูล Location ที่ตรงกับ ID สำหรับลูกค้าที่ล็อคอินในระบบ
 *                  ระบบจะดึงข้อมูลของลูกค้าที่มี `locationID` ที่ตรงกับคำขอ
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The location ID to retrieve
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the location
 *       403:
 *         description: Forbidden - The location doesn't belong to the customer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// GET [/locations]/:id
// ต้องการให้สามารถ GET ข้อมูล Location ของ User ที่ล็อคอินในระบบ โดยมีการเลือกระบุว่าเป็น Customer หรือ Driver แล้วนำข้อมูลของ User ที่เลือกออกมาได้
locationsRouter.get("/:id", jwtTokenMiddleware, async (req, res) => {
    try {
        if (req.role === 'Customer') {
            const userID = parseInt(req.user)
            const locationID = parseInt(req.params.id)
            const result = await getLocationByID({ userID, locationID });

            if (result.length === 0) {
                return res.status(403).json({ message: "Forbidden: Not Your Location" })
            }

            return res.status(200).json({ message: "OK", result });
        }
        
        return res.status(403).json({ message: "Driver is Forbidden" })
    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
})

/**
 * @swagger
 * /locations/add:
 *   post:
 *     summary: Add a new location for the logged-in customer
 *     description: |
 *                  ใช้เพื่อเพิ่มข้อมูล Location ใหม่สำหรับลูกค้าที่ล็อคอินในระบบ
 *                  ข้อมูลที่ต้องการเพิ่ม ได้แก่ ชื่อที่อยู่, หมายเลขติดต่อ และอื่นๆ
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the location
 *               example: "Warehouse"
 *             address:
 *               type: string
 *               description: Address of the location
 *               example: "123 Warehouse St."
 *             contactName:
 *               type: string
 *               description: Contact person name
 *               example: "John Doe"
 *             contactNumber:
 *               type: string
 *               description: Contact phone number
 *               example: "+1234567890"
 *             notes:
 *               type: string
 *               description: Additional notes for the location
 *               example: "Near the main street"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Successfully created the new location
 *       403:
 *         description: Forbidden for driver users
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// POST [/locations]/add
// ต้องการให้สามารถเพิ่มข้อมูล Location ของ User ที่ล็อคอินในระบบ โดยมีการเลือกระบุว่าเป็น Customer หรือ Driver แล้วนำข้อมูลที่ได้รับจัดเก็บใส่ Database
locationsRouter.post('/add', jwtTokenMiddleware, async (req, res) => {
    const { name, address, contactName, contactNumber, notes } = req.body
    try {

        if (req.role === 'Customer') {
            const userID = parseInt(req.user)

            const result = await addNewLocation({ userID, name, address, contactName, contactNumber, notes })

            return res.status(201).json({ message: "Created Location", result });
        }
        
        return res.status(403).json({ message: "Driver is Forbidden" })
    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
})

/**
 * @swagger
 * /locations/update:
 *   put:
 *     summary: Update an existing location for the logged-in customer
 *     description: |
 *                  ใช้เพื่ออัปเดตข้อมูล Location ที่มีอยู่สำหรับลูกค้าที่ล็อคอินในระบบ
 *                  โดยจะต้องระบุข้อมูลที่ต้องการอัปเดต
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             locationID:
 *               type: integer
 *               description: ID of the location to update
 *               example: 1
 *             name:
 *               type: string
 *               description: Updated name of the location
 *               example: "New Warehouse"
 *             address:
 *               type: string
 *               description: Updated address of the location
 *               example: "456 New Warehouse St."
 *             contactName:
 *               type: string
 *               description: Updated contact name
 *               example: "Jane Doe"
 *             contactNumber:
 *               type: string
 *               description: Updated contact number
 *               example: "+0987654321"
 *             notes:
 *               type: string
 *               description: Updated notes
 *               example: "Updated near the mall"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully updated the location
 *       403:
 *         description: Forbidden - The location doesn't belong to the customer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// PUT [/locations]/update
// ต้องการให้สามารถแก้ไขข้อมูล Location ของ User ที่ล็อคอินในระบบ โดยมีการเลือกระบุว่าเป็น Customer หรือ Driver แล้วนำข้อมูลที่ได้รับมาแก้ไขใน Database
locationsRouter.put('/update', jwtTokenMiddleware, async (req, res) => {
    const { locationID, name, address, contactName, contactNumber, notes } = req.body
    try {

        if (req.role === 'Customer') {
            const userID = parseInt(req.user)

            // const checkLocation = await getLocationByID({ userID, locationID });

            // // if (checkLocation.length === 0) {
            // //     return res.status(403).json({ message: "Forbidden: Not Your Location" })
            // // }

            const result = await updateLocation({ userID, locationID, name, address, contactName, contactNumber, notes })

            return res.status(200).json({ message: "Updated Location", result });
        }
        
        return res.status(403).json({ message: "Driver is Forbidden" })

    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
})

/**
 * @swagger
 * /locations/delete:
 *   delete:
 *     summary: Delete a location for the logged-in customer
 *     description: |
 *                  ใช้เพื่อทำการลบข้อมูล Location สำหรับลูกค้าที่ล็อคอินในระบบ
 *                  ระบบจะทำการลบ Location ที่ตรงกับ `locationID`
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           properties:
 *             locationID:
 *               type: integer
 *               description: The ID of the location to delete
 *               example: 1
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted the location
 *       403:
 *         description: Forbidden - The location doesn't belong to the customer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// DELETE [/locations]/delete
// ต้องการให้สามารถลบข้อมูล Location ของ User ที่ล็อคอินในระบบ โดยมีการเลือกระบุว่าเป็น Customer หรือ Driver แล้วนำข้อมูลออกจาก Database
locationsRouter.delete('/delete', jwtTokenMiddleware, async (req, res) => {
    const { locationID } = req.body
    try {

        if (req.role === 'Customer') {
            const userID = parseInt(req.user)

            const checkLocation = await getLocationByID({ userID, locationID });

            if (checkLocation.length === 0) {
                return res.status(403).json({ message: "Forbidden: Not Your Location" })
            }

            const result = await deleteLocation({ userID, locationID })

            return res.status(200).json({ message: "Deleted Location", result });
        }
        
        return res.status(403).json({ message: "Driver is Forbidden" })

    } catch (error) {
        return res.status(409).json({ message: "Conflict" });
    }
})

export default locationsRouter