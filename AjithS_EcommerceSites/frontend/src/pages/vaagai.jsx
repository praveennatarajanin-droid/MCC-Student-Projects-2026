import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./Vaagai.css";
import enterprises2logo from "../components/Assets/enterprises2logo.png"; // Enterprises2 logo



const Vaagai = () => {
  const navigate = useNavigate(); // React Router navigation hook

  return (
    <div className="vaagai-page">
      
      {/* Header */}
      <header className="vaagai-header">
        <img src={enterprises2logo} alt="Enterprises2 Logo" className="vaagai-logo" />
        <h1>Vaagai Unit</h1>
        <p>Your partner in excellence and innovation.</p>
      </header>

      {/* About Section */}
      <section className="vaagai-about">
        <h2>About Vaagai</h2>
        <p>
          The Vaagai Unit is dedicated to delivering world-class solutions and
          fostering growth in the technology sector. With a passionate team of
          experts, we aim to push boundaries, achieve milestones, and inspire
          change.
        </p>
      </section>

      <div className="vaagai-container">
            {/* Services Section */}
            <section className="vaagai-section vaagai-services">
                <h2>Our Services</h2>
                <ul>
                    <li>Innovative product development</li>
                    <li>State-of-the-art software solutions</li>
                    <li>Customized consultancy services</li>
                    <li>Technical training and upskilling programs</li>
                </ul>
            </section>

            {/* Contact Section */}
            <section className="vaagai-section vaagai-contact">
                <h2>Contact Us</h2>
                <p>Have questions? Get in touch with us at:</p>
                <p>Email: info@varnamunit.com</p>
                <p>Phone: +1 234 567 8901</p>
                <button onClick={() => navigate("/AboutPage")}>Go to About Us</button>
            </section>
        </div>

    </div>
  );
};

export default Vaagai;
