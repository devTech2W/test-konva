import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Text, Line, Circle, Rect, Image } from "react-konva";

export default function App() {
  const [plan, setPlan] = useState(null);
  const imageRef = useRef(null);

  // Stocker le plan dans "plan"
  const handlePlanUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setPlan(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (plan) {
      const image = new window.Image();
      image.onload = () => {
        imageRef.current.image(image);
        imageRef.current.getLayer().batchDraw();
      };
      image.src = plan;
    }
  }, [plan]);

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          handlePlanUpload(e);
        }}
      />
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>{<Image ref={imageRef} />}</Layer>
      </Stage>
    </div>
  );
}
