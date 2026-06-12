import React from "react";
import "./whyvarnam.css";
import enterprises2logo from "../components/Assets/enterprises2logo.png"; 
import img1 from "../components/Assets/v6.png"; 
import img2 from "../components/Assets/v9.png";
import img3 from "../components/Assets/v8.png";
import Slider from "react-slick";

const Whyvarnam = () => {  // ✅ Capitalized component name

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: false,
    fade: true,
    cssEase: "linear",
  };

  return (
    <div className="why-page">
      {/* Header */}
      <header className="why-header">
        <img src={enterprises2logo} alt="Block Logo" className="block-logo" />
        <h1>Why Varnam</h1>
        
      </header>

      {/* About Section */}
      <section className="why-about">
        <h2>The Inspiring Journey of Varnam's Artisans</h2>
        <p>
        The story of Varnam is a testament to the resilience of the human spirit, a journey marked by liberation from exploitation to empowerment. 
        Born from the shadows of slavery, individuals once trapped in mines and estates found salvation through the intervention of compassionate NGOs. 
        Rescued from the depths of despair, they embarked on a transformative path towards freedom and self-discovery. 
        Varnam emerged as a beacon of hope, offering not just employment but a platform for holistic rehabilitation. 
        Through skill-based training programs in block printing and tailoring, artisans discovered newfound talents and avenues for self-expression. 
        Each handmade creation became a symbol of their liberation, weaving together threads of resilience and creativity.
        From the oppressive confines of bondage, they emerged as artisans, entrepreneurs, and agents of change.
        </p>
      </section>

      {/* Hero Section */}
      <div className="hero-section">
        <Slider {...settings}>
          <div>
            <img src={img1} alt="Handcrafted Item 1" className="slider-image" />
          </div>
          <div>
            <img src={img2} alt="Handcrafted Item 2" className="slider-image" />
          </div>
          <div>
            <img src={img3} alt="Handcrafted Item 3" className="slider-image" />
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default Whyvarnam; // ✅ Export the correctly named component
