import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  formatDisponibility,
  formatIndisponibility,
  formatReservations,
  formatManualBlocks,
} from "../Utils/Format/Time";
import {
  slotStyleGetter,
  eventStyleGetter,
  translateMessage,
} from "../Utils/Format/CalendarForm";
import "./calendar.css";

dayjs.locale("fr");
const localizer = dayjsLocalizer(dayjs);

const CustomCalendar = ({
  disponibilities,
  indisponibilities,
  reservations,
  manualBlocks,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState([]);
  const slotStyle = (date) =>
    slotStyleGetter(date, formatDisponibility(disponibilities));

  useEffect(() => {
    const formattedIndisponibilities = Array.isArray(formatIndisponibility(indisponibilities))
      ? formatIndisponibility(indisponibilities)
      : [];
    const formattedReservations = Array.isArray(reservations)
      ? formatReservations(reservations)
      : [];
    const formattedManualBlocks = Array.isArray(manualBlocks)
      ? formatManualBlocks(manualBlocks)
      : [];

    setEvents([
      ...formattedReservations,
      ...formattedIndisponibilities,
      ...formattedManualBlocks,
    ]);
  }, [disponibilities, indisponibilities, reservations, manualBlocks]);

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["week", "day", "agenda"]}
        min={new Date(1970, 1, 1, 7, 0, 0)}
        max={new Date(1970, 1, 1, 21, 0, 0)}
        style={{ height: "75vh" }}
        eventPropGetter={eventStyleGetter}
        slotPropGetter={slotStyle}
        messages={translateMessage}
        timeslots={1}
        step={60}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
};

export default CustomCalendar;

CustomCalendar.propTypes = {
  disponibilities: PropTypes.arrayOf(PropTypes.object),
  indisponibilities: PropTypes.arrayOf(PropTypes.object),
  reservations: PropTypes.arrayOf(PropTypes.object),
  manualBlocks: PropTypes.arrayOf(PropTypes.object),
  onSelectEvent: PropTypes.func,
};
