import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./Gantt.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Gantt({ tasks }) {
  const ganttContainerRef = useRef(null);
  const [initialTasks, setInitialTasks] = useState([]);
  const [filterOn, setFilterOn] = useState(false);
  const [extremeDates, setExtremeDates] = useState({
    before: null,
    after: null,
  });
  const [limitDates, setLimitDates] = useState({
    startDate: null,
    endDate: null,
  });

  const handleFetchTasks = () => {
    if (limitDates.startDate !== null && limitDates.endDate !== null) {
      gantt.config.start_date = limitDates.startDate;
      gantt.config.end_date = limitDates.endDate;
    }
    setInitialTasks(tasks);
    gantt.config.date_grid = "%d/%m/%Y";

    gantt.init(ganttContainerRef.current);
    gantt.parse(tasks);
  };

  const filterDate = (type, da) => {
    const date = new Date(da);
    type === "start"
      ? setLimitDates({ ...limitDates, startDate: date })
      : setLimitDates({ ...limitDates, endDate: date });
  };

  const handleSubmitFilter = (e) => {
    e.preventDefault(); // Empêcher le rafraîchissement de la page par défaut

    if (limitDates.startDate && limitDates.endDate) {
      handleFetchTasks();
      setFilterOn(true);
    }
  };

  const disableFilter = () => {
    setFilterOn(false);
    setLimitDates({
      startDate: null,
      endDate: null,
    });
    gantt.config.start_date = null; // Réinitialiser la date de début de configuration de Gantt
    gantt.config.end_date = null; // Réinitialiser la date de fin de configuration de Gantt
    gantt.clearAll();
    gantt.parse(initialTasks);
  };

  const getExtremeDatesTasks = () => {
    const today = moment();
    const list = tasks.data;
    const pastTasks = list?.filter((task) =>
      moment(task.start_date, "DD-MM-YYYY").isBefore(today, "day")
    );
    const futureTasks = list?.filter((task) =>
      moment(task.end_date, "DD-MM-YYYY").isAfter(today, "day")
    );

    const closestPastTask = pastTasks.sort(
      (taskB, taskA) =>
        moment(taskB.start_date, "YYYY-MM-DD") -
        moment(taskA.start_date, "YYYY-MM-DD")
    )[0];

    const closestFutureTask = futureTasks.sort(
      (taskA, taskB) =>
        moment(taskB.end_date, "YYYY-MM-DD") -
        moment(taskA.end_date, "YYYY-MM-DD")
    )[0];

    setExtremeDates({
      before: moment(closestPastTask.start_date).format("YYYY-MM-DD"),
      after: moment(closestFutureTask.end_date).format("YYYY-MM-DD"),
    });
  };

  useEffect(() => {
    getExtremeDatesTasks();
    handleFetchTasks();
  }, [tasks, filterOn]);

  return (
    <>
      <form>
        <label htmlFor="debut">Date de début</label>
        <DatePicker
          placeholderText="Selectionner une date"
          selected={limitDates.startDate}
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          onChange={(date) => filterDate("start", date)}
          minDate={new Date(extremeDates.before)}
        />
        <label htmlFor="fin">Date de fin</label>
        <DatePicker
          placeholderText="Selectionner une date"
          selected={limitDates.startDate}
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          onChange={(date) => filterDate("end", date)}
          maxDate={new Date(extremeDates.after)}
        />
        {limitDates.startDate && limitDates.endDate ? (
          <button
            onClick={(e) => {
              handleSubmitFilter(e);
            }}
          >
            Filtrer par date
          </button>
        ) : null}
        {filterOn ? (
          <button
            onClick={() => {
              disableFilter();
            }}
          >
            Retirer le filtre
          </button>
        ) : null}
      </form>
      <div
        ref={ganttContainerRef}
        style={{ width: "100%", height: "50vh" }}
      ></div>
    </>
  );
}
