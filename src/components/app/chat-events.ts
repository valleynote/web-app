export function openChatHistory() {
  window.dispatchEvent(new CustomEvent("valleynote:chats"));
}
