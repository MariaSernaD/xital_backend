import express from 'express';
import User from './models/User';


const getUsers = async (req, res)=>{
    const user = await User.find();
};
const getUserById = async(req,res)=>{};
const createUser = async (req, res)=>{};
const updateUser = async (req, res)=>{};
const deleteUser = async (req,res)=>{};

export  {getUsers, getUserById, createUser, updateUser, deleteUser};