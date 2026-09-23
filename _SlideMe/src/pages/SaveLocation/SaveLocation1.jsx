import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import "./SaveLocation.css";
import "leaflet/dist/leaflet.css";

function SaveLocation1({ locations, addLocation, deleteLocation, setSelectPosition1 }) {
  const [limitReached, setLimitReached] = useState(false);
  const navigate = useNavigate();

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

  const [isMapView, setIsMapView] = useState(false);
  const [position, setPosition] = useState([13.736717, 100.523186]);
  const [location, setLocation] = useState({
    name: '',
    address: '',
    contactName: '',
    contactNumber: '',
    notes: '',
  });

  const fetchAddress = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data?.display_name) {
        setLocation((prev) => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }, []);

  function LocationMarker() {
    const map = useMapEvents({
      moveend() {
        const center = map.getCenter();
        setPosition([center.lat, center.lng]);
        fetchAddress(center.lat, center.lng);
      },
    });
    return null;
  }

  const centerIcon = new L.DivIcon({
    html: '<div style="font-size: 24px; color: red;"><i class="bi bi-geo-alt-fill"></i></div>',
    className: "center-pin-icon",
  });

  const openMapView = () => {
    if (location.address) {
      fetchCoordinates(location.address);
    }

    setIsMapView(true);
  };

  const selectedLoc = (location) => {
    console.log(location);
    setSelectPosition1(location);
    navigate('/home');
  }

  const fetchCoordinates = useCallback(async (address) => {
    if (!address.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data?.[0]) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  }, []);

  return (
    <div className="page-container">
      <div style={{ padding: "20px" }}>
        {isMapView ? (
          <>
            <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
              <Button variant="success" className='back-button d-flex' onClick={() => setIsMapView(false)}>
                <span className='bi bi-caret-left-fill d-flex'></span>
              </Button>
              <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>บันทึกที่อยู่</h2>
            </div>

            <div className="map-container" style={{ marginBottom: '20px', overflowY: "auto", maxHeight: "40rem" }}>
              <MapContainer center={position} zoom={15} style={{ height: "300px", width: "100%" }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution=''
                />
                <Marker position={position} icon={centerIcon} />
                <LocationMarker />
              </MapContainer>
              <div className="location-info">
                <p>ตำแหน่ง: {location.address || "กำลังโหลด..."}</p>
              </div>

              <div className="buttons-container">
                <button className="start-button" onClick={() => {
                  selectedLoc(location);
                }}>บันทึก</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
              <Link to="/">
                <Button variant="success" className='back-button d-flex'>
                  <span className='bi bi-caret-left-fill d-flex'></span>
                </Button>
              </Link>
              <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>บันทึกที่อยู่</h2>
            </div>

            {/* รายการที่อยู่ */}
            <div div className="address-list">
              <div className="buttons-container3">
                <button className="address-button-pin" onClick={() => {
                  setIsMapView(true);
                }}>
                  <span className="bi bi-geo-alt-fill fix"></span>
                  <div className="address-container">
                    <span className="card-title">ตำแหน่งปักหมุด</span>
                  </div>
                </button>
              </div>
              {locations.map((location) => (
                <div key={location.locationID} className="buttons-container3">
                  <button className="address-button" onClick={() => {
                    setSelectPosition1(location);
                    navigate('/home/');
                  }}>
                    <span className="bi bi-house-door-fill"></span>
                    <div className="address-container">
                      <span className="card-title">{location.name === '' ? 'ที่อยู่ใหม่' : location.name}</span>
                      <span className="card-title">{location.address === '' ? 'กรอกที่อยู่' : location.address}</span>
                    </div>
                  </button>

                  <div className="button-actions">
                    <Link to={`/home/save-location1/edit-location1?id=${location.locationID}`}>
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

          </>
        )}
      </div>
    </div >
  );
}

export default SaveLocation1;
