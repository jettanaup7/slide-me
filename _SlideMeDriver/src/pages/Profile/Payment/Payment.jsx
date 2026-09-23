import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

import "./Payment.css";

function Payment({ token }) {
  const navigate = useNavigate();

  const [bankMethods, setBank] = useState([]);

  const [newBank, setNewBank] = useState({ bankFin: "กรุงไทย", bankName: "", accountNumber: "" });
  const [bankError, setBankError] = useState("");

  const fetchBankMethods = async () => {
    try {
      const response = await axios.get("http://localhost:3000/payments/driver/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBank(response.data);
      console.log(response.data)
    }
    catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  useEffect(() => {
    fetchBankMethods();
  }, []);

  const handleAddBank = () => {
    if (newBank.accountNumber.trim() === "" || newBank.bankFin.trim() === "") {
      setBankError("กรุณาเลือกธนาคารและหมายเลขบัญชีให้ครบถ้วน");
      return;
    }

    const newPayment = {
      type: newBank.bankFin,
      name: newBank.bankName,
      accountNumber: newBank.accountNumber,
      isDefault: false,
    };

    axios.post("http://localhost:3000/payments/driver", newPayment, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        fetchBankMethods(); // Refresh the payment methods after adding a new one
        setNewBank({ bankFin: "กรุงไทย", bankName: "", accountNumber: "" }); // Reset the form
        setBankError
      })
      .catch((error) => {
        console.error("Error adding payment method:", error);
      });
  };

  const handleSetDefault = async (cpmID) => {
    axios.put(`http://localhost:3000/payments/driver`, { cpmID }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        fetchBankMethods(); // Refresh the payment methods after setting default
      })
      .catch((error) => {
        console.error("Error setting default payment method:", error);
      });
  };

  const handleDeleteBank = async (cpmID) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?")) return;

    try {
      await axios.delete(`http://localhost:3000/payments/driver/${cpmID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBankMethods(); // Refresh list after delete
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  const thaiBanks = [
    "กรุงเทพ",
    "กสิกรไทย",
    "กรุงไทย",
    "ไทยพาณิชย์",
    "ทหารไทยธนชาต (TTB)",
    "ธนชาต",
    "ธนาคารออมสิน",
    "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)",
    "ธนาคารอาคารสงเคราะห์ (ธอส.)",
    "ยูโอบี",
    "ซีไอเอ็มบี ไทย",
    "ธนาคารไอซีบีซี (ไทย)",
    "ธนาคารแลนด์แอนด์เฮ้าส์",
    "ธนาคารทิสโก้",
    "ธนาคารเกียรตินาคินภัทร",
    "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย (ธพว.)",
  ];

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
        <h2 style={{ marginTop: "20px" }}>บัญชี</h2>

        {bankMethods.map((method, index) => (
          <div key={index} className="payment-label" onClick={() => handleSetDefault(method.cpmID)}>
            <div>
              <strong>{method.type}</strong><br></br>
              {method.name ? `${method.name}` : ""}
            </div>
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
                }}
                onClick={() => handleSetDefault(method.cpmID)}
              >
                Default
              </span>}
            {method.isDefault == 0 && <button
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
              onClick={() => handleDeleteBank(method.cpmID)}>
              ลบ
            </button>}
          </div>
        ))}

        <h2 style={{ marginTop: "20px" }}>เพิ่มบัญชี</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <select
            value={newBank.bankFin}
            onChange={(e) => setNewBank({ ...newBank, bankFin: e.target.value })}
            className="payment-input-bar"
          >
            {thaiBanks.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          <input type="text" placeholder="ชื่อธนาคาร" value={newBank.bankName} onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })} className="payment-input-bar" />
          <input
            type="text"
            placeholder="เลขบัญชี"
            value={newBank.accountNumber}
            onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
            className="payment-input-bar"
            maxLength={10}
          />
          {bankError && <div style={{ color: "red" }}>{bankError}</div>}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleAddBank}
              className="payment-start-button"
            >
              เพิ่มบัญชี
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}

export default Payment;
