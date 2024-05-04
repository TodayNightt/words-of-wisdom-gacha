import { Environment } from "~/environments";

export const API_SERVER = Environment.getInstance().get("API_URL");