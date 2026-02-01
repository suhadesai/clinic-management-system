const express = require("express")
const app = express()
const PORT = process.env.PORT || 3233;
const cors = require("cors")
const corsOptions = {origin: ["https://clinic-management-system-s18a.onrender.com"]}
app.use(cors(corsOptions));
app.use(express.json());


const dotenv = require("dotenv")
dotenv.config();
const mongoose = require("mongoose")
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));


const basicsSchema = new mongoose.Schema({
    repName:{type: String},
    facilityAndDrug: {type: String},
    phoneNumber: {type: Number},
    faxNumber: {type: Number},
    tags: [{type: String}],
    location: {type: String}
})

const basics = new mongoose.model('basics', basicsSchema) 

const medsSchema = new mongoose.Schema({
    medName: {type: String},
    expiryDate: {type: Date, default: Date.now}
})

const meds = new mongoose.model('meds',medsSchema)

const tagsSchema = new mongoose.Schema({
    name: {type: String}
})

const tag = new mongoose.model('tag', tagsSchema)

app.get("/get-all", async (req, res) => {
    const allBasics = await basics.find({});
    res.json(allBasics);
}) 

app.get("/get-all-meds", async (req, res) => {
    const allMeds = await meds.find({});
    res.json(allMeds);
}) 

app.post("/post" , async(req, res) =>{
    const { repName, facilityAndDrug, phoneNumber, faxNumber, tags, location } = req.body;

    const newEntry = new basics({ repName, facilityAndDrug, phoneNumber, faxNumber, tags, location });
    await newEntry.save();

    res.send("username recieved");
})

app.post("/post-med" , async(req, res) =>{
    const { medName, expiryDate } = req.body;

    const newEntry = new meds({ medName, expiryDate });
    await newEntry.save();

    res.send("med recieved and saved");
})

app.delete("/delete-med/:id", async(req, res) =>{
    await meds.findByIdAndDelete(req.params.id);
})

app.delete("/delete/:id", async(req, res) =>{
    await basics.findByIdAndDelete(req.params.id);
})

app.put("/update", async(req, res) =>{
    try {
        const { _id, repName, facilityAndDrug, faxNumber, phoneNumber, location, tags } = req.body;
        
        const updatedData = await basics.findByIdAndUpdate(
            _id,
            {
                repName,
                facilityAndDrug,
                faxNumber,
                phoneNumber,
                location,
                tags
            },
            { new: true } 
        );
        
        if (!updatedData) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        res.json({ message: "Updated successfully", data: updatedData });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update" });
    }
})

app.get("/get-all-tags", async (req, res) => {
    try {
      const tags = await tag.find().sort({ count: -1, name: 1 });
      res.json(tags.map(i => i.name));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });
  
  app.post("/create-tag", async (req, res) => {
    try {
      const { tagName } = req.body;
      
      const existingTag = await tag.findOne({ name: tagName });
      if (existingTag) {
        return res.status(400).json({ error: "Tag already exists" });
      }
      
      const newTag = new tag({ name: tagName });
      await newTag.save();
      
      res.json({ message: "Tag created successfully", tag: newTag });
    } catch (error) {
      res.status(500).json({ error: "Failed to create tag" });
    }
  });

app.listen(PORT, () => {console.log(`server started, port ${PORT}`)})
