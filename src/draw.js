import React, { useState, useEffect, useRef, useDebugValue } from "react";
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
import { Document } from "react-pdf";
import "./App.css";

export default function App() {
  const planRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [planFile, setPlanFile] = useState(null);
  const [shapeList, setShapeList] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [points, setPoints] = useState([]);
  const [shape, setShape] = useState({
    shape_id: `shape_${shapeList.length}`,
    points: points,
    pointsHistory: [],
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
  const [pdfFile, setPdfFile] = useState();

  useEffect(() => {
    setShape({
      ...shape,
      points: points,
    });
  }, [points]);

  useEffect(() => {
    points.length === 0 ? setConfirm(false) : null;
  }, [points, confirm]);

  // const handleCloseShape = () => {
  //   if (points.length > 0) {
  //     setPoints([...points, points[0]]);
  //   }
  // };

  const handleColorChange = (newColor) => {
    setShape({ ...shape, color: newColor });
  };

  const handleNameChange = (newName) => {
    setShape({ ...shape, name: newName });
  };

  const handlePlanUpload = (e) => {
    if (e.target.files.length > 0) {
      const fileType = e.target.files[0].type;
      if (fileType === "image/png" || fileType === "image/jpeg") {
        const uploadedImage = e.target.files[0];
        const imageURL = URL.createObjectURL(uploadedImage);
        const img = new window.Image();
        img.src = imageURL;
        img.onload = () => {
          planRef.current.image(img);
          planRef.current.getLayer().batchDraw();
        };
      } else if (fileType === "application/pdf") {
        const file = e.target.files[0];
        setPdfFile(file);
      } else {
        null;
      }
    } else {
      null;
    }
  };

  const addPoint = (e) => {
    if (isDrawing) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      if (points.length >= 1) {
        const newPointHistory = [
          ...shape.pointsHistory,
          { x: point.x, y: point.y },
        ];
        const newPoints = [...points, { x: point.x, y: point.y }];
        setPoints(newPoints);
        setShape({ ...shape, pointsHistory: newPointHistory });
      } else {
        const points = { x: point.x, y: point.y };
        setPoints([{ x: point.x, y: point.y }]);
        setShape({ ...shape, pointsHistory: [points] });
      }
    } else return;
  };

  const handleUndo = async () => {
    if (points.length > 0) {
      let currentPoints = [...points];
      let currentHistory = [...shape.pointsHistory];
      // for (let i = 0; i !== points.length - 1; i++) {
      //   // eslint-disable-next-line no-unused-expressions
      //   await currentPoints.push(points[i]);
      // }
      currentPoints.pop();
      currentHistory.pop();
      setPoints(currentPoints);
      setShape({ ...shape, pointsHistory: currentHistory });
    } else {
    }
  };

  const handleUndoEdit = async () => {
    if (shapeToEdit?.points.length > 1) {
      const newPoints = [...shapeToEdit.points];
      const newHistory = [...shapeToEdit.pointsHistory];
      const indexToRemove = newPoints.indexOf(
        newHistory[newHistory.length - 1]
      );
      newPoints.splice(indexToRemove, 1);
      newHistory.pop();

      const newShape = {
        ...shapeToEdit,
        points: newPoints,
        pointsHistory: newHistory,
      };
      setShapeToEdit(newShape);
      const newList = [...shapeList];
      // Mettre à jour la liste des formes avec la forme modifiée
      const replace = shapeList.indexOf(shapeToEdit);
      newList.splice(replace, 1, newShape);
      setShapeList(newList);
    } else if (shapeToEdit !== null && shapeToEdit?.points.length <= 1) {
      // Supprimer shapeToEdit de shapeList
      const newShapeList = shapeList.filter(
        (shape) => shape.shape_id !== shapeToEdit.shape_id
      );
      setShapeList(newShapeList);
      setShapeToEdit(null);
      setIsEditing(false);
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
      poinsHistory: [],
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
    setShowMessage(false);
    setIsEditing(false);
    setShapeToEdit(null);
    setShowMessage(false);
  };

  const handleDragMove = (e, x, y) => {
    setPointsToReplace({
      x: x,
      y: y,
    });
    let newShape = { ...shapeToEdit };
    const newPoint = {
      x: e.target.x(),
      y: e.target.y(),
    };
    const emplacementPoint = newShape.points.findIndex(
      (point) => point.x === pointsToReplace.x && point.y === pointsToReplace.y
    );

    if (emplacementPoint !== -1) {
      newShape.points.splice(emplacementPoint, 1, newPoint);
      setShapeToEdit(newShape);
      const newList = [...shapeList];
      // Mettre à jour la liste des formes avec la forme modifiée
      const replace = shapeList.indexOf(shapeToEdit);
      newList.splice(replace, 1, newShape);
      setShapeList(newList);
    } else {
      null;
    }
  };

  const handleDragEnd = (e) => {
    setPointsToReplace({ x: null, y: null });
    // setShapeToEdit(shapeToEdit);
  };

  const handleAddPointEdit = (e) => {
    // vérifier les 2 points les plus proches
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    let newList = shapeList;
    let newShape = shapeToEdit;

    // Vérifier s'il y a déjà un point à proximité
    const nearbyPoint = newShape.points.some((pt, index) => {
      const x = newShape.points[index].x;
      const y = newShape.points[index].y;
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      return distance < 10; // Définissez une distance de seuil appropriée
    });
    if (!nearbyPoint) {
      const { x, y } = e.target.getStage().getPointerPosition();
      const nouvelObjet = { x, y };
      let point1 = null;
      let point2 = null;
      let distanceMin1 = Number.MAX_VALUE;
      let distanceMin2 = Number.MAX_VALUE;

      shapeToEdit.points.forEach((objet, index) => {
        const distance = Math.sqrt(
          Math.pow(objet.x - point.x, 2) + Math.pow(objet.y - point.y, 2)
        );

        if (distance < distanceMin1) {
          distanceMin2 = distanceMin1;
          distanceMin1 = distance;
          point2 = point1;
          point1 = { ...objet, index };
        } else if (distance < distanceMin2) {
          distanceMin2 = distance;
          point2 = { ...objet, index };
        }
      });

      const nouveauTableau = [...shapeToEdit.points];
      const newHistory = [...shapeToEdit.pointsHistory];

      // Vérifier si les deux points les plus proches sont adjacents
      if (Math.abs(point1.index - point2.index) === 1) {
        // Les deux points sont adjacents, insérer le nouveau point après le premier point
        nouveauTableau.splice(point1.index + 1, 0, nouvelObjet);
      } else {
        // Les deux points ne sont pas adjacents, insérer le nouveau point entre les deux points
        const insertionIndex = Math.max(point1.index, point2.index);
        nouveauTableau.splice(insertionIndex, 0, nouvelObjet);
      }

      newHistory.push(nouvelObjet);

      const newShape = {
        ...shapeToEdit,
        points: nouveauTableau,
        pointsHistory: newHistory,
      };
      setShapeToEdit(newShape);
      const newList = [...shapeList];
      // Mettre à jour la liste des formes avec la forme modifiée
      const replace = shapeList.indexOf(shapeToEdit);
      newList.splice(replace, 1, newShape);
      setShapeList(newList);
      setShape({});
    } else {
      null;
    }
  };

  useEffect(() => {
    setShapeToEdit(shapeToEdit);
  }, [shapeToEdit]);

  useEffect(() => {
    setShapeList(shapeList);
  }, [shapeList]);

  const handleFinishEdit = () => {
    if (shapeToEdit !== null && shapeToEdit?.points.length < 1) {
      // Supprimer shapeToEdit de shapeList
      const newShapeList = shapeList.filter(
        (shape) => shape.shape_id !== shapeToEdit.shape_id
      );
      setShapeList(newShapeList);

      // Supprimer shapeToEdit
      setShapeToEdit(null);
    }
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
      {planRef ? (
        <button
          onClick={() => {
            planRef.current?.image(null);
            planRef.current?.getLayer().batchDraw();
          }}
        >
          Supprimer l'image
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
        {isDrawing && points.length > 0
          ? "Terminer"
          : isEditing
          ? "Modifications terminées"
          : !isDrawing
          ? "Créer une zone"
          : null}
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

          {shapeList.length > 0
            ? shapeList?.map((shape) => {
                const pts = shape?.points;
                const objetAvecYLePlusBas = shape?.points.reduce(
                  (objetMin, objetCourant) => {
                    if (objetCourant.y < objetMin.y) {
                      return objetCourant;
                    } else {
                      return objetMin;
                    }
                  }
                );
                console.log(shape.points, objetAvecYLePlusBas);
                return (
                  <Group>
                    <Text
                      fill={"black"}
                      text={shape?.name}
                      x={
                        objetAvecYLePlusBas ? objetAvecYLePlusBas.x + 10 : null
                      }
                      y={
                        objetAvecYLePlusBas ? objetAvecYLePlusBas.y - 35 : null
                      }
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
                        context.moveTo(pts[0].x, pts[0].y);
                        pts.forEach((point, i) => {
                          context.lineTo(pts[i].x, pts[i].y);
                        });
                        context.closePath();
                        context.fillStrokeShape(shape);
                      }}
                      fill={`${shape.color}90`}
                      // onClick={handleCloseShape}
                      onDblClick={() => {
                        setShowMessage(true);
                        setShapeToEdit(shape);
                      }}
                    />
                    {isEditing && shape === shapeToEdit && pts.length > 0
                      ? pts.map((pt, index) => {
                          const x = pts[index].x;
                          const y = pts[index].y;
                          return (
                            <Circle
                              onDragStart={() => {}}
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
                context.moveTo(points[0].x, points[0].y);
                points.forEach((point, i) => {
                  context.lineTo(points[i].x, points[i].y);
                });
                context.closePath();
                context.fillStrokeShape(shape);
              }}
              fill={`${shape.color}80`}
              // onClick={handleCloseShape}
            />
          ) : null}
          {points?.map((point, index) => {
            const x = points[index].x;
            const y = points[index].y;
            return (
              <Circle
                key={`circle_${index}`}
                x={x}
                y={y}
                radius={5}
                fill="yellow"
              />
            );
          })}
          {shape === shapeToEdit
            ? pts?.map((point, index) => {
                const x = pts[index].x;
                const y = pts[index].y;
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
          <button
            onClick={() => {
              setConfirm(false);
            }}
          >
            Revenir au dessin de la forme
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
