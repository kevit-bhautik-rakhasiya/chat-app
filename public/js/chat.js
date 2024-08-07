const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#message-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTamplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTamplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (messageUrl) => {
  console.log(messageUrl);
  const html = Mustache.render(locationMessageTemplate, {
    url: messageUrl.url,
    createdAt: moment(messageUrl.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (err) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (err) {
      return console.log(err);
    }
    console.log("Message Delivers Successfully!!!");
  });
});

document.querySelector("#message-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  //disable location button
  $locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $locationButton.removeAttribute("disabled");
        console.log("Location shared!!!");
      }
    );
  });
});
