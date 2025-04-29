// Add this to app.js for smooth scrolling functionality
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
  });
  
const API_KEY = "your_openai_api_key"; // 🔑 Replace with your OpenAI API key

// Get Elements
const chatbot = document.getElementById("chatbot");
const chatIcon = document.getElementById("chat-icon");

// Chatbot Toggle
chatbot.addEventListener("click", () => {
    chatbot.classList.toggle("expanded");
    if (chatbot.classList.contains("expanded")) {
        chatIcon.style.display = "none";
        chatbot.innerHTML = `
            <div class="chat-header">
                Chatbot <span class="close-btn">&times;</span>
            </div>
            <div class="chat-box" id="chat-box">
                <div class="chat-message bot-message">Hello! How can I assist you today?</div>
            </div>
            <div class="chat-container">
                <input type="text" id="user-input" placeholder="Type your message...">
                <button id="send-btn">Send</button>
            </div>
        `;
        addChatFunctionality();
    } else {
        chatbot.innerHTML = `<i id="chat-icon" class="fas fa-comments"></i>`;
    }
});

function addChatFunctionality() {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const closeBtn = document.querySelector(".close-btn");
    
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
    closeBtn.addEventListener("click", () => {
        chatbot.classList.remove("expanded");
        chatbot.innerHTML = `<i id="chat-icon" class="fas fa-comments"></i>`;
    });
}

async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const userText = userInput.value.trim();
    if (!userText) return;
    
    addMessage(userText, "user-message");
    userInput.value = "";
    
    const botResponse = await fetchChatGPTResponse(userText);
    addMessage(botResponse, "bot-message");
}

async function fetchChatGPTResponse(message) {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    };

    const body = JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: message }]
    });

    try {
        const response = await fetch(apiUrl, { method: "POST", headers, body });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
    } catch (error) {
        console.error("Error:", error);
        return "Oops! Something went wrong.";
    }
}

function addMessage(text, className) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", className);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
