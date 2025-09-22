import User from "../../models/User";
import bcrypt from "bcrypt";

export default async function UserSeeder() {
    // =========================>
    // ## Seed the application's database
    // =========================>
    const password: string  = await bcrypt.hash("password", 10)
    
    await User.query().create({
        name: "Admin",
        email: "admin@example.com",
        password: password
    });

    console.log("👤 UserSeeder executed");
}
