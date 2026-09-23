import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

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

// สมัครสมาชิก Driver พร้อมบันทึกข้อมูลรถ
export const registerDriverWithDetails = async ({ user, pass, token, driverProfile, driverDetails }) => {
  try{
    console.log({ user, pass, token, driverProfile, driverDetails })

    const hashedPassword = await bcrypt.hash(pass, 10);
  
    const sqlDriver = "INSERT INTO drivers (user, pass, token) VALUES (?, ?, ?)";
    const paramsDriver = [user, hashedPassword, token || "driver"];
    const result = await query(sqlDriver, paramsDriver);

    if (!result.insertId) {
      throw new Error("ไม่สามารถสร้างบัญชีได้");
    }

    const driverID = result.insertId;
  
    // ✅ บันทึกข้อมูล Profile
    if (driverProfile) {
      const { name, email, birthdate, countryCode, phoneNumber } = driverProfile;
      const sqlProfile = `
        INSERT INTO driverProfile (driverID, name, email, birthdate, countryCode, phoneNumber)
        VALUES (?, ?, ?, ?, ?, ?)`;
      const paramsProfile = [driverID, name || "", email || "", birthdate || "", countryCode || "", phoneNumber || ""];
      await query(sqlProfile, paramsProfile);
    }
  
    // ✅ บันทึกข้อมูลรถ
    if (driverDetails) {
      const { plateNumber, brand, province, district, driveLicense, identityCard } = driverDetails;
      const sqlDetails = `
        INSERT INTO driverDetails (driverID, plateNumber, brand, province, district, driveLicense, identityCard)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const paramsDetails = [driverID, plateNumber, brand, province, district, driveLicense, identityCard];
      await query(sqlDetails, paramsDetails);
    }
  
    return { driverID, message: "สมัครสมาชิกสำเร็จ!" };
  }
  catch(err){
    throw new Error(err.message || "ไม่สามารถสมัครสมาชิกได้");
  }
};

export const checkDriverUsername  = async ({ username }) => {
  try{
    const existingUser = await getDriverByUsername(username);
    if (existingUser) {
      throw new Error("Username นี้ถูกใช้ไปแล้ว");
    }

    return { message: "ชื่อผู้ใช้นี้สามารถใช้งานได้" };
  }
  catch(err){
    throw new Error(err.message || "ไม่สามารถสมัครสมาชิกได้");
  }
};

// ล็อกอิน Driver
export const loginDriver = async ({ username }) => {
  const sql = `SELECT 
                drivers.driverID, 
                drivers.user, 
                drivers.pass,
                drivers.token, 
                driverProfile.name
              FROM drivers 
              JOIN driverProfile ON drivers.driverID = driverProfile.driverID 
              WHERE drivers.user = ?`
  return await query(sql, [username]);
};

export const getDriverByUsername = async (username) => {
  try {
    const sql = `SELECT 
                  drivers.driverID AS id, 
                  drivers.user, 
                  drivers.pass,
                  driverProfile.name
                FROM drivers
                JOIN driverProfile ON drivers.driverID = driverProfile.driverID 
                WHERE drivers.user = ?`
    const result = await query(sql, [username]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
  }
};

// ดึงข้อมูล Driver
export const getDriverData = async (driverID) => {
  const sql = `SELECT 
                drivers.driverID, 
                drivers.user, 
                drivers.token, 
                driverProfile.name,
                driverProfile.email,
                driverProfile.birthdate,
                driverProfile.countryCode,
                driverProfile.phoneNumber
              FROM drivers 
              JOIN driverProfile ON drivers.driverID = driverProfile.driverID 
              WHERE drivers.driverID = ?`
  return await query(sql, [driverID]);
};

// ดึงข้อมูล Profile ของ Driver
export const getDriverProfile = async (driverID) => {
  const sql = "SELECT * FROM driverProfile WHERE driverID = ?";
  return await query(sql, [driverID]);
};

// ดึงข้อมูลรายละเอียดของ Driver
export const getDriverDetails = async (driverID) => {
  const sql = `SELECT 
                driverDetails.driverID,
                driverDetails.plateNumber,
                driverDetails.brand,
                driverDetails.details,
                driverDetails.province,
                driverDetails.district,
                driverDetails.driveLicense,
                driverDetails.identityCard,

                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'picID', driverPictures.picID,
                        'picURL', CONVERT(driverPictures.picURL USING utf8mb4)
                    )
                ) AS driverPictures
              FROM driverDetails
              JOIN driverPictures ON driverDetails.driverID = driverPictures.driverID
              WHERE driverDetails.driverID = ?`;
  return await query(sql, [driverID]);
};

// อัปเดตข้อมูลโปรไฟล์
export const updateDriverProfile = async (driverID, profile = {}) => {
  if (!driverID) throw new Error("Driver ID is required");
  if (!profile || Object.keys(profile).length === 0) throw new Error("Profile data is missing");

  const { name, email, birthdate, phone } = profile;

  console.log("Updating profile with data:", profile);

  await query(
    "UPDATE driverProfile SET name = ?, email = ?, birthdate = ?, phoneNumber = ? WHERE driverID = ?",
    [name || "", email || "", birthdate || "", phone || "", driverID]
  );

  return { message: "Profile updated successfully" };
};

// อัปเดตข้อมูลรถ
export const updateDriverDetails = async ({driverID, plateNumber, brand, details, driverPictures}) => {
  try {
    const deleteOldImages = await query("DELETE FROM driverPictures WHERE driverID = ?", [driverID]);

    if (deleteOldImages.affectedRows > 0) {
      console.log("Old images deleted successfully");
    }

    const updateDetails = await query(
      "UPDATE driverDetails SET plateNumber = ?, brand = ?, details = ? WHERE driverID = ?",
      [plateNumber, brand, details, driverID]
    );

    if (updateDetails.affectedRows > 0) {

      if (driverPictures && driverPictures.length > 0) {
        const sql = "INSERT INTO driverPictures (driverID, picURL) VALUES (?, ?)";
        for (const image of driverPictures) {
          await query(sql, [driverID, image.picURL]);
        }
      }
    
      return { message: "Details updated successfully" };
    }
  }
  catch (error) {
    console.error("Error updating driver details:", error);
    throw new Error("Failed to update driver details");
  }
};

export const updateDriverLocation = async ({driverID, province, district}) => {
  const sql = "UPDATE driverDetails SET province = ?, district = ? WHERE driverID = ?";
  const params = [province, district, driverID];
  const result = await query(sql, params);

  if (result.affectedRows > 0) {
    return { message: "Location updated successfully" };
  } else {
    throw new Error("Failed to update location");
  }
};

// เพิ่มข้อมูลการชำระเงิน
export const addDriverPayment = async (driverID, paymentInfo) => {
  const { type, name, accountNumber, isDefault } = paymentInfo;

  if (!type || !name || !accountNumber) {
    throw new Error("Missing required payment details");
  }

  // ✅ ปิดค่า `isDefault` ของ Payment อื่นก่อนถ้ากำหนดให้เป็นค่า Default ใหม่
  if (isDefault) {
    await query("UPDATE driverPayment SET isDefault = 0 WHERE driverID = ?", [driverID]);
  }

  const sql = `
    INSERT INTO driverPayment (driverID, type, name, accountNumber, isDefault)
    VALUES (?, ?, ?, ?, ?)
  `;

  await query(sql, [driverID, type, name, accountNumber, isDefault ? 1 : 0]);

  return { message: "Payment information added successfully" };
};

// เพิ่มรูปภาพของคนขับ
export const addDriverPicture = async (driverID, pictureURL) => {
  if (!pictureURL) {
    throw new Error("Picture URL is required");
  }

  const sql = "INSERT INTO driverPictures (driverID, picURL) VALUES (?, ?)";
  await query(sql, [driverID, pictureURL]);

  return { message: "Picture uploaded successfully" };
};

// ดึงข้อมูลการชำระเงินของ Driver
export const getDriverPayment = async (driverID) => {
  const sql = "SELECT cpmID, type, name, accountNumber, isDefault FROM driverPayment WHERE driverID = ?";
  return await query(sql, [driverID]);
};

// ดึงรูปภาพของ Driver
export const getDriverPictures = async (driverID) => {
  const sql = "SELECT picID, picURL FROM driverPictures WHERE driverID = ?";
  return await query(sql, [driverID]);
};