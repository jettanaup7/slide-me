import mysql from "mysql2/promise"
import bcrypt from 'bcryptjs'

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

const getCurrentDate = new Date();
const formatDate = (date) => {
                const pad = (num) => num.toString().padStart(2, '0');
                const yyyy = date.getFullYear();
                const mm = pad(date.getMonth() + 1);
                const dd = pad(date.getDate());
                const hh = pad(date.getHours());
                const mi = pad(date.getMinutes());
                const ss = pad(date.getSeconds());
                return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
            };
const sentDate = formatDate(getCurrentDate)

const emptyOrRows = (rows) => {
    if (rows === undefined || rows.length === 0) return []
    return rows
}

export const getAllChats = async ({ orderID }) => {
    try {    
        const chatGet = await query(`SELECT * FROM chats WHERE orderID = ?`, [orderID]);

        if (chatGet.length === 0) {
            throw "No Chat"
        }

        return emptyOrRows(chatGet)
    }
    catch (error) {
        throw error
    }
}

export const getAllChatsByUser = async ({ userID, orderID } ) => {
    try {    
        const chatGet = await query(`SELECT * FROM chats WHERE userID = ? AND orderID = ?`, [userID, orderID]);

        if (chatGet.length === 0) {
            throw "No Chat"
        }

        return emptyOrRows(chatGet)
    }
    catch (error) {
        throw error
    }
}

export const getAllChatsByDriver = async ({ driverID, orderID } ) => {
    try {    
        const chatGet = await query(`SELECT * FROM chats WHERE driverID = ? AND orderID = ?`, [driverID, orderID]);

        if (chatGet.length === 0) {
            throw "No Chat"
        }

        return emptyOrRows(chatGet)
    }
    catch (error) {
        throw error
    }
}

export const addNewChatByUser = async ({ userID, orderID, message }) => {
    try {
        const sql = 'INSERT INTO chats (userID, orderID, message, sent_at) VALUES (?, ?, ?, ?)'
        const params = [userID, orderID, message, sentDate]
        const result = await query(sql, params)
        if (result.affectedRows === 1) return "success"
        return "error"
    } catch (error) {
        throw error
    }
}

export const addNewChatByDriver = async ({ driverID, orderID, message }) => {
    try {
        const sql = 'INSERT INTO chats (driverID, orderID, message, sent_at) VALUES (?, ?, ?, ?)'
        const params = [driverID, orderID, message, sentDate]
        const result = await query(sql, params)
        if (result.affectedRows === 1) return "success"
        return "error"
    } catch (error) {
        throw error
    }
}