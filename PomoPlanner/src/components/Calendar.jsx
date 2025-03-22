import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { lightGreen } from "@mui/material/colors";

import React from "react";

export default function Calendar() {
  return (
    <div >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar sx={{
          bgcolor: lightGreen[50],
        }} />
      </LocalizationProvider>
    </div>
  );
}