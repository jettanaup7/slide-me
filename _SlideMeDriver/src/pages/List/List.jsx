import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import './List.css'

function List({ ordersList, fetchOrders, token }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        fetchOrders()
    }, [activeTab]);

    const handleButtonClick = (tab) => {
        fetchOrders()
        if (tab === "waiting") {
            setActiveTab('waiting');

            return;
        }

        setActiveTab(tab);
    };

    const handleChooseOrder = (order) => {
        navigate(`/list/process-working/?orderID=${order.orderID}`);
    }

    const handlePayOrder = (order) => {
        navigate(`/list/process-payment/?orderID=${order.orderID}`);
    }

    const handleReceiptOpen = (order) => {
        navigate(`/list/process-receipt/?orderID=${order.orderID}`);
    }

    const handleFilterOrders = (orders) => {
        if (activeTab === 'waiting') {
            return orders.filter(order => order.orderStatus === 'current' && order.isPay == 0);
        }
        if (activeTab === 'current') {
            return orders.filter(order => order.orderStatus === activeTab && order.isPay == 1);
        }
        return orders.filter(order => order.orderStatus === activeTab);
    }

    const handleDeleteOrder = async (orderID) => {
        const confirmed = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์?");
        if (confirmed) {
            try {
                alert("กำลังรอการยกเลิกออเดอร์จากระบบ");
                axios.put(`http://localhost:3000/orders/cancelOrder`, { orderID }, { headers: { Authorization: `Bearer ${token}` } });
                alert("ยกเลิกออเดอร์เรียบร้อยแล้ว");
                fetchOrders();
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        }
    }

    const filteredOrders = handleFilterOrders(ordersList)

    return (
        <div className='list-container'>
            <div className="order-list">
                <div className="order-buttons">
                    <button
                        className={`order-button ${activeTab === 'scheduled' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('scheduled')}
                    >
                        ล่วงหน้า
                    </button>
                    <button
                        className={`order-button ${activeTab === 'waiting' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('waiting')}
                    >
                        รอชำระ
                    </button>
                    <button
                        className={`order-button ${activeTab === 'current' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('current')}
                    >
                        ดำเนินการ
                    </button>
                    <button
                        className={`order-button ${activeTab === 'history' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('history')}
                    >
                        ประวัติ
                    </button>
                    <button
                        className={`order-button ${activeTab === 'cancel' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('cancel')}
                    >
                        ยกเลิก
                    </button>
                </div>


                <div className="order-container">
                    {filteredOrders.map((order, index) => (
                        <div className="order-item" key={order.orderID}>
                            <div className="order-icon"></div>
                            <div className="order-details">
                                <p style={{ fontWeight: 'bold' }}>{order.customerName}</p>
                                <p>{new Date(order.orderDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                                {order.orderStatus === 'scheduled' && activeTab === 'scheduled' &&
                                    <p style={{ color: '#FFBF00', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handlePayOrder(order)}>วันที่เรียก: {new Date(order.requestDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                                {order.orderStatus === 'current' && activeTab === 'current' &&
                                    <p style={{ color: '#FFBF00', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleChooseOrder(order)}>กำลังดำเนินการ</p>}
                                {order.orderStatus === 'current' && activeTab === 'waiting' &&
                                    <p style={{ color: '#FFBF00', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handlePayOrder(order)}>รอการชำระเงิน</p>}
                                {order.orderStatus === 'history' && activeTab === 'history' &&
                                    <p style={{ color: '#FFBF00', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleReceiptOpen(order)}>ดูรายละเอียด</p>}
                            </div>
                            {activeTab !== 'current' &&
                                <div className='order-details2'>
                                    {activeTab === 'waiting' &&
                                        <div className="order-amount">฿ {(Number(order.amount)).toLocaleString()}</div>}
                                    {activeTab === 'history' &&
                                        <div className="order-amount">฿ {(Number(order.amount)).toLocaleString()}</div>}
                                    {activeTab === 'scheduled' &&
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteOrder(order.orderID)} // Updated to use the hook method
                                        >
                                            Cancel
                                        </button>}
                                </div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default List;