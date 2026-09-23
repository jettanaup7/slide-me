import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/orders/driverReq/'; // Replace with actual API URL

const useRequestData = (tokenUser) => {
    const [requestList, setRequestList] = useState([]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}all`, {
                headers: { Authorization: `Bearer ${tokenUser}` },
            });
            if (Array.isArray(res.data.result)) {
                setRequestList(res.data.result);
                console.log('Requests fetched successfully:', res.data.result);
            } else {
                console.error('Invalid data format', res.data);
            }
        } catch (error) {
            console.error('Fetch Request Error:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [tokenUser]);

    const updateRequests = (id, newRequest) => {
        setRequestList(requestList.map(request => request.userID === userID && request.id === id ? { ...request, ...newRequest } : request));
    };

    const deleteRequests = (id) => {
        const updatedRequests = requestList.filter(request => !(request.userID === userID && request.id === id));
        setRequestList(updatedRequests);
    };

    return { requestList: requestList, fetchRequests, updateRequests, deleteRequests };
};

export default useRequestData;
