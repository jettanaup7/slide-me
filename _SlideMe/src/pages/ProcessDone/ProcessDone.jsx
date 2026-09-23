import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import StarRating from "./StarRating/StarRating";

import "./ProcessDone.css";

function ProcessDone({ fetchOrders, token }) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const orderID = queryParams.get("orderID");
  const [selectedOrder, setSelectedOrder] = useState([]);

  const [reviewRate, setReviewRate] = useState(0);
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

  useEffect(() => {
    fetchOrder();
  }, []);

  const handleSubmitReview = async () => {
    try {
      const reviewData = {
        orderID: selectedOrder.orderID,
        reviewRate: reviewRate,
        reviewText: reviewText,
      };

      console.log(reviewData)

      const res = await axios.put("http://localhost:3000/orders/review", reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        console.log("Review submitted successfully:", res.data);
        navigate("/");
      } else {
        console.error("Invalid data format", res.data);
      }
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };


  return (
    <div className="process-done-container">
      <div style={{ padding: "5px" }}></div>
      {/* Back button */}
      <div className="back-button-container">
        <Link to="/">
          <Button variant="success" className="back-button d-flex" onClick={handleSubmitReview}>
            <span className="bi bi-caret-left-fill d-flex"></span>
          </Button>
        </Link>
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

        <div className="review-container">
          <h4 style={{ fontWeight: "bold" }}>ให้คะแนนและรีวิว</h4>

          <StarRating
            totalStars={5}
            onRatingChange={(rating) => setReviewRate(rating)}
          />
          <textarea
            placeholder="เขียนรีวิวของคุณ..."
            style={{
              width: "100%",
              height: "100px",
              marginTop: "10px",
              padding: "10px",
            }}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          ></textarea>
        </div>

        <div className="processdone-button-container" style={{ marginTop: "5px" }}>
          <Button variant="success" className="rounded-pill" size="lg" onClick={handleSubmitReview}>
            ส่งรีวิว
          </Button>
          <Button variant="success" className="rounded-pill" size="lg">
            ติดต่อทางร้าน
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProcessDone;
