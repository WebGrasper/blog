import React from "react";
import './navbar.css';

function Navbar() {

    return <nav className="navbar">
        <div className="container-1">
            <h1 className="container-1-h1">Blog</h1>
        </div>
        <div className="container-2">
            <form className="container-2-span" method="POST">
                <input type="text" className="container-2-search-box" id="container-2-search-box" placeholder="Search" />
                <button type="submit" className="container-2-search-button material-symbols-outlined">search</button>
            </form>
        </div>
        <div className="container-button">
            <input type="checkbox" className="check-box" name="check" id="check" />
            <button className="menu-button material-symbols-outlined">menu</button>
            <button className="close-button material-symbols-outlined">close</button>
        <div className="container-3">
            <a className="link" href="#Home">Home</a>
            <a className="link" href="#Login">Login</a>
            <a className="link" href="#Logout">Logout</a>
            <a className="link" href="#contact-us">contact us</a>
        </div>
        </div>
    </nav>
}

export default Navbar;