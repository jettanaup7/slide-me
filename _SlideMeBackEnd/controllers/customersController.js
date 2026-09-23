import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// ✅ ตั้งค่าการเชื่อมต่อฐานข้อมูล
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

export const query = async (sql, params) => {
  const [rows] = await pool.query(sql, params);  // Use pool to run queries
  return rows;
}

// ✅ สมัครสมาชิก (Create Account)
export const createCustomer = async ({user, pass, token, customerProfile}) => {
  try {
    // ตรวจสอบว่า user มีอยู่แล้วหรือไม่
    const username = user 
    const existingUser = await getCustomerByUsername(username);
    if (existingUser) {
      throw new Error("Username นี้ถูกใช้ไปแล้ว");
    }
    
    const hashedPassword = await bcrypt.hash(pass, 10);

    // ✅ เพิ่มข้อมูลในตาราง `customers`
    const sqlCustomer =
      "INSERT INTO customers (user, pass, token) VALUES (?, ?, token)";
    const result = await query(sqlCustomer, [username, hashedPassword, token]);

    if (!result.insertId) {
      throw new Error("ไม่สามารถสร้างบัญชีได้");
    }

    const userID = result.insertId;

    const { name, email, birthdate, countryCode, phoneNumber } = customerProfile

    // ✅ เพิ่มข้อมูลในตาราง `customerProfile`
    const sqlProfile =
      "INSERT INTO customerProfile (userID, name, email, countryCode, phoneNumber) VALUES (?, ?, ?, ?, ?)";
    await query(sqlProfile, [
      userID,
      name,
      email,
      countryCode,
      phoneNumber,
    ]);

    const sqlPayment = "INSERT INTO customerPayment (userID, type, isDefault) VALUES (?, 'Promptpay', 1)"
    await query(sqlPayment, [userID])

    return { userID, message: "สมัครสมาชิกสำเร็จ!" };
  } catch (error) {
    // console.error("Error creating customer:", error.message);
    throw new Error(error.message || "ไม่สามารถสมัครสมาชิกได้");
  }
};

// ✅ ดึงข้อมูลผู้ใช้จาก username
export const getCustomerByUsername = async (username) => {
  try {
    const sql = `SELECT 
                  customers.userID AS id, 
                  customers.user, 
                  customers.pass,
                  customerProfile.name
                FROM customers 
                JOIN customerProfile ON customers.userID = customerProfile.userID 
                WHERE customers.user = ?`;
    const result = await query(sql, [username]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
  }
};

export const getUserById = async (userID) => {
  try {
    const sql = "SELECT customerProfile.userID, customers.user, customerProfile.name, customerProfile.email, customerProfile.phoneNumber, customerProfile.birthdate FROM customerProfile JOIN customers ON customerProfile.userID = customers.userID WHERE customerProfile.userID = ?";
    const result = await query(sql, [userID]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("ไม่สามารถดึงข้อมูลลูกค้าได้");
  }
};

export const deleteUserById = async (userID) => {
  try {
    await query("DELETE FROM customerProfile WHERE userID = ?", [userID]);
    await query("DELETE FROM customers WHERE userID = ?", [userID]);
    return "success";
  } catch (error) {
    console.error("Error deleting user:", error);
    return "failed";
  }
};