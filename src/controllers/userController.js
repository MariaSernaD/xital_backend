import express from "express";
import User from "./models/User.js";

//falta agregar como generar el password y que se encripte
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};


const createUser = async (req, res) => {
    try {
        const {name, email, password, role} = req.body;
        const newUser = await User.create({name, email, password, role});
        if (!newUser){
            return res.status
        }
    } catch (error) {
        
    }
};
const updateUser = async (req, res) => {};
const deleteUser = async (req, res) => {};

export { getUsers, getUserById, createUser, updateUser, deleteUser };
