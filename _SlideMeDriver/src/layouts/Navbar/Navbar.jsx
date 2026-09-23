import { useState, useEffect, useRef } from "react";

import "./Navbar.css";
import { Link } from "react-router-dom";

const initTab = 'home'

function Navbar() {
    const [tab, setTab] = useState('')

    useEffect(() => {
        setTab(initTab)
    }, [])

    const homeRef = useRef()
    const listRef = useRef()
    const reqRef = useRef()
    const profileRef = useRef()

    useEffect(() => {
        if (tab === 'home') homeRef.current.click()
        else if (tab === 'list') listRef.current.click()
        else if (tab === 'requestList') reqRef.current.click()
        else if (tab === 'profile') profileRef.current.click()
    }, [tab])

    return (
        <div className="Navbar-container">
            <Link to='/home'>
                <button
                    style={{ boxShadow: '0 0 0.25rem gray' }}
                    className={
                        "home " + (tab === "home" ? "btn-onclick" : "btn-unselect")}
                    onClick={() => setTab('home')}
                    ref={homeRef}
                >
                </button>
            </Link>
            <Link to='/list/request-list'>
                <button
                    style={{ boxShadow: '0 0 0.25rem gray' }}
                    className={
                        "request " + (tab === "requestList" ? "btn-onclick" : "btn-unselect")}
                    onClick={() => setTab('requestList')}
                    ref={reqRef}
                >
                </button>
            </Link>
            <Link to='/list'>
                <button
                    style={{ boxShadow: '0 0 0.25rem gray' }}
                    className={
                        "menu " + (tab === "list" ? "btn-onclick" : "btn-unselect")}
                    onClick={() => setTab('list')}
                    ref={listRef}
                >
                </button>
            </Link>
            <Link to='/profile'>
                <button
                    style={{ boxShadow: '0 0 0.25rem gray' }}
                    className={
                        "profile " + (tab === "profile" ? "btn-onclick" : "btn-unselect")}
                    onClick={() => setTab('profile')}
                    ref={profileRef}
                >
                </button>
            </Link>
        </div >
    );
}

export default Navbar;
