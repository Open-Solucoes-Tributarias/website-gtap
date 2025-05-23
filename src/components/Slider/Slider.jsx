import React, { useState, useEffect, useRef } from "react";
import "./Slider.css"
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
      
      }}
    >
      <i className="fa-solid fa-chevron-left" style={{ fontSize: "30px", color: "#fff" }}></i>
    </div>
  );
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
      }}
    >
      <i className="fa-solid fa-chevron-right" style={{ fontSize: "30px", color: "#fff" }}></i>
    </div>
  );
};

const AsNavFor = ({ images }) => {
  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

  return (
    <div className="slider-container">
      <div className="slider-for">
        <Slider
          asNavFor={nav2}
          ref={sliderRef1}
          slidesToShow={1}
          slidesToScroll={1}
          fade={true}
          dots={false}
        //   arrows={false}
          prevArrow={<PrevArrow/>}
          nextArrow={<NextArrow/>}
        >
          {images.map((img, index) => (
            <div key={index}>
              <img
                src={img.url}
                alt={`Imagem ${index}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
          ))}
        </Slider>
      </div>

      <div className="slider-nav">
        <Slider
          asNavFor={nav1}
          ref={sliderRef2}
          slidesToShow={4}
          swipeToSlide={true}
          focusOnSelect={true}
          centerMode={true}
          dots={false}
          arrows={false}
        >
          {images.map((img, index) => (
            <div key={index}>
              <img
                src={img.url}
                alt={`Miniatura ${index}`}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default AsNavFor;
