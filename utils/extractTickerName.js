const fs = require('fs');
const path = require('path');

function extractTickerNameFromFile(filename) {
    // Remove the file extension if present
    const baseName = filename.split('.')[0];

    // Split the base name by underscore and take the second part
    const parts = baseName.split('_');

    // Check if there are at least two parts
    if (parts.length < 2) {
        return null;
    }

    // Extract the ticker part, which is after the first underscore
    const tickerPart = parts[1].trim();

    // Remove anything after a comma, space, or parentheses
    const ticker = tickerPart.split(/[, \(]/)[0].trim();

    return ticker;
}

function findFilesByTicker(ticker, directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const matchingFiles = files.filter(filename => {
        const extractedTicker = extractTickerNameFromFile(filename);
        return extractedTicker === ticker;
    });

    return matchingFiles;
}

function getMostRecentFile(files, directoryPath) {
    if (files.length === 0) {
        return null;
    }

    let mostRecentFile = files[0];
    let mostRecentTime = fs.statSync(path.join(directoryPath, mostRecentFile)).mtime;

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStats = fs.statSync(filePath);
        if (fileStats.mtime > mostRecentTime) {
            mostRecentFile = file;
            mostRecentTime = fileStats.mtime;
        }
    }

    return mostRecentFile;
}


module.exports = {
    extractTickerNameFromFile,
    getMostRecentFile,
    findFilesByTicker
}