import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";

import Chat from "./Chat/Chat";

import "./ProcessPayment.css";

function ProcessPayment({ fetchOrders, token }) {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const orderID = queryParams.get("orderID");

    const [selectedOrder, setSelectedOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/orders/${orderID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.result) {
                console.log("Order fetched successfully:", res.data.result[0]);
                setSelectedOrder(res.data.result[0]);
                setIsLoading(false);
            } else {
                console.error("Invalid data format", res.data);
            }
        } catch (error) {
            console.error('Fetch Order Error:', error);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, []);

    const [paymentStatus, setPaymentStatus] = useState('รอชำระเงิน');

    useEffect(() => {
        if (selectedOrder && selectedOrder.isPay !== undefined) {
            setPaymentStatus(selectedOrder.isPay === 1 ? 'ชำระเงินแล้ว' : 'รอชำระเงิน');
        }
    }, [selectedOrder]);

    const handlePayment = () => {
        const evidence = {
            image: "https://thunder.in.th/wp-content/uploads/2024/06/%E0%B8%AA%E0%B8%A5%E0%B8%B4%E0%B8%9B%E0%B9%82%E0%B8%AD%E0%B8%99%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99.webp", // Placeholder for actual evidence image
        };

        axios.put(`http://localhost:3000/orders/sendPayment`, { orderID, evidence }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                fetchOrder();
                fetchOrders();
                setTimeout(() => {
                    navigate(`/list/process-working/?orderID=${orderID}`);
                }, 5000); // 5000 milliseconds = 5 seconds
            })
            .catch((error) => {
                console.error('Error setting payment status:', error);
            });
    };

    const handleCancel = () => {
        // setPaymentStatus('รอชำระเงิน');
    };

    const [isChatOpen, setIsChatOpen] = useState(false); // State to track if chat is open

    // If chat is open, render Chat component; otherwise render the payment process UI
    if (isChatOpen) {
        return <Chat setIsChatOpen={setIsChatOpen} orderID={orderID} token={token} />;
    }

    return (
        <div className="propayment-container">
            <div style={{ padding: "20px" }}></div>
            <div className="back-button-container">
                <Link to="/list">
                    <Button variant="success" className="back-button d-flex">
                        <span className="bi bi-caret-left-fill d-flex"></span>
                    </Button>
                </Link>
            </div>
            <div className="location-container">
                <div>
                    <h5>
                        <span className="icon badge bg-success rounded-pill">ต้นทาง</span>
                    </h5>
                    <span className="text">
                        {isLoading ? "Loading..." : selectedOrder.pickupLocation}
                    </span>
                    <h5>
                        <span className="icon badge bg-danger rounded-pill">ปลายทาง</span>
                    </h5>
                    <span className="text">
                        {isLoading ? "Loading..." : selectedOrder.dropoffLocation}
                    </span>
                </div>
            </div>

            <div className="driver-container">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" className="driver-icon" />
                <span style={{ fontWeight: "bold" }} className="driver">รายละเอียดผู้ให้บริการ</span><br />
                <span className="driver">ชื่อ : {isLoading ? "Loading..." : selectedOrder.driverName} </span><br />
                <span className="driver">เลขทะเบียนรถ : {isLoading ? "Loading..." : selectedOrder.plateNumber}</span><br />
                <span className="driver">ยี่ห้อรถ : {isLoading ? "Loading..." : selectedOrder.vehicleBrand}</span>
            </div>
            <div className="button-container">
                <button className="save-button">
                    ติดต่อทางร้าน
                </button>
                <button
                    className="save-button"
                    onClick={() => setIsChatOpen(true)} // Set chat open when clicked
                >
                    แชทติดต่อ
                </button>
            </div>

            <div className="price-container">
                <span>ค่าบริการ</span>
                <span className="price-thai" style={{ fontWeight: "bold" }}>{isLoading ? "Loading..." : (Number(selectedOrder.amount) + Number(selectedOrder.amount * 0.1)).toLocaleString()}฿</span>
                <span>การชำระเงิน</span>
                <span className="payment" style={{ fontWeight: "bold" }}>{isLoading ? "Loading..." : selectedOrder.payment}</span>
                <span>สถานะ : <span className="status" >{isLoading ? "Loading..." : paymentStatus}</span></span>
            </div>

            <div className="button-container">
                <Button onClick={handlePayment} disabled={paymentStatus === 'ชำระเงินแล้ว'} variant="success" className="rounded-pill" size="lg" >
                    ชำระเงิน
                </Button>
            </div>
        </div>
    );
}

export default ProcessPayment;
