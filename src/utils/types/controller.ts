import "elysia";
import type { Context } from "elysia";

declare module "elysia" {
    interface ControllerContext extends Context {
        getQuery         :  {
            sortDirection  :  string;
            sortBy         :  string;
            paginate       :  number;
            filter         :  string;
            search         :  string;
        };
        responseData     :  (
            data       :  any[],
            totalRow  ?:  number,
            message   ?:  string,
            columns   ?:  string[]
        ) => { status: number; body: any };
        validation       :  (rules: any) => any;
        responseError    :  (...args: any[]) => any;
        responseSaved    :  (data: any, message?: string) => any;
        responseSuccess  :  (data: any, message?: string) => any;
        uploadFile       :  (file: File, folder?: string) => Promise<string>;
        deleteFile       :  (filePath: string) => void;
        user            ?:  any
    }
}