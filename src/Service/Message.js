import Parse from 'parse';

// Messages contain a name, email, and message, and are the only independant class
export const fetchAllMessages = () => {
  const query = new Parse.Query('Message');
  query.ascending('createdAt');
  return query.find().then(results => results.map(msg => ({
    id: msg.id,
    name: msg.get('name'),
    email: msg.get('email'),
    message: msg.get('message'),
  })));
}