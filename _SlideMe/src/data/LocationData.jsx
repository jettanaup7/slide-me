import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/locations/'; // Replace with actual API URL

const useLocationData = (tokenUser) => {
    const [locations, setLocations] = useState([]);
    const fetchLocations = async () => {
        try {
            const res = await axios.get(`${API_URL}all`, {
                headers: { Authorization: `Bearer ${tokenUser}` },
            });

            if (Array.isArray(res.data.result)) {
                setLocations(res.data.result);
            } else {
                console.error('Invalid data format', res.data);
            }
        } catch (error) {
            console.error('Fetch Location Error:', error);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [tokenUser]);

    const updateLocation = async (locationID, newLocationData) => {
        try {
            // Destructure newLocationData into separate variables
            const { name, contactName, contactNumber, notes, address } = newLocationData;

            // Send the update request
            const res = await axios.put(`${API_URL}update/`,
                { locationID, name, contactName, contactNumber, notes, address },
                { headers: { Authorization: `Bearer ${tokenUser}` } }
            );

            fetchLocations(); // Refresh location data
        } catch (error) {
            console.error("PUT request failed:", error.response?.data || error);
            alert("Failed to update location. Check console for details.");
        }
    };

    const addLocation = async (newLocation, userID) => {
        if (locations.length < 5) { // Limit per user
            try {
                const res = await axios.post("http://localhost:3000/locations/add/",
                    { ...newLocation, userID },
                    { headers: { Authorization: `Bearer ${tokenUser}` } }
                );

                fetchLocations();
                alert("เพิ่มตำแหน่งสําเร็จสิ้น");
            } catch (error) {
                console.error("POST request failed:", error.response?.data || error);
                alert("Failed to add location. Check console for details.");
            }
        } else {
            alert("คุณเพิ่มตำแหน่งได้สูงสุดเพียง 5 ตำแหน่ง");
        }
    };

    const deleteLocation = async (locationID) => {
        try {
            const res = await axios.delete("http://localhost:3000/locations/delete", {
                headers: { Authorization: `Bearer ${tokenUser}` },
                data: { locationID }
            });

            // After successful deletion, refresh the locations
            fetchLocations();
            console.log("Location deleted successfully:", res.data);
            alert("ลบตำแหน่งสําเร็จสิ้น");
        } catch (error) {
            console.error("DELETE request failed:", error.response?.data || error);
            alert("Failed to delete location. Check console for details.");
        }
    };


    return { locations, updateLocation, addLocation, deleteLocation };
};

export default useLocationData;
