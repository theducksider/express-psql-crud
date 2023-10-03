require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')

const app = express()
const table = process.env.TABLE_NAME

app.use(express.json())

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

app.get('/', async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM person ${table}`)
    res.status(200).json({ data: data.rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error getting data from the database' })
  }
})

app.post('/user/new', async (req, res) => {
  const { name, age } = req.body
  try {
    await pool.query(`INSERT INTO ${table}(name, age) VALUES ($1, $2)`, [
      name,
      age,
    ])
    res
      .status(200)
      .send({ message: `Successfully added ${name} into the database` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error adding data into the database' })
  }
})

app.delete('/user/delete/:id', async (req, res) => {
  const id = req.params.id

  try {
    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id])
    if (result.rowCount === 1) {
      res.status(200).json({ message: 'Person deleted successfully' })
    } else {
      res.status(404).json({ message: 'Person not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error deleting person' })
  }
})

app.listen(3000, () => {
  console.log('App listen on PORT:3000')
})
