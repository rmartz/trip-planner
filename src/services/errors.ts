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

export class MalformedActivityError extends Error {
  constructor(activityId: string) {
    super(
      `Activity ${activityId} is malformed: its document is not nested under a stop`,
    );
    this.name = "MalformedActivityError";
  }
}
