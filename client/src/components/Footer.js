import React from "react";
import '../styles/Footer.css';
import ibm from '../images/ibm.png';

const FooterPage = () => {
  return (
    <div className='footer'>
      <img src={ibm} alt="ibm-logo" className="ibm-footer-image"></img>
      <footer className="footer-text">
        <span className="">&copy; {new Date().getFullYear()} Pioneered By CPSD</span>
      </footer>
    </div>
  );
}

export default FooterPage;