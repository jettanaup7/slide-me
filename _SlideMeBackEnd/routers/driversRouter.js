import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import {
  registerDriverWithDetails,
  loginDriver,
  checkDriverUsername,
  getDriverData,
  getDriverProfile,
  getDriverDetails,
  updateDriverProfile,
  updateDriverDetails,
  updateDriverLocation,
  addDriverPayment,
  addDriverPicture,
  getDriverPayment,
  getDriverPictures
} from "../controllers/driversController.js";


const driversRouter = Router();
const JWT_SECRET = "secret";

// Middleware ตรวจสอบ Token
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
 * tags:
 *   name: Drivers
 *   description: Operations related to drivers
 */

/**
 * @swagger
 * /userDriver/register:
 *   post:
 *     summary: Register a new driver
 *     description: |
 *       - ใช้สำหรับสร้างบัญชีคนขับใหม่ พร้อมข้อมูลรถยนต์
 *       - ข้อมูลที่ต้องส่งใน body ได้แก่
 *          - ข้อมูลบัญชี (user, pass)
 *          - ข้อมูลโปรไฟล์ (name, email, birthdate, phoneNumber)
 *          - ข้อมูลรถยนต์ (plateNumber, brand, province, district, latitude, longitude)
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 example: johndoe
 *               pass:
 *                 type: string
 *                 format: password
 *                 example: securepassword
 *               profile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: johndoe@example.com
 *                   birthdate:
 *                     type: string
 *                     format: date
 *                     example: 1990-01-01
 *                   countryCode:
 *                     type: string
 *                     example: "+66"
 *                   phoneNumber:
 *                     type: string
 *                     example: "0812345678"
 *               details:
 *                 type: object
 *                 properties:
 *                   plateNumber:
 *                     type: string
 *                     example: "1234 ABC"
 *                   brand:
 *                     type: string
 *                     example: "Toyota"
 *                   province:
 *                     type: string
 *                     example: "Bangkok"
 *                   district:
 *                     type: string
 *                     example: "Chatuchak"
 *                   latitude:
 *                     type: number
 *                     example: 13.7563
 *                   longitude:
 *                     type: number
 *                     example: 100.5018
 *     responses:
 *       201:
 *         description: Driver registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Driver registered successfully"
 *                 driverID:
 *                   type: integer
 *                   example: 1
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/login:
 *   post:
 *     summary: Login as a driver
 *     description: |
 *       - ใช้สำหรับเข้าสู่ระบบของคนขับ
 *       - ต้องส่งข้อมูลใน body:
 *         - username: ชื่อบัญชีผู้ใช้
 *         - password: รหัสผ่าน
 *       - หากล็อกอินสำเร็จ จะได้รับ JWT Token สำหรับใช้งาน API อื่น ๆ

 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "namphet"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/data:
 *   get:
 *     summary: Get driver data
 *     description: |
 *       - ใช้สำหรับดึงข้อมูลพื้นฐานของคนขับ
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)

 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved driver data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/data/profile:
 *   get:
 *     summary: Get driver profile
 *     description: |
 *       - ใช้สำหรับดึงข้อมูลโปรไฟล์ของคนขับ
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profile data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/data/details:
 *   get:
 *     summary: Get driver details
 *     description: |
 *       - ใช้สำหรับดึงรายละเอียดเพิ่มเติมของคนขับ เช่น ข้อมูลรถยนต์
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved details
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/updateProfile:
 *   put:
 *     summary: Update driver profile
 *     description: |
 *       - ใช้สำหรับอัปเดตข้อมูลโปรไฟล์ของคนขับ
 *       - ข้อมูลที่ต้องส่งใน body ได้แก่:
 *         - name: ชื่อ-นามสกุล
 *         - phoneNumber: เบอร์โทรศัพท์
 *         - countryCode: รหัสประเทศ
 *         - birthdate: วันเกิด
 *         - email: อีเมล
 *         - profileImage: URL รูปโปรไฟล์
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Somchai Jaidee"
 *               phoneNumber:
 *                 type: string
 *                 example: "0812345678"
 *               countryCode:
 *                 type: string
 *                 example: "+66"
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "somchai@example.com"
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /userDriver/updateDetails:
 *   put:
 *     summary: Update driver vehicle details
 *     description: |
 *       - ใช้สำหรับอัปเดตข้อมูลรถของคนขับ
 *       - ข้อมูลที่ต้องส่งใน body ได้แก่:
 *         - plateNumber: ทะเบียนรถ
 *         - brand: ยี่ห้อรถ
 *         - province: จังหวัด
 *         - district: เขต/อำเภอ
 *         - latitude: ละติจูด
 *         - longitude: ลองจิจูด
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plateNumber:
 *                 type: string
 *                 example: "1234 ABC"
 *               brand:
 *                 type: string
 *                 example: "Toyota"
 *               province:
 *                 type: string
 *                 example: "Bangkok"
 *               district:
 *                 type: string
 *                 example: "Chatuchak"
 *               latitude:
 *                 type: number
 *                 example: 13.7563
 *               longitude:
 *                 type: number
 *                 example: 100.5018
 *     responses:
 *       200:
 *         description: Details updated successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/addPayment:
 *   post:
 *     summary: Add payment information
 *     description: |
 *       - ใช้สำหรับเพิ่มข้อมูลการชำระเงินของคนขับ
 *       - ข้อมูลที่ต้องส่งใน body ได้แก่:
 *         - type: ประเภทการชำระเงิน (เช่น Bank Transfer)
 *         - name: ชื่อบัญชี
 *         - accountNumber: หมายเลขบัญชี
 *         - isDefault: กำหนดให้เป็นค่าเริ่มต้นหรือไม่ (true/false)
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Payment added successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/uploadPicture:
 *   post:
 *     summary: Upload profile picture
 *     description: |
 *       - ใช้สำหรับอัปโหลดรูปโปรไฟล์ของคนขับ
 *       - ข้อมูลที่ต้องส่งใน body:
 *         - pictureURL: URL ของรูปภาพ
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []  # ต้องใช้ Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pictureURL:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/profileSomjai.jpg"
 *     responses:
 *       201:
 *         description: Picture uploaded successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /userDriver/data/pictures:
 *   get:
 *     summary: Get driver pictures
 *     description: |
 *       - ใช้สำหรับดึงรูปภาพที่เคยอัปโหลดของคนขับ
 *       - ต้องใช้ Token ในการเข้าถึง (Bearer Authentication)
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pictures
 *       404:
 *         description: No pictures found
 *       500:
 *         description: Internal Server Error
 */



