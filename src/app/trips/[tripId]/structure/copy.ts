export const TRIP_STRUCTURE_COPY = {
  heading: "Trip structure",
  headingSubtext: "stops & legs",
  addStop: "+ Stop",
  addLeg: "+ Add leg",
  editStop: "Edit",
  saveStop: "Save",
  cancelEdit: "Cancel",
  stopLabel: (n: number) => "STOP " + String(n),
  nameLabel: "Name",
  startDateLabel: "Start date",
  endDateLabel: "End date",
  errorNameRequired: "Name is required",
  errorStartDateRequired: "Start date is required",
  errorEndDateRequired: "End date is required",
  errorEndBeforeStart: "End date must be on or after start date",
  submitAddStop: "Add stop",
} as const;

export const LEG_FORM_COPY = {
  fromStopLabel: "From stop",
  toStopLabel: "To stop",
  submitAddLeg: "Add leg",
  cancelEdit: "Cancel",
  errorFromStopRequired: "From stop is required",
  errorToStopRequired: "To stop is required",
  errorSameStop: "From and to stops must be different",
} as const;
