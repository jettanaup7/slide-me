import axios from 'axios';

const API_URL = 'http://localhost:3000/userDriver/'; // Replace with actual API URL

export const loginUser = async (username, password) => {
    try { }
    catch (error) {
        console.error('Login error:', error.response?.data || error);
        return null;
    }
};

// Fetch users from the database
export const getUsersFromDB = async (token) => {
    try {
        const response = await axios.get(`${API_URL}data`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// Save users to the database (replace or append depending on backend logic)
export const saveUsersToDB = async (token) => {
    try {
        const response = await axios.post('${API_URL}data', {
            headers: { Authorization: `Bearer ${token}` },
        })
        return response.data;
    } catch (error) {
        console.error('Error saving users:', error);
    }
};

// Immediately fetch users for export
let users = [];

export default users;