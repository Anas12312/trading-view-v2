const AWS = require('aws-sdk');

// // Configure the AWS SDK with your region
AWS.config.update({ region: 'us-east-2' });
const docClient = new AWS.DynamoDB.DocumentClient();
// Function to get the table name based on the current date
function getTableName() {
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `tvtable_${currentDate}`;
}
async function update(params) {
    
}
async function getAllTickers(status) {
    const params = {
        TableName: getTableName(),
        FilterExpression: '#status IN (:statusValue0, :statusValue1)',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':statusValue0': 0,
            ':statusValue1': 1
        }
    }
    try {
        const data = await docClient.scan(params).promise();
        const tickers = data.Items;
        return tickers;
    } catch (error) {
        console.error('Error scanning table:', error);
        throw error;
    }

}
// Function to update an item in the DynamoDB table
async function updateItem(ticker, newStatus) {
    const tableName = getTableName();

    // Initialize DynamoDB DocumentClient


    const params = {
        TableName: tableName,
        Key: {
            ticker: ticker
        },
        UpdateExpression: 'set #s = :new_status',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':new_status': newStatus
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        const response = await docClient.update(params).promise();
        console.log(`Item with ticker ${ticker} updated successfully!`);
        console.log(response);
    } catch (error) {
        console.error(`Error updating item with ticker ${ticker}:`, error);
    }
}

// Example of updating an item
// updateItem('AAPL', 2);


// Parsing the CSV file 

// npm install csv - parser


const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

function getLastDateWithFilterWithSpecificValue(data, filterColumn, filterValue, dateColumn) {
    const filteredData = data.filter(row => row[filterColumn] == filterValue);
    if (filteredData.length > 0) {
        return filteredData[filteredData.length - 1][dateColumn];
    } else {
        return null;
    }
}
function getLastDateWithFilterWithAnyValue(data, filterColumn, dateColumn) {
    const filteredData = data.filter(row => row[filterColumn] != 'NaN');
    if (filteredData.length > 0) {
        return filteredData[filteredData.length - 1][dateColumn];
    } else {
        return null;
    }
}
const { extractTickerNameFromFile } = require('./utils/extractTickerName')
async function processCSV(filePath, ticker) {
    try {
        const data = await readCSV(filePath);
        const ticker = extractTickerNameFromFile(path.basename(filePath, path.extname(filePath)));
        // console.log(data[0], ticker)
        const bullishLastDate = getLastDateWithFilterWithSpecificValue(data, 'Bullish', '1', 'time');
        const bearishLastDate = getLastDateWithFilterWithSpecificValue(data, 'Bearish', '1', 'time');
        const bullishPlusLastDate = getLastDateWithFilterWithSpecificValue(data, 'Bullish+', '1', 'time');
        const bearishPlusLastDate = getLastDateWithFilterWithSpecificValue(data, 'Bearish+', '1', 'time');
        const bullishExitLastDate = getLastDateWithFilterWithAnyValue(data, 'Bullish Exit', 'time');
        const bearishExitLastDate = getLastDateWithFilterWithAnyValue(data, 'Bearish Exit', 'time');
        console.log(
            bullishLastDate
        )
        if(
            bullishLastDate !== ticker.bullish_bartime ||
            bearishLastDate !== ticker.bearish_bartime ||
            bullishPlusLastDate !== ticker.bullish_plus_bartime ||
            bearishPlusLastDate !== ticker.bearish_plus_bartime ||
            bullishExitLastDate !== ticker.bullish_exit_bartime ||
            bearishExitLastDate !== ticker.bearish_exit_bartime 
        ) {
            // await storeResultsInDynamoDB(ticker, bullishLastDate, bearishLastDate, bullishPlusLastDate, bearishPlusLastDate, bullishExitLastDate, bearishExitLastDate);
        }

    } catch (error) {
        console.error('Error processing CSV:', error);
    }
}

async function storeResultsInDynamoDB(ticker, bullishLastDate, bearishLastDate, bullishPlusLastDate, bearishPlusLastDate, bullishExitLastDate, bearishExitLastDate) {
    const tableName = getTableName();
    const params = {
        TableName: tableName,
        Key: { ticker: ticker },
        UpdateExpression: `
            SET bullish_bartime = :bullishLastDate,
                bearish_bartime = :bearishLastDate,
                bullish_plus_bartime = :bullishPlusLastDate,
                bearish_plus_bartime = :bearishPlusLastDate,
                bullish_exit_bartime = :bullishExitLastDate,
                bearish_exit_bartime = :bearishExitLastDate`,
        ExpressionAttributeValues: {
            ':bullishLastDate': bullishLastDate,
            ':bearishLastDate': bearishLastDate,
            ':bullishPlusLastDate': bullishPlusLastDate,
            ':bearishPlusLastDate': bearishPlusLastDate,
            ':bullishExitLastDate': bullishExitLastDate,
            ':bearishExitLastDate': bearishExitLastDate
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        // const docClient = new AWS.DynamoDB.DocumentClient();
        const result = await docClient.update(params).promise();
        console.log(`Data for ${ticker} stored/updated successfully in DynamoDB.`, result);
    } catch (error) {
        console.error('Error storing/updating data in DynamoDB:', error);
    }
}
module.exports = {
    processCSV,
    getAllTickers,
    updateItem
}
// Replace 'your-file.csv' with the path to your actual CSV file
// processCSV('your-file.csv');

