import { useEffect, useState } from 'react';
import { fetchAllMessages } from '../models/Message';

function Contact() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchAllMessages().then(setMessages);
  }, []);

  return (
    <div>
      <h1>Contact Messages</h1>
      {messages.length === 0 && <p>No messages found.</p>}
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.name}</strong> — <em>{msg.email}</em>
          <p>{msg.message}</p>
        </div>
      ))}
    </div>
  );
}

export default Contact;