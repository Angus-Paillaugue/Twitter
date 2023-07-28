import { MongoClient } from "mongodb"
import { MONGODB_CONNEXION_STRING } from "$env/static/private"

const client = new MongoClient(MONGODB_CONNEXION_STRING);
await client.connect();

const database = client.db('onlyfans');

const usersRef = database.collection("users");
const postsRef = database.collection("posts");

export { usersRef, postsRef }