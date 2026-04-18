import Review from "../models/Review.js";

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user")
      .populate("product");
    if (reviews.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReviewByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reviewsByUser = await Review.findOne({ _id: id, user: userId })
      .populate("user")
      .populate("product");

    if (!reviewsByUser) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(reviewsByUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {comment, rating, productId } = req.body;
    const productReview = await Review.create({
      user: userId,
      product: productId,
      comment,
      rating,
    });
    await productReview.populate("user").populate("product");
    res.status(201).json(productReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { comment, rating } = req.body;
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment is required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    const review = await Review.findOneAndUpdate(
      { _id: id, user: userId },
      { comment, rating }, {new: true, runValidators: true}
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    await review.populate("user").populate("product");
    res
      .status(200)
      .json({ message: "Review updated successfully", data: review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const deletingReview = await Review.findOneAndDelete({
      _id: id,
      user: userId,
    });
    if (!deletingReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getReviews,
  getReviewByUser,
  createReview,
  updateReview,
  deleteReview,
};
