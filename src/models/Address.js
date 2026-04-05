import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
         ref: "User", 
         required: true
        },
    name: {
        type: String, 
        required: true, 
        trim: true
    },
    address :{
        type: String, 
        required: true,
         trim: true 
        },
    city: {
        type: String,
        required: true, 
        trim: true,
    },
    state: {
        type: String,
        required: true, 
        trim: true,
    },
    postalCode: {
        type: String, 
        required: true, 
        minlength: 4,
        maxlength: 6,
        trim: true,
    },
    country:{
        type: String, 
        required: true,
        trim: true,
    },
    phone:{
        type: String, 
        required: true, 
        maxlength: 15,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    addressType: {
        type: String,
        required: true,
        enum: ["home", "work", "other"],
        default: "home",
    },
},
{timestamps: true}
);

const Address = mongoose.model("Address", addressSchema);
export default Address;