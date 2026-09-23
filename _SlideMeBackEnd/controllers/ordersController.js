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
    const [rows] = await pool.query(sql, params);
    return rows;
}

const emptyOrRows = (rows) => {
    if (rows === undefined || rows.length === 0) return []
    return rows
}

// สำหรับการ Get ข้อมูลทั้งหมด (ไม่ใช้)
export const getOrders = async (req, res) => {
    try {
        const orders = await query(`
            SELECT 
                o.orderID,
                o.orderDate,
                cr.orderDate as requestDate,
                o.amount,
                o.status AS orderStatus,
                o.isPay,
                o.isgetCar,

                -- Customer Info
                c.userID AS customerID,
                cp.name AS customerName,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                o.orderLatitude,
                o.orderLongitude,
                cr.carType,
                cr.carDetails,
                cr.payment,

                -- Driver Info
                d.driverID,
                dp.name AS driverName,
                dd.plateNumber,
                dd.brand AS vehicleBrand,
                dri.recievedPay AS driverReceivedPayment,

                -- Order Pictures (Concatenated as a comma-separated string)
                GROUP_CONCAT(op.picURL) AS orderPictures

            FROM orders o
            JOIN driverRequest dri on o.driReqID = dri.driReqID
            JOIN customerRequest cr ON dri.cusReqID = cr.cusReqID
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID

            JOIN drivers d ON dri.driverID = d.driverID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            LEFT JOIN driverDetails dd ON d.driverID = dd.driverID

            GROUP BY o.orderID
        `);

        const formattedOrders = orders.map(order => ({
            ...order,
            orderPictures: order.orderPictures ? order.orderPictures.split(',') : []
        }));

        return emptyOrRows(formattedOrders)
    }
    catch (error) {
        throw error
    }
}

export const getOrdersFromDriver = async ( { id } ) => {
    try {    
        const orders = await query(`
            SELECT 
                o.orderID,
                o.orderDate,
                cr.orderDate as requestDate,
                o.amount,
                o.status AS orderStatus,
                o.isPay,
                o.isgetCar,

                -- Customer Info
                c.userID AS customerID,
                cp.name AS customerName,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                o.orderLatitude,
                o.orderLongitude,
                cr.carType,
                cr.carDetails,
                cr.payment,

                -- Driver Info
                d.driverID,
                dp.name AS driverName,
                dd.plateNumber,
                dd.brand AS vehicleBrand,
                dri.recievedPay AS driverReceivedPayment,

                -- Order Pictures (Concatenated as a comma-separated string)
                GROUP_CONCAT(op.picURL) AS orderPictures

            FROM orders o
            JOIN driverRequest dri on o.driReqID = dri.driReqID
            JOIN customerRequest cr ON dri.cusReqID = cr.cusReqID
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID

            JOIN drivers d ON dri.driverID = d.driverID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            LEFT JOIN driverDetails dd ON d.driverID = dd.driverID

            WHERE d.driverID = ?
            GROUP BY o.orderID
        `, [id]);

        const formattedOrders = orders.map(order => ({
            ...order,
            orderPictures: order.orderPictures ? order.orderPictures.split(',') : []
        }));

        return emptyOrRows(formattedOrders)
    }
    catch (error) {
        throw error
    }
}

