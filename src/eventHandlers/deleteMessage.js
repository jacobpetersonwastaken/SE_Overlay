const mavCounterElement = document.getElementById('mav_counter');

export const handleMessageDeleteEvent = (event, sessionData) => {
  const {msgId} = event;

  Object.entries(sessionData.deleteCounters).map(([userId, deleteCounterData]) => {
    if(deleteCounterData.messageIds[msgId]) {
      deleteCounterData.element.innerHTML = ++deleteCounterData.deletedMessages;
    }
  })
}