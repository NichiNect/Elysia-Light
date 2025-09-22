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
  validation: (rules: Rules) => {
      const result = validate(body as Record<string, any>, rules);
      
      if (!result.valid) {
          throw status(422, {
              message: "Error: Unprocessable Entity!",
              errors: result.errors,
          })
      }
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
  responseSuccess: (data: any, message?: string) => {
    throw status(201, {
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
  uploadFile: async (file: File, folder = "uploads") => {
      const dir = path.resolve(folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(dir, file.name);

      fs.writeFileSync(filePath, buffer);
      return filePath;
  },



  // ==================================>
  // ## Delete File
  // ==================================>
  deleteFile: (filePath: string) => {
      if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
      }
  },
}));