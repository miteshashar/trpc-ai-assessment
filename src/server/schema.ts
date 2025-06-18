// Input validation schemas for API endpoints
import { zfd } from "zod-form-data";

// Schema for CV evaluation endpoint - expects two PDF files
const evaluateSchema = zfd.formData({
  jobDescription: zfd.file(),
  cv: zfd.file(),
});

export default {
  evaluateSchema,
};
