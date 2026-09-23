import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

import "./EvidenceSend.css";

function EvidenceSend({ setIsEvidenceOpen, isLastStage, selectedOrder, token, fetchOrder }) {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  // Handle image upload
  const handleImageUpload = async (event, index = null) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=a8006fb18d60b1a6b6a35753e2d2ec39`,
          formData
        );
        const imageUrl = res.data.data.url;

        setImages((prevImages) => {
          if (index !== null) {
            const updatedImages = [...prevImages];
            updatedImages[index] = imageUrl;
            return updatedImages;
          } else {
            return [...prevImages, imageUrl];
          }
        });

      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleImageDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const updateEvidence = async () => {
    if (isLastStage) {

      // orderID, status, description, evidence
      const pickupCar = {
        orderID: selectedOrder.orderID,
        status: 'history',
        description: description,
        evidence: images,
      }

      axios.put(`http://localhost:3000/orders/update`, pickupCar, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          console.log("User data updated successfully:", response.data);
          alert("เสร็จงานเรียบร้อยแล้ว");
          navigate("/");
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
        });
    }
    else {
      const pickupCar = {
        orderID: selectedOrder.orderID,
        description: description,
        evidence: images,
      }

      axios.put(`http://localhost:3000/orders/getCar`, pickupCar, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          console.log("User data updated successfully:", response.data);
          fetchOrder();
          setIsEvidenceOpen(false)
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
        });
    }
  }

  return (
    <div className="evidence-container">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
          <Button variant="success" className='back-button d-flex' onClick={() => setIsEvidenceOpen(false)}>
            <span className='bi bi-caret-left-fill d-flex'></span>
          </Button>
        </div>

        <div className="evidence-input-container">
          <div style={{ textAlign: "left" }}>
            <label htmlFor="" className="title">ภาพหลักฐาน</label>
            <div className="pic-container">
              <div className="buttons-pic">
                {images.map((image, index) => (
                  <div key={index} className="image-preview" onClick={() => handleImageDelete(index)}>
                    <img src={image} alt={`Uploaded ${index + 1}`} className="preview-img" />
                    <div className="delete-overlay">
                      <span className="bi bi-trash-fill trash-icon"></span>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      style={{ display: "none" }}
                      id={`upload-button-new`}
                    />
                    <label htmlFor="upload-button-new" className="add">
                      เพิ่มภาพถ่าย <span className="bi bi-camera-fill"></span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="" className="title">รายละเอียด</label>
            <input
              className="evidence-input-bar"
              type="text"
              placeholder="รายละเอียดเพิ่มเติม"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="evidence-buttons-container">
            <button className="start-button" onClick={() => updateEvidence()}>
              {!isLastStage ? "อัพเดตสถานะ" : "จบงาน"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EvidenceSend;
