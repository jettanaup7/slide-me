import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./OfferChoice.css";
import { use } from "react";

function OfferChoice({ token, selectedOffer, setSelectedOffer }) {
    const [activeTab, setActiveTab] = useState("details");
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const cusReqID = queryParams.get("cusReqID");

    const [requestDetails, setRequestDetails] = useState([]);

    const [driverOffers, setDriverOffers] = useState([]);

    const fetchOffers = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/orders/driverReq/byCusID/${cusReqID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.result) {
                setDriverOffers(res.data.result);
                console.log("Offers fetched successfully:", res.data.result);
            } else {
                console.error("Invalid data format", res.data);
            }
        } catch (error) {
            console.error("Fetch Offers Error:", error);
        }
    };

    const fetchRequest = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/orders/cusReq/${cusReqID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.result) {
                setRequestDetails(res.data.result[0]);
                console.log("Request fetched successfully:", res.data.result);
            } else {
                console.error("Invalid data format", res.data);
            }
        } catch (error) {
            console.error("Fetch Request Error:", error);
        }
    }

    useEffect(() => {
        fetchRequest();
        fetchOffers();

        const intervalId = setInterval(() => {
            fetchOffers();
        }, 5000); // every 5 seconds

        return () => clearInterval(intervalId); // cleanup on unmount
    }, []);


    const [map, setMap] = useState(null);

    // Fetch location by address using Nominatim API
    const fetchLocationByAddress = async (address) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0]; // Get the first match
            return { lat: parseFloat(lat), lng: parseFloat(lon) };
        }
        return null; // Return null if no result found
    };

    // Initialize the map and search for the location
    useEffect(() => {
        const initMap = async () => {
            if (!requestDetails.pickupLocation) {
                console.warn("No address provided for location fetch");
                return;
            }

            const location = await fetchLocationByAddress(requestDetails.pickupLocation);
            if (location) {
                if (map) {
                    map.remove(); // Remove the old map instance
                }

                const newMap = L.map("map", {
                    center: [location.lat, location.lng],
                    zoom: 14,
                    dragging: false, // Make map undraggable
                    scrollWheelZoom: false, // Disable scroll zoom
                    zoomControl: false, // Disable zoom buttons
                });

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                }).addTo(newMap);

                // Add marker at the location
                L.marker([location.lat, location.lng]).addTo(newMap);

                // Add a circle with a 200m radius around the marker (scanning area)
                L.circle([location.lat, location.lng], {
                    color: "transparent",  // No border
                    fillColor: "yellow",  // Circle fill color
                    fillOpacity: 0.2,     // Circle fill opacity
                    radius: 1000,          // 1000 meters radius
                }).addTo(newMap);

                setMap(newMap); // Save the map instance for future updates
            } else {
                console.error("Location not found for the given address");
            }
        };

        initMap();

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [requestDetails.pickupLocation]);

    const deleteRequest = async () => {
        const confirmed = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอ?");
        if (confirmed) {
            try {
                alert("กำลังรอการยกเลิกคำขอ");
                axios.put(`http://localhost:3000/orders/cusReq/cancel`, { cusReqID }, { headers: { Authorization: `Bearer ${token}` } });
                alert("ยกเลิกคำขอเรียบร้อยแล้ว");
                navigate("/list/request-list");
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        }
    }

    // Function to handle selecting an offer
    const handleSelectOffer = async (offer) => {
        const location = await fetchLocationByAddress(requestDetails.pickupLocation);
        const confirmed = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการเลือกรายการนี้? ไม่สามารถย้อนกลับได้");

        if (confirmed) {
            const summitDate = new Date();

            const formatDate = (date) => {
                const pad = (num) => num.toString().padStart(2, '0');
                const yyyy = date.getFullYear();
                const mm = pad(date.getMonth() + 1);
                const dd = pad(date.getDate());
                const hh = pad(date.getHours());
                const mi = pad(date.getMinutes());
                const ss = pad(date.getSeconds());
                return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
            };

            axios.post(`http://localhost:3000/orders/add`, { cusReqID, driReqID: offer.driReqID, orderLatitude: location.lat, orderLongitude: location.lng, orderDate: formatDate(summitDate) }, { headers: { Authorization: `Bearer ${token}` } })
                .then((res) => {
                    console.log(res.data);
                    navigate(`/list/process-payment/?orderID=${res.data.result}`);
                })
                .catch((error) => {
                    console.error("Error selecting offer:", error);
                });
        }
    };


    return (
        <div className="offer-container">
            <div style={{ padding: "10px" }}>
                {/* Back Button */}
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
                    <Button variant="success" className="back-button d-flex" onClick={() => navigate("/list/request-list")}>
                        <span className="bi bi-caret-left-fill d-flex"></span>
                    </Button>
                </div>

                {/* Map Section */}
                <div id="map" style={{ height: "350px", width: "100%" }}></div>

            </div>

            <div className="tab-container">
                {/* Tab Buttons */}
                <div className="tab-buttons">
                    <button
                        className={activeTab === "details" ? "active" : "unactive"}
                        onClick={() => setActiveTab("details")}
                    >
                        รายละเอียด
                    </button>
                    <button
                        className={activeTab === "offer" ? "active" : "unactive"}
                        onClick={() => setActiveTab("offer")}
                    >
                        Offer
                    </button>
                </div>

                {/* Content Section */}
                <div className="content-section">
                    {activeTab === "details" ? (
                        <div className="details-container">
                            <h3 style={{ display: 'flex', }}>
                                <span className="bi bi-geo-alt-fill" style={{ color: "red", marginRight: '8px' }}></span>
                                <span>{requestDetails.pickupLocation}</span>
                            </h3>
                            <h3 style={{ display: 'flex', }}>
                                <span className="bi bi-geo-alt-fill" style={{ color: "#01c063", marginRight: '8px' }}></span>
                                <span>{requestDetails.dropoffLocation}</span>
                            </h3>
                            <h3>
                                <b>ประเภทรถ:</b> &nbsp;
                                {requestDetails.carType}
                            </h3>
                            <h3>
                                <b>ประเภทการเรียกรถ:</b> &nbsp;
                                {requestDetails.callType === "now" ? "เรียกทันที" : "เรียกล่วงหน้า"}
                            </h3>
                            <button
                                className="btn btn-danger"
                                onClick={() => deleteRequest()} // Updated to use the hook method
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowY: "scroll", height: "15rem" }}>
                            {driverOffers && driverOffers.length > 0 ? (
                                driverOffers.map((offer) => (
                                    <div className="offer-item" key={offer.driReqID}>
                                        <div className="offer-title">
                                            <h3>{offer.driverName}</h3>
                                        </div>
                                        <div className="offer-detail">
                                            <h3 className="offer-price">
                                                {(Number(offer.requestPrice) + Number(offer.requestPrice * 0.1)).toFixed(2)} ฿
                                            </h3>
                                            <button
                                                className="click-button"
                                                onClick={() => {
                                                    handleSelectOffer(offer)
                                                }}
                                            >
                                                เลือก
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: "center", marginTop: "7.5rem" }}>
                                    <span>กรุณารอคำขอจากคนขับ</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

export default OfferChoice;
