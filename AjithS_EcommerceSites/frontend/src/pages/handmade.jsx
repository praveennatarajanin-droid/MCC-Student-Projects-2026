import React from "react";
import "./handmade.css";
import enterprises2logo from "../components/Assets/enterprises2logo.png";

const Handmade = () => {

  return (
    <div className="handmade-page">
      <header className="handmade-header">
        <img src={enterprises2logo} alt="Block Logo" className="block-logo" />
        <h1>Handmade Products</h1>
        <p>Your partner in excellence and innovation.</p>
      </header>
    </div>
  );
};

export default Handmade;
