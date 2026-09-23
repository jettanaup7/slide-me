import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';

import './Home.css';
import 'leaflet/dist/leaflet.css';

import banner from '../../data/banner.jsx';
import adPicture from '../../assets/ad/ad1.png';
import { Form } from 'react-bootstrap';

const provinces = [
    {
        name: "กรุงเทพมหานคร",
        districts: [
            { name: "พระนคร", coordinates: [13.764444, 100.499167] },
            { name: "ดุสิต", coordinates: [13.776944, 100.520556] },
            { name: "หนองจอก", coordinates: [13.855556, 100.8625] },
            { name: "บางรัก", coordinates: [13.729889, 100.528044] },
            { name: "บางเขน", coordinates: [13.870909, 100.5865] },
            { name: "บางกะปิ", coordinates: [13.765728, 100.647346] },
            { name: "ปทุมวัน", coordinates: [13.744942, 100.5222] },
            { name: "ป้อมปราบศัตรูพ่าย", coordinates: [13.758056, 100.513056] },
            { name: "พระโขนง", coordinates: [13.702222, 100.601667] },
            { name: "มีนบุรี", coordinates: [13.813889, 100.748056] },
            { name: "ลาดกระบัง", coordinates: [13.722317, 100.759669] },
            { name: "ยานนาวา", coordinates: [13.69388, 100.524114] },
            { name: "สัมพันธวงศ์", coordinates: [13.731389, 100.514167] },
            { name: "พญาไท", coordinates: [13.78, 100.542778] },
            { name: "ธนบุรี", coordinates: [13.727895, 100.491315] },
            { name: "บางกอกใหญ่", coordinates: [13.730278, 100.481667] },
            { name: "ห้วยขวาง", coordinates: [13.776667, 100.579444] },
            { name: "คลองสาน", coordinates: [13.730278, 100.509722] },
            { name: "ตลิ่งชัน", coordinates: [13.769464, 100.456238] },
            { name: "บางกอกน้อย", coordinates: [13.768445, 100.473558] },
            { name: "บางขุนเทียน", coordinates: [13.563236, 100.449197] },
            { name: "ภาษีเจริญ", coordinates: [13.714722, 100.437222] },
            { name: "หนองแขม", coordinates: [13.704722, 100.348889] },
            { name: "ราษฎร์บูรณะ", coordinates: [13.682222, 100.505556] },
            { name: "บางพลัด", coordinates: [13.790159, 100.509246] },
            { name: "ดินแดง", coordinates: [13.769722, 100.552778] },
            { name: "บึงกุ่ม", coordinates: [13.785278, 100.669167] },
            { name: "สาทร", coordinates: [13.709899, 100.529614] },
            { name: "บางซื่อ", coordinates: [13.819308, 100.539011] },
            { name: "จตุจักร", coordinates: [13.828611, 100.559722] },
            { name: "บางคอแหลม", coordinates: [13.704421, 100.518222] },
            { name: "ประเวศ", coordinates: [13.716944, 100.694444] },
            { name: "คลองเตย", coordinates: [13.708056, 100.583889] },
            { name: "สวนหลวง", coordinates: [13.741612, 100.652987] },
            { name: "จอมทอง", coordinates: [13.677222, 100.484722] },
            { name: "ดอนเมือง", coordinates: [13.913611, 100.589722] },
            { name: "ราชเทวี", coordinates: [13.758889, 100.534444] },
            { name: "ลาดพร้าว", coordinates: [13.803611, 100.6075] },
            { name: "วัฒนา", coordinates: [13.74288, 100.577511] },
            { name: "บางแค", coordinates: [13.720619, 100.391307] },
            { name: "หลักสี่", coordinates: [13.8875, 100.578889] },
            { name: "สายไหม", coordinates: [13.919167, 100.645833] },
            { name: "คันนายาว", coordinates: [13.8271, 100.6743] },
            { name: "สะพานสูง", coordinates: [13.77, 100.684722] },
            { name: "วังทองหลาง", coordinates: [13.781972, 100.590063] },
            { name: "คลองสามวา", coordinates: [13.859722, 100.704167] },
            { name: "บางนา", coordinates: [13.664929, 100.615965] },
            { name: "ทวีวัฒนา", coordinates: [13.775022, 100.396054] },
            { name: "บางบอน", coordinates: [13.66442, 100.395946] },
        ],
    },
];

