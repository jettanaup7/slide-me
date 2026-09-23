import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./OfferChoice.css";

function OfferChoice({ requestList, fetchRequests, token }) {
    const [activeTab, setActiveTab] = useState("details");
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const cusReqID = queryParams.get("cusReqID");

    const [locationDetails, setLocationDetails] = useState([]);
    const [sentBackDetails, setsentBackDetails] = useState([]);

    const [customerRequest, setCustomerRequest] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState([]);
    const [userData, setUserData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);

    const [noCustomerRequest, setNoCustomerRequest] = useState(false);

    const [status, setStatus] = useState("รอให้คุณเสนอราคา");

    const fetchCustomerRequest = async () => {
        try {
            axios.get(`http://localhost:3000/orders/cusReq/all`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    if (response.data.result && response.data.result.length > 0) {
                        console.log("Customer request data:", response.data.result);
                        setCustomerRequest(response.data.result);
                        setNoCustomerRequest(false);
                        if (cusReqID) {
                            const selectedRequest = response.data.result.find(
                                (request) => String(request.cusReqID) === String(cusReqID)
                            );
                            if (selectedRequest) {
                                const findAlreadyRequest = requestList.find((request) => request.cusReqID === selectedRequest.cusReqID);
                                setSelectedRequest(selectedRequest);
                                setStatus("รอการตอบรับจากลูกค้า");
                                setOffer(findAlreadyRequest.requestPrice)
                            } else {
                                setSelectedRequest(response.data.result[0]);
                                const findAlreadyRequest = requestList.find((request) => request.cusReqID === response.data.result[0].cusReqID);
                                if (findAlreadyRequest) {
                                    setStatus("รอการตอบรับจากลูกค้า");
                                    setOffer(findAlreadyRequest.requestPrice)
                                }
                                else {
                                    setStatus("รอให้คุณเสนอราคา");
                                    setOffer("");
                                }
                            }
                        } else {
                            setSelectedRequest(response.data.result[0]);
                            const findAlreadyRequest = requestList.find((request) => request.cusReqID === response.data.result[0].cusReqID);
                            if (findAlreadyRequest) {
                                setStatus("รอการตอบรับจากลูกค้า");
                                setOffer(findAlreadyRequest.requestPrice)
                            }
                            else {
                                setStatus("รอให้คุณเสนอราคา");
                                setOffer("");
                            }
                        }

                        setIsLoading(false);
                    }
                    else {
                        console.error("No customer request data found");
                        setCustomerRequest([]);
                        setNoCustomerRequest(true);
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching customer request data:", error.response?.data || error);
                })
        } catch (error) {
            console.error("Error fetching customer request data:", error);
        }
    };

    const fetchUserData = async () => {
        try {
            axios.get(`http://localhost:3000/userDriver/data/details`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    if (response.data) {
                        console.log("User data:", response.data[0]);
                        setUserData(response.data[0]);
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

    const fetchPayment = async () => {
        try {
            axios.get(`http://localhost:3000/payments/driver/`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    if (response.data) {
                        console.log("Payment data:", response.data);
                        setPaymentData(response.data);
                    }
                    else {
                        console.error("No payment data found");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching payment profile:", error.response?.data || error);
                })
        } catch (error) {
            console.error("Error fetching payment data:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchCustomerRequest();
        fetchUserData();
        fetchPayment();
    }, []);


    // Function to handle selecting an offer
    const handleSelectOffer = (cusReqID) => {
        // setCustomerRequest where cusReqID is equal to the selected cusReqID
        const selectedRequest = customerRequest.find((request) => request.cusReqID === cusReqID);
        setSelectedRequest(selectedRequest)

        const findAlreadyRequest = requestList.find((request) => request.cusReqID === cusReqID);
        console.log("findAlreadyRequest", findAlreadyRequest);
        if (findAlreadyRequest) {
            setStatus("รอการตอบรับจากลูกค้า");
            setOffer(findAlreadyRequest.requestPrice)
            return;
        }
        setStatus("รอให้คุณเสนอราคา");
        setOffer("");
    };

    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const highlightMarker = async (marker) => {
        const carIcon = new L.Icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/75/75800.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        if (selectedMarker) {
            await selectedMarker.setIcon(carIcon);
        }

        const selectedIcon = new L.Icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/75/75800.png', // or any highlighted version
            iconSize: [42, 42],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
        });

        await marker.setIcon(selectedIcon);
        setSelectedMarker(marker);
    };

    useEffect(() => {
        const fetchCoordinates = async () => {
            try {
                // Step 1: Get map center from user's district
                const districtRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userData.district)}`);
                const districtData = await districtRes.json();

                if (!districtData || districtData.length === 0) {
                    console.error("District not found:", userData.district);
                    return;
                }

                const centerLat = parseFloat(districtData[0].lat);
                const centerLng = parseFloat(districtData[0].lon);

                // Cleanup old map
                if (map) {
                    map.remove();
                }

                // Step 2: Initialize map
                const newMap = L.map("map", {
                    center: [centerLat, centerLng],
                    zoom: 14,
                    zoomControl: false,
                });

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(newMap);

                // Add user location marker
                L.marker([centerLat, centerLng]).addTo(newMap);
                L.circle([centerLat, centerLng], {
                    color: "transparent",
                    fillColor: "yellow",
                    fillOpacity: 0.2,
                    radius: 1000,
                }).addTo(newMap);

                // 🚫 Skip marker creation if no customer requests
                if (!customerRequest || customerRequest.length === 0) {
                    setMap(newMap);
                    return;
                }

                // Step 3: Fetch coordinates for all pickup locations
                const carIcon = new L.Icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/75/75800.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                const geocodePickup = async (address) => {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
                    const data = await res.json();
                    return data.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
                };

                const pickupCoords = await Promise.all(
                    customerRequest.map(req => geocodePickup(req.pickupLocation))
                );

                const coordMap = new Map();
                const newMarkers = [];

                pickupCoords.forEach((coords, index) => {
                    if (!coords) return;

                    const key = `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
                    const count = coordMap.get(key) || 0;
                    coordMap.set(key, count + 1);

                    const offset = count * 0.0001;
                    const offsetLat = coords.lat + offset;
                    const offsetLng = coords.lng + offset;

                    const marker = L.marker([offsetLat, offsetLng], { icon: carIcon })
                        .addTo(newMap)
                        .on('click', () => {
                            handleSelectOffer(customerRequest[index].cusReqID);
                            highlightMarker(marker);
                        });

                    newMarkers.push(marker);
                });

                setMarkers(newMarkers);
                setMap(newMap);

            } catch (err) {
                console.error("Error initializing map with pickups:", err);
            }

            return () => {
                if (map) {
                    map.remove();
                }
            };
        };

        if (userData?.district && customerRequest.length > 0) {
            fetchCoordinates();
        }
    }, [userData?.district, customerRequest]);


    useEffect(() => {
        if (!selectedRequest || markers.length === 0) return;

        const index = customerRequest.findIndex(req => req.cusReqID === selectedRequest.cusReqID);
        if (index >= 0 && markers[index]) {
            highlightMarker(markers[index]);
        }
    }, [selectedRequest, markers]);

    const [offer, setOffer] = useState(""); // Raw numeric value

    const formatCurrency = (value) => {
        if (!value) return ""; // Handle empty input
        const formatter = new Intl.NumberFormat("th-TH", {
            style: "decimal", // Format as a plain number
            minimumFractionDigits: 0,
        });
        return formatter.format(value); // Add commas for thousands
    };

    const [showModal, setShowModal] = useState(false); // State for modal visibility

    const handleOfferSubmit = () => {
        if (offer) {
            const requestDate = new Date();

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

            const receivedPay = paymentData.find((item) => item.isDefault == 1)?.type || null; // Get the default

            axios.post(`http://localhost:3000/orders/driverReq/add`, {
                cusReqID: selectedRequest.cusReqID,
                requestDate: formatDate(requestDate),
                amount: offer,
                receivedPay: receivedPay
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    if (response.data) {
                        fetchRequests();
                        console.log("Offer submitted:", response.data);
                        setStatus("รอการตอบรับจากลูกค้า");
                    } else {
                        console.error("Failed to submit offer");
                    }
                })
                .catch((error) => {
                    console.error("Error submitting offer:", error.response?.data || error);
                });
        } else {
            alert("กรุณากรอกจำนวนเงิน");
        }
    };

    // Function to handle modal visibility
    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
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
                    <Button variant="success" className="back-button d-flex" onClick={() => navigate("/home/", { state: { sentBackDetails } })}>
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
                {noCustomerRequest ? (
                    <div className="no-request-message">
                        ไม่มีการเรียกใช้บริการในขณะนี้
                    </div>
                ) : (
                    // Your main content rendering
                    <div className="content-section">
                        {activeTab === "details" ? (
                            <div className="details-container">
                                <h3 style={{ display: 'flex', }}>
                                    <span className="bi bi-geo-alt-fill" style={{ color: "red", marginRight: '8px' }}></span>
                                    <span>{selectedRequest.pickupLocation}</span>
                                </h3>
                                <h3 style={{ display: 'flex', }}>
                                    <span className="bi bi-geo-alt-fill" style={{ color: "#01c063", marginRight: '8px' }}></span>
                                    <span>{selectedRequest.dropoffLocation}</span>
                                </h3>
                                <h3>
                                    <b>ชื่อลูกค้า:</b>&nbsp;
                                    {selectedRequest.customerName}
                                </h3>
                                <h3>
                                    <b>ประเภทรถ:</b>&nbsp;
                                    {selectedRequest.carType}
                                </h3>
                                <h3>
                                    <b>ประเภทการเรียกรถ:</b>&nbsp;
                                    {selectedRequest.callType === "scheduled" ? "เรียกล่วงหน้า" : "เรียกทันที"}
                                </h3>

                                <h3 onClick={() => handleShowModal()} className="more-details">
                                    ดูรายละเอียดเพิ่มเติม &gt;&gt;
                                </h3>
                            </div>
                        ) : (
                            <div>
                                <div className="details-container">
                                    <div className="offer-item">
                                        <div className="offer-title">
                                            <h3><b>เสนอราคา</b></h3>
                                        </div>
                                        <input
                                            type="text"
                                            id="offer-input"
                                            className="offer-input"
                                            placeholder="กรอกจำนวนเงิน"
                                            value={
                                                status !== "รอให้คุณเสนอราคา"
                                                    ? `${formatCurrency(offer)}฿` // Add ฿ only when disabled
                                                    : offer // Show raw numeric input when editable
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, ""); // Strip non-numeric characters
                                                setOffer(value); // Store raw numeric value
                                            }}
                                            disabled={status !== "รอให้คุณเสนอราคา"} // Control editable state
                                        />

                                        {status !== "รอการตอบรับจากลูกค้า" && (
                                            <button className="offer-button" onClick={handleOfferSubmit} disabled={status !== "รอให้คุณเสนอราคา"}>
                                                เสนอราคา
                                            </button>
                                        )}

                                    </div>

                                    <h3 style={{ marginTop: '2rem' }}><b>สถานะ: </b>
                                        <span style={{ color: '#FFBF00' }}>{status}</span>
                                    </h3>
                                </div>
                            </div>
                        )}

                        {/* Modal for More Details */}
                        <Modal show={showModal} onHide={handleCloseModal} centered>
                            <Modal.Body>
                                <div className="modal-contrainer">
                                    <Modal.Title clas>รายละเอียดเพิ่มเติม</Modal.Title>
                                    {isLoading ? (
                                        <p>Loading...</p>
                                    ) : (<div className="image-preview">
                                        {selectedRequest.orderPictures.map((image, index) => (
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
                                        <h3>{!selectedRequest.carDetails ? "ไม่มีรายละเอียดเพิ่มเติม" : selectedRequest.carDetails}</h3>
                                    </div>
                                    <Button variant="success" onClick={handleCloseModal}>
                                        ปิด
                                    </Button>
                                </div>
                            </Modal.Body>
                        </Modal>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OfferChoice;
