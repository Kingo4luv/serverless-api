'use strict';
const  AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid");
const db = new AWS.DynamoDB.DocumentClient({apiVersion: "2012-08-10"})

const postsTable = process.env.POSTS_TABLE;

function response(statusCode, message){
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}

function sortByDate(a,b){
  if(a.createdAt > b.createdAt){
    return -1;
  }else{
    return 1;
  }
}

// Create post
module.exports.createPost = async (event, context, callback) => {
  const reqBody = JSON.parse(event.body);
  if(!reqBody.title || reqBody.title.trim() === "" || !reqBody.body || reqBody.body.trim() === ""){
    return callback(null, response(400, {error: "Post must have a title and body and they must not be empty"}));
  }
  const post = {
    id: uuidv4(),
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

//Get all post
module.exports.getAllPost = (event, context) => {
  
  try {
    const results = await db.scan({
        TableName: postsTable
      }).promise();

      return results.Item;
  } catch (error) {
    
    return error;
  }

}

//Get number of posts
module.exports.getPosts = (event, context, callback) => {
  const numberOfPosts = event.pathParameters.number;
  const params = {
    TableName: postsTable,
    Limit: numberOfPosts
  };
  return db.scan(params).promise().then(res => {
    callback(null, response.Items.sort(sortByDate))
  }).catch(err => callback(null, response(err.statusCode, err)));
}

// Get a single post
module.exports.getPost = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    key: {
      id: id
    },
    TableName: postsTable,
  };
  return db.scan(params).promise().then(res => {
    if(res.Item) callback(null, response.Items.sort(200, res.Item))
    else callback(null, response(404, 'Post not found'))
  }).catch(err => callback(null, response(err.statusCode, err)));
}

//update a post
module.exports.updatePost = (event, context, callback) => {
  const id = event.pathParameters.id;
  const body = JSON.parse(event.body);
  const paraName = body.paraName;
  const paraValue = body.paramValue;

  const params = {
    Key:{
      id: id
    },
    TableName: postsTable,
    ConditionExpression: 'attribute_exist(id)',
    UpdateExpression: 'set ' + paraName + ' = :v',
    ExpressionAttributeValues: {
      ':v': paramValue
    },
    ReturnValue: 'ALL_NEW'
  };

  return db.update(params).promise().then(res => {
    callback(null, response(200, res))
  })
  .catch(err => callback(null, response(err.statusCode, err)));
}

// Delete a post
module.exports.deletePost = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    key: {
      id: id
    },
    TableName: postsTable,
  };
  return db.delete(params).promise().then(() => callback(null, response(200, {message: 'Post deleted successfully'})))
  .catch(err => callback(null, response(err.statusCode, err)));

}

