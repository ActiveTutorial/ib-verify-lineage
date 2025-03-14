const express = require('express');
const {initializeIC} = require('ic-proxy')
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/verify', async (req, res) => {
    const id = req.query.id;

    // Check if id is provided
    if (!id) {
        return res.status(400).json({ message: 'id is required' });
    }

    // Get lineage
    let lineage = await axios.get(`https://infinibrowser.wiki/api/recipe/custom?id=${id}`)
        .catch(e => {
            res.status(500).json({ message: e.message });
        });

    // Process lineage
    lineage = lineage.data.steps.map(step => [step.a.id, step.b.id, step.result.id]);

    // Verify lineage
    const results = lineage.map(step => step[2]);
    let valid = lineage.every(([_a, _b, result], i) => results.slice(0, i).includes(result))

    res.json({ lineage, valid });

});

initializeIC().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});