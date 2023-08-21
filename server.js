const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/updateTopics', (req, res) => {
  const newData = req.body;

  fs.writeFile('topics.json', JSON.stringify(newData), err => {
    if (err) {
      console.error('Error writing to file:', err);
      res.status(500).json({ error: 'Error writing to file' });
    } else {
      console.log('topics.json updated');
      res.status(200).json({ message: 'topics.json updated' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
