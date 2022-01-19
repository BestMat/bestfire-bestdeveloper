const { Select } = require("./")

const jsFrameworkSel = new Select({
    question: "Which of these is your fav JS framework?",
    options: ["Angular", "React", "Vue", "Svelte"],
    answers: ["angular", "react", "vue", "svelte"],
    pointer: ">",
    color: "magenta"
})

jsFrameworkSel.start()
