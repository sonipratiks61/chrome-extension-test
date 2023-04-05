window.addEventListener("load", () => {
  chrome.storage.local.get(["key"], function (result) {
    console.log(result,'result')
  })
})

