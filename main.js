const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('message', (event) => {
  const message = event.data;
  displayMessage(message);
});

document.getElementById('sendButton').addEventListener('click', () => {
  sendMessage();
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value;
  if (message.trim() === '') {
    return;
  }
  ws.send(message);
  displayMessage(message, true);
  messageInput.value = '';
}

function displayMessage(message, isSender = false) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  if (isSender) {
    messageContainer.classList.add('sender-message-container');
  }

  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble');
  messageBubble.textContent = message;

  const messageOptions = document.createElement('div');
  messageOptions.classList.add('message-options');

  const optionsButton = document.createElement('div');
  optionsButton.textContent = '...'; // 3-dot icon
  optionsButton.addEventListener('click', () => {
    // Show options menu (delete, copy)
    messageOptions.style.display = 'block';
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    // Remove the message
    messageContainer.remove();
  });

  messageOptions.appendChild(deleteButton);

  messageContainer.appendChild(optionsButton);
  messageContainer.appendChild(messageBubble);
  messageContainer.appendChild(messageOptions);

  messagesDiv.appendChild(messageContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
// Add this code to your existing JavaScript code
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('options-menu')) {
    // Handle the click on the 3-dots menu
    // You can implement options like delete or copy here
    // For example:
    if (confirm('Delete this message?')) {
      // Remove the message if the user confirms
      const messageContainer = event.target.closest('.message-container');
      messageContainer.remove();
    }
  }
});
// Handle the click on the 3-dots menu
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('options-menu')) {
    if (confirm('Delete this message?')) {
      // Remove the message from the client
      const messageContainer = event.target.closest('.message-container');
      messageContainer.remove();

      // Send a message deletion request to the server
      ws.send(JSON.stringify({ type: 'delete', id: messageContainer.id }));
    }
  }
});
