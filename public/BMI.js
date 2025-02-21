const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true}));

app.get('/', (req, res) => {
    res.send(`
        <form action="/" method="POST">
            <lable for="weight">Weight: </lable>
            <input type="number" name="weight" step="0.1" required><br><br>
            <lable for="height">Height: </lable>
            <input type="number" name="height" step="0.1" required><br><br>
            <button type="submit">Calculate BMI</button>
        `)
})

app.post('/', (req, res) => {
    const {weight, height} = req.body;
    const heightM = height/100;
    const bmi = weight/(heightM*heightM);
    let category;

    if (bmi < 18.5) category="Underweight";
    else if (bmi>=18.5 && bmi<=24.9) category="Normal weight";
    else if (bmi>=25 && bmi<=30) category="Overweight";
    else if (bmi>30) category="Obese";
    else category = "Invalid input";

    res.send(`
        <form action="/" method="POST">
            <lable for="weight">Weight: </lable>
            <input type="number" name="weight" step="0.1" value="${weight}" required><br><br>
            <lable for="height">Height: </lable>
            <input type="number" name="height" step="0.1" value="${height}" required><br><br>
            <button type="submit">Calculate BMI</button>
            <h1> Your bmi is ${bmi.toFixed(2)}. You in ${category}. </h1>
        `)
})

app.listen(5000, () => {
    console.log(`http://localhost:5000`)
})