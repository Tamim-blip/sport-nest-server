import express from "express"
import cors from "cors"
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())



const client = new MongoClient(process.env.BETTER_AUTH_CONNECTION_URI);


export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

  const connectedDB = await connectToMongoDB()
  const db = connectedDB.db('sport-nest')
  const facilities = db.collection("fecilities")
  const booking = db.collection("booking")



  const verifyApi = async(req, res, next) => {

    const authHeader = req.headers.authorization
   

    if(!authHeader){
      res.status(401).send({msg : Unauthorized})
    }

    const token = authHeader.split(" ")[1]
   

    if(!token){
      res.status(401).send({msg : Unauthorized})
    }


    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.JWK_BASE_URL}/api/auth/jwks`)
    )

    const {payload} = await jwtVerify(token, JWKS)


    next()
  }



app.get("/", (req, res) => {
    res.send("Hello world")
})


app.post("/fecilities", verifyApi, async(req, res) => {

    const allData = req.body
    const result = await facilities.insertOne(allData)
    res.send(result)
})

app.get("/featured-fecilities", async(req, res) => {

  const result = await facilities.find().limit(6).toArray()
  res.send(result)
})


app.get("/fecilities", async(req, res) => {

    const result = await facilities.find().toArray()
    res.send(result)
})

app.get("/fecilities/:id",verifyApi, async (req, res) => {
  const id = req.params.id
  const result = await facilities.findOne({_id : new ObjectId(id)})
  res.send(result)
})


app.delete("/fecilities/:id",verifyApi, async (req, res) => {
  const id = req.params.id

  const result = await facilities.deleteOne({_id : new ObjectId(id)})
  res.send(result)
} )


app.patch("/fecilities/:id",verifyApi, async (req, res) => {
  const id = req.params.id
  const updatedData = req.body

  const result = await facilities.updateOne(
    { _id: new ObjectId(id) },
    {
        $set: updatedData
    });
    res.send(result);
  
} )

app.post("/booking", verifyApi, async(req, res) => {
  const allData = req.body
  const result = await booking.insertOne(allData)
  res.send(result)
})

app.get("/bookings/:email", verifyApi, async (req, res) => {

  const email = req.params.email
  const result = await booking.find({customar_email : email}).toArray()
  res.send(result)

})

app.get("/test", (req, res) => {
    res.send({msg : "success"})
})

app.listen(PORT , () => {
    console.log("Server is running on port", PORT)
})