import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import L from "leaflet"; // Install leaflet: npm install leaflet

import Chat from "./Chat/Chat";
import Evidence from "./EvidenceSend/EvidenceSend";

import SlideLogo from "../../assets/slide-car-blue.png";

import "leaflet/dist/leaflet.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./ProcessWorking.css";

function ProcessWorking({ fetchOrders, token }) {
  const [progress, setProgress] = useState(0); // Initial progress value
  const [location1, setLocation1] = useState(null); // State for address1 coordinates
  const [location2, setLocation2] = useState(null); // State for address2 coordinates

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const orderID = queryParams.get("orderID");
  const [selectedOrder, setSelectedOrder] = useState([]);

  const mapRef = React.useRef(null); // Ref for the map
  const mapContainerRef = React.useRef(null); // Ref for the map container

  const [driverLat, setDriverLat] = useState(null);
  const [driverLon, setDriverLon] = useState(null);
  const driverMarkerRef = React.useRef(null);

  const [isChatOpen, setIsChatOpen] = useState(false); // State to track if chat is open
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false); // State to track if evidence is open
  const [isLastStage, setIsLastStage] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [hasReachedDestination, setHasReachedDestination] = useState(false);

  const [showModal, setShowModal] = useState(false); // State for modal visibility

  // Function to handle modal visibility
  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/orders/${orderID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.result) {
        console.log("Order fetched successfully:", res.data.result[0]);
        setSelectedOrder(res.data.result[0]);
        setIsLoading(false);
        if (res.data.result[0].isgetCar == 1) {
          setIsLastStage(true)
        }
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


  // Fetch location from Nominatim API
  const fetchLocation = async (address, setLocation) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
      } else {
        console.error("Location not found for", address);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    if (selectedOrder?.pickupLocation) {
      fetchLocation(selectedOrder.pickupLocation, setLocation1);
    }
    if (selectedOrder?.dropoffLocation) {
      fetchLocation(selectedOrder.dropoffLocation, setLocation2);
    }
  }, [selectedOrder]);

  const [routePoints, setRoutePoints] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);


  const fetchRoute = async () => {
    if (location1 && location2) {
      const { lat: lat1, lon: lon1 } = location1;
      const { lat: lat2, lon: lon2 } = location2;

      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?geometries=geojson&alternatives=false&steps=false`;

      try {
        const response = await fetch(routeUrl);
        const data = await response.json();
        const route = data.routes[0].geometry.coordinates;

        setRoutePoints(route); // Save route points
        setRouteIndex(0); // Reset index

        // Draw the polyline
        if (mapRef.current) {
          const polyline = L.polyline(route.map(coord => [coord[1], coord[0]]), {
            color: "blue",
            weight: 5,
          }).addTo(mapRef.current);

          const bounds = polyline.getBounds();
          mapRef.current.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  useEffect(() => {
    if (!isLastStage || routePoints.length === 0 || hasReachedDestination) return; // ✅ Don't proceed if done

    const interval = setInterval(() => {
      if (routeIndex >= routePoints.length) {
        clearInterval(interval);
        return;
      }

      const [lon, lat] = routePoints[routeIndex];
      setDriverLat(lat);
      setDriverLon(lon);

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([lat, lon]);
      }

      axios.put(`http://localhost:3000/orders/driver-location`, {
        orderID: orderID,
        orderLatitude: lat,
        orderLongitude: lon,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Update driver location error:", error));

      setRouteIndex(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLastStage, routePoints, routeIndex, token, hasReachedDestination]); // ✅ Add flag to dependencies

  const fetchDriverLocation = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/orders/${orderID}/driver-location`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.result) {
        const lat = res.data.result[0].orderLatitude;
        const lon = res.data.result[0].orderLongitude;

        setDriverLat(lat);
        setDriverLon(lon);

        if (driverMarkerRef.current) {
          driverMarkerRef.current.setLatLng([lat, lon]); // Use the fresh values directly
        }
      }
    } catch (error) {
      console.error("Error fetching driver location:", error);
    }
  };

  // Initialize or re-initialize the map when locations change
  useEffect(() => {
    if (location1 && location2 && !isChatOpen) {
      // Destroy the map instance if it already exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (!mapContainerRef.current) return;

      // Calculate the midpoint between pickupLocation and dropoffLocation
      const midLat = (location1.lat + location2.lat) / 2;
      const midLon = (location1.lon + location2.lon) / 2;

      // Initialize the map with zoomControl and dragging set to false
      mapRef.current = L.map(mapContainerRef.current, {
        zoom: 14,
        zoomControl: false, // Disable zoom buttons
      }).setView([midLat, midLon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add markers for pickupLocation and dropoffLocation
      const marker1 = L.marker([location1.lat, location1.lon]).addTo(mapRef.current).bindPopup("Address 1");
      const marker2 = L.marker([location2.lat, location2.lon]).addTo(mapRef.current).bindPopup("Address 2");

      const centerIcon = L.icon({
        iconUrl: SlideLogo, // Use the URL for your logo
        iconSize: [40, 40], // Adjust the size of the marker
        iconAnchor: [16, 32], // Anchor the icon at the bottom
        popupAnchor: [0, -32], // Popup will appear above the icon
      });

      driverMarkerRef.current = L.marker([driverLat, driverLon], { icon: centerIcon })
        .addTo(mapRef.current)
        .bindPopup("Pickup Location");

      fetchDriverLocation();

      // Fetch and draw the route
      fetchRoute();
    }
  }, [location2, isChatOpen, isEvidenceOpen]); // Re-run when locations or isChatOpen changes

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchDriverLocation();

      if (
        driverLat !== null &&
        driverLon !== null &&
        location2 &&
        Math.abs(driverLat - location2.lat) < 0.0001 &&
        Math.abs(driverLon - location2.lon) < 0.0001
      ) {
        setProgress(100); // Reached the dropoff location
        setHasReachedDestination(true); // ✅ Set flag
        clearInterval(interval);
      }
      else {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1)); // Animate as normal
      }
    }, 120);

    return () => clearInterval(interval); // Cleanup
  }, [driverLat, driverLon, location2]);


  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDriverLocation();
    }, 120); // Update every 120ms

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // If chat is open, render Chat component; otherwise render the payment process UI
  if (isChatOpen) {
    return <Chat setIsChatOpen={setIsChatOpen} orderID={orderID} token={token} />;
  }
  else if (isEvidenceOpen) {
    return <Evidence
      setIsEvidenceOpen={setIsEvidenceOpen}
      isLastStage={isLastStage}
      setIsLastStage={setIsLastStage}
      selectedOrder={selectedOrder}
      fetchOrder={fetchOrder}
      token={token} />;
  }

  return (
    <div className="proworking-container">
      <div className="back-button-container">
        <Link to="/">
          <Button variant="success" className="back-button d-flex">
            <span className="bi bi-caret-left-fill d-flex"></span>
          </Button>
        </Link>
      </div>

      <div
        id="map"
        ref={mapContainerRef}
        style={{ height: "350px", width: "100%" }}
      ></div>

      <div className="status-main-container">
        <div className="status-container">
          <span style={{ fontWeight: "bold" }} className="driver">
            รายละเอียดผู้ให้บริการ
          </span>

          <div className="status-bar-container">
            <div className="status-icon">
              <i className="bi bi-truck"></i>
            </div>
            <div className="status-progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-end"></div>
            </div>
            <button
              className="working-button"
              onClick={() => setIsEvidenceOpen(true)} // Set chat open when clicked
            >
              อัพเดตสถานะ
            </button>
          </div>
        </div>

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

        <div style={{ textAlign: "center" }}>
          <p style={{ color: '#FFBF00', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleShowModal()}>ดูรายละเอียดเพิ่มเติม</p>
          <div className="proworking-button-container">
            <button className="working-button">
              ติดต่อลูกค้า
            </button>
            <button
              className="working-button"
              onClick={() => setIsChatOpen(true)} // Set chat open when clicked
            >
              แชทติดต่อ
            </button>
          </div>
        </div>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Body>
            <div className="modal-contrainer">
              <Modal.Title clas>รายละเอียดเพิ่มเติม</Modal.Title>
              {isLoading ? (
                <p>Loading...</p>
              ) : (<div className="image-preview">
                {selectedOrder.orderPictures.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="preview-img"
                    style={{ marginRight: '10px', cursor: 'pointer' }}
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
              </div>)}
              <div className="more-details-modal">
                <h3>{!selectedOrder.carDetails ? "ไม่มีรายละเอียดเพิ่มเติม" : selectedOrder.carDetails}</h3>
              </div>
              <Button variant="success" onClick={handleCloseModal}>
                ปิด
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default ProcessWorking;
