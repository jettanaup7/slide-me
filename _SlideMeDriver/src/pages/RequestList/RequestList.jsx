import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import './RequestList.css'

function RequestList({ requestList, fetchRequests, updateRequests, deleteRequests }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('waited');

    useEffect(() => {
        fetchRequests();
    }, []);


    const handleButtonClick = (tab) => {
        setActiveTab(tab);
        fetchRequests();
    };

    const handleChooseRequest = (request) => {
        if (request.requestStatus === 'waited') {
            navigate(`/home/offer-choice/?cusReqID=${request.cusReqID}`);
            return;
        }
        if (request.requestStatus === 'accepted') {
            return;
        }
        if (request.requestStatus === 'cancelled') {
            return;
        }
    }

    const filteredRequests = requestList.filter(request => request.requestStatus === activeTab);

    return (
        <div className='list-container'>
            <div className="request-list">
                <div className="request-buttons">
                    <button
                        className={`request-button ${activeTab === 'waited' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('waited')}
                    >
                        กำลังรอคอย
                    </button>
                    <button
                        className={`request-button ${activeTab === 'cancel' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('cancel')}
                    >
                        คำขอที่ยกเลิก
                    </button>
                    <button
                        className={`request-button ${activeTab === 'accepted' ? 'button-active' : ''}`}
                        onClick={() => handleButtonClick('accepted')}
                    >
                        คำขอที่ยืนยัน
                    </button>
                </div>

                <div className="request-container">
                    {filteredRequests.map((request) => (
                        <div className="request-item" key={request.cusReqID} onClick={() => handleChooseRequest(request)} style={{ cursor: 'pointer' }}>
                            <div className="request-icon"></div>
                            <div className="request-details">
                                <p style={{
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '250px' // <-- adjust as needed
                                }}>{request.customerName}</p>
                                <p><b>ประเภท:</b> {request.callType === 'now' ? 'เรียกทันที' : 'เรียกล่วงหน้า'}</p>
                                <p>{new Date(request.requestDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                            </div>
                            <div className='request-details2'>
                                <div className="order-amount">฿ {request.requestPrice}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RequestList;