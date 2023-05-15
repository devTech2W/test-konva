import React, { useState, useEffect, useRef } from "react";

import {
  Stage,
  Layer,
  Line,
  Text,
  Group,
  Image,
  Rect,
  Circle,
  Shape,
} from "react-konva";
import "./App.css";

export default function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [plan, setPlan] = useState(null);
  const imageRef = useRef(null);
  const [shapeList, setShapeList] = useState([]);
  const [points, setPoints] = useState([]);
  const [shape, setShape] = useState({
    shape_id: `shape_${shapeList.length}`,
    points: points,
    color: "red",
    name: `zone ${shapeList.length + 1}`,
  });

  useEffect(() => {
    setShape({
      ...shape,
      points: points,
    });
  }, [points]);

  const handleCloseShape = () => {
    if (points.length >= 2) {
      setPoints([...points, points[0], points[1]]);
    }
  };

  const handleColorChange = (newColor) => {
    setShape({ ...shape, color: newColor });
  };

  const handleNameChange = (newName) => {
    setShape({ ...shape, name: newName });
  };

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

  const addPoint = (e) => {
    if (isDrawing) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      if (points.length > 0) {
        const avantDernier = points[points.length - 2];
        const dernier = points[points.length - 1];
        points.pop();
        points.pop();
        const newPoints = [...points, avantDernier, dernier, point.x, point.y];
        setPoints(newPoints);
      } else {
        setPoints([point.x, point.y]);
      }
    } else return;
  };

  const handleUndo = async () => {
    if (points.length > 0) {
      let currentPoints = [];
      for (let i = 0; i !== points.length - 2; i++) {
        console.log(points[i]);
        // eslint-disable-next-line no-unused-expressions
        await currentPoints.push(points[i]);
      }
      setPoints(currentPoints);
    } else {
    }
  };

  const handleShapeState = () => {
    if (isDrawing) {
      if (points.length > 1 && points.length % 2 === 0) {
        setShapeList([...shapeList, shape]);
        setShape({});
        setPoints([]);
      }
      setShape({});
      setIsDrawing(false);
      setPoints([]);
    } else {
      setIsDrawing(true);
      setShape({
        shape_id: `shape_${shapeList.length}`,
        points: points,
        color: "red",
        name: `zone ${shapeList.length + 1}`,
      });
      setPoints([]); // Réinitialiser le tableau de points pour le nouveau dessin
    }
  };

  return (
    <>
      <input
        type="file"
        accept="*"
        onChange={(e) => {
          handlePlanUpload(e);
        }}
      />

      <button
        className={isDrawing ? "active" : "create"}
        onClick={() => {
          handleShapeState();
        }}
        width={50}
        height={50}
      >
        {isDrawing ? "Terminer" : "Créer une zone"}
      </button>
      <button
        onClick={() => {
          handleUndo();
        }}
        width={50}
        height={50}
      >
        Revenir en arrière
      </button>
      <button width={50} height={50}>
        Effacer le plan
      </button>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        // onClick={() => {
        //   handleClick();
        // }}
        className="Stage-Decoration"
        onMouseDown={(e) => {
          addPoint(e);
        }}
      >
        <Layer>
          {<Image ref={imageRef} />}
          <Rect
            style={{ padding: "2em" }}
            width={1000}
            height={1000}
            fill="#00000080"
          />

          <Group>
            <Text
              text={shape.name}
              x={points[0] + (points[2] - points[0]) / 2}
              y={points[1] - 20}
              fontSize={15}
            />

            {shapeList?.map((shape) => {
              const pts = shape.points;
              return (
                <Shape
                  sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.moveTo(pts[0], pts[1]);
                    pts.forEach((point, i) => {
                      if (i % 2 === 0 && i > 1) {
                        context.lineTo(pts[i], pts[i + 1]);
                      }
                    });
                    context.closePath();
                    context.fillStrokeShape(shape);
                  }}
                  fill={shape.color}
                  onClick={handleCloseShape}
                />
              );
            })}
            {points.length > 0 ? (
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(points[0], points[1]);
                  points.forEach((point, i) => {
                    if (i % 2 === 0 && i > 1) {
                      context.lineTo(points[i], points[i + 1]);
                    }
                  });
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill={shape.color}
                onClick={handleCloseShape}
              />
            ) : null}
          </Group>
          {shapeList?.map((shape) => {
            const pts = shape.points;
            return (
              <>
                {pts.map((point, index) => {
                  if (index % 2 === 0) {
                    const x = pts[index];
                    const y = pts[index + 1];
                    return (
                      <Circle
                        draggable
                        key={`circle_${index}`}
                        x={x}
                        y={y}
                        radius={5}
                        fill="black"
                      />
                    );
                  }
                  return null;
                })}
              </>
            );
          })}
          {points.map((point, index) => {
            if (index % 2 === 0) {
              const x = points[index];
              const y = points[index + 1];
              return (
                <Circle
                  key={`circle_${index}`}
                  x={x}
                  y={y}
                  radius={5}
                  fill="black"
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      <input
        type="color"
        placeholder="Enter color"
        onChange={(e) => handleColorChange(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter name"
        onChange={(e) => handleNameChange(e.target.value)}
      />
      <p>Shape color: {shape.color}</p>
      <p>Shape name: {shape.name}</p>
    </>
  );
}
