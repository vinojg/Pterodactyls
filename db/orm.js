require('dotenv').config();
require('./sql.js');
const mongo = require('./mongo.js');
const Sequelize = require('sequelize');


let db = new Sequelize('kuyikSQL',
  process.env.SQL_USERNAME,
  process.env.SQL_PASSWORD,
  {
    host: process.env.SQL_HOST,
    dialect: 'mysql'
  }
);

// check if the connection is working
db.authenticate()
  .then(() => {
    console.log('Sequelize is connected to the kuyikSQL database');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// define our tables (foreign keys come later)
const Users = db.define('Users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  about_me: Sequelize.TEXT, // eslint-disable-line camelcase
  pic: Sequelize.STRING
});

const Sessions = db.define('Sessions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hash: Sequelize.STRING
});

const Locations = db.define('Locations', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  location: Sequelize.STRING
});

const Posts = db.define('Posts', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  subtitle: Sequelize.STRING,
  pics: Sequelize.STRING,
  id_mongo_text: Sequelize.STRING // eslint-disable-line camelcase
});


// create foreign keys in our tables via sequelize "associations"
Posts.belongsTo(Users, {
  foreignKey: 'id_users'
});

Sessions.belongsTo(Users, {
  foreignKey: 'id_users'
});

Posts.belongsTo(Locations, {
  foreignKey: 'id_locations'
});


//Gets post to load on home page
searchFrontPosts = () => {
  return Posts.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ // this performs joins
      model: Users
    }, {
      model: Locations
    }]
  })
    .then(posts => {
      return posts.map(post => {
        let cleanPost = {
          id: post.id,
          title: post.title,
          subtitle: post.subtitle,
          author: post.User.username,
          location: post.Location.location,
          pics: post.pics,
          id_mongo_text: post.id_mongo_text, // eslint-disable-line camelcase
          createdAt: post.createdAt
        };
        return cleanPost;
      });
    });
  // TO DO:
  // Add limit and filter once decided, such as
  // top 20 most recent posts or top 10 liked posts
};

// Gets post to load through search field
searchAllPosts = (query) => {
  return Posts.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ // this performs joins
      model: Users
    }, {
      model: Locations
    }],
  })
    .then(posts => {
      return posts.map(post => {
        let cleanPost = {
          id: post.id,
          title: post.title,
          subtitle: post.subtitle,
          author: post.User.username,
          location: post.Location.location,
          pics: post.pics,
          id_mongo_text: post.id_mongo_text, // eslint-disable-line camelcase
          createdAt: post.createdAt
        };
        return cleanPost;
      });
    });
};

// Get the main post text from mongo for
//  each of the posts retrieved from sql
getMongoTextsForSqlResults = sqlResults => {
  let ids = sqlResults.map(post => post['id_mongo_text']);
  let mongoTexts = ids.map(_id => {
    return mongo.Post.findOne({_id: _id});
  });
  return Promise.all(mongoTexts);
};

// Combine the mongo and sql results so that
//  we can send one object to the client
addMongoTextsToSqlResults = (sqlPosts, mongoTexts) => {
  for (let i = 0; i < sqlPosts.length; i++) {
    let id = sqlPosts[i]['id_mongo_text'];
    sqlPosts[i].text = mongoTexts[id];
  }
  return sqlPosts;
};

module.exports.db = db;
module.exports.Posts = Posts;
module.exports.Locations = Locations;
module.exports.Users = Users;
module.exports.Sessions = Sessions;
module.exports.searchAllPosts = searchAllPosts;
module.exports.searchFrontPosts = searchFrontPosts;
module.exports.getMongoTextsForSqlResults = getMongoTextsForSqlResults;
module.exports.addMongoTextsToSqlResults = addMongoTextsToSqlResults;
