import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";

import Chat from "./Chat/Chat";

import "./ProcessReceipt.css";

function ProcessReceipt({ fetchOrders, token }) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const orderID = queryParams.get("orderID");
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedReview, setSelectedReview] = useState([]);

  const [reviewText, setReviewText] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/orders/${orderID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.result) {
        console.log("Order fetched successfully:", res.data.result[0]);
        setSelectedOrder(res.data.result[0]);
      } else {
        console.error("Invalid data format", res.data);
      }
    } catch (error) {
      console.error('Fetch Order Error:', error);
    }
  };

  const fetchReview = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/orders/review/${orderID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.result) {
        console.log("Review fetched successfully:", res.data.result[0]);
        setSelectedReview(res.data.result[0]);
      } else {
        console.error("Invalid data format", res.data);
      }
    } catch (error) {
      console.error('Fetch Review Error:', error);
    }
  };

  const Stars = ({ rating }) => {
    const totalStars = 5;
    return (
      <>
        {[...Array(totalStars)].map((_, index) => (
          <span key={index}>
            {index < rating ? '★' : '☆'}
          </span>
        ))}
      </>
    );
  };

  useEffect(() => {
    fetchOrder();
    fetchReview();
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false); // State to track if chat is open

  // If chat is open, render Chat component; otherwise render the payment process UI
  if (isChatOpen) {
    return <Chat setIsChatOpen={setIsChatOpen} orderID={orderID} token={token} />;
  }

  return (
    <div className="process-done-container">
      <div style={{ padding: "5px" }}></div>
      {/* Back button */}
      <div className="back-button-container">
        <Link to="/">
          <Button variant="success" className="back-button d-flex">
            <span className="bi bi-caret-left-fill d-flex"></span>
          </Button>
        </Link>
        <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>ประวัติการเรียกใช้บริการ</h2>
      </div>

      <div className="driver-container">
        <span style={{ fontWeight: "bold" }} className="driver">รายละเอียดลูกค้า</span>
        <br />
        <span className="driver">ชื่อผู้เรียกใช้ : {selectedOrder.customerName} </span>
        <br />
        <span className="driver">เลขที่อ้างอิง : {selectedReview.receiptID} </span>
        <br />
        <span className="driver">เลขที่ออเดอร์ : {selectedOrder.orderID}</span>
        <br />
        <span className="driver">วันที่เรียกใช้ : {new Date(selectedOrder.requestDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
        <br />
        <span className="driver">วันที่สิ้นสุด : {new Date(selectedReview.finishDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
        <br />
        <span className="driver">ประเภทรถ : {selectedOrder.carType}</span>
        <br />
        <span className="driver">คะแนนรีวิว : <Stars rating={selectedReview.reviewRate} /></span>
      </div>

      <div className="main-container">
        <div className="location-container">
          <div>
            <h5>
              <span className="icon badge bg-success rounded-pill">ต้นทาง</span>
            </h5>
            <span className="text">
              {selectedOrder.pickupLocation}
            </span>
            <h5>
              <span className="icon badge bg-danger rounded-pill">ปลายทาง</span>
            </h5>
            <span className="text">
              {selectedOrder.dropoffLocation}
            </span>
          </div>
        </div>

        <div className="driver-container">
          <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" className="driver-icon" />
          <span style={{ fontWeight: "bold" }} className="driver">รายละเอียดผู้ให้บริการ</span>
          <br />
          <span className="driver">ชื่อ : {selectedOrder.driverName} </span>
          <br />
          <span className="driver">เลขทะเบียนรถ : {selectedOrder.plateNumber}</span>
          <br />
          <span className="driver">ยี่ห้อรถ : {selectedOrder.vehicleBrand}</span>
          <br />
          <span className="driver">ค่าบริการ : {(Number(selectedOrder.amount) + Number(selectedOrder.amount * 0.1)).toLocaleString()}฿</span>
        </div>

        <div className="processdone-button-container" style={{ marginTop: "5px" }}>
          <Button variant="success" className="rounded-pill" size="lg" onClick={() => setIsChatOpen(true)}>
            ดูประวัติแชท
          </Button>
          <Button variant="success" className="rounded-pill" size="lg">
            ติดต่อทางร้าน
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProcessReceipt;
