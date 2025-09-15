// src/components/Editor/ImageComparisonSlider.tsx
"use client";

import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import Image from 'next/image';
import styles from './ImageComparisonSlider.module.css';

interface SliderProps {
  beforeImage: string;
  afterImage: string;
}

const ImageComparisonSlider: React.FC<SliderProps> = ({ beforeImage, afterImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const afterWrapperRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const stopDrag = () => setIsDragging(false);

    const onDrag = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
      if (!isDragging || !containerRef.current || !afterWrapperRef.current || !handleRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const containerRect = containerRef.current.getBoundingClientRect();
      let x = clientX - containerRect.left;

      if (x < 0) x = 0;
      if (x > containerRect.width) x = containerRect.width;

      const percentage = (x / containerRect.width) * 100;
      afterWrapperRef.current.style.width = `${percentage}%`;
      handleRef.current.style.left = `${percentage}%`;
    };

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging]);

  return (
    <div className={styles.comparisonContainer} ref={containerRef}>
      <div className={styles.imageWrapper}>
        <Image src={beforeImage} alt="Before" layout="fill" objectFit="contain" draggable="false" />
      </div>

      <div className={styles.afterImageWrapper} ref={afterWrapperRef}>
        <div className={styles.imageWrapper}>
          <Image src={afterImage} alt="After" layout="fill" objectFit="contain" draggable="false" />
        </div>
      </div>

      <div 
        className={styles.sliderHandle} 
        ref={handleRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className={styles.sliderArrows}></div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;