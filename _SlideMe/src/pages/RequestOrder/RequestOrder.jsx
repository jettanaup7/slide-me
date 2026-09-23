import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RequestOrder.css";

function RequestOrder({ selectPosition1, selectPosition2, token, fetchRequests, setSelectPosition1, setSelectPosition2 }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { sentBackDetails } = location.state || {};

    // State to store all details in a single object
    const [newOfferDetails, setNewOfferDetails] = useState({
        address1: selectPosition1.address,
        address2: selectPosition2.address,
        carType: "",
        otherCarType: "",
        carDetails: "",
        callType: "",
        orderDate: new Date(), // Replace bookingDate and bookingTime
        orderPictures: [],
    });

    useEffect(() => {
        if (sentBackDetails) {
            setNewOfferDetails(sentBackDetails);
        }
    }, [sentBackDetails]);

    // Booking Time Function
    const [showModal, setShowModal] = useState(false);
    const [immediateSelected, setImmediateSelected] = useState(false);
    const [scheduleSelected, setScheduleSelected] = useState(false);

    const handleImmediateClick = () => {
        setImmediateSelected(true);
        setScheduleSelected(false);
        setNewOfferDetails((prevState) => ({
            ...prevState,
            callType: "now"
        }));
    };

    const handleScheduleClick = () => {
        setScheduleSelected(true);
        setImmediateSelected(false);
        setShowModal(true);
        setNewOfferDetails((prevState) => ({
            ...prevState,
            callType: "advance"
        }));
    };

    const handleCloseModal = () => setShowModal(false);

    // Car Selection Function
    const handleCarTypeChange = (event) => {
        const value = event.target.value;
        setNewOfferDetails((prevState) => ({
            ...prevState,
            carType: value,
            otherCarType: value === "other" ? prevState.otherCarType : ""
        }));
    };

    const handleOtherCarTypeChange = (event) => {
        setNewOfferDetails((prevState) => ({
            ...prevState,
            otherCarType: event.target.value
        }));
    };

    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());

    const handleSaveDateTime = () => {
        const mergedDate = new Date(tempDate);
        mergedDate.setHours(tempTime.getHours());
        mergedDate.setMinutes(tempTime.getMinutes());
        mergedDate.setSeconds(0);
        mergedDate.setMilliseconds(0);

        setNewOfferDetails(prev => ({
            ...prev,
            orderDate: mergedDate,
        }));

        setShowModal(false);
    };


    // Check if the button should be disabled
    const isButtonDisabled = !newOfferDetails.carType || !newOfferDetails.callType;

    const [images, setImages] = useState([]);

    // Handle image upload
    const handleImageUpload = async (event, index = null) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await axios.post(
                    `https://api.imgbb.com/1/upload?key=368b9963c0be3d0fe89c85f1b479a302`,
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

                setNewOfferDetails((prevState) => ({
                    ...prevState,
                    orderPictures: [...images, imageUrl]
                }));
            }
            catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    // Handle image delete
    const handleImageDelete = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        setNewOfferDetails((prevState) => ({
            ...prevState,
            orderPictures: prevState.orderPictures.filter((_, i) => i !== index)
        }));
    };

    const sendRequest = async () => {
        try {

            if (!newOfferDetails.carType || !newOfferDetails.callType) {
                alert("กรุณากรอกข้อมูลให้ครบถ้วน");
                return;
            }


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

            console.log("Sending request with details:", {
                ...newOfferDetails,
                orderDate: formatDate(newOfferDetails.orderDate)
            });

            axios.post("http://localhost:3000/orders/cusReq/add", {
                ...newOfferDetails,
                orderDate: formatDate(newOfferDetails.orderDate)
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((response) => {
                    console.log("Request sent successfully:", response.data);
                    setSelectPosition1([]);
                    setSelectPosition2([]);
                    fetchRequests();
                    navigate("/list/request-list");
                })
                .catch((error) => {
                    console.error("Error sending request:", error);
                    alert("เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง");
                });
        }
        catch (err) {
            console.log("Error")
        }
    }

    return (
        <div className="request-order-container">
            <div className="content-scrolling" style={{ padding: "15px" }}>
                <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
                    <Link to="/">
                        <Button variant="success" className='back-button d-flex'>
                            <span className='bi bi-caret-left-fill d-flex'></span>
                        </Button>
                    </Link>
                </div>
                <div className="location-container">
                    <div>
                        <h5>
                            <span className="icon badge bg-success rounded-pill">ต้นทาง</span>
                        </h5>
                        <span className="text">
                            {newOfferDetails.address1}
                        </span>
                        <h5>
                            <span className="icon badge bg-danger rounded-pill">ปลายทาง</span>
                        </h5>
                        <span className="text">
                            {newOfferDetails.address2}
                        </span>
                    </div>
                </div>
                <div className="req-input-container">
                    <select className="req-input-bar" value={newOfferDetails.carType} onChange={handleCarTypeChange}>
                        <option value="">ประเภทรถ</option>
                        <option value="Muscle Car">Muscle Car</option>
                        <option value="Sport Car">Sport Car</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="SUV">SUV</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Electric">Electric</option>
                        <option value="Pickup">Pickup</option>
                        <option value="other">อื่น ๆ</option>
                    </select>
                    {newOfferDetails.carType === 'other' && (
                        <input
                            className="req-input-bar"
                            type="text"
                            placeholder="ระบุประเภทอื่น ๆ"
                            value={newOfferDetails.otherCarType}
                            onChange={handleOtherCarTypeChange}
                        />
                    )}
                </div>

                <div className="req-input-container">
                    <Accordion className="accordion-container" defaultActiveKey="0">
                        <Accordion.Item eventKey="1">
                            <Accordion.Header className="accordion-header">ประเภทการเรียก</Accordion.Header>
                            <Accordion.Body>
                                <div className="options-container">
                                    <div
                                        className={`option ${immediateSelected ? 'selected' : ''}`}
                                        onClick={handleImmediateClick}
                                    >
                                        เรียกรถทันที<br />
                                        <i className="bi bi-truck-front-fill truck-icon"></i>
                                    </div>
                                    <div
                                        className={`option ${scheduleSelected ? 'selected' : ''}`}
                                        onClick={handleScheduleClick}
                                    >
                                        เรียกรถล่วงหน้า<br />
                                        <i className="bi bi-clock-fill truck-icon"></i>
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>

                {/* Modal */}
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>เลือกเวลา</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="modal-options-container">
                            <div className="date-time-picker-container">
                                <div className="modal-option">
                                    <DatePicker
                                        selected={tempDate}
                                        onChange={(date) => setTempDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="date-picker"
                                        minDate={new Date()}
                                    />
                                </div>
                                <DatePicker
                                    selected={tempTime}
                                    onChange={(time) => setTempTime(time)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="HH:mm"
                                    className="time-picker"
                                />
                            </div>
                        </div>
                        <div className="modal-save-button-container">
                            <button onClick={handleSaveDateTime} className="modal-save-button">
                                บันทึก
                            </button>
                        </div>
                    </Modal.Body>
                </Modal>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                    <div className="pic-container">
                        <label htmlFor="" className="pic-title">ภาพถ่ายรถยนต์</label>
                        <div className="pic-con-container">
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
                                    <label htmlFor="upload-button-new" className="add-picture">
                                        เพิ่มภาพถ่าย <span className="bi bi-camera-fill"></span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="req-input-container">
                    <input
                        className="req-input-bar"
                        type="text"
                        placeholder="รายละเอียดเพิ่มเติม"
                        value={newOfferDetails.carDetails || ''}
                        onChange={(e) => setNewOfferDetails({ ...newOfferDetails, carDetails: e.target.value })}
                    />
                </div>

                <div className="search-button-container">
                    <Button
                        className={`btn rounded-pill ${isButtonDisabled ? 'btn-secondary' : 'btn-success'}`}
                        size="lg"
                        onClick={() => {
                            sendRequest();
                        }}
                        disabled={isButtonDisabled}
                    >
                        <span className="bi bi-search"></span>&nbsp;ค้นหาผู้ให้บริการ
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default RequestOrder;
