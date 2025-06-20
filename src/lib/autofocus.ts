export const autofocus = (node: HTMLElement) => {
  node.focus();
  console.log(document.activeElement);
  setTimeout(() => {
    console.log("ok", document.activeElement);
  });
  setTimeout(() => {
    console.log("and", document.activeElement);
  }, 100);
};
