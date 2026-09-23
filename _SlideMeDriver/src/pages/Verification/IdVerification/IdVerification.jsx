import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";

import "./IdVerification.css";

function IdVerification({ setIdentityCard, setIsIdVerifiOpen, setIsDoneIDVerifi }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post(
          "https://api.imgbb.com/1/upload?key=c49a5cefe44932d30ee15901433c34b5",
          formData
        );
        const imageUrl = res.data.data.url;
        setSelectedImage(imageUrl);
        setIdentityCard(imageUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  const handleCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post(
          "https://api.imgbb.com/1/upload?key=c49a5cefe44932d30ee15901433c34b5",
          formData
        );
        const imageUrl = res.data.data.url;
        setSelectedImage(imageUrl);
        setIdentityCard(imageUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIdentityCard(selectedImage);
  };

  return (
    <div className="IdVerification-container">
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "left",
            justifyContent: "left",
            gap: "10px",
            marginBottom: "20px",
            marginLeft: "1.5rem",
          }}
        >
          <Button
            variant="success"
            className="back-button d-flex"
            onClick={() => setIsIdVerifiOpen((false))}
          >
            <span className="bi bi-caret-left-fill d-flex"></span>
          </Button>
          <h2
            className="d-flex"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginLeft: "1.5rem",
            }}
          >
            ยืนยันบัตรประชาชน
          </h2>
        </div>

        <div className="ID-label-container">

          <div className="ID-reccomend">
            กรุณาวางเอกสารให้อยู่ในกรอบที่กำหนด<br />ให้เห็นตัวอักษรและข้อมูลบนบัตรอย่างชัดเจน
          </div>

          <div className="input-container" style={{ textAlign: "center" }}>
            <form onSubmit={handleSubmit}>

              <div className="preview-container">
                {selectedImage ? (
                  <div className="image-wrapper">
                    <img src={selectedImage} alt="Selected" />
                    <button
                      className="delete-button"
                      onClick={() => setSelectedImage(null)}
                    >
                      ✖
                    </button>
                  </div>
                ) : (
                  <p>ยังไม่มีรูปภาพ</p>
                )}
              </div>


              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                id="cameraInput"
                style={{ display: "none" }}
                className="bg-success camInput"
              />
              <label htmlFor="cameraInput" className="id-camera-label">
                <span class="bi bi-camera-fill"></span> &nbsp;ถ่ายภาพ
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="uploadInput"
                style={{ display: "none" }}
                className="bg-success imgInput"
              />
              <label htmlFor="uploadInput" className="id-camera-label">
                <span class="bi bi-card-image"></span> &nbsp;เพิ่มรูป
              </label>

              <button className="id-submit" type="submit" onClick={() => {
                if (!selectedImage) {
                  setErrorMessage("กรุณาถ่ายภาพบัตรประชาชนก่อน")
                  return
                }
                setErrorMessage('')
                setIsDoneIDVerifi(true)
                setIsIdVerifiOpen(false)
              }}>
                ยืนยัน
              </button>

              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdVerification;
