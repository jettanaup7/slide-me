import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "./EditLocation.css";

function EditLocationP({ locations, updateLocation }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const locationID = parseInt(params.get("id"));

  const [isMapView, setIsMapView] = useState(false);
  const [position, setPosition] = useState([13.736717, 100.523186]); // Default to Bangkok
  const [address, setAddress] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    contactNumber: "",
    notes: ""
  });

  useEffect(() => {
    if (!locations?.length || !locationID) return;

    const locationData = locations.find(loc => loc.locationID === locationID);
    if (!locationData) return;

    setFormData(prev => {
      if (
        prev.name === locationData.name &&
        prev.contactName === locationData.contactName &&
        prev.contactNumber === locationData.contactNumber &&
        prev.notes === locationData.notes
      ) {
        return prev; // Prevent unnecessary state updates
      }
      return {
        name: locationData.name || '',
        contactName: locationData.contactName || '',
        contactNumber: locationData.contactNumber || '',
        notes: locationData.notes || ''
      };
    });

    setAddress(prev => (prev === locationData.address ? prev : locationData.address || ''));

    if (locationData.address) fetchCoordinates(locationData.address);
  }, [locationID, locations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const saveAddress = () => {
    updateLocation(locationID, { ...formData, address });
    setIsMapView(false);
  };

  const saveLocation = () => {
    updateLocation(locationID, { ...formData, address });
    navigate("/profile/save-location/");
  }

  const fetchAddress = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data?.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }, []);

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
    if (address) {
      fetchCoordinates(address); // Center map on address when opening map
    }
    setIsMapView(true);
  };

  return (
    <div className="editloc-container">
      <div style={{ padding: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
          <Link to="/profile/save-location/">
            <Button variant="success" className='back-button d-flex'>
              <span className='bi bi-caret-left-fill d-flex'></span>
            </Button>
          </Link>
          <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>กำหนดตำแหน่ง</h2>
        </div>

        {isMapView ? (
          <div className="map-container">
            <MapContainer center={position} zoom={15} style={{ height: "300px", width: "100%" }} zoomControl={false}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution=''
              />
              <Marker position={position} icon={centerIcon} />
              <LocationMarker />
            </MapContainer>
            <div className="location-info">
              <p>ตำแหน่ง: {address || "กำลังโหลด..."}</p>
            </div>
            <div className="buttons-container">
              <button className="start-button" onClick={saveAddress}>บันทึก</button>
            </div>
          </div>
        ) : (
          <div className="edit-input-container">
            <div className="inputGPS">
              <input
                className="input-bar1"
                type="text"
                placeholder="กรอกคำค้นหาตำแหน่ง"
                value={address}
                onChange={handleAddressChange}
                onBlur={() => fetchCoordinates(address)} // Update coordinates on blur
              />

              <button className="GPS-button" onClick={openMapView}>
                <span className="bi bi-geo-alt-fill" style={{ color: "red" }}></span>
              </button>
            </div>
            <input
              className="input-bar"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="กรอกชื่อตำแหน่ง"
            />
            <input
              className="input-bar"
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              placeholder="กรอกชื่อสำหรับติดต่อ"
            />
            <input
              className="input-bar"
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="กรอกเบอร์สำหรับติดต่อ"
            />
            <input
              className="input-bar"
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="กรอกหมายเหตุ"
            />
            <div className="buttons-container">
              <button className="start-button" onClick={saveLocation}>บันทึก</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditLocationP;
