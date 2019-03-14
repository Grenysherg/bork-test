import IMask from "imask";

const submitDisabledClassName = "button--disabled";
const inputCorrectClassName = "input--correct";
const inputErrorClassName = "input--error";
const inputFiledClassName = "js-form-input-field";

const formElement = document.querySelector(".js-form");
const telElement = formElement.querySelector(".js-form-tel");
const submitElement = formElement.querySelector(".js-form-submit");

new IMask(telElement, {
  mask: "{8}(000) 000-00-00"
});

submitElement.classList.add(submitDisabledClassName);

formElement.addEventListener(
  "focus",
  event => {
    const element = event.target;

    if (element.classList.contains(inputFiledClassName)) {
      event.target.parentNode.classList.remove(
        inputCorrectClassName,
        inputErrorClassName
      );
    }
  },
  true
);

formElement.addEventListener(
  "blur",
  event => {
    const element = event.target;

    if (element.classList.contains(inputFiledClassName)) {
      const elementContainer = element.parentNode;

      if (element.checkValidity()) {
        elementContainer.classList.add(inputCorrectClassName);
        elementContainer.classList.remove(inputErrorClassName);
      } else {
        elementContainer.classList.add(inputErrorClassName);
        elementContainer.classList.remove(inputCorrectClassName);
      }

      if (formElement.checkValidity()) {
        submitElement.classList.remove(submitDisabledClassName);
      } else {
        submitElement.classList.add(submitDisabledClassName);
      }
    }
  },
  true
);
