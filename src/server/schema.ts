import { zfd } from "zod-form-data";

const evaluateSchema = zfd.formData({
  jobDescription: zfd.file(),
  cv: zfd.file(),
});

export default {
  evaluateSchema,
};
