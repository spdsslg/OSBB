import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Slider.css';
import { Link, useNavigate } from 'react-router-dom';
import Vinnytsia1 from './images/Vinnytsia1.png';
import Vinnytsia2 from './images/Vinnytsia2.jpg';
import Vinnytsia3 from './images/Vinnytsia3.png';
import waveSVG from './images/wave1.svg';

const Slider = ({ loggedInUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [waveDelay, setWaveDelay] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const navigate = useNavigate();

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    { 
      image: Vinnytsia2, 
      text: "Керуйте рахунками ОСББ на одній сторінці!", 
      button: "Вхід", 
      isLoginButton: true
    },
    { 
      image: Vinnytsia3, 
      text: "Ще не маєте власного кабінету? Зв'яжіться з нами!", 
      button: "Детальніше", 
      link: "/contacts"
    },
    { 
      image: Vinnytsia1, 
      text: "Дізнайтеся більше про нормативні документи", 
      button: "Документи", 
      link: "/templates"
    },
  ];

  const handleSlideButtonClick = (slide) => {
    if (slide.isLoginButton) {
      if (loggedInUser) {
        navigate('/cabinet');
      } else {
        const headerLoginButton = document.querySelector('.header-right button');
        if (headerLoginButton) {
          headerLoginButton.click();
        }
      }
    }
  };

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setWaveDelay(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      setTimeout(() => {
        setWaveDelay(true);
        setIsAnimating(false);
      }, 300); // Уменьшаем задержку
    }, 500);
  }, [isAnimating, slides.length]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setWaveDelay(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
      setTimeout(() => {
        setWaveDelay(true);
        setIsAnimating(false);
      }, 300);
    }, 500);
  };

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(nextSlide, 10000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, autoPlay]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWaveDelay(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setAutoPlay(false);

    if (touchStartX.current - touchEndX.current > 40 && !isAnimating) {
      nextSlide();
    }

    if (touchStartX.current - touchEndX.current < -40 && !isAnimating) {
      prevSlide();
    }
  };

  return (
    <div 
      className="slider"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`slider-content ${isAnimating ? 'animating' : ''} ${waveDelay ? 'wave-delay' : ''}`} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className="slider-image-container">
            <div className="overlay">
              <img src={waveSVG} alt="Wave" className="wave" />
              <div className="slide-text">
                <h2>{slide.text}</h2>
                {!slide.isLoginButton ? (
                  <Link to={slide.link} className="slider-button-link">
                    <button className="slider-button">
                      {slide.button}
                    </button>
                  </Link>
                ) : (
                  <button 
                    className="slider-button"
                    onClick={() => handleSlideButtonClick(slide)}
                  >
                    {slide.button}
                  </button>
                )}
              </div>
            </div>
            <img 
              src={slide.image} 
              alt={`Slide ${index + 1}`} 
              className="slider-image" 
            />
          </div>
        ))}
      </div>
      <div className="slider-dots">
        {slides.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setAutoPlay(false);
              setIsAnimating(true);
              setWaveDelay(false);
              setTimeout(() => { 
                setCurrentIndex(index);
                setTimeout(() => {
                  setWaveDelay(true);
                  setIsAnimating(false);
                }, 300);
              }, 500);
            }}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Slider;
