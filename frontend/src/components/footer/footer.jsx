import React from "react";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="item">
        <h2 className="adrhd">
          Our Address:
        </h2>
      <address>
        Bazar Nasurrallah khan, <br />
        Peer ke paith, <br />
        Rampur, <br />
        Uttar pradesh <br />
      </address>
      
      
      </div>
      <div className="item">
        <h3>Connect with us on: </h3>
    
        <img src="https://png.pngtree.com/png-vector/20221018/ourmid/pngtree-instagram-icon-png-image_6315974.png" width="30px" alt="" />
        <img src= "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" width="30px" alt="" />
        <img src= "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/768px-Twitter-logo.svg.png?20220821125553" width="30px" alt="" />
        <img src= "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2044px-WhatsApp.svg.png" width="30px" alt="" />
       
        <img src="" width="30px" alt="" />
      </div>
      <div className="item">
        <h3>Blog © 2023</h3>
      </div>
    
      </footer>
  );
}

export default Footer;
