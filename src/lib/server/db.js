import { MongoClient } from "mongodb"
import { MONGODB_CONNEXION_STRING } from "$env/static/private"

const client = new MongoClient(MONGODB_CONNEXION_STRING);
await client.connect();

const database = client.db('Twitter');

const usersRef = database.collection("users");
const postsRef = database.collection("posts");
const messagesRef = database.collection("messages");
const conversationsRef = database.collection("conversations");

export { usersRef, postsRef, messagesRef, conversationsRef }