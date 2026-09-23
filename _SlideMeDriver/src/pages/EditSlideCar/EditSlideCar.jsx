import axios from "axios";
import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import "./EditSlideCar.css";

function EditSlideCar({ token }) {
  const [userData, setUserData] = useState([]);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      axios.get(`http://localhost:3000/userDriver/data/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.data) {
            console.log("User data:", response.data[0]);
            setUserData(response.data[0]);
            const imageUrls = response.data[0].driverPictures.map((pic) => pic.picURL);
            setImages(imageUrls);
          }
          else {
            console.error("No user data found");
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error.response?.data || error);
        })
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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


  // Handle image delete
  const handleImageDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Save updated data to userData
  const handleSave = () => {
    const updatedUserData = { ...userData, driverPictures: images.map((url) => ({ picURL: url })) };

    axios.put(`http://localhost:3000/userDriver/updateDetails`, updatedUserData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        console.log("User data updated successfully:", response.data);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error updating user data:", error);
      });

  };

  return (
    <div className="page-container">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
          <Link to="/">
            <Button variant="success" className='back-button d-flex'>
              <span className='bi bi-caret-left-fill d-flex'></span>
            </Button>
          </Link>
        </div>

        <div className="input-container">
          {/* Editable input fields with initial informDriver */}
          <div style={{ textAlign: "left" }}>
            <label htmlFor="" className="title">เลขทะเบียนรถ</label>
            <input
              className="input-bar"
              type="text"
              value={userData.plateNumber}
              onChange={(e) => setUserData({ ...userData, plateNumber: e.target.value })}
              placeholder="เลขทะเบียนรถ"
            />
          </div>
          <div style={{ textAlign: "left" }}>
            <label htmlFor="" className="title">ยี่ห้อรถสไลด์</label>
            <input
              className="input-bar"
              type="text"
              value={userData.brand}
              onChange={(e) => setUserData({ ...userData, brand: e.target.value })}
              placeholder="ยี่ห้อรถสไลด์"
            />
          </div>
          <div style={{ textAlign: "left" }}>
            <label htmlFor="" className="title">ภาพถ่ายรถสไลด์</label>
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

          <div style={{ textAlign: "left" }}>
            <label htmlFor="" className="title">รายละเอียดเพิ่มเติม</label>
            <input
              className="input-bar"
              type="text"
              value={userData.details}
              onChange={(e) => setUserData({ ...userData, details: e.target.value })}
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </div>

          <div className='buttons-container'>
            <button className='edit-save-button' onClick={handleSave}>
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditSlideCar;
