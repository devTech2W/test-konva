// eslint-disable
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Icon } from "@iconify/react";
import { Stage, Layer, Rect, Arc, Text, Circle, Line } from "react-konva";

export default function App() {
  // Tableau contenant toutes les formes du plan
  const [shapes, setShapes] = useState([]);
  // Passer de l'état de dessiner à non
  const [drawing, setDrawing] = useState(false);
  // La dernière forme créee
  const [currentShape, setCurrentShape] = useState(null);
  // La forme que l'utilisateur veut dessiner
  const [choosenShape, setChoosenShape] = useState("square");
  // La couleur selectionnée
  const [choosenColor, setChoosenColor] = useState("");
  // Nom donné à la zone créee
  const [areaName, setAreaName] = useState("");
  // Finaliser la création de la zone du plan
  const [confirm, setConfirm] = useState(false);

  // La fonction qui est appelé au clique pour débuter la création d'un RECTANGLE
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

  // La fonction qui est appelé au clique pour débuter la création d'un ARC
  const handleMouseDownArc = (event) => {};

  // La fonction appelé au mouvement de la souris pendant la création d'un ARC
  const handleMouseMoveArc = (event) => {};

  return (
    <div className={confirm ? "containerCF" : "container"}>
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
        mouse
        onMouseDown={(e) => {
          // eslint-disable-next-line no-unused-expressions
          choosenShape === "square" ? handleMouseDownRect(e) : null;
        }}
        onMousemove={(e) => {
          // eslint-disable-next-line no-unused-expressions
          choosenShape === "square" ? handleMouseMoveRect(e) : null;
        }}
        // FONCTION QUI VA PROPOSER DE RENSEIGNER LES INFOS UNE FOIS LA FORME CREEE
        onMouseup={(e) => {
          setDrawing(false);
          setConfirm(true);
        }}
      >
        <Layer style={{ backgroundColor: "red" }}>
          {shapes?.map((shape) => {
            if (shape.shape === "rect") {
              return (
                <React.Fragment key={shape.id}>
                  <Rect
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
            } else {
              return null;
            }
          })}
          {/* <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
          />
          <Line
          x={20}
          y={200}
          points={[0, 0, 100, 0, 100, 100]}
          tension={0.5}
          closed
          stroke="black"
          fillLinearGradientStartPoint={{ x: -50, y: -50 }}
          fillLinearGradientEndPoint={{ x: 50, y: 50 }}
          fillLinearGradientColorStops={[0, 'red', 1, 'yellow']}
        />
          <Rect
            x={20}
            y={270}
            width={100}
            height={100}
            fill="green"
            shadowBlur={10}
          /> */}
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
