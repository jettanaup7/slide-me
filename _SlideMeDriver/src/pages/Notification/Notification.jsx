import React, { useState } from 'react';
import { Modal, Button, ListGroup, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Notification.css'

// const promotions = [
//     { title: 'ใส่รหัส Sildeme50 ลดเพิ่ม', details: 'รายละเอียดเพิ่มเติม' },
//     { title: 'ใส่รหัส Sildeme100 ลดเพิ่ม', details: 'รายละเอียดเพิ่มเติม' },
//     { title: 'โปรพิเศษ ซื้อ 1 แถม 1', details: 'รายละเอียดเพิ่มเติม' },
//     { title: 'ลด 20% สำหรับลูกค้าใหม่', details: 'รายละเอียดเพิ่มเติม' },
//     { title: 'โปรลดราคากระหน่ำ', details: 'รายละเอียดเพิ่มเติม' },
//     { title: 'ใส่รหัส FREEDELIVERY รับจัดส่งฟรี', details: 'รายละเอียดเพิ่มเติม' },
// ];

function Notification() {
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'ใส่รหัส Sildeme50 ลดเพิ่ม', details: 'รับส่วนลดพิเศษ 50 บาท เมื่อใช้รหัส Sildeme50 ในการชำระเงิน' },
        { id: 2, title: 'ใส่รหัส Sildeme100 ลดเพิ่ม', details: 'รับส่วนลดพิเศษ 100 บาท เมื่อใช้รหัส Sildeme100 ในการชำระเงิน' },
        { id: 3, title: 'ส่วนลด 20% สำหรับลูกค้าใหม่', details: 'ลูกค้าใหม่รับส่วนลดทันที 20% สำหรับการใช้บริการครั้งแรก' },
        { id: 4, title: 'โปรโมชันสะสมแต้มแลกส่วนลด', details: 'สะสมแต้มครบ 100 แต้ม รับส่วนลด 50 บาททันที' },
        { id: 5, title: 'ลดพิเศษสำหรับการจัดส่งในกรุงเทพ', details: 'ลดเพิ่มอีก 10% สำหรับการจัดส่งในกรุงเทพตอนนี้' },
        { id: 6, title: 'ส่วนลดวันเกิด', details: 'รับส่วนลด 25% เมื่อใช้บริการภายในเดือนเกิดของคุณ' },
        { id: 7, title: 'ชวนเพื่อนมาสมัครรับเครดิต', details: 'เชิญเพื่อนสมัครใช้งาน รับเครดิตเงินคืน 100 บาททันที' },
        { id: 8, title: 'รับเงินคืน 10% ทุกการสั่งซื้อ', details: 'ทุกการสั่งซื้อจะได้รับเงินคืน 10% เข้ากระเป๋าเครดิตของคุณ' }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const handleShowModal = (notification) => {
        setSelectedNotification(notification);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedNotification(null);
        setShowModal(false);
    };

    const handleDeleteNotification = (id) => {
        setNotifications(notifications.filter((notification) => notification.id !== id));
    };

    return (
        <div className='noti-container'>
            <div style={{ paddingTop: '20px' }}>
                <h2 style={{ fontWeight: 'bold', marginTop: '1rem', marginLeft: '2rem' }}>การแจ้งเตือน</h2>
                <div className="promotion-list">
                    <div className="promotion-container">
                        {notifications.map((notification) => (
                            <div className="promotion-item" key={notification.id}>
                                <div className="promotion-icon"></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div className="promotion-details">
                                        <h3 style={{ fontWeight: 'bold' }}>{notification.title}</h3>
                                        <p onClick={() => handleShowModal(notification)}
                                        >รายละเอียดเพิ่มเติม
                                        </p>
                                    </div>
                                </div>

                                <button className='delete-noti'
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering modal
                                        handleDeleteNotification(notification.id);
                                    }}
                                >
                                    <span className="bi bi-trash-fill"></span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Modal */}
                {selectedNotification && (
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedNotification.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{selectedNotification.details}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                ปิด
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default Notification;