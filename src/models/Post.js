import Parse from 'parse';

// Posts contain a title and body, as well as an objectID that the Comments class points to
export const fetchAllPosts = () => {
  const query = new Parse.Query('Post');
  query.ascending('createdAt');
  return query.find().then(results => results);
};