export const getOrdersFromCustomer = async ( { id } ) => {
    try {    
        const orders = await query(`
            SELECT 
                o.orderID,
                o.orderDate,
                cr.orderDate as requestDate,
                o.amount,
                o.status AS orderStatus,
                o.isPay,
                o.isgetCar,

                -- Customer Info
                c.userID AS customerID,
                cp.name AS customerName,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                o.orderLatitude,
                o.orderLongitude,
                cr.carType,
                cr.carDetails,
                cr.payment,

                -- Driver Info
                d.driverID,
                dp.name AS driverName,
                dd.plateNumber,
                dd.brand AS vehicleBrand,
                dri.recievedPay AS driverReceivedPayment,

                -- Order Pictures (Concatenated as a comma-separated string)
                GROUP_CONCAT(op.picURL) AS orderPictures

            FROM orders o
            JOIN driverRequest dri on o.driReqID = dri.driReqID
            JOIN customerRequest cr ON dri.cusReqID = cr.cusReqID
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID

            JOIN drivers d ON dri.driverID = d.driverID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            LEFT JOIN driverDetails dd ON d.driverID = dd.driverID

            WHERE c.userID = ?
            GROUP BY o.orderID
        `, [id]);

        const formattedOrders = orders.map(order => ({
            ...order,
            orderPictures: order.orderPictures ? order.orderPictures.split(',') : []
        }));

        return emptyOrRows(formattedOrders)
    }
    catch (error) {
        throw error
    }
}

export const getOrdersById = async ( { orderId, id, role } ) => {
    try {    
        const orders = await query(`
            SELECT 
                o.orderID,
                o.orderDate,
                cr.orderDate as requestDate,
                o.amount,
                o.status AS orderStatus,
                o.isPay,
                o.isgetCar,

                -- Customer Info
                c.userID AS customerID,
                cp.name AS customerName,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                o.orderLatitude,
                o.orderLongitude,
                cr.carType,
                cr.carDetails,
                cr.payment,

                -- Driver Info
                d.driverID,
                dp.name AS driverName,
                dd.plateNumber,
                dd.brand AS vehicleBrand,
                dri.recievedPay AS driverReceivedPayment,

                -- Order Pictures (Concatenated as a comma-separated string)
                GROUP_CONCAT(op.picURL) AS orderPictures

            FROM orders o
            JOIN driverRequest dri on o.driReqID = dri.driReqID
            JOIN customerRequest cr ON dri.cusReqID = cr.cusReqID
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID

            JOIN drivers d ON dri.driverID = d.driverID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            LEFT JOIN driverDetails dd ON d.driverID = dd.driverID

            WHERE o.orderID = ?
            GROUP BY o.orderID
        `, [orderId]);

        const formattedOrders = orders.map(order => ({
            ...order,
            orderPictures: order.orderPictures ? order.orderPictures.split(',') : []
        }));

        return emptyOrRows(formattedOrders)
    }
    catch (error) {
        throw error
    }
}

export const getOrdersDriverLocation = async ( { orderId, id } ) => {
    try {    
        const orders = await query(`
            SELECT 
                o.orderID,
                o.orderLatitude,
                o.orderLongitude,
                o.status
            FROM orders o
            WHERE o.orderID = ?
        `, [orderId]);

        return emptyOrRows(orders)
    }
    catch (error) {
        throw error
    }
}

