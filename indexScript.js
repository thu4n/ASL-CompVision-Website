const githubButton = document.getElementById("githubButton");
// GitHub button on the index page
function loadGithub(){
    window.location.assign("https://github.com/thu4n/ASL-CompVision-Website");
  }
  githubButton.addEventListener("click",loadGithub);