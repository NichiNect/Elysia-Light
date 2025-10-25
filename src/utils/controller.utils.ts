import { Elysia } from "elysia";
import fs from "fs";
import path from "path";
import { validate, Rules } from "./validate.utils";

export const Controller = (app: Elysia) => app.derive(({ query, body, status }) => ({
  // =====================================>
  // ## Basic fetching data query
  // =====================================>
  getQuery: {
      sortDirection  :  query.sortDirection      ||  "DESC",
      sortBy         :  query.sortBy             ||  "created_at",
      paginate       :  Number(query.paginate)   ||  10,
      filter         :  query.filter             ||  "[]",
      search         :  query.search             ||  "",
  },



  // ===================================>
  // ## Validation request body
  // ===================================>
  validation: async (rules: Rules) => {
      const result = await validate(body as Record<string, any>, rules);
      
      if (!result.valid) {
          throw status(422, {
              message: "Error: Unprocessable Entity!",
              errors: result.errors,
          })
      }
  },



  // ====================================>
  // ## Response error validation
  // ====================================>
  responseErrorValidation: (errors: Record<string, string[]>) => {
      throw status(422, {
          message: "Error: Unprocessable Entity!",
          errors: errors,
      })
  },



  // ====================================>
  // ## Response error
  // ====================================>
  responseError: (error: string, section?: string, message?: string, debug = process.env.APP_DEBUG) => {
      if (debug) {
          throw status(500, {
              message  :  message ?? "Error: Server Side Having Problem!",
              error    :  error ?? "unknown",
              section  :  section ?? "unknown",
          })
      }

      throw status(500, {
          message: message ?? "Error: Server Side Having Problem!"
      })
  },


  // ====================================> 
  // ## Response record
  // ====================================>
  responseData: (data: any[], totalRow?: number, message?: string, columns?: string[]) => {
      throw status(200, {
          message    :  message ?? (data.length ? "Success" : "Empty data"),
          data       :  data ?? [],
          total_row  :  totalRow ?? null,
          columns    :  columns ?? null,
      });
  },



  // ===================================>
  // ## Response success
  // ===================================>
  responseSuccess: (data: any, message?: string, code?: 200 | 201) => {
    throw status(code || 200, {
        message  :  message ?? "Success",
        data     :  data ?? [],
    })
  },



  // ===================================>
  // ## Response saved record
  // ===================================>
  responseSaved: (data: any, message?: string) => {
    throw status(201, {
        message  :  message ?? "Success",
        data     :  data ?? [],
    })
  },



  // ===================================>
  // ## Upload file
  // ===================================>
  uploadFile: async (file: File, folder = "uploads"): Promise<string> => {
    const dir = path.resolve("storage", "public", folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 18)}${path.extname(file.name).toLowerCase()}`;
    const filePath = path.join(dir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    fs.writeFileSync(filePath, buffer);

    return `/${folder}/${fileName}`
  },



  // ==================================>
  // ## Delete File
  // ==================================>
  deleteFile: (filePath: string) => {
    if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); return true; }

    return false;
  },
}));