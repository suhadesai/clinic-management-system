const express = require("express")
const app = express()
const PORT = process.env.PORT || 3233;
const cors = require("cors")
const corsOptions = {origin: [process.env.FRONTEND_URL, "http://localhost:5173", "https://clinic-management-system-jfl3.onrender.com"], credentials: true,}
app.use(cors(corsOptions));
app.use(express.json());
const PDFDocument = require("pdfkit")
const logoPath = "../clinic-frontend/src/assets/footer-logo_1.png"

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
    phoneNumber: {type: String},
    faxNumber: {type: String},
    tags: [{type: String}],
    location: {type: String},
    pdfLinks: [{type: String}]
})

const basics = new mongoose.model('basics', basicsSchema) 

const medsSchema = new mongoose.Schema({
    medName: {type: String},
    expiryDate: {type: Date},
    dosage: {type: String},
    lotNumber: {type: String},
    medTags: [{type: String}],
    repInformation: {type: String},
})

const meds = new mongoose.model('meds',medsSchema)

const tagsSchema = new mongoose.Schema({
    name: {type: String}
})

const tag = new mongoose.model('tag', tagsSchema)

const medTagsSchema = new mongoose.Schema({
    name: {type: String}
})

const medTag = new mongoose.model('medTag', medTagsSchema)

app.get("/get-all", async (req, res) => {
    const allBasics = await basics.find({});
    res.json(allBasics);
}) 

app.get("/get-all-meds", async (req, res) => {
    const allMeds = await meds.find({});
    res.json(allMeds);
}) 

app.post("/post" , async(req, res) =>{
    const { repName, facilityAndDrug, phoneNumber, faxNumber, tags, location, pdfLinks } = req.body;

    const newEntry = new basics({ repName, facilityAndDrug, phoneNumber, faxNumber, tags, location, pdfLinks });
    await newEntry.save();

    res.send("username recieved");
})