export const createOrder = async ( { userID, cusReqID, driReqID, orderLongitude, orderLatitude, orderDate } ) => {
    try {
        // Fetch customer request details
        const customerRequest = await query(`
        SELECT userID, address1, address2, carType, carDetails, payment, callType
        FROM customerRequest 
        WHERE cusReqID = ? AND status = 'waited'
        `, [cusReqID]);
        
        if (customerRequest.length === 0) {
            return "Invalid or already accepted customer request";
        }

        if (customerRequest[0].userID !== userID) {
            return "Forbidden";
        }
        
        // Fetch driver request details
        const driverRequest = await query(`
            SELECT driverID, amount FROM driverRequest WHERE driReqID = ? AND status = 'waited'
        `, [driReqID]);
        
        if (driverRequest.length === 0) {
            return "Invalid or already accepted driver request";
        }
        
        const { amount } = driverRequest[0];

        const { callType } = customerRequest[0]

        const status = callType === 'now' ? 'current' : 'scheduled'
        
        // Insert the new order
        const insertOrder = await query(`
            INSERT INTO orders (driReqID, orderDate, amount, status, orderLongitude, orderLatitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [driReqID, orderDate, amount, status, orderLongitude, orderLatitude]);
        
        if (insertOrder.affectedRows !== 1) {
            return "Failed to create order"
        }
        
        // Update customer request status to 'accepted'
        await query(`UPDATE customerRequest SET status = 'accepted' WHERE cusReqID = ?`, [cusReqID]);
        
        // Update driver request status to 'accepted'
        await query(`UPDATE driverRequest SET status = 'accepted' WHERE driReqID = ?`, [driReqID]);
        
        // Cancel other driver requests for the same customer request
        await query(`
            UPDATE driverRequest SET status = 'cancel' 
                    WHERE cusReqID = ? AND driReqID != ?
        `, [cusReqID, driReqID]);

        return `${insertOrder.insertId}`
    }
    catch (error) {
        throw error
    }
}

export const cancelOrder = async ( { orderID } ) => {
    try{
        const result = await query(`
            UPDATE orders
            SET status = 'cancel'
            WHERE orderID = ?
        `, [orderID]);

        if (result.affectedRows === 0) {
            return "Failed to cancel order"
        }

        return "success"
    }
    catch (error) {
        throw error
    }
}

export const sendPayment = async ( { userID, orderID } ) => {
    try {
        const orderFinding = await query(`
            SELECT * FROM orders WHERE orderID = ?
        `, [orderID]);

        if (orderFinding.length === 0) {
            return "Order not found"
        }

        if (orderFinding[0].isPay === 1) {
            return "Already sent payment"
        }

        const result = await query(`
            UPDATE orders
            SET isPay = 1,
                status = 'current'
            WHERE orderID = ?
        `, [orderID]);        

        if (result.affectedRows === 0) {
            return "Failed to send payment"
        }

        return "success"
    }
    catch (error) {
        throw error
    }
}

export const updateOrder = async ( { driverID, orderID, description, evidence, status } ) => {
    try {
        const orderFinding = await query(`
            SELECT *
            FROM orders
            WHERE orderID = ?
        `, [orderID]);

        if (orderFinding.length === 0) {
            return "Order not found"
        }

        if (orderFinding[0].status === status) {
            return "Already updated"
        }
        
        const result = await query(`
            UPDATE orders
            SET status = ?
            WHERE orderID = ?
        `, [status, orderID]);
        
        if (result.affectedRows === 0) {
            return "Failed to update order"
        }

        if (status == 'history') {
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
            
            const finishDate = formatDate(getCurrentDate)

            const receiptCreate = await query(`
                INSERT INTO receipt (orderID, finishDate)
                VALUES (?, ?)
            `, [orderID, finishDate]);

            if (receiptCreate.affectedRows === 0) {
                return "Failed to create receipt"
            }

            if (description) {
                const descriptionCreate = await query(`INSERT INTO chats (driverID, orderID, message, sent_at) VALUES (?, ?, ?, ?)`, [driverID, orderID, description, finishDate]);
                if (descriptionCreate.affectedRows === 0) {
                    return "Failed to create evidence"
                }
            }

            if (evidence && evidence.length > 0) {
                const evidenceSQL = `INSERT INTO chats (driverID, orderID, message, sent_at, isPicture) VALUES ${evidence.map(() => '(?, ?, ?, ?, 1)').join(', ')}`;
                const evidenceParams = evidence.flatMap(pic => [driverID, orderID, pic, finishDate]);
                await query(evidenceSQL, evidenceParams);
                
                return "success"
            }
        }
        
    }
    catch (error){
        throw error
    }
}

export const updateOrdersDriverLocation = async ( { orderID, id, orderLatitude, orderLongitude} ) => {
    try {
        const result = await query(`
            UPDATE orders
            SET orderLatitude = ?, orderLongitude = ?
            WHERE orderID = ?
        `, [orderLatitude, orderLongitude, orderID]);
        
        if (result.affectedRows === 0) {
            return "Failed to update order"
        }
        
        return "success"
    }
    catch (error){
        throw error
    }
}

export const getUpCar = async ( { driverID, orderID, description, evidence } ) => {
    try {
        const orderFinding = await query(`
            SELECT *
            FROM orders
            WHERE orderID = ?
        `, [orderID]);

        if (orderFinding.length === 0) {
            return "Order not found"
        }

        if (orderFinding[0].isgetCar  == 1) {
            return "Already updated"
        }
        
        const result = await query(`
            UPDATE orders
            SET isgetCar = 1
            WHERE orderID = ?
        `, [orderID]);
        
        if (result.affectedRows === 0) {
            return "Failed to update order"
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
            
        const finishDate = formatDate(getCurrentDate)

        if (description) {
            const descriptionCreate = await query(`INSERT INTO chats (driverID, orderID, message, sent_at) VALUES (?, ?, ?, ?)`, [driverID, orderID, description, finishDate]);

            if (descriptionCreate.affectedRows === 0) {
                return "Failed to create evidence"
            }
        }

        if (evidence && evidence.length > 0) {
            const evidenceSQL = `INSERT INTO chats (driverID, orderID, message, sent_at, isPicture) VALUES ${evidence.map(() => '(?, ?, ?, ?, 1)').join(', ')}`;
            const evidenceParams = evidence.flatMap(pic => [driverID, orderID, pic, finishDate]);
            await query(evidenceSQL, evidenceParams);
            
            return "success"
        }
    }
    catch (error){
        throw error
    }
}

// ------ Customer Request Side ------
export const getCustomerRequest = async ( { id } ) => {
    try {    
        const customerRequests = await query(`
            SELECT 
                cr.cusReqID,
                cr.userID AS customerID,
                cp.name AS customerName,
                c.user AS customerUsername,
                cr.orderDate,
                cr.status AS requestStatus,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                cr.carType,
                cr.carDetails,
                cr.payment,
                cr.callType,

                -- Order Pictures (Concatenated as a comma-separated string)
                IFNULL(GROUP_CONCAT(DISTINCT op.picURL ORDER BY op.picURL ASC SEPARATOR ','), '') AS orderPictures

            FROM customerRequest cr
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID

            WHERE cr.userID = ?
            GROUP BY cr.cusReqID
        `, [id]);

        const formattedRequests = customerRequests.map(request => ({
            ...request,
            orderPictures: request.orderPictures ? request.orderPictures.split(',').filter(pic => pic !== '') : []
        }));

        return emptyOrRows(formattedRequests)
    }
    catch (error) {
        throw error
    }
}

export const getCustomerRequestByDriver = async ( ) => {
    try {
        // SELECT only cr.status AS requestStatus = 'waited'
        const customerRequests = await query(`
            SELECT 
                cr.cusReqID,
                cr.userID As customerID,
                cp.name AS customerName,
                c.user AS customerUsername,
                cr.orderDate,
                cr.status AS requestStatus,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                cr.carType,
                cr.carDetails,
                cr.payment,
                cr.callType,    

                -- Order Pictures (Concatenated as a comma-separated string)
                IFNULL(GROUP_CONCAT(DISTINCT op.picURL ORDER BY op.picURL ASC SEPARATOR ','), '') AS orderPictures

            FROM customerRequest cr
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID
            
            WHERE cr.status = 'waited'
            GROUP BY cr.cusReqID
        `);

        const formattedRequests = customerRequests.map(request => ({
            ...request,
            orderPictures: request.orderPictures ? request.orderPictures.split(',').filter(pic => pic !== '') : []
        }));

        return emptyOrRows(formattedRequests)
    }
    catch (error) {
        throw error
    }
}

export const getCusReqByID = async ( { cusReqID, id, role } ) => {
    try {    
        const customerRequests = await query(`
            SELECT 
                cr.cusReqID,
                cr.userID As customerID,
                cp.name AS customerName,
                c.user AS customerUsername,
                cr.orderDate,
                cr.status AS requestStatus,
                cr.address1 AS pickupLocation,
                cr.address2 AS dropoffLocation,
                cr.carType,
                cr.carDetails,
                cr.payment,
                cr.callType,

                -- Order Pictures (Concatenated as a comma-separated string)
                IFNULL(GROUP_CONCAT(DISTINCT op.picURL ORDER BY op.picURL ASC SEPARATOR ','), '') AS orderPictures

            FROM customerRequest cr
            JOIN customers c ON cr.userID = c.userID
            JOIN customerProfile cp ON c.userID = cp.userID
            LEFT JOIN orderPictures op ON cr.cusReqID = op.cusReqID

            WHERE cr.cusReqID = ?
            GROUP BY cr.cusReqID
        `, [cusReqID]);

        const formattedRequests = customerRequests.map(request => ({
            ...request,
            orderPictures: request.orderPictures ? request.orderPictures.split(',').filter(pic => pic !== '') : []
        }));

        return emptyOrRows(formattedRequests)
    }
    catch (error) {
        throw error
    }
}

export const createCustomerRequest = async ({ id, orderDate, address1, address2, carType, carDetails, orderPictures, callType }) => {
    try {
        const paymentSQL = 'SELECT cpm.type FROM customerPayment cpm WHERE cpm.userID = ? AND cpm.isDefault = 1';
        const defaultPayment = await query(paymentSQL, [id])

        if (defaultPayment.length === 0) {
            return "No default payment method found for this user."
        }

        const paymentType = defaultPayment[0].type;

        const SQL = `INSERT INTO customerRequest (userID, orderDate, address1, address2, carType, carDetails, payment, callType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [id, orderDate, address1, address2, carType, carDetails, paymentType, callType];
        const result = await query(SQL, params);

        if (result.affectedRows === 1) {
            const cusReqID = result.insertId; // Get the newly inserted request ID
            
            // Insert order pictures if provided
            if (orderPictures && orderPictures.length > 0) {
                const pictureSQL = `INSERT INTO orderPictures (cusReqID, picURL) VALUES ${orderPictures.map(() => '(?, ?)').join(', ')}`;
                const pictureParams = orderPictures.flatMap(pic => [cusReqID, pic]);
                await query(pictureSQL, pictureParams);
            }

            return `Success: Request ID: ${cusReqID}`;
        }
        return "error";
    } catch (error) {
        throw error;
    }
};

export const cancelCustomerRequest = async ( { id, cusReqID } ) => {
    try {
        const cusReqSQL = `UPDATE customerRequest SET status = 'cancel' WHERE cusReqID = ? AND userID = ?`;
        const cusReqParams = [cusReqID, id];
        const result = await query(cusReqSQL, cusReqParams);

        if (result.affectedRows === 0) {
            return "Failed to cancel customer request or request not found"
        }

        // Check if there is a driver request associated with this customer request and Cancel the driver request associated with this customer request

        const driReqSQL = `UPDATE driverRequest SET status = 'cancel' WHERE cusReqID = ?`;
        const driReqParams = [cusReqID];
        await query(driReqSQL, driReqParams);

        return "Success";
    }
    catch (error) {
        throw error
    }
}

// ------ Driver Request Side ------
export const getDriverRequest = async ( { id } ) => {
    try {    
        const driverRequests = await query(`
            SELECT 
                dr.driReqID,
                dr.driverID,
                cr.cusReqID,
                dp.name AS driverName,
                d.user AS driverUsername,
                dr.requestDate,
                dr.amount AS requestPrice,
                dr.status AS requestStatus,
                dr.recievedPay AS receivedPayment,
                cp.name AS customerName,
                cr.callType
            FROM driverRequest dr
            JOIN drivers d ON dr.driverID = d.driverID
            JOIN customerRequest cr ON dr.cusReqID = cr.cusReqID
            JOIN customerProfile cp ON cr.userID = cp.userID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            
            WHERE dr.driverID = ?
            GROUP BY dr.driReqID
        `, [id]);

        return emptyOrRows(driverRequests)
    }
    catch (error) {
        throw error
    }
}

export const getDriverRequestByCustomer = async ( { id } ) => {
    try {
        const driverRequests = await query(`
            SELECT 
                dr.driReqID,
                dr.driverID,
                cr.cusReqID,
                dp.name AS driverName,
                d.user AS driverUsername,
                dr.requestDate,
                dr.amount AS requestPrice,
                dr.status AS requestStatus,
                dr.recievedPay AS receivedPayment,
                cp.name AS customerName,
                cr.callType
            FROM driverRequest dr
            JOIN drivers d ON dr.driverID = d.driverID
            JOIN customerRequest cr ON dr.cusReqID = cr.cusReqID
            JOIN customerProfile cp ON cr.userID = cp.userID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            
            WHERE cr.userID = ? AND dr.status = 'waited'
            GROUP BY dr.driReqID
        `, [id]);

        return emptyOrRows(driverRequests)
    }
    catch (error) {
        throw error
    }
}

export const getDriverRequestByCusReqID = async ( { id, cusReqID } ) => {
    try {
        const driverRequests = await query(`
            SELECT 
                dr.driReqID,
                dr.driverID,
                cr.cusReqID,
                dp.name AS driverName,
                d.user AS driverUsername,
                dr.requestDate,
                dr.amount AS requestPrice,
                dr.status AS requestStatus,
                dr.recievedPay AS receivedPayment,
                cp.name AS customerName,
                cr.callType
            FROM driverRequest dr
            JOIN drivers d ON dr.driverID = d.driverID
            JOIN customerRequest cr ON dr.cusReqID = cr.cusReqID
            JOIN customerProfile cp ON cr.userID = cp.userID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            
            WHERE cr.userID = ? AND dr.status = 'waited' AND cr.cusReqID = ?
            GROUP BY dr.driReqID
        `, [id, cusReqID]);

        return emptyOrRows(driverRequests)
    }
    catch (error) {
        throw error
    }
}

export const getDriReqByID = async ( { driverReqID, id, role } ) => {
    try {
        const driverRequests = await query(`
            SELECT 
                dr.driReqID,
                dr.driverID,
                cr.cusReqID,
                dp.name AS driverName,
                d.user AS driverUsername,
                dr.requestDate,
                dr.amount AS requestPrice,
                dr.status AS requestStatus,
                dr.recievedPay AS receivedPayment,
                cp.name AS customerName,
                cr.callType
            FROM driverRequest dr
            JOIN drivers d ON dr.driverID = d.driverID
            JOIN customerRequest cr ON dr.cusReqID = cr.cusReqID
            JOIN customerProfile cp ON cr.userID = cp.userID
            JOIN driverProfile dp ON d.driverID = dp.driverID
            
            WHERE dr.driReqID = ?
            GROUP BY dr.driReqID
        `, [driverReqID]);

        return emptyOrRows(driverRequests)
    }
    catch (error) {
        throw error
    }
}

export const createDriverRequest = async ({ id, cusReqID, requestDate, amountInt, receivedPay }) => {
    try {
        const SQL = `INSERT INTO driverRequest (driverID, cusReqID, requestDate, amount, recievedPay) VALUES (?, ?, ?, ?, ?)`
        const params = [id, cusReqID, requestDate, amountInt, receivedPay]
        const result = await query(SQL, params)
        if (result.affectedRows === 1) return `Success: Request ID: ${result.insertId}`
        return "error"
    } catch (error) {
        throw error
    }
}

export const getReview = async ( { id, orderID } ) => {
    try {
        const SQL = `SELECT receiptID, orderID, finishDate, reviewRate, reviewText FROM receipt WHERE orderID = ?`
        const params = [orderID]
        const result = await query(SQL, params)
        return emptyOrRows(result)
    }
    catch (error) {
        throw error
    }
}

export const createReview = async ({ id, orderID, reviewRate, reviewText }) => {
    try{
        const SQL = `UPDATE receipt SET reviewRate = ?, reviewText = ? WHERE orderID = ?`
        const params = [reviewRate, reviewText, orderID]
        const result = await query(SQL, params)
        if (result.affectedRows === 1) return `Success: Request ID: ${result.insertId}`
        return "error"
    }
    catch (error) {
        throw error
    }
}