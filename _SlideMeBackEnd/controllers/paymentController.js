import mysql from "mysql2/promise"
import bcrypt from "bcryptjs/dist/bcrypt.js"

// ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
const config = {
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'slideme',
    waitForConnections: true,  
    connectionLimit: 10,    
    queueLimit: 0
}

const pool = mysql.createPool(config);

const query = async (sql, params) => {
    const [rows] = await pool.query(sql, params);  // Use pool to run queries
    return rows;
}

// ฟังก์ชันเช็คข้อมูลที่ว่าง
const emptyOrRows = (rows) => {
    if (rows === undefined || rows.length === 0) return []
    return rows
}

//-----------------------------------------
// Get All Driver Payment
export const getPaymentDriver = async () => {
    const sql = `
    SELECT * FROM driverPayment` ;
    // Query ดึงข้อมูลการชำระเงินทั้งหมด
    const rows = await query(sql);
    return emptyOrRows(rows);
};

// Get All Customer Payment
export const getPaymentCustomer = async () => {
    const sql = `
    SELECT * FROM customerPayment`;
    // Query ดึงข้อมูลการชำระเงินทั้งหมด
    const rows = await query(sql);
    return emptyOrRows(rows);
};

// Get Customer Payment By userID
export const getPaymentCustomerByUserID = async (userID) => {
    const sql = `
    SELECT * FROM customerPayment WHERE userID = ?`;
    // Query ดึงข้อมูลการชำระเงินทั้งหมด
    const rows = await query(sql, [userID]);
    return emptyOrRows(rows);
}

// Get Driver Payment By driverID
export const getPaymentDriverByDriverID = async (driverID) => {
    const sql = `
    SELECT * FROM driverPayment WHERE driverID = ?`;
    // Query ดึงข้อมูลการชำระเงินทั้งหมด
    const rows = await query(sql, [driverID]);
    return emptyOrRows(rows);
}

// -----------------------------------------

// Post Driver Payment
export  const addPaymentDriver = async (driverID, type, name, accountNumber) => {
    const sql = 'INSERT INTO driverPayment (driverID, type, name, accountNumber) VALUES (?, ?, ?, ?)';
    const params = [driverID, type, name, accountNumber];
    
    try {
        const result = await query(sql, params);
        if (result.affectedRows > 0) {
            return { success: true, message: 'Payment added successfully', driverID };
        }else{
            return { success: false, message: 'Failed to add payment' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Database error during payment insertion' };
    }
};

// Post Customer Payment
export const addPaymentCustomer = async (userID, type, cardNum, CCV, expiredDate) => {
    const sql = 'INSERT INTO customerPayment (userID, type, cardNum, CCV, expiredDate) VALUES (?, ?, ?, ?, ?)';
    const params = [userID, type, cardNum, CCV, expiredDate];
    
    try {
        const result = await query(sql, params);
        if (result.affectedRows > 0) {
            return { success: true, message: 'Payment added successfully', userID };
        }else{
            return { success: false, message: 'Failed to add payment' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Database error during payment insertion' };
    }
};

//-----------------------------------------

// Delete Driver Payment By cpmID
export  const deletePaymentDriver = async (cpmID) => {
    const sql = 'DELETE FROM driverPayment WHERE cpmID = ?';
    const result = await query(sql, [cpmID]);
    return result;
};

// Delete Customer Payment By cpmID
export  const deletePaymentCustomer = async (cpmID) => {
    const sql = 'DELETE FROM customerPayment WHERE cpmID = ?';
    const result = await query(sql, [cpmID]);
    return result;
};

//-----------------------------------------

// PUT Payment By driverID and cpmID
export const updatePaymentDriver = async (driverID, cpmID) => { 
    if (!driverID || !cpmID) {
        return { success: false, message: 'Invalid driverID or cpmID' };
    }

    const checkPayment = `
        SELECT COUNT(*) AS count 
        FROM driverPayment 
        WHERE driverID = ? AND cpmID = ?;
    `;
    // 1. อัพเดต `isDefault` เป็น false ให้กับทุกแถวที่เป็นของ user นั้น
    const updateFalse = `
        UPDATE driverPayment 
        SET isDefault = 0 
        WHERE driverID = ? AND isDefault = 1;
    `;
    
    // 2. อัพเดต `isDefault` เป็น true สำหรับ cpmID ที่เลือก
    const updateTrue = `
        UPDATE driverPayment 
        SET isDefault = 1 
        WHERE cpmID = ? AND driverID = ?;
    `;
    
    try {
        // เชื่อมต่อฐานข้อมูล
        const connection = await mysql.createConnection(config);

        // 1. ตรวจสอบว่า cpmID และ driverID ที่ให้มามีอยู่ในฐานข้อมูลหรือไม่
        const [rows] = await connection.query(checkPayment, [driverID, cpmID]);
        if (rows[0].count === 0) {
            return { success: false, message: 'Invalid cpmID for the specified driverID' };
        }
        // เริ่มต้น transaction
        await connection.beginTransaction();   
        // 2. เปลี่ยน `isDefault` ให้เป็น false ในทุกแถวที่เป็นของ driverID นี้
        await connection.query(updateFalse, [driverID]);

        // 3. เปลี่ยน `isDefault` ให้เป็น true สำหรับ cpmID ที่เลือก
        await connection.query(updateTrue, [cpmID, driverID]);

        // Commit การเปลี่ยนแปลง
        await connection.commit();
        
        connection.end();
        return { success: true, message: 'Payment default updated successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error updating payment default' };
    }
};

// PUT Payment By userID and cpmID
export const updatePaymentCustomer = async (userID, cpmID) => { 
    if (!userID || !cpmID) {
        return { success: false, message: 'Invalid userID or cpmID' };
    }

    const checkPayment = `
        SELECT COUNT(*) AS count 
        FROM customerPayment 
        WHERE userID = ? AND cpmID = ?;
    `;
    // 1. อัพเดต `isDefault` เป็น false ให้กับทุกแถวที่เป็นของ user นั้น
    const updateFalse = `
        UPDATE customerPayment 
        SET isDefault = 0 
        WHERE userID = ? AND isDefault = 1;
    `;
    
    // 2. อัพเดต `isDefault` เป็น true สำหรับ cpmID ที่เลือก
    const updateTrue = `
        UPDATE customerPayment 
        SET isDefault = 1 
        WHERE cpmID = ? AND userID = ?;
    `;
    
    try {
        // เชื่อมต่อฐานข้อมูล
        const connection = await mysql.createConnection(config);

        // 1. ตรวจสอบว่า cpmID และ userID ที่ให้มามีอยู่ในฐานข้อมูลหรือไม่
        const [rows] = await connection.query(checkPayment, [userID, cpmID]);
        if (rows[0].count === 0) {
            return { success: false, message: 'Invalid cpmID for the specified userID' };
        }
        // เริ่มต้น transaction
        await connection.beginTransaction();   
        // 2. เปลี่ยน `isDefault` ให้เป็น false ในทุกแถวที่เป็นของ userID นี้
        await connection.query(updateFalse, [userID]);

        // 3. เปลี่ยน `isDefault` ให้เป็น true สำหรับ cpmID ที่เลือก
        await connection.query(updateTrue, [cpmID, userID]);

        // Commit การเปลี่ยนแปลง
        await connection.commit();
        
        connection.end();
        return { success: true, message: 'Payment default updated successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error updating payment default' };
    }
};