function MapUpdater({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
}

function Home({ isAcceptingJobs, setIsAcceptingJobs, token }) {
    const navigate = useNavigate();

    const sliderRef = useRef(null);
    const [images, setImages] = useState([]);

    const [userData, setUserData] = useState([]);
    const [bankMethods, setBank] = useState([]);

    const defaultCenter = [13.8556296, 100.5854846];
    const [center, setCenter] = useState(defaultCenter); // Ma

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

    const fetchBankMethods = async () => {
        try {
            const response = await axios.get("http://localhost:3000/payments/driver/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const filteredBankMethods = response.data.filter((method) => method.isDefault == 1);
            setBank(filteredBankMethods);
        }
        catch (error) {
            console.error("Error fetching payment methods:", error);
        }
    };

    // 1. Fetch user data once
    useEffect(() => {
        fetchUserData();
        fetchBankMethods();
        setImages(banner);
    }, []);

    // 2. Update map center when userData is fetched
    useEffect(() => {
        const province = provinces.find((p) => p.name === userData.province);
        const district = province?.districts.find((d) => d.name === userData.district);

        if (district) {
            setCenter(district.coordinates);
        } else {
            setCenter(defaultCenter);
        }
    }, [userData]);


    const scrollToNextImage = (direction = 'right') => {
        const container = sliderRef.current;
        const imageWidth = container?.firstElementChild?.clientWidth || 0;

        if (container) {
            const currentScroll = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            if (direction === 'right' && currentScroll + imageWidth >= maxScroll) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (direction === 'left' && currentScroll <= 0) {
                container.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                const scrollAmount = direction === 'right' ? imageWidth + 10 : -imageWidth;
                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth',
                });
            }
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            scrollToNextImage('right');
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleJobToggle = (event) => {
        const { plateNumber, brand, details, province, district } = userData;

        if (event.target.checked) {
            if (plateNumber && brand && details && province && district) {
                if (bankMethods.length > 0) {
                    setIsAcceptingJobs(true);
                }
                else {
                    event.target.checked = false;
                    alert("กรุณาเพิ่มบัญชีธนาคารก่อนเปิดรับงาน");
                }
            }
            else {
                event.target.checked = false;
                alert("กรุณากรอกข้อมูลรถสไลด์ให้ครบถ้วนก่อนเปิดรับงาน");
            }
        } else {
            setIsAcceptingJobs(false);
        }
    }

    return (
        <div className="home-container">
            <div style={{ display: 'flex', justifyContent: 'right', paddingRight: '10px' }}>
                <Link to='/notification'>
                    <button
                        style={{
                            fontSize: '36px', width: '3rem',
                            height: '2.5rem',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: '#01c063',
                            transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            backgroundSize: '60%',
                            border: 'none',
                            borderRadius: '0.5rem',

                        }}
                        className={
                            "noti "}
                    >
                    </button>
                </Link>
            </div>
            <div className="banner-container">
                <button
                    className="nav-btn"
                    onClick={() => scrollToNextImage('left')}
                >
                    {/* Left Arrow Button */}
                </button>
                <div className="images-container" ref={sliderRef}>
                    {images.map((image, index) => (
                        <img
                            className="image"
                            alt="sliderImage"
                            key={image?.id}
                            src={image?.url}
                        />
                    ))}
                </div>
                <button
                    className="nav-btn"
                    onClick={() => scrollToNextImage('right')}
                >
                    {/* Right Arrow Button */}
                </button>
            </div>

            <div className="maps-container">
                <div
                    className={isAcceptingJobs ? "map-onjob" : "map-disabled"}
                    style={{ border: '4px solid #00A050', width: '90%', borderRadius: '10px', overflow: 'hidden', marginBottom: '5px' }}
                    onClick={() => {
                        if (isAcceptingJobs) {
                            navigate('/home/offer-choice')
                        }
                    }}
                    disabled={!isAcceptingJobs}>
                    <MapContainer
                        center={center}
                        zoom={15}
                        style={{ height: '250px', width: '100%' }}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        zoomControl={false}
                        dragging={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={center} />
                    </MapContainer>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ fontWeight: 'bold' }}>เมนูคนขับ</h2>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <Form style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>ปิดรับงาน</span>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label="เปิดรับงาน"
                            className="custom-switch"
                            checked={isAcceptingJobs}
                            onChange={(e) => handleJobToggle(e)} // อัปเดตสถานะ
                        />
                    </Form>
                </div>
            </div>

            <div className="buttons-container">
                <Link to='/home/edit-slide-car'>
                    <button
                        className={!isAcceptingJobs ? "start-button" : "start-button-disabled"} // เปลี่ยนคลาสตามสถานะ
                        disabled={isAcceptingJobs} // ปิดการทำงานหากปิดรับงาน
                    >
                        แก้ไขข้อมูลรถสไลด์ <span className="bi bi-truck-flatbed" style={{ color: "white", marginRight: '8px' }}></span>
                    </button>
                </Link>
                <Link to='/home/edit-distance'>
                    <button
                        className={!isAcceptingJobs ? "start-button" : "start-button-disabled"} // เปลี่ยนคลาสตามสถานะ
                        disabled={isAcceptingJobs} // ปิดการทำงานหากปิดรับงาน
                    >
                        แก้ไขขอบเขตงาน <span className="bi bi-geo-alt-fill" style={{ color: "white", marginRight: '8px' }}></span>
                    </button>
                </Link>
            </div>

            <div className="ad-container">
                <img src={adPicture} alt="Ad" className="ad-image" />
            </div>
        </div>
    );
}

export default Home;