require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const uuid = require("uuid");

const createTables = async () => {
  const SQL = /*sql*/ `
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE  IF EXISTS restaurants CASCADE;
    DROP TABLE  IF EXISTS reservations CASCADE;
    CREATE TABLE customers(
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );
    CREATE TABLE restaurants(
        id UUID PRIMARY KEY,
        name VARCHAR(250) NOT NULL
    );
    CREATE TABLE reservations(
        id UUID PRIMARY KEY,
        reservation_date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL
    )
    `;
  await client.query(SQL);
};

const createCustomer = async (name) => {
  const SQL = `
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async (name) => {
  const SQL = `
      INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
      `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
  SELECT *
  FROM customers
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT *
    FROM restaurants
      `;
  const response = await client.query(SQL);
  return response.rows;
};

const createReservation = async ({
  restaurant_id,
  customer_id,
  reservation_date,
  party_count,
}) => {
  const SQL = `
    INSERT INTO reservations(id, restaurant_id, customer_id, reservation_date, party_count) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    restaurant_id,
    customer_id,
    reservation_date,
    party_count,
  ]);
  return response.rows[0];
};

const fetchReservations = async () => {
  const SQL = `
    SELECT *
    FROM reservations
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyReservation = async ({ id, customer_id }) => {
  console.log(id, customer_id);
  const SQL = `
    DELETE FROM reservations
    WHERE id = $1 AND customer_id=$2
    `;
    await client.query(SQL, [id, customer_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
};
