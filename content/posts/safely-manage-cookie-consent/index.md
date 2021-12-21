---
title: "How to safely manage cookie consent?"
date: 2021-12-08T20:22:46+01:00
draft: false
hero: cookie.jpg
menu:
  sidebar:
    name: How to cookie consent?
    identifier: safely-manage-cookie-consent
    weight: 20
---

{{< photoCredit
  via="Unsplash" viaHref="https://unsplash.com/s/photos/cookie?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
  by="Vyshnavi Bisani" byHref="https://unsplash.com/@vyshnavibisani?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}
  

## Disclaimer
I am no legal expert, so what follows is the result of my researches and my understanding of privacy regulations. I highly recommend you to verify if my approach works for you or not.

This post is not about explaining what is GDPR or all its implications. Here, I will describe what I implemented on my [Hugo](https://gohugo.io/) site as a solution to comply with regulations.


## GDPR and cookies 

GDPR mandates that your website must acquire cookie consent from your visitor before actually setting any cookie. While this seems pretty straightforward, you may encounter complications along the way. For cookies that you set personally, you can easily track in your javascript or your server if the visitor has given his consent or not. However, it gets more complicated as you start integrated features from third-party services...

Those services may set cookies without you having any real control over it, even without you noticing if you are not extra careful. This is the case with popular services like google analytics, but could also happen with something as insignificant as a like or share button from a social media.

So let´s get started by listing what cookies you may have on your website. 
  - ~~set by the website itself~~ &#8594; at the time of writing, I don't set any cookie manually on my site
  - [Google analytics](https://analytics.google.com/analytics/)
  - [GraphComment](https://graphcomment.com/en/) (the comment service I am using, similar to [Disqus](https://blog.disqus.com/))
  - ~~Social media like/share buttons~~ &#8594; at the time of writing, I have no such feature


As you can see, the list is quite short in my case. I could have traced all cookies set by those services and prevent them from being set, but this approach would be cumbersome and also likely to break if a service were to change its cookies. What I want is a generic solution that I can leave as-is without worrying much about it. I decided to degrade functionalities by default if no consent is explicitly given then analytics, therefore the comment system is fully disabled without user consent.


## A cookie safeguard

To keep things simple, my solution is to completely disallow any cookie by overriding getter and setter on cookie object. While it does not give fine grain control over cookies and allow some features like essential cookies or letting visitors choose selectively what they are ok with or not, this is enough for my usage. 

Enough talking already, show us some code!

```javascript
  function deleteCookies() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;domain=";
      /*below line is to delete the google analytics cookies. they are set with the domain*/
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;domain=" + location.hostname.replace(/^www\./i, "");
    }
  }

  function disableCookies() {
    deleteCookies();
    if (!document.__defineGetter__) {
      Object.defineProperty(document, 'cookie', {
        get: function () { return '' },
        set: function () { return true },
      });
    } else {
      document.__defineGetter__("cookie", function () { return ''; });
      document.__defineSetter__("cookie", function () { return true });
    }
  }

  function isCookieApproved() {
    return localStorage.getItem("cookieBannerApproved") === 'true';
  }

  if (!isCookieApproved()) {
    disableCookies();
  }

  window.isCookieApproved = isCookieApproved;
  window.disableCookies = disableCookies;
  window.deleteCookies = deleteCookies;
```

This script is intended to run at page load time, at the earliest time possible so that other script cannot set cookies before this piece of code actually executed.
In my case, I load it with a `<script>` tag inside my html header.

What does it do? Simple, it looks for an approval inside the `localStorage` of the user browser. If that approval is not present, it clear the getter and setter. On top of that, it also clear all cookies that were present if any. We can never be **too careful**, right?

But wait, now I cannot have any cookie! And how does this consent get saved? Okay, so here comes the second piece of the puzzle.


## The unyielding cookie banner
Yes, I know it is yet another cookie banner. They are everywhere these days, I guess cats pictures might have found a worthy opponent for supremacy over the internet...

{{< photoWithCredit
  src="kitten.jpg"
  via="Unsplash" viaHref="https://unsplash.com/s/photos/meme-cat?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
  by="Sereja Ris" byHref="https://unsplash.com/@serejaris?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}


I will not show you here how to implement a cookie banner as that would be a bit off-topic. Here, I only show the actions triggered by the `consent` and `reject` buttons.


```javascript
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
```

Here, I set some values in `localStorage` if the visitor is a cookie eater or not. Afterwards, if it is a reject, I call the previously defined function `disableCookies()` and force a page reload if the consent value has changed.

At this point, I think you might wonder why would I make the page reload. It is simply to ensure that the cookie getter and setter are properly reset (the load script only execute the disable if there was no consent, remember?).

But why not just restore the getter and setter? Is a page reload really necessary? Yes and no. I agree that reloading the page causes a small flashing that is not very aesthetic and restoring the cookie functions would allow setting cookies afterward. The main issue lies in the fact that the setup script for external service usually run on page load as well. Therefore, those cookies would not be set after the setter is restored and the service would not behave as expected or not work at all.


## Closing notes

That's it. By following this approach you can prevent unwanted cookies before you get your visitor consent. Of course you should not forget that you need on your website a `privacy statement` and a `cookie policy`. As I have no expertise in this, I will not go in details on how to write these. In short, you need at least to describe the following:
  - What is the activity of your website?
  - What personal data you are collecting about your visitors?
  - How do you collect these data?
  - Why do you need those data for?

You can refer to one of the numerous article on the web to see how, or there are also some service that can provide assistance to write/generate one though that may incur some costs.


Thanks for reading, I hope you found this article useful. Please leave me a comment if you have a question or if you would like to share your thoughts about this solution.

{{< graphcomment commentThreadUid="howToCookie_33ceba38-f64f-53d2-b117-a5fb560f9ad8" >}}
