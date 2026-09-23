import { Outlet } from 'react-router';

import Header from '../Header/Header';

import './LayoutLogin.css';

function LayoutLogin() {
    return (
        <div>
            <Header />
            <Outlet />
        </div>
    );
}

export default LayoutLogin