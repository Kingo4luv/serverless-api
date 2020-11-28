'use strict';
import  AWS from 'aws-sdk';
import uuid from "uuid/v4";
const db = new AWS.DynamoDB.DocumentClinet({apiVersion: "2012-08-10"})

const postsTable = process.env.POSTS_TABLE;

function response(statusCode, message){
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}
module.exports.createPost = async (event, context, callback) => {
  const reqBody = JSON.parse(event.body);
  const post = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    userId: 1,
    title: reqBody.title,
    body: reqBody.body
  }

  return db.put({
    TableName: postsTable,
    Item: post
  }).promise().then(() => {
    callback(null, response(201, post));
  }).catch(err => response(null, response(err.statusCode, err)));
};
