const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const settingSchema = new Schema({
    siteTitle: {
        type: String,
        required: true
    },
    siteSEOTitle: {
        type: String,
        required: true
    },
    siteDescription: {
        type: String,
        required: true
    },
    siteSEODescription: {
        type: String,
        required: true
    },
    recentPastesMaxNumber: {
        type: Number,
        required: true,
        default: 4
    },
    trendsMaxNumberPerPage: {
        type: Number,
        required: true,
        default: 4
    },
    searchResultsMaxNumberPerPage: {
        type: Number,
        required: true,
        default: 4
    }
});

module.exports = mongoose.model('Setting', settingSchema);