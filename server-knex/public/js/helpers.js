function createSMDE(attachID) {
  var simplemde = new SimpleMDE({
    element: $("#" + attachID)[0],
    toolbar: [
      "bold",
      "italic",
      "heading",
      "strikethrough",
      "|",
      "quote",
      "unordered-list",
      "ordered-list",
      "|",
      "link",
      "table",
      "image",
      "|",
      "preview"
    ]
  });

  return simplemde;
}
