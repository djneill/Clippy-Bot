import { useState } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

// const API_KEY = import.meta.env.API_KEY
const API_TOKEN = import.meta.env.VITE_API_TOKEN
const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello",
      sender: "Hugging Face",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing",
    }

    const newMessages = [...messages, newMessage]; //all the old messages plus the new one

    //update our messages state
    setMessages(newMessages);

    // set typing indicatior
    setIsTyping(true);
    // process message to chaGPT (send it over and see the response)
    await processMessageToHuggingFace(newMessages)
  };

  async function processMessageToHuggingFace(chatMessages) {
    // chatMessages { sender: 'user' or 'hugginface', message: 'message content' }
    // apiMessages { role: 'user' or 'assistant', content: 'message content' }

    let apiMessages = chatMessages.map((messageObject) => {
      let role = ''
      if (messageObject.sender === 'HugginFace') {
        role = 'assistant'
      } else {
        role = 'user'
      }
      return { role: role, content: messageObject.message }
    })

    // role: 'user -> a message from the user, 'assistant' -> a message from the assistant
    // system -> generally one initial message defining how we want Hugging Face to behave

    const systemMessage = {
      role: 'system',
      content: 'Speak like you are Microsoft Clippy'
    }


    let apiRequestBody = {
      'model': 'google/flan-t5-large',
      'messages': [
        systemMessage,
        ...apiMessages
      ]
    }

    async function query(data) {

      console.log("Request URL:", `${API_URL}`);
      const response = await fetch(
        `${API_URL}`,
        {
          headers: { Authorization: "Bearer " + API_TOKEN },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      return result;
    }

    query({ apiRequestBody }).then((data) => {
      console.log(JSON.stringify(data));
    }).then((data) => {
      return data.json()
    }).then((data) => {
      console.log(data)
      console.log(data.choices[0].message.content)
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "HuggingFace",
        }]
      )
      setIsTyping(false)
    })
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "700px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicatior={isTyping ? <TypingIndicator content="HuggingFace is typing..." /> : null}>
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
