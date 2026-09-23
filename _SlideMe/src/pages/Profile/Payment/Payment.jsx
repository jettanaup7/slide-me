import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

import "./Payment.css";

function Payment({ token }) {
  const navigate = useNavigate();

  const [payment, setPayment] = useState([]);

  const [newCard, setNewCard] = useState({ type: "Visa", cardNum: "", CCV: "", expiredDate: "" });
  const [cardError, setCardError] = useState("");

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get("http://localhost:3000/payments/customer/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayment(response.data);
      console.log(response.data)
    }
    catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleAddCard = () => {
    if (!validateCardNumber(newCard.cardNum)) {
      setCardError("กรุณากรอกหมายเลขบัตรให้ถูกต้อง");
      return;
    }

    if (newCard.CCV.trim() === "") {
      setCardError("กรุณากรอกรหัส CCV ให้ครบถ้วน");
      return;
    }

    if (newCard.expiredDate.trim() === "") {
      setCardError("กรุณากรอกวันหมดอายุของบัตร");
      return;
    }

    if (newCard.cardNum.trim() === "" || newCard.CCV.trim() === "" || newCard.expiredDate.trim() === "") {
      alert("Please fill all fields.");
      return;
    }

    const newPayment = {
      type: newCard.type,
      cardNum: newCard.cardNum,
      isDefault: false,
      expiredDate: newCard.expiredDate,
      CCV: newCard.CCV
    };
    // set PaymentMethods on local storage

    axios.post("http://localhost:3000/payments/customer", newPayment, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        fetchPaymentMethods(); // Refresh the payment methods after adding a new one
        setNewCard({ type: "Visa", cardNum: "", CCV: "", expiredDate: "" });
        setCardError("");
      })
      .catch((error) => {
        console.error("Error adding payment method:", error);
      });
  };

  const handleSetDefault = async (cpmID) => {
    axios.put(`http://localhost:3000/payments/customer`, { cpmID }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        fetchPaymentMethods(); // Refresh the payment methods after setting default
      })
      .catch((error) => {
        console.error("Error setting default payment method:", error);
      });
  };

  // Luhn Algorithm to validate the card number
  const validateCardNumber = (number) => {
    // Remove any non-numeric characters (e.g., spaces, dashes)
    const sanitizedNumber = number.replace(/\D/g, "");

    // Check if the length of the number is exactly 16 digits
    return sanitizedNumber.length === 16;
  };

  // Handle the expiration date formatting automatically
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters

    // Automatically format as MM/YY
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }

    // Set the formatted value to the state
    setNewCard({ ...newCard, expiredDate: value });
  };

  const handleDeleteCard = async (cpmID) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบัตรนี้?")) return;

    try {
      await axios.delete(`http://localhost:3000/payments/customer/${cpmID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchPaymentMethods(); // Refresh list after delete
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  return (
    <div className="Payment-container">
      <div style={{ paddingTop: "20px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginLeft: '1.5rem' }}>
          <Button variant="success" className='back-button d-flex' onClick={() => navigate("/profile/")}>
            <span className='bi bi-caret-left-fill d-flex'></span>
          </Button>
        </div>
      </div>

      <div className="payment-methods">
        <h2 style={{ marginTop: "20px" }}>Payment</h2>

        {payment.map((method) => (
          <div key={method.cpmID} className="payment-label" onClick={() => handleSetDefault(method.cpmID)}>
            <div>
              <strong>{method.type}</strong><br></br>
              {method.cardNum ? `**** **** **** ${method.cardNum.slice(-4)}` : ""}
            </div>
            <div>
              {method.isDefault == 1 &&
                <span
                  style={{
                    backgroundColor: "#01C063",
                    textAlign: "center",
                    padding: "0.2rem",
                    color: "white",
                    border: "none",
                    borderRadius: "40px",
                    width: "65px",
                    height: "25px",
                    marginRight: "5px",
                  }}
                  onClick={() => handleSetDefault(method.cpmID)}
                >
                  Default
                </span>}
              {method.type !== "PromptPay" && <button
                style={{
                  backgroundColor: "#FF0000",
                  textAlign: "center",
                  padding: "0.2rem",
                  color: "white",
                  border: "none",
                  borderRadius: "40px",
                  width: "45px",
                  height: "30px",
                }}
                onClick={() => handleDeleteCard(method.cpmID)}>
                ลบ
              </button>}
            </div>
          </div>
        ))}



        <h2 style={{ marginTop: "20px" }}>Add Card</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <select
            value={newCard.type}
            onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
            className="payment-input-bar"

          >
            <option value="Visa">Visa</option>
            <option value="MasterCard">MasterCard</option>
            <option value="Amex">Amex</option>
          </select>
          <input
            type="text"
            placeholder="Card Number"
            value={newCard.cardNum}
            onChange={(e) => setNewCard({ ...newCard, cardNum: e.target.value })}
            className="payment-input-bar"
            maxLength={16} // Visa/MasterCard limit
          />
          <input
            type="text"
            placeholder="CCV"
            value={newCard.CCV}
            onChange={(e) => setNewCard({ ...newCard, CCV: e.target.value })}
            className="payment-input-bar"
            maxLength={3} // CCV limit
          />
          <input
            type="text"
            placeholder="Expiry Date (MM/YY)"
            value={newCard.expiredDate}
            onChange={handleExpiryDateChange} // Custom change handler
            className="payment-input-bar"
            maxLength={5} // Expiry Date limit (MM/YY format)
          />
          {cardError && <div style={{ color: "red" }}>{cardError}</div>}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleAddCard}
              className="payment-start-button"
            >
              เพิ่มบัตร
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}

export default Payment;
