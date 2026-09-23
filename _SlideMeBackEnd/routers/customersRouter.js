import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createCustomer,
  getCustomerByUsername,
  getUserById,
  deleteUserById,
} from "../controllers/customersController.js";

import { query } from "../controllers/customersController.js";

const customersRouter = Router();
const JWT_SECRET = "secret";

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
 * /userCustomer/register:
 *   post:
 *     summary: Register a new customer
 *     description: สมัครสมาชิกใหม่ในระบบ
 *     tags: 
 *       - Customers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "testuser"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-12"
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */

// 🔹 REGISTER: สมัครสมาชิก
customersRouter.post("/register", async (req, res) => {
  const { user, pass, token, customerProfile } = req.body
  try {
    await createCustomer({ user, pass, token, customerProfile });
    res.status(201).json({ message: "สร้างบัญชีผู้ใช้เสร็จสิ้น" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message, error: error });
  }
});
/**
 * @swagger
 * /userCustomer/login:
 *   post:
 *     summary: Login a customer
 *     description: เข้าสู่ระบบของลูกค้า
 *     tags: 
 *       - Customers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "teejay"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสําเร็จ
 *       404:
 *         description: ไม่พบผู้ใช้
 *       401:
 *         description: รหัสผ่านไม่ถูกต้อง
 */
customersRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {

    const user = await getCustomerByUsername(username);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const matched = await bcrypt.compare(password, user.pass);
    if (!matched) return res.status(401).json({ message: "Invalid Password" });

    const token = jwt.sign({ id: user.id, role: 'Customer' }, JWT_SECRET, { expiresIn: '12h' })

    return res.status(200).json({ message: "Login Successful", token, name: user.name });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @swagger
 * /userCustomer/data:
 *   get:
 *     summary: Get user data
 *     description: ดึงข้อมูลลูกค้า (ตรวจสอบรหัสผ่านก่อน)
 *     tags: 
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลลูกค้าสําเร็จ
 *       404:
 *         description: ไม่พบข้อมูลลูกค้า
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
// 🔹 GET USER DATA: ดึงข้อมูลลูกค้า (ตรวจสอบรหัสผ่านก่อน)
customersRouter.get("/data", jwtTokenMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user); // ดึงข้อมูลจาก userID ที่อยู่ใน JWT
    if (!user) return res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า" });

    // Format the birthdate
    if (user.birthdate) {
      user.birthdate = new Date(user.birthdate).toISOString().slice(0, 10);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});
/**
 * @swagger
 * /userCustomer/update:
 *   put:
 *     summary: Update user data     
 *     description: แก้ไขข้อมูลลูกค้า     
 *     tags: 
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               birthdate:
 *                 type: string
 *                 example: "1990-01-01"
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลลูกค้าสําเร็จ
 *       400:
 *         description: กรุณากรอกข้อมูลที่ต้องการอัปเดต
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
// 🔹 UPDATE USER DATA: แก้ไขข้อมูลลูกค้า
customersRouter.put("/update", jwtTokenMiddleware, async (req, res) => {
  const { email, phone, name, birthdate } = req.body;

  if (!email && !phone && !name && !birthdate) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลที่ต้องการอัปเดต" });
  }

  try {
    let updateFields = [];
    let values = [];

    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (phone) {
      updateFields.push("phoneNumber = ?");
      values.push(phone);
    }
    if (name) {
      updateFields.push("name = ?");
      values.push(name);
    }
    if (birthdate) {
      updateFields.push("birthdate = ?");
      values.push(birthdate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องการอัปเดต" });
    }

    values.push(req.user);

    const sql = `UPDATE customerProfile SET ${updateFields.join(
      ", "
    )} WHERE userID = ?`;
    const result = await query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการอัปเดต" });
    }

    res.json({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});
/**
 * @swagger
 * /userCustomer/delete:
 *   delete:
 *     summary: Delete user account
 *     description: ลบบัญชีลูกค้า
 *     tags: 
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ลบบัญชีสําเร็จ
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
customersRouter.delete("/delete", jwtTokenMiddleware, async (req, res) => {
  try {
    const result = await deleteUserById(req.user);
    if (result === "failed") {
      return res.status(500).json({ message: "ไม่สามารถลบบัญชีได้" });
    }
    res.json({ message: "ลบบัญชีสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

export default customersRouter;
