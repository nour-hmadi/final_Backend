import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const gallerySchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        image_url:{
            type: String,
            required: true
        },
        page:{
            type: String,
            required: true,
            
        }
    },

    {
        collection: 'about',
        timestamps: true,
    }

);

const Gallery = model('gallery', gallerySchema);
export default Gallery;