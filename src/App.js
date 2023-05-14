import React, { useState, useEffect, useRef } from "react";

import { Stage, Layer, Line, Text, Group, Image, Rect } from "react-konva";
import "./App.css";

export default function App() {
  const [plan, setPlan] = useState(null);
  const imageRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [selectedShape, setSelectedShape] = useState(null);
  const [lineLengths, setLineLengths] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState("");

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

  const handleClick = (e) => {
    if (!isDrawing) {
      return;
    }
    if (!lines.length) {
      setLines([{ points: [] }]);
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    let lastX = 0;
    let lastY = 0;
    let lineLength = 0;
    if (lastLine && lastLine.points.length > 0) {
      lastX = lastLine.points[lastLine.points.length - 2];
      lastY = lastLine.points[lastLine.points.length - 1];
      lineLength = Math.sqrt(
        Math.pow(point.x - lastX, 2) + Math.pow(point.y - lastY, 2)
      );
    }
    if (!lastLine) {
      setLines([...lines, { points: [point.x, point.y] }]);
    } else {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLineLengths([...lineLengths, lineLength]);
      setLines(lines.concat());
    }
  };

  const handleNewShape = () => {
    setIsDrawing(true);
    setLines([...lines, { points: [] }]);
  };

  const calculateArea = (points) => {
    let area = 0;
    let j = points.length - 2;
    for (let i = 0; i < points.length; i += 2) {
      area += (points[j] + points[i]) * (points[j + 1] - points[i + 1]);
      j = i;
    }

    return Math.abs(area / 2);
  };

  const handleSelectShape = (shapeIndex) => {
    setSelectedShape(shapeIndex);
    const selectedShapePoints = lines[shapeIndex].points;
    const area = calculateArea(selectedShapePoints);
    console.log(lines[shapeIndex]);
  };

  const handleUndoClick = () => {
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const newPoints = lastLine.points.slice(0, -2);
      lastLine.points = newPoints;
      setLines([...lines]);
    }
  };
  const clearShape = () => {
    setLines([]);
    setLines([{ points: [] }]);
  };

  return (
    <>
      <input
        type="file"
        onChange={(e) => {
          handlePlanUpload(e);
        }}
      />
      <button width={50} height={50} onClick={handleNewShape}>
        Créer la forme
      </button>
      <button width={50} height={50} onClick={handleUndoClick}>
        Revenir en arrière
      </button>
      <button width={50} height={50} onClick={clearShape}>
        Effacer le plan
      </button>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleClick}
        className="Stage-Decoration"
      >
        <Layer>
          {<Image ref={imageRef} />}
          <Rect width={1000} height={1000} fill="#00000080" />
          <Group scaleX={zoom} scaleY={zoom}>
            {lines.map((line, i) => {
              const length = Math.sqrt(
                Math.pow(
                  line.points[line.points.length - 2] -
                    line.points[line.points.length - 4],
                  2
                ) +
                  Math.pow(
                    line.points[line.points.length - 1] -
                      line.points[line.points.length - 3],
                    2
                  )
              );
              return (
                <>
                  <Line
                    key={i}
                    points={line.points}
                    stroke="red"
                    strokeWidth={4}
                    closed="true"
                    draggable="false"
                    lineCap="square"
                    lineJoin="bevel"
                    shadowOffsetX={2}
                    shadowOffsetY={2}
                    shadowOpacity={0.5}
                    fill={i === selectedShape ? "lightpink" : "transparent"}
                    onDblClick={() => handleSelectShape(i)}
                  />
                </>
              );
            })}
          </Group>
        </Layer>
      </Stage>
    </>
  );
}
