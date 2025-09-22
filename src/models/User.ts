import { Model } from '@/utils/model.utils'

export default class User extends Model {
    // =====================>
    // ## Fillable
    // =====================>
    fillable    =  [
        "name",
        "email",
        "password"
    ]

    // ====================>
    // ## Selectable
    // ====================>
    selectable  =  [
        "id",
        "name",
        "email",
        "created_at"
    ]

    // ====================>
    // ## Searchable
    // ====================>
    searchable  =  [
        "name",
        "email"
    ]
}