// Slideshow
var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demodots");
  if (n > x.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = x.length} ;
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" w3-white", "");
  }
  x[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " w3-white";
}

//Button
function initialBook() {
  let firstName = "";
  let lastName = "";
  let email = "";

  swal("First name:", {
    content: "input",
  })
  .then((value) => {
    console.log(value)
    swal("Surname:", {
      content: "input",
    })
    .then((value) => {
      console.log(value)
      swal("Email:", {
        content: "input",
      })
      .then((value) => {
        console.log(value)
        swal("Phone Number:", {
          content: "input",
        })
        .then((value) => {
          console.log(value)
          swal("Date:", {
            content: "input",
          })
            .then((value) => {
            console.log(value)
            swal("Time:", {
              content: "input",
            })
              .then((value) => {
                console.log(value)
                swal("Room:", {
                  content: "input",
              })
                .then((value) => {
                  console.log(value)
                  swal("Success", "Thank you for booking", "success")
              })
            })
          })
        })
      })
    })
  })
}

