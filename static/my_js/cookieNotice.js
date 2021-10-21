const cookieContainer = document.querySelector(".cookie-container");
const cookieButtonOk = document.querySelector(".cookie-btn-ok");
const cookieButtonNo = document.querySelector(".cookie-btn-no");
const cookieAnchor = document.querySelector(".cookie-anchor");

cookieButtonOk.addEventListener("click", () => {
  const wasApproved = window.isCookieApproved();
  cookieContainer.classList.remove("active");
  cookieAnchor.classList.remove("inactive");
  localStorage.setItem("cookieBannerApproved", "true");
  localStorage.removeItem("cookieBannerRejected")
  window.enableCookies();
  if (!wasApproved) {
    window.location.reload();
  }
});

cookieButtonNo.addEventListener("click", () => {
  const wasApproved = window.isCookieApproved();
  cookieContainer.classList.remove("active");
  cookieAnchor.classList.remove("inactive");
  localStorage.setItem("cookieBannerRejected", "true");
  localStorage.removeItem("cookieBannerApproved")
  window.disableCookies();
  if (wasApproved) {
    window.location.reload();
  }
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