// สมัครสมาชิก Driver พร้อมข้อมูลรถ
driversRouter.post("/register", async (req, res) => {
  try {
    const result = await registerDriverWithDetails(req.body);
    return res.status(201).json({ message: "สร้างบัญชีผู้ใช้เสร็จสิ้น" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
});

driversRouter.post("/checkUser", async (req, res) => {
  try {
    const { username } = req.body
    const result = await checkDriverUsername({ username });
    return res.status(201).json({ message: "ชื่อผู้ใช้สามารถใช้งานได้" });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: error });
  }
})

// ล็อกอิน Driver
driversRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await loginDriver({ username });
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const matched = await bcrypt.compare(password, result[0].pass);
    if (!matched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: result[0].driverID, role: 'Driver' }, JWT_SECRET, { expiresIn: '12h' })

    return res.status(200).json({ message: "Login successful", token, name: result[0].name});
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// ดึงข้อมูล Driver
driversRouter.get("/data", jwtTokenMiddleware, async (req, res) => {
  try {
    const data = await getDriverData(req.user);

        // Format the birthdate
        if (data.birthdate) {
          data.birthdate = new Date(user.birthdate).toISOString().slice(0, 10);
        }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// ดึงข้อมูล Profile ของ Driver
driversRouter.get("/data/profile", jwtTokenMiddleware, async (req, res) => {
  try {
    const profile = await getDriverProfile(req.user);

    if (profile.birthdate) {
      profile.birthdate = new Date(profile.birthdate).toISOString().slice(0, 10);
    }

    return res.status(200).json( profile );
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// ดึงข้อมูลรายละเอียดของ Driver
driversRouter.get("/data/details", jwtTokenMiddleware, async (req, res) => {
  try {
    const details = await getDriverDetails(req.user);
    return res.status(200).json(details);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// อัปเดตข้อมูลโปรไฟล์ Driver
driversRouter.put("/updateProfile", jwtTokenMiddleware, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Bad Request: No data provided" });
    }

    console.log("Updating Profile for DriverID:", req.user);
    console.log("Received Data:", req.body);

    const result = await updateDriverProfile(req.user, req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
});


// อัปเดตข้อมูลรถของ Driver
driversRouter.put("/updateDetails", jwtTokenMiddleware, async (req, res) => {
  const { plateNumber, brand, details, driverPictures } = req.body;
  const driverID = req.user;

  try {
    await updateDriverDetails({driverID, plateNumber, brand, details, driverPictures});
    return res.status(200).json({ message: "Details updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

driversRouter.put("/updateLocation", jwtTokenMiddleware, async (req, res) => {
  try {
    const { province, district } = req.body;
    const driverID = req.user;

    await updateDriverLocation({driverID, province, district});
    return res.status(200).json({ message: "Location updated successfully" });
  }
  catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
});

// เพิ่มข้อมูลการชำระเงิน
driversRouter.post('/addPayment', jwtTokenMiddleware, async (req, res) => {
  try {
    const driverID = req.user;

    if (!driverID) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const response = await addDriverPayment(driverID, req.body);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// เพิ่มรูปภาพของคนขับ
driversRouter.post("/uploadPicture", jwtTokenMiddleware, async (req, res) => {
  try {
    const { pictureURL } = req.body;
    
    if (!pictureURL) {
      return res.status(400).json({ message: "Bad Request: pictureURL is required" });
    }

    const result = await addDriverPicture(req.user, pictureURL);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error uploading picture:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
});

// ดึงข้อมูลการชำระเงินของ Driver
driversRouter.get("/data/payment", jwtTokenMiddleware, async (req, res) => {
  try {
    console.log("Driver ID:", req.user);

    const result = await getDriverPayment(req.user);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No payment details found" });
    }

    return res.status(200).json({ payments: result });
  } catch (error) {
    console.error("Error retrieving payment data:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
});



// ดึงรูปภาพของ Driver
driversRouter.get("/data/pictures", jwtTokenMiddleware, async (req, res) => {
  try {
    const pictures = await getDriverPictures(req.user);

    if (!pictures || pictures.length === 0) {
      return res.status(404).json({ message: "No pictures found" });
    }

    return res.status(200).json({ pictures });
  } catch (error) {
    console.error("Error retrieving pictures:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
});


export default driversRouter;

