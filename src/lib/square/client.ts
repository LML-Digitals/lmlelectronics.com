import { SquareClient, SquareEnvironment } from "square";

if (!process.env.SQUARE_ACCESS_TOKEN) {
  throw new Error("SQUARE_ACCESS_TOKEN is required");
}

if (!process.env.SQUARE_LOCATION_ID) {
  throw new Error("SQUARE_LOCATION_ID is required");
}

// Initialize Square client
export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
export const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID;
