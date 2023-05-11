import TeacherCard from "../models/TeacherCardModel.js";
import fs from "fs";
import asyncHandler from "express-async-handler";
import path from "path";

// GET /cards - retrieve all cards
const getCards = async (req, res) => {
  try {
    const cards = (await TeacherCard.find()).map((item) => {
      let image;
      if (item.image_url) {
        const file = fs.readFileSync(item.image_url);
        image = Buffer.from(file).toString("base64");
      }
      return {
        name: item.name,
        email: item.email,
        profession: item.profession,
        subject: item.subject,
        description_title: item.description_title,
        description_parag: item.description_parag,
        platform_link: item.platform_link,
        id: item.id,
        image,
      };
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /cards/:id - retrieve a specific card by ID
const getCardById = async (req, res) => {
  try {
    const card = await TeacherCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /cards - create a new card
const createCard = asyncHandler(async (req, res) => {
  const card = new TeacherCard({
    name: req.body.name,
    email: req.body.email,
    profession: req.body.profession,
    subject: req.body.subject,
    description_title: req.body.description_title,
    description_parag: req.body.description_parag,
    platform_link: req.body.platform_link,
    id: req.body.id,
    image_url: req.file?.path,
  });

  try {
    const newCard = await card.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /cards/:id - update a specific card by ID
const updateCard = async (req, res) => {
  try {
    const card = await TeacherCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    const imageFile = req.file?.path;

    const { name, email, profession, subject, description_title, description_parag, platform_link } = req.body;

    card.name = name;
    card.email = email;
    card.profession = profession;
    card.subject = subject;
    card.description_title = description_title;
    card.description_parag = description_parag;

    card.platform_link = platform_link;
    if (imageFile) card.image_url = imageFile;

    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /cards/:id - delete a specific card by ID
const deleteCard = async (req, res) => {
  try {
    const card = await TeacherCard.findByIdAndDelete(req.params.id);
    res.json({ message: `Card ${card.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCards, getCardById, createCard, updateCard, deleteCard };