app.post("/post-med" , async(req, res) =>{
    const { medName, expiryDate, dosage, lotNumber, medTags } = req.body;

    const newEntry = new meds({ medName: medName, expiryDate: expiryDate, dosage: dosage, lotNumber: lotNumber, medTags: medTags });
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
        const { _id, repName, facilityAndDrug, faxNumber, phoneNumber, location, tags, pdfLinks } = req.body;
        
        const updatedData = await basics.findByIdAndUpdate(
            _id,
            {
                repName,
                facilityAndDrug,
                faxNumber,
                phoneNumber,
                location,
                tags,
                pdfLinks
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

app.put("/update-med", async(req, res) =>{
  try {
      const { _id, medName, expiryDate, dosage, lotNumber, medTags, repInformation } = req.body;
      
      const updatedData = await meds.findByIdAndUpdate(
          _id,
          {
            medName, 
            expiryDate,
            dosage,
            lotNumber,
            medTags,
            repInformation
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

  app.get("/get-all-med-tags", async (req, res) => {
    try {
      const tags = await medTag.find().sort({ count: -1, name: 1 });
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

  app.post("/create-med-tag", async (req, res) => {
    try {
      const { tagName } = req.body;
      
      const existingTag = await medTag.findOne({ name: tagName });
      if (existingTag) {
        return res.status(400).json({ error: "Tag already exists" });
      }
      
      const newTag = new medTag({ name: tagName });
      await newTag.save();
      
      res.json({ message: "Tag created successfully", tag: newTag });
    } catch (error) {
      res.status(500).json({ error: "Failed to create tag" });
    }
  });

//   const generateBasicsPDF = (doc, basicsData, title = "Basics Report") => {
//     doc.fontSize(20).text(title, { align: "center" });
//     doc.moveDown();
  
//       doc
//         .fontSize(14)
//         .text(`Entry`, { underline: true });
  
//       doc.fontSize(11)
//         .text(`Rep Name: ${basicsData.repName || "N/A"}`)
//         .text(`Facility & Drug: ${basicsData.facilityAndDrug || "N/A"}`)
//         .text(`Phone: ${basicsData.phoneNumber || "N/A"}`)
//         .text(`Fax: ${basicsData.faxNumber || "N/A"}`)
//         .text(`Location: ${basicsData.location || "N/A"}`)
//         .text(`Tags: ${basicsData.tags?.join(", ") || "None"}`)
//         .text(`Links: ${basicsData.pdfLinks?.join(", ") || "None"}`);
  
//       doc.moveDown();
//       doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
//       doc.moveDown();
    
// };

const generateBasicsPDF = (doc, basicsData, title = "Basics Report") => {
  // Colors from your palette
  const colors = {
    lightest: "#C5C3E8",
    light: "#CDBBE4",
    medium: "#886AA4",
    dark: "#26408B",
    darker: "#0F084B",
    darkest: "#0D0221",
  };

  // ---------------------------
  // HEADER BAR
  // ---------------------------
  doc
    .rect(0, 0, doc.page.width, 70)
    .fill(colors.darkest);

  doc
    .fillColor(colors.lightest)
    .fontSize(24)
    .font("Helvetica-Bold")
    .text(title, 50, 25);

    try { const logoSize = 40; // adjust size 
    doc.image(logoPath, doc.page.width - 50 - logoSize, 15, { 
      width: logoSize, height: logoSize, 
    }); } catch (err) { 
      console.error("Logo failed to load:", err); 
    }

  doc.moveDown(2);

  // ---------------------------
  // SECTION TITLE
  // ---------------------------
  doc
    .fillColor(colors.darkest)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Entry Details", { align: "left" });

  // Accent underline
  doc
    .moveTo(50, doc.y + 2)
    .lineTo(200, doc.y + 2)
    .strokeColor(colors.medium)
    .lineWidth(2)
    .stroke();

  doc.moveDown(1.5);

  // ---------------------------
  // CARD BACKGROUND
  // ---------------------------
  const cardTop = doc.y;
  const cardPadding = 12;

  doc
    .rect(40, cardTop, doc.page.width - 80, 200)
    .fillOpacity(0.15)
    .fill(colors.dark)
    .fillOpacity(1);

  doc.y = cardTop + cardPadding;

  // ---------------------------
  // CARD CONTENT
  // ---------------------------
  doc
    .fillColor(colors.light)
    .fontSize(12)
    .font("Helvetica");
  

  const addField = (label, value) => {
    doc
      .font("Helvetica-Bold")
      .fillColor(colors.dark)
      .text(`${label}:`, { continued: true })
      .font("Helvetica")
      .fillColor(colors.medium)
      .text(` ${value || "N/A"}`);

  };

  addField("Rep Name", basicsData.repName);
  doc.moveDown(0.6);
  addField("Facility & Drug", basicsData.facilityAndDrug);
  doc.moveDown(0.6);
  addField("Phone", basicsData.phoneNumber);
  doc.moveDown(0.6);
  addField("Fax", basicsData.faxNumber);
  doc.moveDown(0.6);
  addField("Location", basicsData.location);
  doc.moveDown(0.6);
  addField("Tags", basicsData.tags?.join(", ") || "None");
  doc.moveDown(0.6);
  addField("Links", basicsData.pdfLinks?.join(", ") || "None");
  doc.moveDown(0.6);

};


  app.get("/create-pdf-by-id/:_id", async (req, res) => {
    try {
      const results = await basics.findById(req.params._id);
  
      if (!results) {
        return res.status(404).json({ error: "Entry not found" });
      }
  
      const doc = new PDFDocument({ margin: 50 });
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=basics-filtered.pdf"
      );
  
      doc.pipe(res);
  
      generateBasicsPDF(
        doc,
        results,
        results.repName ? `Basics for ${results.repName}` : "Basics Records"
      );
  
      doc.end();
    } catch (error) {
      console.error("PDF error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });
  
  app.get("/create-pdf/basics", async (req, res) => {
    try {
      const { repName } = req.query;
  
      const query = repName ? { repName } : {};
      const results = await basics.find(query);
  
      if (results.length === 0) {
        return res.status(404).json({ error: "No matching records found" });
      }
  
      const doc = new PDFDocument({ margin: 50 });
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=basics-filtered.pdf"
      );
  
      doc.pipe(res);
  
      generateBasicsPDF(
        doc,
        results,
        repName ? `Basics for ${repName}` : "Basics Records"
      );
  
      doc.end();
    } catch (error) {
      console.error("PDF error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

app.listen(PORT, () => {console.log(`server started, port ${PORT}`)})
