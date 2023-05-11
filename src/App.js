import React, { useState, useRef } from "react";
import "./App.css";
import { Icon } from "@iconify/react";
import { Stage, Layer, Rect, Arc, Text, Circle } from "react-konva";

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

  // La fonction qui est appelé au clique pour débuter la création d'un RECTANGLE
  const handleMouseDownRect = (event) => {
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
  const handleMouseDown = (event) => {
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
  const handleMouseMove = (event) => {
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
      </div>
      <Stage
        style={{ backgroundColor: "lightgray", margin: "2em" }}
        width={500}
        height={500}
      >
        {/* {choosenShape === "rect" ?
        // CODE CREATION RECTANGLE
      : 
      // CODE CREATION ANGLE
      } */}
      </Stage>
    </>
  );
}



