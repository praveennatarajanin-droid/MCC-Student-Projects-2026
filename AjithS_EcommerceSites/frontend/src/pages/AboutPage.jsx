import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

import artisanImage from "../components/Assets/v6.png";
import enterprises1logo from "../components/Assets/enterprises1logo.png";
import enterprises2logo from "../components/Assets/enterprises2logo.png";
import enterprises3logo from "../components/Assets/enterprises3logo.png";

const AboutPage = () => {
  const navigate = useNavigate();

  const handleUnitClick = (unit) => {
    navigate(`/${unit.toLowerCase()}`);
  };

  const units = [
    { name: "Enterprises1", text_color: "#08cbf7ff", font_style: "italic", logo: enterprises1logo },
    { name: "Enterprises2", text_color: "#80002f", font_style: "italic", logo: enterprises2logo },
    { name: "Enterprises3", text_color: "#80002f", font_style: "italic", logo: enterprises3logo }
];




  return (
    <div className="about-container">
      <div className="about-content">

        {/* Hero Section */}
        <div className="hero-section">
          <div className="heading">
            <h1>
               An authentic platform for pure craft.
            </h1>
          </div>
          <div className="content">
            <p>
            UnityThreads is a digital platform for some of the world's oldest and most intricate craft forms, with a special focus on the art of weaving and textile creation. We started this social enterprise close to 10 years ago in order to preserve, showcase, and share the talent of Tamil Nadu's artisans with the world. At UnityThreads, we believe in the power of connection—bringing together artisans from diverse regions of Tamil Nadu to create threads of unity through their craft.


            </p>
          </div>
        </div>

        {/* Artisan Section */}
        <div className="section artisan-section">
          <div className="heading">
            <h3>Established in 2019, Chennai, India.</h3>
          </div>
          <div className="content"><center>
            <p>
              WWe are headquartered in Chennai, India, the capital of Tamil Nadu, the city of dreams. Our objective has always been to empower our artisans to deliver sustainable products of the finest quality. We devote ourselves to these causes. Each of our products is handcrafted and unique. Each product tells the unique story of the artisan who made it.
            </p></center>
            <div className="artisan-image">
              <img src={artisanImage} alt="Artisan crafting" />
            </div>
          </div>
        </div>
        <div className="units-section bg-gray-100 dark:bg-gray-800">
    <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Our Units</h2>
    <div className="units-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {units.map((unit) => (
            <div
                key={unit.name}
                className="unit-card flex flex-col items-center p-4 border-2 border-yellow-400 rounded-2xl shadow-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-700 transition-all duration-300"
                onClick={() => handleUnitClick(unit.name)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        handleUnitClick(unit.name);
                    }
                }}
                aria-label={`Visit ${unit.name} page`}
            >
                <img 
                    src={unit.logo} 
                    alt={`${unit.name} Logo`} 
                    className="w-16 h-16 mb-2"
                />
                <p 
    className="text-xl transition-all duration-300"
    style={{ 
        color: unit.text_color, 
        fontStyle: unit.font_style === "italic" ? "italic" : "normal",
        fontWeight: unit.font_style === "bold" ? "bold" : "normal"
    }}
>
    {unit.name}
</p>
            </div>
        ))}
    </div>
</div>

      </div>
    </div>
  );
};

export default AboutPage;
