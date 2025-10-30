import mongoose from "mongoose";

// Category Schema 
const categorySchema = new mongoose.Schema({ 
    name: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    }, 
    description: String, 
    parentCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Categoria', 
        default: null 
    }, 
    isActive: { 
        type: Boolean, 
        default: true 
    } 
});

export const Categoria = mongoose.model("Categoria", categorySchema)