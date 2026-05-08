export class PlannerOnlyError extends Error {
  constructor(message = "Only Planners can perform this action") {
    super(message);
    this.name = "PlannerOnlyError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
