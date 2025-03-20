import fs from 'fs';
import csvParser from 'csv-parser';
import Client from '../models/client.js';

export const uploadCSV = async (req, res) => {
  const results = [];

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'CSV file is required.' });
  }

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      try {
        for (const row of results) {
          const { name, email, phone, address, fixedAmount, ...months } = row;

          // Clean and parse month data
          const parsedMonths = {};
          for (const [month, value] of Object.entries(months)) {
            parsedMonths[month.toLowerCase()] = parseFloat(value) || 0;
          }

          await Client.findOneAndUpdate(
            { phone, user: req.userId },
            {
              $set: {
                name,
                email,
                address,
                fixedAmount: parseFloat(fixedAmount),
                months: parsedMonths,
                user: req.userId,
              },
            },
            { upsert: true, new: true }
          );
        }

        res.status(200).json({ message: 'CSV uploaded successfully' });
      } catch (err) {
        console.error('Error inserting clients from CSV:', err);
        res.status(500).json({ message: 'Error processing CSV file', error: err.message });
      } finally {
        fs.unlink(req.file.path, () => {}); // delete temp file
      }
    })
    .on('error', (err) => {
      console.error('CSV Read Error:', err);
      res.status(500).json({ message: 'Error reading CSV file', error: err.message });
    });
};
