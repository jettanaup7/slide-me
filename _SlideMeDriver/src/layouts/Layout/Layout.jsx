import { Outlet } from 'react-router';

import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';

import './Layout.css';

function Layout({ tab, setTab }) {
    return (
        <div>
            <Header />
            <Outlet />
            <Navbar tab={tab} setTab={setTab} />
        </div>
    );
}

export default Layout