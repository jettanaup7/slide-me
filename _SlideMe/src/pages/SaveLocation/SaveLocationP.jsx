import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import "./SaveLocation.css";
import "leaflet/dist/leaflet.css";

function SaveLocationP({ locations, addLocation, deleteLocation }) {
  const [limitReached, setLimitReached] = useState(false);

  const handleAddLocation = () => {
    if (locations.length >= 5) {
      setLimitReached(true);
      return; // Do nothing if the limit is already reached
    }

    const newLocation = {
      name: '',
      address: '',
      contactName: '',
      contactNumber: '',
      notes: '',
    };

    addLocation(newLocation);
  };

  return (
    <div className="page-container">
      <div style={{ padding: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
          <Link to="/profile/">
            <Button variant="success" className='back-button d-flex'>
              <span className='bi bi-caret-left-fill d-flex'></span>
            </Button>
          </Link>
          <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>บันทึกที่อยู่</h2>
        </div>

        {/* รายการที่อยู่ */}
        <div className="address-list">
          {locations.map((location) => (
            <div key={location.locationID} className="buttons-container3">
              <button className="address-button">
                <span className="bi bi-house-door-fill"></span>
                <div className="address-container">
                  <span className="card-title">{location.name === '' ? 'ที่อยู่ใหม่' : location.name}</span>
                  <span className="card-title">{location.address === '' ? 'กรอกที่อยู่' : location.address}</span>
                </div>
              </button>

              <div className="button-actions">
                <Link to={`/profile/save-location/edit-location?id=${location.locationID}`}>
                  <button className="edit-button">
                    <span className="bi bi-pencil-square"></span>
                  </button>
                </Link>

                <button className="delete-button" onClick={() => deleteLocation(location.locationID)}>
                  <span className="bi bi-trash-fill"></span>
                </button>
              </div>
            </div>
          ))}
        </div>


        {/* ปุ่มเพิ่มที่อยู่ใหม่ */}
        <div className="buttons-container2">
          <button
            className="save-button"
            onClick={handleAddLocation}
          >
            + เพิ่ม
          </button>
        </div>

        {/* Show a warning if the limit is reached and button is pressed */}
        {limitReached && (
          <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
            คุณไม่สามารถเพิ่มที่อยู่ได้เกิน 5 รายการ
          </p>
        )}
      </div>
    </div>
  );
}

export default SaveLocationP;
