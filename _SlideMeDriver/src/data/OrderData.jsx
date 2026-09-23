import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/orders/'; // Replace with actual API URL

const useOrderData = (tokenUser) => {
    const [ordersList, setOrdersList] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}all`, {
                headers: { Authorization: `Bearer ${tokenUser}` },
            });
            if (Array.isArray(res.data.result)) {
                setOrdersList(res.data.result);
                console.log('Orders fetched successfully:', res.data.result);
            } else {
                console.error('Invalid data format', res.data);
            }
        } catch (error) {
            console.error('Fetch Order Error:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [tokenUser]);

    const addOrders = (newOrder) => {
        setOrdersList([...ordersList, { ...newOrder, userID, id: ordersList.length + 1 }]);
    };

    const updateOrders = (id, newOrder) => {
        setOrdersList(ordersList.map(order => order.userID === userID && order.id === id ? { ...order, ...newOrder } : order));
    };

    const deleteOrders = (id) => {
        const updatedOrders = ordersList.filter(order => !(order.userID === userID && order.id === id));
        setOrdersList(updatedOrders);
    };

    return { ordersList: ordersList, fetchOrders, addOrders, updateOrders, deleteOrders };
};

export default useOrderData;
