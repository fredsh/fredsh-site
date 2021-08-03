const cookieContainer = document.querySelector(".cookie-container");
const cookieButtonOk = document.querySelector(".cookie-btn-ok");
const cookieButtonNo = document.querySelector(".cookie-btn-no");
const cookieAnchor = document.querySelector(".cookie-anchor");

cookieButtonOk.addEventListener("click", () => {
  cookieContainer.classList.remove("active");
  cookieAnchor.classList.remove("inactive");
  localStorage.setItem("cookieBannerApproved", "true");
  localStorage.removeItem("cookieBannerRejected")
});

cookieButtonNo.addEventListener("click", () => {
  cookieContainer.classList.remove("active");
  cookieAnchor.classList.remove("inactive");
  localStorage.setItem("cookieBannerRejected", "true");
  localStorage.removeItem("cookieBannerApproved")
});

cookieAnchor.addEventListener("click", () => {
  cookieContainer.classList.add("active");
  cookieAnchor.classList.add("inactive");
});

setTimeout(() => {
  if (!localStorage.getItem("cookieBannerApproved")
    && !localStorage.getItem("cookieBannerRejected")) {
    cookieContainer.classList.add("active");
  }
}, 800);