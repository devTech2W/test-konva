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
  const planRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [plan, setPlan] = useState(null);
  const [shapeList, setShapeList] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [points, setPoints] = useState([]);
  const [shape, setShape] = useState({
    shape_id: `shape_${shapeList.length}`,
    points: points,
    color: "red",
    name: `zone ${shapeList.length + 1}`,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shapeToEdit, setShapeToEdit] = useState(null);
  const [pointsToReplace, setPointsToReplace] = useState({
    x: null,
    y: null,
  });
  const [newPoints, setNewPoints] = useState({
    x: null,
    y: null,
  });

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
    const uploadedImage = e.target.files[0];
    const imageURL = URL.createObjectURL(uploadedImage);
    const img = new window.Image();
    img.src = imageURL;
    img.onload = () => {
      planRef.current.image(img);
      planRef.current.getLayer().batchDraw();
    };
  };

  // useEffect(() => {
  //   if (plan) {
  //     const image = new window.Image();
  //     image.onload = () => {
  //       imageRef.current.image(image);
  //       imageRef.current.getLayer().batchDraw();
  //     };
  //     image.src = plan;
  //   }
  // }, [plan]);

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

  const handleUndoEdit = async () => {
    if (shapeToEdit?.points.length >= 2) {
      for (let i = 0; i < 2; i++) {
        shapeToEdit.points.pop();
      }
    } else if (shapeToEdit !== null && shapeToEdit?.points.length <= 4) {
      // Supprimer shapeToEdit de shapeList
      const newShapeList = shapeList.filter(
        (shape) => shape.shape_id !== shapeToEdit.shape_id
      );
      setShapeList(newShapeList);
      setShapeToEdit(null);
    } else {
      null;
    }

    setShape({});
    setIsDrawing(false);
    setPoints([]);
    setConfirm(false);
  };

  const handleClear = () => {
    setShapeList([]);
    setShape({});
    setPoints([]);
    setIsDrawing(false);
    setConfirm(false);
    setIsEditing(false);
    setShowMessage(false);
    setShapeToEdit(null);
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

  const handleDragMove = (e, x, y) => {
    setPointsToReplace({
      x: x,
      y: y,
    });
    let newShape = shapeToEdit;
    const newX = e.target.x();
    const newY = e.target.y();
    const emplacementAncienX = newShape.points.indexOf(pointsToReplace.x);
    const emplacementAncienY = newShape.points.indexOf(pointsToReplace.y);

    newShape.points.splice(emplacementAncienX, 1, newX);
    newShape.points.splice(emplacementAncienY, 1, newY);

    setShapeToEdit(newShape);
  };

  const handleDragEnd = (e) => {
    setShapeToEdit(shapeToEdit);
  };

  const handleAddPointEdit = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    let newList = shapeList;
    let newShape = shapeToEdit;

    // Vérifier s'il y a déjà un point à proximité
    const nearbyPoint = newShape.points.some((pt, index) => {
      if (index % 2 === 0) {
        const x = newShape.points[index];
        const y = newShape.points[index + 1];
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        return distance < 10; // Définissez une distance de seuil appropriée
      }
      return false;
    });

    if (!nearbyPoint) {
      newShape.points.push(point.x);
      newShape.points.push(point.y);
    }

    // Mettre à jour la liste des formes avec la forme modifiée
    const replace = shapeList.indexOf(shapeToEdit);
    newList.splice(replace, 1, newShape);
    setShapeList(newList);
    setShape({});
    setIsDrawing(false);
    setPoints([]);
    setConfirm(false);
  };

  useEffect(() => {
    setShapeToEdit(shapeToEdit);
  }, [shapeToEdit]);

  const handleFinishEdit = () => {
    if (shapeToEdit !== null && shapeToEdit?.points.length <= 4) {
      // Supprimer shapeToEdit de shapeList
      const newShapeList = shapeList.filter(
        (shape) => shape.shape_id !== shapeToEdit.shape_id
      );
      setShapeList(newShapeList);

      // Supprimer shapeToEdit
      setShapeToEdit(null);
    }

    setShapeToEdit(null);
    setNewPoints(null);
    setPointsToReplace(null);
    setIsEditing(false);
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
          }}
        >
          Supprimer le plan
        </button>
      ) : null}
      <button
        className={isDrawing || isEditing ? "active" : "create"}
        onClick={() => {
          isDrawing
            ? setConfirm(true)
            : isEditing
            ? handleFinishEdit()
            : handleShapeState();
        }}
        width={50}
        height={50}
      >
        {isDrawing
          ? "Terminer"
          : isEditing
          ? "Modifications terminées"
          : "Créer une zone"}
      </button>
      {points.length > 0 ||
      (shapeToEdit && shapeToEdit.points.length > 0 && isEditing) ? (
        <button
          onClick={() => {
            isDrawing ? handleUndo() : isEditing ? handleUndoEdit() : null;
          }}
          width={50}
          height={50}
        >
          Revenir en arrière
        </button>
      ) : null}
      {shapeList.length > 0 ? (
        <button
          onClick={() => {
            handleClear();
          }}
          width={50}
          height={50}
        >
          Effacer le plan
        </button>
      ) : null}
      {/* {shapeToEdit !== null && isEditing ? (
        <button
          className={shapeToEdit ? "active" : "create"}
          onClick={() => {
            handleFinishEdit();
          }}
          width={50}
          height={50}
        >
          Modifications terminées
        </button>
      ) : null} */}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        // onClick={() => {
        //   handleClick();
        // }}
        className="Stage-Decoration"
        onMouseDown={(e) => {
          isEditing ? handleAddPointEdit(e) : confirm ? null : addPoint(e);
        }}
      >
        <Layer style={{ padding: "2em" }}>
          <Image ref={planRef} />
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
                        setShowMessage(true);
                        setShapeToEdit(shape);
                      }}
                    />
                    {isEditing && shape === shapeToEdit && pts.length > 0
                      ? pts.map((pt, index) => {
                          if (index % 2 === 0) {
                            const x = pts[index];
                            const y = pts[index + 1];
                            return (
                              <Circle
                                onDragStart={() => {
                                  setPointsToReplace({
                                    x: x,
                                    y: y,
                                  });
                                }}
                                onDragMove={(e) => {
                                  isEditing && pointsToReplace !== null
                                    ? handleDragMove(e, x, y)
                                    : null;
                                }}
                                onDragEnd={(e) => {
                                  handleDragEnd(e);
                                }}
                                key={`circle_${index}`}
                                draggable
                                x={x}
                                y={y}
                                radius={5}
                                fill="yellow"
                              />
                            );
                          }
                        })
                      : null}
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
                  radius={5}
                  fill="yellow"
                />
              );
            }
            return null;
          })}
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
                      radius={5}
                      fill="yellow"
                    />
                  );
                }
                return null;
              })
            : null}
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
            Créer la zone
          </button>
        </div>
      ) : null}
      {showMessage ? (
        <div className="confirm">
          <button
            onClick={() => {
              setIsEditing(true);
              setShowMessage(false);
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
