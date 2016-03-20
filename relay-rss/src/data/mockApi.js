import _ from 'lodash';

const types = generateTypes(5);
const newsData = generateNews(40);
const viewer = new Viewer();

/**
* @constructor
*/
function Viewer() {
}


/**
* @constructor
* @param {string} name
*/
function NewsType(id, name) {
  this.name = name;
  this.id = id;
}

/**
* @constructor
* @param {number} id
* @param {NewsType} type
* @param {string} title
* @param {string} content
*/
function NewsItem(id, type, title, content) {
  this.id = id;
  this.type = type;
  this.title = title;
  this.content = content;
  this.readCount = 0;
}

function generateNews(newsCount) {
  let i, result = [];
  for (i = 0; i !== newsCount; i++) {
    const typeIdx = Math.floor(Math.random() * types.length);
    result.push(new NewsItem(String(i), types[typeIdx], 'title' + i, 'content' + i));
  }
  return result;
}

function generateTypes(typesCount) {
  let i, result = [];
  for (i = 0; i !== typesCount; i++) {
    result.push(new NewsType(String(i), 'type' + i));
  }
  return result;
}

function getAllTypes() {
  return types;
}

function getAllNews() {
  return newsData;
}

function getNewsByTypeNames(typeNames) {
  let result;
  if (typeNames.length > 0) {
    result = _.filter(newsData, (item) => _.some(typeNames, (name) => item.type.name === name));
  } else {
    result = newsData;
  }
  return result;
}

function getNewsItemById(id) {
  return _.filter(newsData, (item) => item.id === id)[0];
}

function readNewsItem(id) {
  const newsItem = getNewsItemById(id);
  newsItem.readCount++;
  return newsItem;
}

function getTypeById(id) {
  return _.filter(types, (type) => type.id === id)[0];
}

function getViewer() {
  return viewer;
}

const Api = {
  getAllTypes, getAllNews, getNewsByTypeNames, getNewsItemById,
  getTypeById, getViewer, NewsType, NewsItem, Viewer, readNewsItem
};

export default Api;
