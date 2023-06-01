import React, { useState, useEffect, useRef, useDebugValue } from "react";
import Select from "react-select";
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
import Planning from "./TCE ARC ind7 17-04-23.json";

export default function App() {
  const planRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeList, setShapeList] = useState([]);
  // liste de toutes les tâches
  const [tasks, setTasks] = useState([]);
  // liste des tâches déjà attribuées
  const [givenTasks, setGivenTasks] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [points, setPoints] = useState([]);
  const [shape, setShape] = useState({
    shape_id: `shape_${shapeList.length}`,
    points: points,
    pointsHistory: [],
    color: "red",
    taskList: [],
  });
  const [showMessage, setShowMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initlaShapeToEdit, setInitialShapeToEdit] = useState(null);
  const [shapeToEdit, setShapeToEdit] = useState(null);
  const [pointsToReplace, setPointsToReplace] = useState({
    x: null,
    y: null,
  });
  const [newPoints, setNewPoints] = useState({
    x: null,
    y: null,
  });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [updatedSelectedTasks, setUpdatedSelectedTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setShape({
      ...shape,
      points: points,
    });
  }, [points]);

  useEffect(() => {
    points.length === 0 ? setConfirm(false) : null;
  }, [points, confirm]);

  const fetchTasks = () => {
    setTasks(Planning);
  };

  // fonction qui retire une tache de la liste si elle est déjà attribuée à une zone
  useEffect(() => {
    const existingTasks = shapeList?.map((task) => {
      return task.task;
    });
  }, [shapeList]);

  const handleColorChange = (newColor) => {
    setShape({ ...shape, color: newColor });
  };

  const handleEditTask = (option) => {
    const updatedShape = { ...shapeToEdit, taskList: option };
    let updatedGivenTasks = givenTasks.filter(
      (task) => !shapeToEdit?.taskList?.includes(task)
    );

    updatedGivenTasks = [...updatedGivenTasks, ...option];

    setUpdatedSelectedTasks(updatedGivenTasks);
    setShapeToEdit(updatedShape);
  };

  useEffect(() => {
    setGivenTasks(updatedSelectedTasks);
  }, [updatedSelectedTasks]);

  const handlePlanUpload = (e) => {
    const uploadedImage = e.target.files[0];
    const imageURL = URL.createObjectURL(uploadedImage);
    const img = new window.Image();
    img.src = imageURL;
    img.onload = () => {
      planRef.current.image(img);
      planRef.current.getLayer().batchDraw();
    };
    setDeleteBtn(true);
  };

  const handleDeletePlan = () => {
    planRef.current?.image(null);
    planRef.current?.getLayer().batchDraw();
    setDeleteBtn(false);
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
      setInitialShapeToEdit(null);
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
    setInitialShapeToEdit(null);
  };

  const handleStartDraw = () => {
    setIsDrawing(true);
    setShape({
      shape_id: `shape_${shapeList.length}`,
      points: points,
      color: "#000000",
      taskList: [],
    });
    setPoints([]);
  };

  const handleCancelCreation = () => {
    setShape({});
    setIsDrawing(false);
    setIsEditing(false);
    setPoints([]);
    setShapeToEdit({});
    setInitialShapeToEdit(null);
    setShowMessage(false);
  };

  const handleFinish = () => {
    if (selectedTasks.length < 1) {
      alert("veuillez assigner une tâche à la zone");
    } else {
      if (isDrawing) {
        if (points.length > 1) {
          // Assigner les tâches à la zone
          const newShape = {
            ...shape,
            taskList: selectedTasks,
          };
          setShape(newShape);
          const mergedTasks = [...givenTasks, ...selectedTasks];
          const uniqueTasks = Array.from(new Set(mergedTasks));
          setGivenTasks(uniqueTasks);
          // fin
          setShapeList([...shapeList, newShape]);
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
    }
  };

  const handleDeleteShape = () => {
    const idToDelete = shapeToEdit.shape_id;
    const newShapeList = shapeList.filter((sha) => sha.shape_id !== idToDelete);
    setShapeList(newShapeList);
    setShowMessage(false);
    setIsEditing(false);
    setShapeToEdit(null);
    setInitialShapeToEdit(null);
    setGivenTasks(null);
  };

  useEffect(() => {
    handleAssingGivenTasks();
  }, [shapeList]);

  const handleAssingGivenTasks = () => {
    const newGivenTaskList = [];

    shapeList.forEach((shape) => {
      const { taskList } = shape;
      newGivenTaskList.push(...taskList);
    });

    setGivenTasks(newGivenTaskList);
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
    if (!shapeToEdit.taskList.length > 0) {
      alert("veuillez assigner une tâche à la zone");
    } else {
      const indexToEdit = shapeList.indexOf(initlaShapeToEdit);
      const newShapeList = [...shapeList];
      newShapeList.splice(indexToEdit, 1, shapeToEdit);
      if (shapeToEdit !== null && shapeToEdit?.points.length < 1) {
        // Supprimer shapeToEdit de shapeList
        const newShapeList = shapeList.filter(
          (shape) => shape.shape_id !== shapeToEdit.shape_id
        );

        // Supprimer shapeToEdit
        setShapeToEdit(null);
        setInitialShapeToEdit(null);
      }
      setShapeList(newShapeList);
      setIsEditing(false);
      setShapeToEdit(null);
      setInitialShapeToEdit(null);
      setShowMessage(false);
    }
  };

  return (
    <div className="container">
      <p>Json</p>
      <input onChange={(e) => {}} type="file" />
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          handlePlanUpload(e);
        }}
      />
      {deleteBtn ? (
        <button
          onClick={() => {
            handleDeletePlan();
          }}
        >
          Supprimer l'image
        </button>
      ) : null}
      {!isDrawing && !isEditing ? (
        <button
          onClick={() => {
            handleStartDraw();
          }}
        >
          Créer une zone
        </button>
      ) : isDrawing && points.length > 2 ? (
        <button
          onClick={() => {
            setConfirm(true);
          }}
        >
          Terminer
        </button>
      ) : null}
      {isDrawing ? (
        <button
          onClick={() => {
            handleCancelCreation();
          }}
        >
          Annuler
        </button>
      ) : null}
      {isEditing ? (
        <button
          onClick={() => {
            setShowMessage(true);
          }}
        >
          Modifications terminées
        </button>
      ) : null}
      {points?.length > 0 ||
      (shapeToEdit && shapeToEdit?.points?.length > 0 && isEditing) ? (
        <button
          onClick={() => {
            isDrawing ? handleUndo() : isEditing ? handleUndoEdit() : null;
          }}
        >
          Revenir au dernier point
        </button>
      ) : null}
      {shapeList.length > 0 ? (
        <button
          onClick={() => {
            handleClear();
          }}
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
                return (
                  <Group>
                    <Text
                      fill={"black"}
                      text={shape?.taskList[0].name}
                      x={
                        objetAvecYLePlusBas ? objetAvecYLePlusBas.x - 100 : null
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
                        setInitialShapeToEdit(shape);
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
          <Select
            isMulti
            options={tasks}
            placeholder="Enter name"
            // si problème de disable
            // isOptionDisabled={(option) => {
            //   const same = givenTasks.filter((task) => {
            //     return task.UID === option.UID;
            //   });
            //   return same.length > 0;
            // }}

            isOptionDisabled={(option) => givenTasks.includes(option)}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.name}
            onChange={(option) => setSelectedTasks(option)}
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
          <button
            onClick={() => {
              handleCancelCreation();
            }}
          >
            Annuler la création
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
          <span>
            <p>Modifier la tâche attribuée</p>
            <Select
              isMulti
              options={tasks}
              placeholder="Enter name"
              defaultValue={[...shapeToEdit?.taskList]}
              isOptionDisabled={(option) => givenTasks.includes(option)}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              onChange={(option) => handleEditTask(option)}
            />
          </span>
          {shapeToEdit !== initlaShapeToEdit ? (
            <button
              onClick={() => {
                handleFinishEdit();
              }}
            >
              Modification terminée
            </button>
          ) : null}
          <button
            onClick={() => {
              handleCancelCreation();
            }}
          >
            Annuler
          </button>
        </div>
      ) : null}
    </div>
  );
}
