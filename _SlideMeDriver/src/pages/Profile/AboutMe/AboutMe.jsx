import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "react-bootstrap";

import "./AboutMe.css";

function AboutMe({ setOnClickAboutMe }) {
    const navigate = useNavigate();

    return (
        <div className="aboutme-container">
            <Button variant="success" style={{ marginLeft: "1.5rem" }} className='back-button d-flex' onClick={() => setOnClickAboutMe(false)}>
                <span className='bi bi-caret-left-fill d-flex'></span>
            </Button>
            <h1 className="aboutme-title">About Dev</h1>

            <div style={{ maxHeight: "74vh", overflowY: "auto" }} className="aboutme-content">
                <div className="">
                    <label htmlFor="" className="aboutme-a"></label>
                    <br />
                    <span>66078688 นางสาว จิตติมา โอภาพ</span>
                </div>

                <div>
                    <label htmlFor="" className="aboutme-b"></label>
                    <br />
                    <span>66080240 นาย วรเดช อาจวิชัย</span>
                </div>

                <div>
                    <label htmlFor="" className="aboutme-c"></label>
                    <br />
                    <span>66015716 นาย อมรเศรษฐ์ ธนาปรีชาศิริ</span>
                </div>

                <div>
                    <label htmlFor="" className="aboutme-d"></label>
                    <br />
                    <span>66018526 นาย เจตนะ เหลืองสอาด</span>
                </div>

                <div>
                    <label htmlFor="" className="aboutme-e"></label>
                    <br />
                    <span>66099910 นาย วรธนเวธน์ ณีศะนันท์</span>
                </div>
            </div>

        </div>
    );
}

export default AboutMe;