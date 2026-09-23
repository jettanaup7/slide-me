import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';

import './Home.css';
import 'leaflet/dist/leaflet.css';

import banner from '../../data/banner.jsx';
import adPicture from '../../assets/ad/ad1.png';

function Home({ selectPosition1, selectPosition2 }) {
    const sliderRef = useRef(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        setImages(banner);
    }, []);

    const scrollToNextImage = (direction = 'right') => {
        const container = sliderRef.current;
        const imageWidth = container?.firstElementChild?.clientWidth || 0;

        if (container) {
            const currentScroll = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            // If scrolling right and we've reached the end, scroll back to the start
            if (direction === 'right' && currentScroll + imageWidth >= maxScroll) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (direction === 'left' && currentScroll <= 0) {
                // If scrolling left and we've reached the start, scroll to the end
                container.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                // Regular scroll based on direction
                const scrollAmount = direction === 'right' ? imageWidth + 10 : -imageWidth;
                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth',
                });
            }
        }
    };

    // Automatic scrolling every 5 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            scrollToNextImage('right');
        }, 5000); // Scroll every 5 seconds

        // Clean up the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, []);

    const isPositionsValid = selectPosition1.length !== 0 && selectPosition2.length !== 0;

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
                {/* Image container */}
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
                {/* Right navigation button */}
                <button
                    className="nav-btn"
                    onClick={() => scrollToNextImage('right')}
                >
                    {/* Right Arrow Button */}
                </button>
            </div>
            <div className="buttons-container1">
                <Link to='/home/save-location1'>
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="bi bi-geo-alt-fill" style={{ color: "red", marginRight: '8px' }}></span>
                        <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '250px' // <-- adjust as needed
                        }}>
                            {selectPosition1.length === 0 ? 'ตำแหน่งต้นทาง' : selectPosition1.address}
                        </span>
                    </button>
                </Link>

                <Link to='/home/save-location2'>
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="bi bi-geo-alt-fill" style={{ color: "#01c063", marginRight: '8px' }}></span>
                        <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '250px' // <-- adjust as needed
                        }}>
                            {selectPosition2.length === 0 ? 'ตำแหน่งปลายทาง' : selectPosition2.address}
                        </span>
                    </button>
                </Link>

            </div>

            <div className="buttons-container">
                <Link to={isPositionsValid ? '/home/request-order' : '#'}>
                    {/* Check if positions are valid */}
                    <button className={isPositionsValid ? 'start-button' : 'start-button-disabled'} disabled={!isPositionsValid}>
                        เริ่มต้นใช้งาน  <span role="img" aria-label="truck"></span>
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
