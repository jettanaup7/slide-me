import mysql from "mysql2/promise"

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

const emptyOrRows = (rows) => {
    if (rows === undefined || rows.length === 0) return []
    return rows
}

export const getAllLocations = async ( { userID } ) => {
    try {    
        const locationGet = await query(`SELECT * FROM customerLocations WHERE userID = ?`, [userID]);

        return emptyOrRows(locationGet)
    }
    catch (error) {
        throw error
    }
}

export const getLocationByID = async ({ userID, locationID }) => {
    try {
        const sql = 'SELECT * FROM customerLocations WHERE locationID = ? AND userID = ?'
        const params = [locationID, userID]

        return emptyOrRows(await query(sql, params))
    } catch (error) {
        throw error
    }
}

export const addNewLocation = async ({ userID, name, address, contactName, contactNumber, notes }) => {
    try {
        const sql = 'INSERT INTO customerLocations (userID, name, address, contactName, contactNumber, notes) VALUES (?, ?, ?, ?, ?, ?)'
        const params = [userID, name, address, contactName, contactNumber, notes]
        const result = await query(sql, params)
        if (result.affectedRows === 1) return "success"
        return "error"
    } catch (error) {
        throw error
    }
}

export const updateLocation = async ({ userID, locationID, name, address, contactName, contactNumber, notes }) => {
    try {
        const sql = 'UPDATE customerLocations SET name = ?, address = ?, contactName = ?, contactNumber = ?, notes = ? WHERE userID = ? AND locationID = ?'
        const params = [name, address, contactName, contactNumber, notes, userID, locationID]
        const result = await query(sql, params)

        if (result.affectedRows === 1) return "success"
        return "Failed to update: "
    } catch (error) {
        throw error
    }
}

export const deleteLocation = async ({ userID, locationID }) => {
    try {
        const sql = 'DELETE FROM customerLocations WHERE userID = ? AND locationID = ?'
        const params = [userID, locationID]
        const result = await query(sql, params)

        if (result.affectedRows === 1) return "success"
        return "Failed to delete: "
    } catch (error) {
        throw error
    }
}