import React, { useState, useEffect, useRef } from "react";
/* eslint-disable */
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
  const [confirm, setConfirm] = useState(false);
  const [points, setPoints] = useState([]);
  const [shape, setShape] = useState({
    shape_id: `shape_${shapeList.length}`,
    points: points,
    color: "red",
    name: `zone ${shapeList.length + 1}`,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [shapeToEdit, setShapeToEdit] = useState(null);

  useEffect(() => {
    setShape({
      ...shape,
      points: points,
    });
  }, [points]);

  useEffect(() => {
    points.length === 0 ? setConfirm(false) : null;
  }, [points, confirm]);

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

  const handleDeleteImage = () => {
    if (imageRef.current) {
      imageRef.current.remove();
    }
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
        // eslint-disable-next-line no-unused-expressions
        await currentPoints.push(points[i]);
      }
      setPoints(currentPoints);
    } else {
    }
  };

  const handleClear = () => {
    setShapeList([]);
    setShape({});
    setPoints([]);
    setIsDrawing(false);
    setConfirm(false);
  };

  const handleShapeState = () => {
    setIsDrawing(true);
    setShape({
      shape_id: `shape_${shapeList.length}`,
      points: points,
      color: "#000000",
      name: `zone ${shapeList.length + 1}`,
    });
    setPoints([]);
  };

  const handleFinish = () => {
    if (isDrawing) {
      if (points.length > 1 && points.length % 2 === 0) {
        setShapeList([...shapeList, shape]);
        setShape({});
        setPoints([]);
      }
      setShape({});
      setIsDrawing(false);
      setPoints([]);
      setConfirm(false);
    } else {
      null;
    }
  };

  const handleEditShape = () => {};

  const handleDeleteShape = () => {
    const idToDelete = shapeToEdit.shape_id;
    const newShapeList = shapeList
      .map((sha) => {
        return sha.shape_id !== idToDelete ? sha : null;
      })
      .filter(Boolean);
    setShapeList(newShapeList);
    setIsEditing(false);
    setShapeToEdit(null);
  };

  return (
    <div className="container">
      <input
        type="file"
        accept="*"
        onChange={(e) => {
          handlePlanUpload(e);
        }}
      />
      {plan ? (
        <button
          onClick={() => {
            setPlan(null);
            handleDeleteImage();
          }}
        >
          Supprimer le plan
        </button>
      ) : null}

      <button
        className={isDrawing ? "active" : "create"}
        onClick={() => {
          isDrawing ? setConfirm(true) : handleShapeState();
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
      <button
        onClick={() => {
          handleClear();
        }}
        width={50}
        height={50}
      >
        Effacer le plan
      </button>
      {shapeToEdit !== null ? (
        <button width={50} height={50}>
          Modifications terminées
        </button>
      ) : null}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        // onClick={() => {
        //   handleClick();
        // }}
        className="Stage-Decoration"
        onMouseDown={(e) => {
          confirm ? null : addPoint(e);
        }}
      >
        <Layer style={{ padding: "2em" }}>
          {<Image ref={imageRef} />}
          <Rect
            style={{ padding: "2em" }}
            width={1000}
            height={1000}
            fill="#00000080"
          />

          {shapeList.length > 0
            ? shapeList?.map((shape) => {
                const pts = shape?.points;
                return (
                  <Group>
                    {shape === shapeToEdit
                      ? pts?.map((point, index) => {
                          if (index % 2 === 0) {
                            const x = pts[index];
                            const y = pts[index + 1];
                            return (
                              <Circle
                                draggable={shapeToEdit === shape}
                                key={`circle_${index}`}
                                x={x}
                                y={y}
                                radius={2}
                                fill="yellow"
                              />
                            );
                          }
                          return null;
                        })
                      : null}
                    <Text
                      fill={"black"}
                      text={shape?.name}
                      x={pts ? pts[0] + 5 : null}
                      y={pts ? pts[1] - 35 : null}
                      fontSize={20}
                      fontFamily="Arial"
                      padding={10}
                      fontStyle="bold"
                      width={200}
                      height={50}
                    />
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
                      fill={`${shape.color}90`}
                      onClick={handleCloseShape}
                      onDblClick={() => {
                        setShapeToEdit(shape);
                        setIsEditing(true);
                      }}
                    />
                  </Group>
                );
              })
            : null}
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
              fill={`${shape.color}80`}
              onClick={handleCloseShape}
            />
          ) : null}
          {points.map((point, index) => {
            if (index % 2 === 0) {
              const x = points[index];
              const y = points[index + 1];
              return (
                <Circle
                  key={`circle_${index}`}
                  x={x}
                  y={y}
                  radius={2}
                  fill="yellow"
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      {confirm ? (
        <div className="confirm">
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

          <button
            onClick={() => {
              handleFinish();
            }}
          >
            Terminer
          </button>
        </div>
      ) : null}
      {isEditing ? (
        <div className="confirm">
          <button
            onClick={() => {
              setIsEditing(false);
              handleEditShape();
            }}
          >
            Modifier la forme
          </button>
          <button
            onClick={() => {
              handleDeleteShape(shape);
            }}
          >
            Supprimer la forme
          </button>
        </div>
      ) : null}
    </div>
  );
}
