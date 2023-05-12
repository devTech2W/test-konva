// eslint-disable
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Icon } from "@iconify/react";
import {
  Stage,
  Layer,
  Rect,
  Arc,
  Text,
  Circle,
  Line,
  Image,
} from "react-konva";

export default function App() {
  // Uploader le plan
  const [plan, setPlan] = useState(null);
  const imageRef = useRef(null);
  // Tableau contenant toutes les formes du plan
  const [shapes, setShapes] = useState([]);
  // Passer de l'état de dessiner à non
  const [drawing, setDrawing] = useState(false);
  // La dernière forme créee
  const [currentShape, setCurrentShape] = useState(null);
  // La forme que l'utilisateur veut dessiner RECTANLGE / ARC / LIGNE
  const [choosenShape, setChoosenShape] = useState("square");
  // La couleur selectionnée
  const [choosenColor, setChoosenColor] = useState("");
  // Nom donné à la zone créee
  const [areaName, setAreaName] = useState("");
  // Confirmer la création de la zone du plan
  const [confirm, setConfirm] = useState(false);
  // Les points placés pour la création par points
  const [points, setPoints] = useState([]);

  // Stocker le plan dans "plan"
  function handlePlanUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setPlan(e.target.result);
    };

    reader.readAsDataURL(file);
  }

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

  // Fonction pour dessiner par point

  function handleCanvasClick(event) {
    const point = { x: event.evt.offsetX, y: event.evt.offsetY };
    setPoints([...points, point]);
  }

  // La fonction  pour débuter la création d'un RECTANGLE
  const handleMouseDownRect = (event) => {
    setDrawing(true);
    const { x, y } = event.target.getStage().getPointerPosition();
    const newRectangle = {
      x: x,
      y: y,
      width: 0,
      height: 0,
      fill: choosenColor ? choosenColor : "#00000080",
      id: `rect${shapes.length + 1}`,
      shape: "rect",
    };
    setCurrentShape(newRectangle);
  };

  // La fonction appelé au mouvement de la souris pendant la création d'un RECTANGLE
  const handleMouseMoveRect = (event) => {
    if (!drawing) return; // Vérification pour s'assurer qu'un rectangle est en train d'être dessiné

    const lastIndex = shapes.length - 1;
    const { x, y } = event.target.getStage().getPointerPosition();
    const updatedRectangle = {
      ...currentShape,
      width: x - shapes[lastIndex]?.x,
      height: y - shapes[lastIndex]?.y,
    };
    const newRectangles = [...shapes];
    newRectangles.splice(lastIndex, 1, updatedRectangle);
    setShapes(newRectangles);
  };

  // Fonction lorsque l'utilisateur valide la création de la forme
  const handleFinish = () => {
    setShapes([...shapes, currentShape]);
    setCurrentShape(null);
    setConfirm(false);
  };

  // Fonction lorsque l'utilisateur annule la création de la forme
  const handleCancel = () => {
    setAreaName("");
    // eslint-disable-next-line no-unused-expressions
    shapes.length === 1 || shapes.length === 0 ? setShapes([]) : null;
    setDrawing(false);
    setCurrentShape(null);
    setConfirm(false);
    console.log(shapes);
  };

  return (
    <div className={confirm ? "containerCF" : "container"}>
      <h3> importez votre plan</h3>
      <input type="file" onChange={handlePlanUpload} />
      <h1>Drawing</h1>
      <p> Choisissez une forme</p>
      <div>
        <span
          className={choosenShape === "square" ? "selected" : null}
          onClick={() => {
            setChoosenShape("square");
          }}
        >
          <Icon icon="material-symbols:square-outline" />
        </span>
        <span
          className={choosenShape === "rect" ? "selected" : null}
          onClick={() => {
            setChoosenShape("rect");
          }}
        >
          <Icon icon="vaadin:spinner-arc" />
        </span>
        <span
          className={choosenShape === "line" ? "selected" : null}
          onClick={() => {
            setChoosenShape("line");
          }}
        >
          <Icon icon="material-symbols:line-end" />
        </span>
        <span>
          <input
            onChange={(e) => {
              setChoosenColor(`${e.target.value}80`);
            }}
            type="color"
          />
        </span>
      </div>
      <p
        onClick={() => {
          console.log(shapes);
        }}
      >
        test
      </p>
      <Stage
        style={{ backgroundColor: "lightgray", margin: "2em" }}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => {
          // eslint-disable-next-line no-unused-expressions
          choosenShape === "square"
            ? handleMouseDownRect(e)
            : choosenShape === "line"
            ? null
            : null;
        }}
        onMousemove={(e) => {
          // eslint-disable-next-line no-unused-expressions
          choosenShape === "square"
            ? handleMouseMoveRect(e)
            : choosenShape === "line"
            ? null
            : null;
        }}
        // FONCTION QUI VA PROPOSER DE RENSEIGNER LES INFOS UNE FOIS LA FORME CREEE
        onMouseup={(e) => {
          setDrawing(false);
          // setConfirm(true);
        }}
        onClick={handleCanvasClick}
      >
        <Layer>
          {<Image ref={imageRef} />}
          {shapes?.map((shape) => {
            if (shape.shape === "rect") {
              return (
                <React.Fragment key={shape.id}>
                  <Rect
                    stroke="black"
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={shape.fill}
                  />
                  <Text
                    x={shape.x}
                    y={shape.y - 20}
                    text={shape.name}
                    fontSize={16}
                  />
                </React.Fragment>
              );
            } else if (shape.shape === "line") {
              return (
                <React.Fragment key={shape.id}>
                  <Line
                    x={20}
                    y={200}
                    points={[100, 90, 100, 20, 300, 400]}
                    tension={0.5}
                    closed
                    stroke="black"
                    fill="#00000080"
                  />
                  <Text
                    x={shape.x}
                    y={shape.y - 20}
                    text={shape.name}
                    fontSize={16}
                  />
                </React.Fragment>
              );
            }
          })}
          {points.map((point, index) => {
            if (index === points.length - 1) {
              return (
                <Circle
                  key={index}
                  x={point.x}
                  y={point.y}
                  radius={5}
                  fill="black"
                />
              );
            } else {
              const nextPoint = points[index + 1];
              return (
                <Line
                  fill={choosenColor}
                  key={index}
                  points={[point.x, point.y, nextPoint.x, nextPoint.y]}
                  stroke="black"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            }
          })}
        </Layer>
      </Stage>
      {confirm ? (
        <div className="confirm">
          <form>
            {/* <label for="name">Nommez votre zone</label>
            <input
              onChange={(e) => {
                setAreaName(e.target.value);
              }}
              type="text"
            /> */}
            <span
              onClick={() => {
                handleFinish();
              }}
            >
              Créer la forme
            </span>
          </form>
          <span
            onClick={() => {
              handleCancel();
            }}
          >
            Annuler
          </span>
        </div>
      ) : null}
    </div>
  );
}
