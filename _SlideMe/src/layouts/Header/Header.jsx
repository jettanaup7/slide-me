import './Header.css';

function Header() {
    return (
        <div className='header-container'>
            <span className="time">9:41</span>
            <div className="status-bar">
                <span className='bi bi-reception-4'></span>
                <span className='bi bi-wifi'></span>
                <span className='bi bi-battery'></span>
            </div>
        </div>
    );
}

export default Header;