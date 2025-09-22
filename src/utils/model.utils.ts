import { status } from "elysia"
import { Model as SutandoModel, ModelNotFoundError } from "sutando"

export class Model extends SutandoModel {
  // ===============================>
  // ## Dumping field to fillable
  // ===============================>
  dumpField(
    request  :  Record<string, any>       //? request body
  ) {
    const fillable = (this as any).fillable || []
    const filtered: Record<string, any>  =  {}

    for (const key of fillable) {
      if (request[key] !== undefined) {
        filtered[key]  =  request[key]
      }
    }

    this.fill(filtered)
    return this
  }



  // =================================>
  // ## Selectable column query
  // =================================>
  static selectableColumns(
    selectable: string[]  =  []          //? when includes custom selectable
  ) {
    return (query: any) => {
      const defaultSelectable  =  (this as any).selectable || ["*"]
      query.select([...defaultSelectable, ...selectable])
      return query
    }
  }



  // ===============================>
  // ## Search query
  // ===============================>
  static search(
    keyword      :  string,             //? keyword of search
    searchables  :  string[] = []       //? when includes custom searchable
  ) {
    return (query: any) => {
      const defaultSearchables  =  (this as any).searchable || []
      const mergedSearchables   =  [...defaultSearchables, ...searchables]

      if (!keyword) return query

      query.where((q: any) => {
        mergedSearchables.forEach((column) => {
          if (column.includes(".")) {
            const [relation, col]  =  column.split(".")
            q.orWhereHas(relation, (rel: any) =>
              rel.where(col, "ILIKE", `%${keyword}%`)
            )
          } else {
            q.orWhere(column, "ILIKE", `%${keyword}%`)
          }
        })
      })

      return query
    }
  }



  // ==============================>
  // ## Filter query
  // ==============================>
  static filter(
    filters  ?:  Record<string, string>     //? rules of filter
  ) {
    return (query: any) => {
      if (!filters) return query

      for (const [field, filter] of Object.entries(filters)) {
        const [type, value]  =  filter.split(":")
        if (!type || value === undefined) continue

        if (field.includes(".")) {
          const [relation, col]  =  field.split(".")
          switch (type) {
            case "eq"  :  
              query.whereHas(relation, (q: any) => q.where(col, value))
              break
            case "ne"  :  
              query.whereHas(relation, (q: any) => q.where(col, "!=", value))
              break
            case "in"  :  
              query.whereHas(relation, (q: any) => q.whereIn(col, value.split(",")))
              break
            case "ni"  :  
              query.whereHas(relation, (q: any) => q.whereNotIn(col, value.split(",")))
              break
            case "bw": {
              const [min, max]  =  value.split(",")
              query.whereHas(relation, (q: any) => q.whereBetween(col, [min, max]))
              break
            }
          }
        } else {
          switch (type) {
            case "eq"  :  
              query.where(field, value)
              break
            case "ne"  :  
              query.where(field, "!=", value)
              break
            case "in"  :  
              query.whereIn(field, value.split(","))
              break
            case "ni"  :  
              query.whereNotIn(field, value.split(",")) 
              break
            case "bw": {
              const [min, max]  =  value.split(",")
              query.whereBetween(field, [min, max])
              break
            }
          }
        }
      }

      return query
    }
  }



  // ============================>
  // ## Exception find or fail
  // ============================>
  static findOrNotFound(
    id  :  number | string                  //? id of record
  ) {
    return async (query: any) => {
      try {
        return await query.findOrFail(id)
      } catch (error: any) {
        if (error instanceof ModelNotFoundError) {
          throw status(404, {
              message  :  "Error: Record not found!",
          })
        }
        throw error;
      }
    };
  }
}
