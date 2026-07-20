const db = require("../database");


const fetchUsers = async()=>{
    const users = await db.getUsers();
    return users
}











exports = {fetchUsers}