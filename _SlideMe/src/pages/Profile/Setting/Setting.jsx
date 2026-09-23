import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "./Setting.css";

import AboutMe from "../AboutMe/AboutMe";

function Setting({ setToken }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [onClickAboutMe, setOnClickAboutMe] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true);  // Show confirmation modal
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    setToken(null);  // Log the user out
    navigate("/");  // Redirect to the login page
  };

  const handleCancelLogout = () => {
    setShowModal(false);  // Close the modal without logging out
  };

  if (onClickAboutMe) {
    return <AboutMe setOnClickAboutMe={setOnClickAboutMe} />;
  }

  return (
    <div className="Setting-container">
      <div style={{ padding: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
          <Button variant="success" className='back-button d-flex' onClick={() => navigate("/profile/")}>
            <span className='bi bi-caret-left-fill d-flex'></span>
          </Button>
          <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>การตั้งค่าแอพ</h2>
        </div>
        <div>
          <button className="buttonclick">
            &nbsp;<span className="bi bi-translate text-success"></span>&nbsp;&nbsp;ภาษา
          </button>
          <button className="buttonclick">
            &nbsp;<span className="bi bi-bell-fill text-success"></span>&nbsp;&nbsp;การแจ้งเตือน
          </button>
          <button className="buttonclick">
            &nbsp;<span className="bi bi-question-circle-fill text-success"></span>&nbsp;&nbsp;ศูนย์ช่วยเหลือ
          </button>
          <button className="buttonclick">
            &nbsp;<span className="bi bi-lock-fill text-success"></span>&nbsp;&nbsp;ข้อมูลและความเป็นส่วนตัว
          </button>
          <button className="buttonclick" onClick={() => setOnClickAboutMe(true)}>
            &nbsp;<span className="bi bi-info-circle-fill text-success"></span>&nbsp;&nbsp;เกี่ยวกับ Slide Me
          </button>
          <button className="buttonclick" onClick={handleLogoutClick}>
            &nbsp;<span className="bi bi-person-fill-gear text-success"></span>&nbsp;&nbsp;เปลี่ยนบัญชี
          </button>
          <button className="buttonclick">
            &nbsp;<span className="bi bi-trash3-fill text-danger"></span>&nbsp;&nbsp;ลบบัญชี
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleCancelLogout} centered>
        <Modal.Body>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <Modal.Title><b>ยืนยันการออกจากระบบ</b></Modal.Title>
            <div>
              <h3>คุณแน่ใจไหมว่าต้องการเปลี่ยนบัญชี?</h3>
            </div>
            <div style={{ gap: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Button variant="danger" onClick={handleCancelLogout}>
                ยกเลิก
              </Button>
              <Button variant="success" onClick={handleConfirmLogout}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Setting;
