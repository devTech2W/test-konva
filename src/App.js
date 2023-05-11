// eslint-disable
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Icon } from "@iconify/react";
import { Stage, Layer, Rect, Arc, Text, Circle, Line } from "react-konva";

export default function App() {
  // Tableau contenant toutes les formes du plan
  const [shapes, setShapes] = useState([]);
  // La position de départ à la création d'une forme
  const [startPos, setStartPos] = useState(null);
  // La position actuelle pendant la création de la forme
  const [currentPos, setCurrentPos] = useState(null);
  // La dernière forme créee
  const [currentShape, setCurrentShape] = useState(null);
  // La forme que l'utilisateur veut dessiner
  const [choosenShape, setChoosenShape] = useState("square");
  // La fonction appelé lors du dessin selon la forme selectionnée
  const [drawFunctions, setDrawFunctions] = useState([
    { handleMouseDown: null },
    { handleMouseMove: null },
  ]);

  // Initialisations au chargement de la page
  // useEffect(() => {
  //   setDrawFunctions([
  //     { handleMouseDown: handleMouseDownRect() },
  //     { handleMouseMove: handleMouseMoveRect() },
  //   ]);
  // }, []);

  // Assigner une fonction de création de forme selon la forme selectionnée
  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    choosenShape === "square"
      ? setDrawFunctions([
          { handleMouseDown: handleMouseDownRect() },
          { handleMouseMove: handleMouseMoveRect() },
        ])
      : null;
  }, [choosenShape]);

  // La fonction qui est appelé au clique pour débuter la création d'un RECTANGLE
  const handleMouseDownRect = (event) => {
    console.log(event)
    const { x, y } = event.target.getStage().getPointerPosition();
    const newRectangle = {
      x: x,
      y: y,
      width: 0,
      height: 0,
      fill: "blue",
      id: `rect${shapes.length + 1}`,
      shape: "rect",
    };
    setShapes([...shapes, newRectangle]);
  };

  // La fonction appelé au mouvement de la souris pendant la création d'un RECTANGLE
  const handleMouseMoveRect = (event) => {
    const lastIndex = shapes.length - 1;
    if (lastIndex < 0) {
      return;
    }
    const { x, y } = event.target.getStage().getPointerPosition();
    const updatedRectangle = {
      ...shapes[lastIndex],
      width: x - shapes[lastIndex].x,
      height: y - shapes[lastIndex].y,
    };
    const newRectangles = [...shapes];
    newRectangles.splice(lastIndex, 1, updatedRectangle);
    setShapes(newRectangles);
  };

  // La fonction qui est appelé au clique pour débuter la création d'un ARC
  const handleMouseDownArc = (event) => {
    const { x, y } = event.target.getStage().getPointerPosition();
    const newArc = {
      x: x,
      y: y,
      outerRadius: 0,
      innerRadius: 0,
      angle: 0,
      fill: "blue",
      id: `arc${shapes.length + 1}`,
      shape: "arc",
    };
    setShapes([...shapes, newArc]);
  };

  // La fonction appelé au mouvement de la souris pendant la création d'un ARC
  const handleMouseMoveArc = (event) => {
    const lastIndex = shapes.length - 1;
    if (lastIndex < 0) {
      return;
    }
    const { x, y } = event.target.getStage().getPointerPosition();
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - shapes[lastIndex].x, 2) +
        Math.pow(y - shapes[lastIndex].y, 2)
    );
    const updatedArc = {
      ...shapes[lastIndex],
      outerRadius: distanceFromCenter,
      innerRadius: distanceFromCenter / 2,
      angle:
        Math.atan2(y - shapes[lastIndex].y, x - shapes[lastIndex].x) *
        (180 / Math.PI),
    };
    const newArcs = [...shapes];
    newArcs.splice(lastIndex, 1, updatedArc);
    shapes(newArcs);
  };

  return (
    <>
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
        width={500}
        height={500}
        mouse
        onMouseDown={(e) => {
          // drawFunctions.handleMouseDown();
        }}
        onMousemove={(e) => {
          console.log(drawFunctions);
          // drawFunctions.handleMouseMove();
        }}
        // FONCTION QUI VA PROPOSER DE RENSEIGNER LES INFOS UNE FOIS LA FORME CREEE
        // onMouseup={handleMouseUp}
      >
        <Layer>
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
    </>
  );
}
