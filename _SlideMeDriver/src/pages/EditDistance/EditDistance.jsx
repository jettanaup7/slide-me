import axios from "axios";
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';

import './EditDistance.css';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

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
    map.setView(center, map.getZoom());
    return null;
}

function EditDistance({ token }) {
    const defaultCenter = [13.8556296, 100.5854846]; // Default coordinates
    const [selectedProvince, setSelectedProvince] = useState(""); // Selected province
    const [selectedDistrict, setSelectedDistrict] = useState(""); // Selected district

    const [userData, setUserData] = useState([]);

    const fetchUserData = async () => {
        try {
            axios.get(`http://localhost:3000/userDriver/data/details`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    if (response.data) {
                        console.log("User data:", response.data[0]);
                        setUserData(response.data[0]);
                        setSelectedProvince(response.data[0].province);
                        setSelectedDistrict(response.data[0].district);
                        const province = provinces.find((p) => p.name === response.data[0].province);
                        const district = province?.districts.find((d) => d.name === response.data[0].district);
                        if (district) {
                            setCenter(district.coordinates); // Update map center to selected district's coordinates
                        }
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

    useEffect(() => {
        fetchUserData();
    }, []);

    const navigate = useNavigate();

    // Handle province change
    const handleProvinceChange = (event) => {
        const provinceName = event.target.value;
        setSelectedProvince(provinceName);
        setSelectedDistrict(""); // Reset district when province changes
        const province = provinces.find((p) => p.name === provinceName);
        if (province && province.districts.length > 0) {
            setCenter(province.districts[0].coordinates); // Default to the first district's location
        }
    };

    // Handle district change
    const handleDistrictChange = (event) => {
        const districtName = event.target.value;
        setSelectedDistrict(districtName);
        const province = provinces.find((p) => p.name === selectedProvince);
        const district = province?.districts.find((d) => d.name === districtName);
        if (district) {
            setCenter(district.coordinates); // Update map center to selected district's coordinates
        }
    };

    // Handle save button click
    const handleSave = () => {

        axios.put(`http://localhost:3000/userDriver/updateLocation`, { province: selectedProvince, district: selectedDistrict }, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                console.log("User data updated successfully:", response.data);
                navigate("/");
            })
            .catch((error) => {
                console.error("Error updating user data:", error);
            });
    };

    const getCoordinates = () => {
        if (userData && userData.province && userData.district) {
            const province = provinces.find(p => p.name === userData.province);
            const district = province?.districts.find(d => d.name === userData.district);
            return district ? district.coordinates : defaultCenter; // Return district coordinates or default if not found
        }
        return defaultCenter; // Default coordinates if no saveLocation
    };

    const [center, setCenter] = useState(getCoordinates()); // Map

    return (
        <div className="page-container">
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '20px', marginLeft: '1.5rem' }}>
                    <Link to="/">
                        <Button variant="success" className='back-button d-flex'>
                            <span className='bi bi-caret-left-fill d-flex'></span>
                        </Button>
                    </Link>
                    <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold' }}>แก้ไขขอบเขตงาน</h2>
                </div>

                {/* Map with dynamic marker */}
                <MapContainer
                    center={center}
                    zoom={13}
                    minZoom={13}
                    maxZoom={16}
                    style={{ height: '340px', width: '100%', marginTop: '20px', borderRadius: '10px', border: '4px solid #00A050' }}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={center} icon={customIcon} />
                    <MapUpdater center={center} />
                </MapContainer>

                {/* Province and District selection */}
                <Card style={{
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: '#FAFAFA',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                }}>
                    <Card.Body>
                        <Form.Group controlId="provinceSelect" style={{ marginBottom: '10px' }}>
                            <h3><b>เลือกจังหวัด</b></h3>
                            <Form.Control as="select" value={selectedProvince} onChange={handleProvinceChange}>
                                <option value="">-- กรุณาเลือกจังหวัด --</option>
                                {provinces.map((province, index) => (
                                    <option key={index} value={province.name}>
                                        {province.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        {selectedProvince && (
                            <Form.Group controlId="districtSelect" style={{ marginBottom: '10px' }}>
                                <h3><b>เลือกเขต</b></h3>
                                <Form.Control as="select" value={selectedDistrict} onChange={handleDistrictChange}>
                                    <option value="">-- กรุณาเลือกเขต --</option>
                                    {provinces
                                        .find((province) => province.name === selectedProvince)
                                        ?.districts.map((district, index) => (
                                            <option key={index} value={district.name}>
                                                {district.name}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                        )}
                    </Card.Body>
                </Card>

                {/* Save button */}
                <div className='buttons-container'>
                    <button className='edit-save-button' onClick={handleSave}>
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditDistance;
