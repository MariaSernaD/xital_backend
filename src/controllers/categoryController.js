import Category from "../models/Category.js";

const getProductCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory");
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getProductCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate("parentCategory");
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, imageURL, parentCategory } = req.body;
    const newCategory = await Category.create({
      name,
      description,
      imageURL,
      parentCategory,
    });
    await newCategory.populate("parentCategory");
    res.status(201).json({ message: "New Category created", newCategory });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const updatedCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageURL, parentCategory } = req.body;
    const updateCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        description,
        imageURL,
        parentCategory: parentCategory || null,
      },
      { new: true, runValidators: true },
    ).populate("parentCategory");
    if (!updateCategory) {
      return res.status(404).send({ message: "Category not found" });
    }
    res.status(200).json(updateCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory =
      await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).send({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export {
  getProductCategories,
  getProductCategoryById,
  createCategory,
  updatedCategory,
  deleteCategory,
};
